from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime


# User profile schemas
class UserProfileUpdate(BaseModel):
    """Schema for updating user profile information"""
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="User's first name")
    surname: Optional[str] = Field(None, max_length=100, description="User's last name")
    email: Optional[EmailStr] = Field(None, description="User's email address")
    avatar_url: Optional[str] = Field(None, max_length=500, description="URL to user's avatar image")
    job_title: Optional[str] = Field(None, max_length=150, description="User's job title")
    company: Optional[str] = Field(None, max_length=150, description="User's company")


class UserPreferencesUpdate(BaseModel):
    """Schema for updating user preferences"""
    timezone: Optional[str] = Field(None, description="User's timezone (e.g., 'America/New_York')")
    language: Optional[str] = Field(None, description="User's preferred language")
    theme: Optional[str] = Field(None, description="User's theme preference")
    notifications_email: Optional[bool] = Field(None, description="Email notifications enabled")
    notifications_push: Optional[bool] = Field(None, description="Push notifications enabled")
    notifications_slack: Optional[bool] = Field(None, description="Slack notifications enabled")
    notifications_summary: Optional[bool] = Field(None, description="Meeting summary notifications enabled")


class ChangePasswordRequest(BaseModel):
    """Schema for changing user password"""
    current_password: str = Field(..., min_length=1, description="Current password")
    new_password: str = Field(..., min_length=8, description="New password (minimum 8 characters)")
    confirm_password: str = Field(..., min_length=8, description="Confirm new password")

    def validate_passwords_match(self):
        """Validate that new password and confirmation match"""
        if self.new_password != self.confirm_password:
            raise ValueError("New password and confirmation do not match")
        return self


# Response schemas
class UserProfileResponse(BaseModel):
    """Schema for user profile response"""
    id: str
    name: str
    surname: Optional[str]
    email: str
    avatar_url: Optional[str]
    job_title: Optional[str]
    company: Optional[str]
    timezone: str
    is_active: bool
    is_email_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LinkedAccount(BaseModel):
    """Schema for linked account information"""
    service: str = Field(..., description="Service name (e.g., 'google_calendar', 'slack')")
    connected: bool = Field(..., description="Whether the account is connected")
    connected_at: Optional[datetime] = Field(None, description="When the account was connected")
    status: str = Field(default="active", description="Connection status")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional service-specific details")


class LinkedAccountsResponse(BaseModel):
    """Schema for linked accounts response"""
    accounts: List[LinkedAccount]


class UserPreferencesResponse(BaseModel):
    """Schema for user preferences response"""
    timezone: str
    language: Optional[str]
    theme: Optional[str]
    notifications_email: bool
    notifications_push: bool
    notifications_slack: bool
    notifications_summary: bool

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    """Schema for general message response"""
    message: str
    success: bool = True 