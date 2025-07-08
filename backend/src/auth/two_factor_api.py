from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr, validator
from typing import Optional
import logging

from .two_factor import TwoFactorAuthService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["2FA Authentication"])

class SendCodeRequest(BaseModel):
    email: EmailStr
    purpose: str = "verification"
    
    @validator('purpose')
    def validate_purpose(cls, v):
        allowed_purposes = ["registration", "login", "verification"]
        if v not in allowed_purposes:
            raise ValueError(f"Purpose must be one of: {', '.join(allowed_purposes)}")
        return v

class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str
    purpose: str = "verification"
    
    @validator('code')
    def validate_code(cls, v):
        # Remove any whitespace and validate format
        v = v.strip().replace(' ', '').replace('-', '')
        if not v.isdigit() or len(v) != 6:
            raise ValueError("Code must be exactly 6 digits")
        return v
    
    @validator('purpose')
    def validate_purpose(cls, v):
        allowed_purposes = ["registration", "login", "verification"]
        if v not in allowed_purposes:
            raise ValueError(f"Purpose must be one of: {', '.join(allowed_purposes)}")
        return v

class CodeStatusRequest(BaseModel):
    email: EmailStr

@router.post("/send-2fa-code")
async def send_verification_code(request: SendCodeRequest):
    """
    Send a 6-digit verification code to the specified email address
    
    - **email**: Email address to send the code to
    - **purpose**: Purpose of the verification (registration, login, verification)
    """
    try:
        success, message = await TwoFactorAuthService.send_verification_code(
            email=request.email,
            purpose=request.purpose
        )
        
        if success:
            logger.info(f"2FA code sent successfully to {request.email} for {request.purpose}")
            return {
                "success": True,
                "message": message,
                "data": {
                    "email": request.email,
                    "purpose": request.purpose,
                    "expires_in_minutes": TwoFactorAuthService.CODE_EXPIRY_MINUTES
                }
            }
        else:
            logger.warning(f"Failed to send 2FA code to {request.email}: {message}")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS if "wait" in message.lower() or "too many" in message.lower() else status.HTTP_400_BAD_REQUEST,
                detail=message
            )
            
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error sending 2FA code to {request.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error. Please try again later"
        )

@router.post("/verify-2fa-code")
async def verify_verification_code(request: VerifyCodeRequest):
    """
    Verify a 6-digit verification code
    
    - **email**: Email address associated with the code
    - **code**: 6-digit verification code
    - **purpose**: Purpose of the verification (must match the purpose used when sending)
    """
    try:
        success, message = await TwoFactorAuthService.verify_code(
            email=request.email,
            provided_code=request.code,
            purpose=request.purpose
        )
        
        if success:
            logger.info(f"2FA code verified successfully for {request.email}")
            return {
                "success": True,
                "message": message,
                "data": {
                    "email": request.email,
                    "purpose": request.purpose,
                    "verified": True
                }
            }
        else:
            logger.warning(f"2FA verification failed for {request.email}: {message}")
            # Determine appropriate status code based on error type
            if "expired" in message.lower():
                status_code = status.HTTP_410_GONE
            elif "too many" in message.lower():
                status_code = status.HTTP_429_TOO_MANY_REQUESTS
            elif "not found" in message.lower():
                status_code = status.HTTP_404_NOT_FOUND
            else:
                status_code = status.HTTP_400_BAD_REQUEST
                
            raise HTTPException(status_code=status_code, detail=message)
            
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error verifying 2FA code for {request.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error. Please try again later"
        )

@router.post("/resend-2fa-code")
async def resend_verification_code(request: SendCodeRequest):
    """
    Resend a verification code (same as send-2fa-code but with different endpoint for clarity)
    
    - **email**: Email address to resend the code to
    - **purpose**: Purpose of the verification
    """
    # Use the same logic as send_verification_code
    return await send_verification_code(request)

@router.post("/2fa-code-status")
async def get_code_status(request: CodeStatusRequest):
    """
    Get the status of a verification code for an email
    
    - **email**: Email address to check status for
    """
    try:
        status_info = TwoFactorAuthService.get_code_status(request.email)
        
        if status_info:
            return {
                "success": True,
                "message": "Code status retrieved",
                "data": {
                    "email": request.email,
                    "has_active_code": True,
                    **status_info
                }
            }
        else:
            return {
                "success": True,
                "message": "No active code found",
                "data": {
                    "email": request.email,
                    "has_active_code": False
                }
            }
            
    except Exception as e:
        logger.error(f"Error getting code status for {request.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error. Please try again later"
        )

@router.get("/2fa-info")
async def get_2fa_info():
    """Get general information about 2FA configuration"""
    return {
        "success": True,
        "message": "2FA configuration retrieved",
        "data": {
            "code_length": TwoFactorAuthService.CODE_LENGTH,
            "code_expiry_minutes": TwoFactorAuthService.CODE_EXPIRY_MINUTES,
            "max_attempts": TwoFactorAuthService.MAX_ATTEMPTS,
            "rate_limit_minutes": TwoFactorAuthService.RATE_LIMIT_MINUTES,
            "max_codes_per_hour": TwoFactorAuthService.MAX_CODES_PER_HOUR
        }
    } 