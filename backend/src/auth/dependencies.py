from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_async_db
from .crud import get_user_by_id
from .models import User
from .exceptions import InvalidTokenException, InactiveUserException
from .utils import verify_token

# HTTP Bearer token scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_async_db)
) -> User:
    """
    Get current authenticated user from JWT token
    """
    token = credentials.credentials
    
    # Verify token
    token_data = verify_token(token, expected_type="access")
    if token_data is None:
        raise InvalidTokenException("Invalid authentication token")
    
    print(f"🔐 AUTH DEBUG: Token verified for user_id: {token_data.user_id}")
    
    # Get user from database
    user = await get_user_by_id(db, token_data.user_id)
    if user is None:
        raise InvalidTokenException("User not found")
    
    print(f"🔐 AUTH DEBUG: User found - id={user.id}, email={user.email}, active={user.is_active}")
    
    # Check if user is active
    if not user.is_active:
        raise InactiveUserException()
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current active user (alias for get_current_user for clarity)
    """
    return current_user


async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: AsyncSession = Depends(get_async_db)
) -> Optional[User]:
    """
    Get current user if authenticated, otherwise return None
    Useful for endpoints that work with or without authentication
    """
    if credentials is None:
        return None
    
    try:
        token = credentials.credentials
        token_data = verify_token(token, expected_type="access")
        
        if token_data is None:
            return None
        
        user = await get_user_by_id(db, token_data.user_id)
        if user is None or not user.is_active:
            return None
        
        return user
    except Exception:
        return None


def validate_refresh_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Validate refresh token and return token data
    """
    token = credentials.credentials
    token_data = verify_token(token, expected_type="refresh")
    
    if token_data is None:
        raise InvalidTokenException("Invalid refresh token")
    
    return token_data
