from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime, timedelta

from .models import User, PasswordReset, GoogleCalendarIntegration
from .schemas import UserCreate, UserUpdate
from .utils import get_password_hash, create_avatar_url, generate_password_reset_token


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Get user by email"""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
    """Get user by ID"""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, user: UserCreate, is_oauth: bool = False) -> User:
    """Create a new user"""
    if is_oauth:
        # For OAuth users, use a placeholder password hash
        hashed_password = get_password_hash("oauth_placeholder_password")
    else:
        hashed_password = get_password_hash(user.password)
    
    avatar_url = create_avatar_url(user.email)
    
    db_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
        avatar_url=avatar_url,
        is_email_verified=is_oauth  # OAuth users have verified emails
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def update_user(db: AsyncSession, user_id: str, user_update: UserUpdate) -> Optional[User]:
    """Update user information"""
    result = await db.execute(select(User).where(User.id == user_id))
    db_user = result.scalar_one_or_none()
    
    if not db_user:
        return None
    
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
    """Authenticate user with email and password"""
    from .utils import verify_password
    
    user = await get_user_by_email(db, email)
    if not user:
        return None
    
    if not verify_password(password, user.hashed_password):
        return None
    
    if not user.is_active:
        return None
    
    return user


async def create_password_reset_request(db: AsyncSession, user_id: str) -> PasswordReset:
    """Create a password reset request"""
    # Expire old tokens for this user
    await db.execute(
        select(PasswordReset).where(
            and_(
                PasswordReset.user_id == user_id,
                PasswordReset.is_used == False,
                PasswordReset.expires_at > datetime.utcnow()
            )
        )
    )
    
    # Create new reset token
    token = generate_password_reset_token()
    expires_at = datetime.utcnow() + timedelta(hours=24)  # Token expires in 24 hour
    
    db_reset = PasswordReset(
        user_id=user_id,
        token=token,
        expires_at=expires_at
    )
    
    db.add(db_reset)
    await db.commit()
    await db.refresh(db_reset)
    return db_reset


async def get_password_reset_request(db: AsyncSession, token: str) -> Optional[PasswordReset]:
    """Get password reset request by token"""
    result = await db.execute(
        select(PasswordReset).where(
            and_(
                PasswordReset.token == token,
                PasswordReset.is_used == False,
                PasswordReset.expires_at > datetime.utcnow()
            )
        )
    )
    return result.scalar_one_or_none()


async def use_password_reset_token(db: AsyncSession, token: str, new_password: str) -> bool:
    """Use password reset token to change password"""
    # Get the reset request
    reset_request = await get_password_reset_request(db, token)
    if not reset_request:
        return False
    
    # Get the user
    user = await get_user_by_id(db, reset_request.user_id)
    if not user:
        return False
    
    # Update password
    user.hashed_password = get_password_hash(new_password)
    
    # Mark token as used
    reset_request.is_used = True
    
    await db.commit()
    return True


async def update_user_password(db: AsyncSession, user_id: str, new_password: str) -> bool:
    """Update user password"""
    user = await get_user_by_id(db, user_id)
    if not user:
        return False
    
    user.hashed_password = get_password_hash(new_password)
    await db.commit()
    return True


async def create_or_update_google_calendar_integration(
    db: AsyncSession, 
    user_id: str, 
    access_token: str,
    refresh_token: Optional[str] = None,
    token_expires_at: Optional[datetime] = None
) -> GoogleCalendarIntegration:
    """Create or update Google Calendar integration for user"""
    # Check if integration already exists
    result = await db.execute(
        select(GoogleCalendarIntegration).where(GoogleCalendarIntegration.user_id == user_id)
    )
    integration = result.scalar_one_or_none()
    
    if integration:
        # Update existing integration
        integration.access_token = access_token
        if refresh_token:
            integration.refresh_token = refresh_token
        if token_expires_at:
            integration.token_expires_at = token_expires_at
        integration.is_active = True
        integration.updated_at = datetime.utcnow()
    else:
        # Create new integration
        integration = GoogleCalendarIntegration(
            user_id=user_id,
            access_token=access_token,
            refresh_token=refresh_token,
            token_expires_at=token_expires_at,
            is_active=True
        )
        db.add(integration)
    
    await db.commit()
    await db.refresh(integration)
    return integration


async def get_google_calendar_integration(db: AsyncSession, user_id: str) -> Optional[GoogleCalendarIntegration]:
    """Get Google Calendar integration for user"""
    result = await db.execute(
        select(GoogleCalendarIntegration).where(
            and_(
                GoogleCalendarIntegration.user_id == user_id,
                GoogleCalendarIntegration.is_active == True
            )
        )
    )
    return result.scalar_one_or_none()
