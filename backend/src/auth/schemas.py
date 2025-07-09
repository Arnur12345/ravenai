from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime


# User Schemas
class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: str
    avatar_url: Optional[str] = None
    is_active: bool
    is_email_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    avatar_url: Optional[str] = None


# Token Schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# Password Reset Schemas
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=100)
    
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class ResetPasswordResponse(BaseModel):
    message: str


# Google OAuth Schemas
class GoogleAuthRequest(BaseModel):
    code: str
    redirect_uri: str
    state: Optional[str] = None


class GoogleAuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    avatar_url: Optional[str] = None
    token_type: str = "bearer"
    user: UserResponse


class GoogleUserInfo(BaseModel):
    id: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    verified_email: bool


# General Response Schemas
class MessageResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    detail: str
    message: Optional[str] = None


class TwoFactorRequest(BaseModel):
    email: EmailStr
    purpose: str = "verification"
    
class TwoFactorVerifyRequest(BaseModel):
    email: EmailStr
    code: str
    purpose: str = "verification"

class PendingAuthResponse(BaseModel):
    requires_2fa: bool = True
    email: str
    purpose: str
    message: str
