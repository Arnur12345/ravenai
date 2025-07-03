from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from typing import Optional, List, Dict, Any
from datetime import datetime

from auth.models import User, GoogleCalendarIntegration, SlackIntegration
from auth.utils import get_password_hash, verify_password
from .schemas import UserProfileUpdate, UserPreferencesUpdate, LinkedAccount


async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
    """Get user by ID with all related data"""
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.google_calendar_integration),
            selectinload(User.slack_integrations)
        )
        .where(User.id == user_id)
    )
    return result.scalar_one_or_none()


async def update_user_profile(
    db: AsyncSession, 
    user_id: str, 
    profile_data: UserProfileUpdate
) -> Optional[User]:
    """Update user profile information"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        return None
    
    # Update only provided fields
    update_data = profile_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(user, field):
            setattr(user, field, value)
    
    user.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(user)
    return user


async def update_user_preferences(
    db: AsyncSession, 
    user_id: str, 
    preferences_data: UserPreferencesUpdate
) -> Optional[User]:
    """Update user preferences"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        return None
    
    # Update only provided preference fields
    update_data = preferences_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(user, field):
            setattr(user, field, value)
    
    user.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(user)
    return user


async def change_user_password(
    db: AsyncSession, 
    user_id: str, 
    current_password: str, 
    new_password: str
) -> bool:
    """Change user password after verifying current password"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        return False
    
    # Verify current password
    if not verify_password(current_password, user.hashed_password):
        return False
    
    # Update password
    user.hashed_password = get_password_hash(new_password)
    user.updated_at = datetime.utcnow()
    
    await db.commit()
    return True


async def get_user_linked_accounts(db: AsyncSession, user_id: str) -> List[LinkedAccount]:
    """Get all linked accounts for a user"""
    # Get user with all integrations
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.google_calendar_integration),
            selectinload(User.slack_integrations)
        )
        .where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        return []
    
    linked_accounts = []
    
    # Google Calendar integration
    if user.google_calendar_integration and user.google_calendar_integration.is_active:
        linked_accounts.append(LinkedAccount(
            service="google_calendar",
            connected=True,
            connected_at=user.google_calendar_integration.created_at,
            status="active",
            details={
                "has_refresh_token": bool(user.google_calendar_integration.refresh_token),
                "token_expires_at": user.google_calendar_integration.token_expires_at.isoformat() if user.google_calendar_integration.token_expires_at else None
            }
        ))
    else:
        linked_accounts.append(LinkedAccount(
            service="google_calendar",
            connected=False,
            status="disconnected"
        ))
    
    # Slack integrations
    active_slack = None
    for slack_integration in user.slack_integrations:
        if slack_integration.is_active:
            active_slack = slack_integration
            break
    
    if active_slack:
        linked_accounts.append(LinkedAccount(
            service="slack",
            connected=True,
            connected_at=active_slack.created_at,
            status="active",
            details={
                "workspace_name": active_slack.workspace_name,
                "workspace_id": active_slack.workspace_id,
                "default_channel": active_slack.default_channel_name
            }
        ))
    else:
        linked_accounts.append(LinkedAccount(
            service="slack",
            connected=False,
            status="disconnected"
        ))
    
    return linked_accounts


async def get_user_preferences(db: AsyncSession, user_id: str) -> Optional[Dict[str, Any]]:
    """Get user preferences"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        return None
    
    return {
        "timezone": user.timezone,
        "language": getattr(user, 'language', None),
        "theme": getattr(user, 'theme', None),
        "notifications_email": getattr(user, 'notifications_email', True),
        "notifications_push": getattr(user, 'notifications_push', False),
        "notifications_slack": getattr(user, 'notifications_slack', True),
        "notifications_summary": getattr(user, 'notifications_summary', True)
    } 