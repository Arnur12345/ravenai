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
    
    # Polar Integration
    polar_environment: Optional[str] = os.getenv('POLAR_ENVIRONMENT')
    polar_access_token: Optional[str] = os.getenv('POLAR_ACCESS_TOKEN')
    polar_webhook_secret: Optional[str] = os.getenv('POLAR_WEBHOOK_SECRET')
    polar_organization_id: Optional[str] = os.getenv('POLAR_ORGANIZATION_ID')
    polar_pro_monthly_price_id: Optional[str] = os.getenv('POLAR_PRO_MONTHLY_PRICE_ID')
    polar_pro_yearly_price_id: Optional[str] = os.getenv('POLAR_PRO_YEARLY_PRICE_ID')
    polar_enterprise_monthly_price_id: Optional[str] = os.getenv('POLAR_ENTERPRISE_MONTHLY_PRICE_ID')
    polar_enterprise_yearly_price_id: Optional[str] = os.getenv('POLAR_ENTERPRISE_YEARLY_PRICE_ID')
    
    # App URLs
    app_base_url: Optional[str] = os.getenv('APP_BASE_URL')
    frontend_success_url: Optional[str] = os.getenv('FRONTEND_SUCCESS_URL')
    frontend_cancel_url: Optional[str] = os.getenv('FRONTEND_CANCEL_URL')
    
    class Config:
        env_file = os.path.join(os.path.dirname(__file__), '..', '..', '.env')

# Global settings instance
settings = Settings()

# For backward compatibility
Config = settings