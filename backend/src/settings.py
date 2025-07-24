import os
from typing import Optional
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load .env from the project root directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost/aftertalk')
    
    # Security
    SECRET_KEY: str = os.getenv('SECRET_KEY', 'your-super-secret-key-change-this-in-production')
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours instead of 30 minutes
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30  # 30 days instead of 7 days
    
    # API Keys
    GEMINI_API_KEY: Optional[str] = os.getenv('GEMINI_API_KEY')
    VEXA_ADMIN_KEY: str = os.getenv('VEXA_ADMIN_KEY', '')
    OPENAI_API_KEY: Optional[str] = os.getenv('OPENAI_API_KEY')
    
    # Polar Payment Configuration
    POLAR_ACCESS_TOKEN: Optional[str] = os.getenv('POLAR_ACCESS_TOKEN')
    POLAR_WEBHOOK_SECRET: Optional[str] = os.getenv('POLAR_WEBHOOK_SECRET')
    POLAR_ENVIRONMENT: str = os.getenv('POLAR_ENVIRONMENT', 'sandbox')  # sandbox or production
    POLAR_ORGANIZATION_ID: Optional[str] = os.getenv('POLAR_ORGANIZATION_ID')
    
    # Application URLs for Polar
    APP_BASE_URL: str = os.getenv('APP_BASE_URL', 'http://localhost:3000')
    FRONTEND_SUCCESS_URL: str = os.getenv('FRONTEND_SUCCESS_URL', 'http://localhost:3000/subscription/success')
    FRONTEND_CANCEL_URL: str = os.getenv('FRONTEND_CANCEL_URL', 'http://localhost:3000/subscription/cancel')
    
    # Slack Integration
    SLACK_CLIENT_ID: Optional[str] = os.getenv('SLACK_CLIENT_ID')
    SLACK_CLIENT_SECRET: Optional[str] = os.getenv('SLACK_CLIENT_SECRET')
    SLACK_SIGNING_SECRET: Optional[str] = os.getenv('SLACK_SIGNING_SECRET')
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://ravenai.site"
    ]
    
    # Email Configuration for 2FA
    SMTP_SERVER: Optional[str] = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT: int = int(os.getenv('SMTP_PORT', '587'))
    SMTP_USERNAME: Optional[str] = os.getenv('SMTP_USERNAME')
    SMTP_PASSWORD: Optional[str] = os.getenv('SMTP_PASSWORD')
    SMTP_FROM_EMAIL: str = os.getenv('SMTP_FROM_EMAIL', 'noreply@ravenai.site')
    SMTP_USE_TLS: bool = os.getenv('SMTP_USE_TLS', 'true').lower() == 'true'
    
    class Config:
        env_file = os.path.join(os.path.dirname(__file__), '..', '..', '.env')

# Global settings instance
settings = Settings()

# For backward compatibility
Config = settings