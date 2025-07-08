import random
import string
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
import logging
from functools import wraps
import json

from settings import settings

logger = logging.getLogger(__name__)

# In-memory storage for verification codes
# Structure: {email: {"code": "123456", "expires_at": datetime, "attempts": 0, "created_at": datetime}}
verification_codes: Dict[str, Dict] = {}

# Rate limiting storage for email sending
# Structure: {email: {"last_sent": datetime, "count": int}}
rate_limits: Dict[str, Dict] = {}

class TwoFactorAuthService:
    """Service for handling two-factor authentication with email verification"""
    
    CODE_LENGTH = 6
    CODE_EXPIRY_MINUTES = 10
    MAX_ATTEMPTS = 3
    RATE_LIMIT_MINUTES = 1  # Min time between sending codes
    MAX_CODES_PER_HOUR = 5
    
    @staticmethod
    def generate_verification_code() -> str:
        """Generate a secure 6-digit verification code"""
        return ''.join(random.choices(string.digits, k=TwoFactorAuthService.CODE_LENGTH))
    
    @staticmethod
    def cleanup_expired_codes():
        """Remove expired codes and old rate limit entries"""
        current_time = datetime.utcnow()
        
        # Clean up expired verification codes
        expired_emails = []
        for email, data in verification_codes.items():
            if current_time > data["expires_at"]:
                expired_emails.append(email)
        
        for email in expired_emails:
            del verification_codes[email]
        
        # Clean up old rate limit entries (older than 1 hour)
        expired_rate_limits = []
        for email, data in rate_limits.items():
            if current_time - data["last_sent"] > timedelta(hours=1):
                expired_rate_limits.append(email)
        
        for email in expired_rate_limits:
            del rate_limits[email]
    
    @staticmethod
    def check_rate_limit(email: str) -> Tuple[bool, Optional[str]]:
        """Check if email can receive a new verification code"""
        current_time = datetime.utcnow()
        
        if email not in rate_limits:
            return True, None
        
        rate_data = rate_limits[email]
        time_since_last = current_time - rate_data["last_sent"]
        
        # Check minimum time between sends
        if time_since_last < timedelta(minutes=TwoFactorAuthService.RATE_LIMIT_MINUTES):
            remaining_seconds = (timedelta(minutes=TwoFactorAuthService.RATE_LIMIT_MINUTES) - time_since_last).total_seconds()
            return False, f"Please wait {int(remaining_seconds)} seconds before requesting a new code"
        
        # Check hourly limit
        if time_since_last < timedelta(hours=1) and rate_data.get("count", 0) >= TwoFactorAuthService.MAX_CODES_PER_HOUR:
            return False, "Too many verification codes requested. Please try again later"
        
        return True, None
    
    @staticmethod
    def update_rate_limit(email: str):
        """Update rate limiting data for email"""
        current_time = datetime.utcnow()
        
        if email not in rate_limits:
            rate_limits[email] = {"last_sent": current_time, "count": 1}
        else:
            # Reset count if more than an hour has passed
            if current_time - rate_limits[email]["last_sent"] > timedelta(hours=1):
                rate_limits[email] = {"last_sent": current_time, "count": 1}
            else:
                rate_limits[email]["last_sent"] = current_time
                rate_limits[email]["count"] = rate_limits[email].get("count", 0) + 1
    
    @staticmethod
    async def send_verification_code(email: str, purpose: str = "verification") -> Tuple[bool, str]:
        """
        Send a verification code to the specified email
        
        Args:
            email: Email address to send code to
            purpose: Purpose of the code (e.g., "registration", "login", "verification")
            
        Returns:
            Tuple of (success: bool, message: str)
        """
        try:
            # Clean up expired codes first
            TwoFactorAuthService.cleanup_expired_codes()
            
            # Check rate limiting
            can_send, rate_message = TwoFactorAuthService.check_rate_limit(email)
            if not can_send:
                return False, rate_message
            
            # Generate new verification code
            code = TwoFactorAuthService.generate_verification_code()
            expires_at = datetime.utcnow() + timedelta(minutes=TwoFactorAuthService.CODE_EXPIRY_MINUTES)
            
            # Store verification code
            verification_codes[email] = {
                "code": code,
                "expires_at": expires_at,
                "attempts": 0,
                "created_at": datetime.utcnow(),
                "purpose": purpose
            }
            
            # Send email
            success = await TwoFactorAuthService._send_email(email, code, purpose)
            
            if success:
                # Update rate limiting
                TwoFactorAuthService.update_rate_limit(email)
                logger.info(f"Verification code sent to {email} for {purpose}")
                return True, "Verification code sent successfully"
            else:
                # Remove code if email failed to send
                if email in verification_codes:
                    del verification_codes[email]
                return False, "Failed to send verification code. Please try again"
                
        except Exception as e:
            logger.error(f"Error sending verification code to {email}: {str(e)}")
            return False, "Failed to send verification code. Please try again"
    
    @staticmethod
    async def verify_code(email: str, provided_code: str, purpose: str = "verification") -> Tuple[bool, str]:
        """
        Verify a provided code against the stored code
        
        Args:
            email: Email address
            provided_code: Code provided by user
            purpose: Expected purpose of the code
            
        Returns:
            Tuple of (success: bool, message: str)
        """
        try:
            # Clean up expired codes first
            TwoFactorAuthService.cleanup_expired_codes()
            
            # Check if code exists
            if email not in verification_codes:
                return False, "No verification code found. Please request a new code"
            
            code_data = verification_codes[email]
            
            # Check if code has expired
            if datetime.utcnow() > code_data["expires_at"]:
                del verification_codes[email]
                return False, "Verification code has expired. Please request a new code"
            
            # Check purpose matches
            if code_data.get("purpose") != purpose:
                return False, "Invalid verification code"
            
            # Check attempt limit
            if code_data["attempts"] >= TwoFactorAuthService.MAX_ATTEMPTS:
                del verification_codes[email]
                return False, "Too many verification attempts. Please request a new code"
            
            # Verify the code
            if provided_code.strip() == code_data["code"]:
                # Code is correct - remove it from storage
                del verification_codes[email]
                logger.info(f"Successful 2FA verification for {email}")
                return True, "Verification successful"
            else:
                # Increment attempt counter
                verification_codes[email]["attempts"] += 1
                remaining_attempts = TwoFactorAuthService.MAX_ATTEMPTS - verification_codes[email]["attempts"]
                
                if remaining_attempts > 0:
                    return False, f"Invalid verification code. {remaining_attempts} attempts remaining"
                else:
                    del verification_codes[email]
                    return False, "Too many failed attempts. Please request a new code"
                    
        except Exception as e:
            logger.error(f"Error verifying code for {email}: {str(e)}")
            return False, "Verification failed. Please try again"
    
    @staticmethod
    async def _send_email(email: str, code: str, purpose: str) -> bool:
        """Send verification code email"""
        try:
            # Create email content
            subject, html_content, text_content = TwoFactorAuthService._create_email_content(code, purpose)
            
            # Create message
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.SMTP_FROM_EMAIL
            msg["To"] = email
            
            # Add text and HTML parts
            part1 = MIMEText(text_content, "plain")
            part2 = MIMEText(html_content, "html")
            
            msg.attach(part1)
            msg.attach(part2)
            
            # Send email
            with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
                if settings.SMTP_USE_TLS:
                    server.starttls()
                if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                
                server.send_message(msg)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {email}: {str(e)}")
            return False
    
    @staticmethod
    def _create_email_content(code: str, purpose: str) -> Tuple[str, str, str]:
        """Create email subject and content"""
        
        purpose_titles = {
            "registration": "Complete Your Registration",
            "login": "Login Verification",
            "verification": "Email Verification"
        }
        
        purpose_messages = {
            "registration": "Welcome to Raven AI! Please verify your email to complete your registration.",
            "login": "A login attempt was made to your Raven AI account. Please verify it's you.",
            "verification": "Please verify your email address for Raven AI."
        }
        
        title = purpose_titles.get(purpose, "Email Verification")
        message = purpose_messages.get(purpose, "Please verify your email address.")
        
        subject = f"Raven AI - {title}"
        
        # HTML email template
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{title}</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                    background-color: #f5f5f5;
                    margin: 0;
                    padding: 0;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 28px;
                    font-weight: 600;
                }}
                .content {{
                    padding: 40px 30px;
                    text-align: center;
                }}
                .verification-code {{
                    background-color: #f8f9fa;
                    border: 2px dashed #83BAFF;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 30px 0;
                    font-size: 36px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    color: #2c3e50;
                    font-family: 'Courier New', monospace;
                }}
                .warning {{
                    background-color: #fff3cd;
                    border-left: 4px solid #ffc107;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 4px;
                }}
                .footer {{
                    background-color: #f8f9fa;
                    padding: 20px 30px;
                    text-align: center;
                    font-size: 14px;
                    color: #6c757d;
                    border-top: 1px solid #e9ecef;
                }}
                .button {{
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #83BAFF;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: 600;
                    margin: 20px 0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Raven AI</h1>
                    <p>{title}</p>
                </div>
                
                <div class="content">
                    <h2>Verification Code</h2>
                    <p>{message}</p>
                    
                    <div class="verification-code">
                        {code}
                    </div>
                    
                    <p>Enter this 6-digit code to continue. This code will expire in {TwoFactorAuthService.CODE_EXPIRY_MINUTES} minutes.</p>
                    
                    <div class="warning">
                        <strong>Security Notice:</strong> If you didn't request this code, please ignore this email or contact support if you're concerned about your account security.
                    </div>
                </div>
                
                <div class="footer">
                    <p>This email was sent by Raven AI</p>
                    <p>If you have any questions, contact us at support@ravenai.site</p>
                    <p>© 2025 Raven AI. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        text_content = f"""
        Raven AI - {title}
        
        {message}
        
        Verification Code: {code}
        
        Enter this 6-digit code to continue. This code will expire in {TwoFactorAuthService.CODE_EXPIRY_MINUTES} minutes.
        
        Security Notice: If you didn't request this code, please ignore this email or contact support.
        
        Best regards,
        Raven AI Team
        """
        
        return subject, html_content, text_content
    
    @staticmethod
    def get_code_status(email: str) -> Optional[Dict]:
        """Get status of current verification code for email"""
        TwoFactorAuthService.cleanup_expired_codes()
        
        if email not in verification_codes:
            return None
        
        code_data = verification_codes[email]
        current_time = datetime.utcnow()
        
        if current_time > code_data["expires_at"]:
            del verification_codes[email]
            return None
        
        time_remaining = code_data["expires_at"] - current_time
        
        return {
            "expires_in_seconds": int(time_remaining.total_seconds()),
            "attempts_used": code_data["attempts"],
            "max_attempts": TwoFactorAuthService.MAX_ATTEMPTS,
            "purpose": code_data.get("purpose", "verification")
        }

# Background task to clean up expired codes
async def cleanup_expired_codes_task():
    """Background task to periodically clean up expired codes"""
    while True:
        try:
            TwoFactorAuthService.cleanup_expired_codes()
            await asyncio.sleep(60)  # Clean up every minute
        except Exception as e:
            logger.error(f"Error in cleanup task: {str(e)}")
            await asyncio.sleep(60)

# Initialize the cleanup task
def init_cleanup_task():
    """Initialize the background cleanup task"""
    asyncio.create_task(cleanup_expired_codes_task()) 