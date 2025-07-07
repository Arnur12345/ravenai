import os
from typing import Optional
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

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
    
    # Email (for future implementation)
    SMTP_SERVER: Optional[str] = os.getenv('SMTP_SERVER')
    SMTP_PORT: int = int(os.getenv('SMTP_PORT', '587'))
    SMTP_USERNAME: Optional[str] = os.getenv('SMTP_USERNAME')
    SMTP_PASSWORD: Optional[str] = os.getenv('SMTP_PASSWORD')
    
    class Config:
        env_file = ".env"

# Global settings instance
settings = Settings()

# For backward compatibility
Config = settings