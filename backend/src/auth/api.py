from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_async_db
from .schemas import (
    UserCreate, UserLogin, UserResponse, UserUpdate, Token,
    ForgotPasswordRequest, ForgotPasswordResponse,
    ResetPasswordRequest, ResetPasswordResponse,
    RefreshTokenRequest, MessageResponse,
    GoogleAuthRequest, GoogleAuthResponse
)
from .service import auth_service
from .dependencies import get_current_user, validate_refresh_token
from .models import User
from .exceptions import AuthenticationException, OAuthException

# Create router
auth_router = APIRouter()


@auth_router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Register a new user
    
    Creates a new user account and returns user data with authentication tokens.
    """
    try:
        user, tokens = await auth_service.register_user(db, user_data)
        
        return {
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "avatar": user.avatar_url,
                "is_active": user.is_active,
                "is_email_verified": user.is_email_verified,
                "created_at": user.created_at
            },
            "access_token": tokens.access_token,
            "refresh_token": tokens.refresh_token,
            "token_type": tokens.token_type
        }
    except Exception as e:
        raise e


@auth_router.post("/login", response_model=dict)
async def login(
    login_data: UserLogin,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Authenticate user and return tokens
    
    Validates user credentials and returns authentication tokens.
    """
    try:
        user, tokens = await auth_service.login_user(db, login_data)
        
        return {
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "avatar": user.avatar_url,
                "is_active": user.is_active,
                "is_email_verified": user.is_email_verified,
                "created_at": user.created_at
            },
            "access_token": tokens.access_token,
            "refresh_token": tokens.refresh_token,
            "token_type": tokens.token_type
        }
    except Exception as e:
        raise e


@auth_router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Refresh access token
    
    Uses refresh token to generate new access and refresh tokens.
    """
    try:
        tokens = await auth_service.refresh_token(db, refresh_data.refresh_token)
        return tokens
    except Exception as e:
        raise e


@auth_router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(
    request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Request password reset
    
    Sends password reset instructions to user's email.
    """
    try:
        await auth_service.request_password_reset(db, request.email)
        return ForgotPasswordResponse(
            message="If an account with this email exists, you will receive password reset instructions."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process password reset request"
        )


@auth_router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_password(
    request: ResetPasswordRequest,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Reset password using token
    
    Resets user password using the token from email.
    """
    try:
        await auth_service.reset_password(db, request.token, request.new_password)
        return ResetPasswordResponse(
            message="Password has been reset successfully"
        )
    except Exception as e:
        raise e


@auth_router.get("/me", response_model=dict)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user profile
    
    Returns the profile of the currently authenticated user.
    """
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "avatar": current_user.avatar_url,
        "is_active": current_user.is_active,
        "is_email_verified": current_user.is_email_verified,
        "created_at": current_user.created_at
    }


@auth_router.put("/me", response_model=dict)
async def update_current_user_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Update current user profile
    
    Updates the profile of the currently authenticated user.
    """
    try:
        updated_user = await auth_service.update_user_profile(
            db, current_user.id, update_data
        )
        
        return {
            "id": updated_user.id,
            "name": updated_user.name,
            "email": updated_user.email,
            "avatar": updated_user.avatar_url,
            "is_active": updated_user.is_active,
            "is_email_verified": updated_user.is_email_verified,
            "created_at": updated_user.created_at
        }
    except Exception as e:
        raise e


@auth_router.post("/logout", response_model=MessageResponse)
async def logout(
    current_user: User = Depends(get_current_user)
):
    """
    Logout user
    
    In a stateless JWT system, logout is handled client-side by removing tokens.
    This endpoint is provided for consistency and future token blacklisting.
    """
    # TODO: Implement token blacklisting in production
    return MessageResponse(message="Successfully logged out")


@auth_router.get("/verify-token")
async def verify_token_endpoint(
    current_user: User = Depends(get_current_user)
):
    """
    Verify if the current token is valid
    
    Returns user data if token is valid, otherwise raises authentication error.
    """
    return {
        "valid": True,
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "avatar": current_user.avatar_url
        }
    }


# Google OAuth Endpoints
@auth_router.get("/google/auth-url")
async def get_google_auth_url(
    redirect_uri: str,
    state: str = None
):
    """
    Get Google OAuth authorization URL
    
    Returns the URL to redirect users to for Google OAuth authentication.
    """
    try:
        auth_url = auth_service.get_google_auth_url(redirect_uri, state)
        return {"auth_url": auth_url}
    except AuthenticationException as e:
        # Preserve the original status code and message from the service
        print(f"🔍 Caught AuthenticationException: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        print(f"❌ Caught generic Exception: {type(e).__name__} - {str(e)}")
        # Check if this is actually an AuthenticationException that wasn't caught
        if hasattr(e, 'status_code') and hasattr(e, 'detail'):
            print(f"🔍 Exception has HTTP attributes: {e.status_code} - {e.detail}")
            raise HTTPException(status_code=e.status_code, detail=e.detail)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate Google auth URL: {str(e)}"
        )


@auth_router.get("/google/callback")
async def google_oauth_callback_redirect(
    code: str = None,
    state: str = None,
    error: str = None,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Handle Google OAuth callback redirect
    
    This endpoint receives the callback from Google and handles the authentication,
    then redirects to the frontend with the result.
    """
    try:
        # Determine frontend URL based on environment or referrer
        frontend_url = "http://localhost:3000"  # Default for development
        
        # Check if we should use production domain
        import os
        if os.getenv('NODE_ENV') == 'production' or 'ravenai.site' in (state or ''):
            frontend_url = "https://ravenai.site"
        
        if error:
            # OAuth error from Google
            error_url = f"{frontend_url}/auth?error={error}"
            return RedirectResponse(url=error_url)
        
        if not code or not state:
            # Missing required parameters
            error_url = f"{frontend_url}/auth?error=missing_parameters"
            return RedirectResponse(url=error_url)
        
        # Exchange code for tokens - use the same redirect_uri that was used for authorization
        # This should match the redirect_uri sent by the frontend
        redirect_uri = f"{frontend_url}/auth/google/callback"
        user, tokens = await auth_service.authenticate_google_user(db, code, redirect_uri)
        
        # Create success URL with tokens
        success_url = f"{frontend_url}/auth/google/success?access_token={tokens.access_token}&refresh_token={tokens.refresh_token}&user_id={user.id}"
        return RedirectResponse(url=success_url)
        
    except AuthenticationException as e:
        # Preserve authentication errors with proper status codes
        error_url = f"{frontend_url}/auth?error=auth_failed&message={str(e.detail)}"
        return RedirectResponse(url=error_url)
    except Exception as e:
        # Other unexpected errors
        error_url = f"{frontend_url}/auth?error=auth_failed&message={str(e)}"
        return RedirectResponse(url=error_url)


@auth_router.post("/google/callback", response_model=dict)
async def google_oauth_callback_api(
    auth_data: GoogleAuthRequest,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Handle Google OAuth callback via API
    
    Exchanges authorization code for user tokens and creates/updates user account.
    """
    try:
        print(f"🔍 Google OAuth callback API called with:")
        print(f"  Code: {auth_data.code[:10]}...")
        print(f"  Redirect URI: {auth_data.redirect_uri}")
        user, tokens = await auth_service.authenticate_google_user(
            db, auth_data.code, auth_data.redirect_uri
        )
        
        return {
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "avatar": user.avatar_url,
                "is_active": user.is_active,
                "is_email_verified": user.is_email_verified,
                "created_at": user.created_at
            },
            "access_token": tokens.access_token,
            "refresh_token": tokens.refresh_token,
            "token_type": tokens.token_type
        }
    except OAuthException as e:
        # OAuth-specific errors (400 Bad Request)
        print(f"🔍 OAuth error in API: {e.detail}")
        raise e
    except AuthenticationException as e:
        # Other authentication errors
        print(f"🔍 Auth error in API: {e.detail}")
        raise e
    except Exception as e:
        print(f"🔍 Unexpected error in API: {type(e).__name__} - {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google authentication failed: {str(e)}"
        )
