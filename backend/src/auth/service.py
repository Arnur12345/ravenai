from typing import Tuple, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta

from .models import User
from .schemas import UserCreate, UserLogin, UserUpdate, Token
from .crud import (
    get_user_by_email, 
    create_user, 
    authenticate_user, 
    update_user,
    create_password_reset_request,
    use_password_reset_token,
    get_user_by_id,
    create_or_update_google_calendar_integration
)
from .utils import create_access_token, create_refresh_token, verify_token, create_avatar_url
from .exceptions import (
    UserAlreadyExistsException, 
    InvalidCredentialsException,
    UserNotFoundException,
    InvalidTokenException,
    AuthenticationException,
    OAuthException
)
from .google_oauth import google_oauth_service
from .schemas import GoogleUserInfo


class AuthService:
    """Authentication service handling all auth-related business logic"""
    
    async def register_user(self, db: AsyncSession, user_data: UserCreate) -> Tuple[User, Token]:
        """
        Register a new user
        
        Args:
            db: Database session
            user_data: User registration data
            
        Returns:
            Tuple of created user and authentication tokens
            
        Raises:
            UserAlreadyExistsException: If user with email already exists
        """
        # Check if user already exists
        existing_user = await get_user_by_email(db, user_data.email)
        if existing_user:
            raise UserAlreadyExistsException(user_data.email)
        
        # Create new user
        user = await create_user(db, user_data)
        
        # Generate tokens
        token_data = {"sub": user.id, "email": user.email}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        tokens = Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )
        
        return user, tokens
    
    async def login_user(self, db: AsyncSession, login_data: UserLogin) -> Tuple[User, Token]:
        """
        Authenticate and login user
        
        Args:
            db: Database session
            login_data: User login credentials
            
        Returns:
            Tuple of authenticated user and tokens
            
        Raises:
            InvalidCredentialsException: If credentials are invalid
        """
        user = await authenticate_user(db, login_data.email, login_data.password)
        if not user:
            raise InvalidCredentialsException()
        
        # Generate tokens
        token_data = {"sub": user.id, "email": user.email}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        tokens = Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )
        
        return user, tokens
    
    async def refresh_token(self, db: AsyncSession, refresh_token: str) -> Token:
        """
        Refresh access token using refresh token
        
        Args:
            db: Database session
            refresh_token: Valid refresh token
            
        Returns:
            New token pair
            
        Raises:
            InvalidTokenException: If refresh token is invalid
        """
        # Verify refresh token
        token_data = verify_token(refresh_token, expected_type="refresh")
        if not token_data:
            raise InvalidTokenException("Invalid refresh token")
        
        # Check if user still exists and is active
        user = await get_user_by_id(db, token_data.user_id)
        if not user or not user.is_active:
            raise InvalidTokenException("User not found or inactive")
        
        # Generate new tokens
        new_token_data = {"sub": user.id, "email": user.email}
        access_token = create_access_token(new_token_data)
        new_refresh_token = create_refresh_token(new_token_data)
        
        return Token(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="bearer"
        )
    
    async def request_password_reset(self, db: AsyncSession, email: str) -> bool:
        """
        Request password reset for user
        
        Args:
            db: Database session
            email: User email
            
        Returns:
            True if reset request was created (always returns True for security)
        """
        user = await get_user_by_email(db, email)
        if user and user.is_active:
            # Create password reset request
            reset_request = await create_password_reset_request(db, user.id)
            
            # TODO: Send email with reset token
            # For now, we'll just log it (in production, send email)
            print(f"Password reset token for {email}: {reset_request.token}")
        
        # Always return True for security (don't reveal if email exists)
        return True
    
    async def reset_password(self, db: AsyncSession, token: str, new_password: str) -> bool:
        """
        Reset user password using token
        
        Args:
            db: Database session
            token: Password reset token
            new_password: New password
            
        Returns:
            True if password was reset successfully
            
        Raises:
            InvalidTokenException: If token is invalid or expired
        """
        success = await use_password_reset_token(db, token, new_password)
        if not success:
            raise InvalidTokenException("Invalid or expired password reset token")
        
        return True
    
    async def update_user_profile(self, db: AsyncSession, user_id: str, update_data: UserUpdate) -> User:
        """
        Update user profile
        
        Args:
            db: Database session
            user_id: User ID
            update_data: Updated user data
            
        Returns:
            Updated user
            
        Raises:
            UserNotFoundException: If user not found
        """
        user = await update_user(db, user_id, update_data)
        if not user:
            raise UserNotFoundException()
        
        return user
    
    async def get_user_profile(self, db: AsyncSession, user_id: str) -> User:
        """
        Get user profile by ID
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            User profile
            
        Raises:
            UserNotFoundException: If user not found
        """
        user = await get_user_by_id(db, user_id)
        if not user:
            raise UserNotFoundException()
        
        return user

    def get_google_auth_url(self, redirect_uri: str, state: Optional[str] = None) -> str:
        """
        Get Google OAuth authorization URL
        
        Args:
            redirect_uri: OAuth redirect URI
            state: Optional state parameter for CSRF protection
            
        Returns:
            Google OAuth authorization URL
            
        Raises:
            AuthenticationException: If Google OAuth service is unavailable
        """
        try:
            return google_oauth_service.get_authorization_url(redirect_uri, state)
        except AuthenticationException:
            # Re-raise AuthenticationException as-is to preserve status code
            raise
        except Exception as e:
            # Wrap any other exception as AuthenticationException
            raise AuthenticationException(
                status_code=500,
                detail=f"Failed to generate Google OAuth URL: {str(e)}"
            )

    async def authenticate_google_user(self, db: AsyncSession, code: str, redirect_uri: str, state: Optional[str] = None) -> Tuple[User, Token]:
        """
        Authenticate user with Google OAuth with enhanced security
        
        Args:
            db: Database session
            code: Authorization code from Google
            redirect_uri: OAuth redirect URI
            state: Optional state parameter for CSRF protection and PKCE
            
        Returns:
            Tuple of authenticated user and tokens
            
        Raises:
            AuthenticationError: If Google authentication fails
        """
        try:
            print(f"🔍 Starting Google user authentication with enhanced security:")
            print(f"  Code: {code[:10]}...")
            print(f"  Redirect URI: {redirect_uri}")
            print(f"  State: {state[:20] if state else 'None'}...")
            
            # Exchange code for tokens with enhanced security
            print("🔍 Exchanging code for tokens...")
            print(f"🔍 Parameters being sent to Google:")
            print(f"  Code: {code[:20]}...")
            print(f"  Redirect URI: {redirect_uri}")
            print(f"  State: {state}")
            
            token_response = await google_oauth_service.exchange_code_for_tokens(code, redirect_uri, state)
            print(f"🔍 Token exchange response: {list(token_response.keys()) if token_response else 'None'}")
            
            access_token = token_response.get('access_token')
            refresh_token = token_response.get('refresh_token')
            expires_in = token_response.get('expires_in')
            
            if not access_token:
                print(f"❌ No access token in response: {token_response}")
                raise OAuthException("Failed to get access token from Google")
            
            # Calculate token expiry time
            token_expires_at = None
            if expires_in:
                token_expires_at = datetime.utcnow() + timedelta(seconds=int(expires_in))
            
            # Get user info from Google
            google_user = await google_oauth_service.get_user_info(access_token)
            
            # Check if user already exists
            existing_user = await get_user_by_email(db, google_user.email)
            
            if existing_user:
                # User exists, update avatar if available
                if google_user.avatar_url and not existing_user.avatar_url:
                    update_data = UserUpdate(avatar_url=google_user.avatar_url)
                    existing_user = await update_user(db, existing_user.id, update_data)
                
                user = existing_user
            else:
                # Create new user from Google info
                user_data = UserCreate(
                    name=google_user.name,
                    email=google_user.email,
                    password="google_oauth_user"  # Placeholder password for OAuth users
                )
                
                # Create user without password validation for OAuth
                user = await create_user(db, user_data, is_oauth=True)
                
                # Set avatar and email verification
                if google_user.avatar_url or google_user.verified_email:
                    update_data = UserUpdate(avatar_url=google_user.avatar_url)
                    user = await update_user(db, user.id, update_data)
                    
                    # Mark email as verified for Google users
                    if google_user.verified_email:
                        user.is_email_verified = True
                        db.add(user)
                        await db.commit()
                        await db.refresh(user)
            
            # Save Google Calendar integration tokens
            try:
                await create_or_update_google_calendar_integration(
                    db=db,
                    user_id=user.id,
                    access_token=access_token,
                    refresh_token=refresh_token,
                    token_expires_at=token_expires_at
                )
                print(f"✅ Google Calendar integration saved for user {user.email}")
            except Exception as e:
                print(f"⚠️  Failed to save Google Calendar integration: {str(e)}")
                # Don't fail the authentication if calendar integration fails
            
            # Generate our app tokens
            token_data = {"sub": user.id, "email": user.email}
            app_access_token = create_access_token(token_data)
            app_refresh_token = create_refresh_token(token_data)
            
            tokens = Token(
                access_token=app_access_token,
                refresh_token=app_refresh_token,
                token_type="bearer"
            )
            
            return user, tokens
            
        except Exception as e:
            print(f"❌ Google authentication failed: {type(e).__name__} - {str(e)}")
            import traceback
            traceback.print_exc()
            raise OAuthException(f"Google authentication failed: {str(e)}")


# Global service instance
auth_service = AuthService()
