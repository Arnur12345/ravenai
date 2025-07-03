from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_async_db
from auth.dependencies import get_current_user
from auth.models import User
from .schemas import (
    UserProfileUpdate, UserPreferencesUpdate, ChangePasswordRequest,
    UserProfileResponse, UserPreferencesResponse, LinkedAccountsResponse,
    MessageResponse
)
from . import crud

# Create user router
user_router = APIRouter(prefix="/api/users", tags=["users"])


@user_router.get("/me", response_model=UserProfileResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get current user's profile information
    """
    try:
        user = await crud.get_user_by_id(db, current_user.id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return UserProfileResponse.from_orm(user)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user profile: {str(e)}"
        )


@user_router.put("/me", response_model=UserProfileResponse)
async def update_current_user_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Update current user's profile information
    
    Updates only the provided fields. Fields not included in the request will remain unchanged.
    """
    try:
        updated_user = await crud.update_user_profile(db, current_user.id, profile_data)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return UserProfileResponse.from_orm(updated_user)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update profile: {str(e)}"
        )


@user_router.post("/me/change-password", response_model=MessageResponse)
async def change_user_password(
    password_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Change current user's password
    
    Requires current password for verification and new password confirmation.
    """
    try:
        # Validate passwords match
        password_data.validate_passwords_match()
        
        success = await crud.change_user_password(
            db, 
            current_user.id, 
            password_data.current_password, 
            password_data.new_password
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        return MessageResponse(message="Password changed successfully")
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to change password: {str(e)}"
        )


@user_router.get("/me/preferences", response_model=UserPreferencesResponse)
async def get_user_preferences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get current user's preferences
    """
    try:
        preferences = await crud.get_user_preferences(db, current_user.id)
        if not preferences:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User preferences not found"
            )
        return UserPreferencesResponse(**preferences)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get preferences: {str(e)}"
        )


@user_router.put("/me/preferences", response_model=UserPreferencesResponse)
async def update_user_preferences(
    preferences_data: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Update current user's preferences
    
    Updates only the provided preference fields. Fields not included will remain unchanged.
    """
    try:
        updated_user = await crud.update_user_preferences(db, current_user.id, preferences_data)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get updated preferences
        preferences = await crud.get_user_preferences(db, updated_user.id)
        return UserPreferencesResponse(**preferences)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update preferences: {str(e)}"
        )


@user_router.get("/me/linked-accounts", response_model=LinkedAccountsResponse)
async def get_user_linked_accounts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get current user's linked third-party accounts
    
    Returns information about connected services like Google Calendar and Slack.
    """
    try:
        linked_accounts = await crud.get_user_linked_accounts(db, current_user.id)
        return LinkedAccountsResponse(accounts=linked_accounts)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get linked accounts: {str(e)}"
        ) 