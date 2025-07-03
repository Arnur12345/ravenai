from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
import uuid


class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String(100), nullable=False)
    surname = Column(String(100), nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    job_title = Column(String(150), nullable=True)
    company = Column(String(150), nullable=True)
    timezone = Column(String(50), default="UTC")
    is_active = Column(Boolean, default=True)
    is_email_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationship with password reset tokens
    password_resets = relationship("PasswordReset", back_populates="user", cascade="all, delete-orphan")
    
    # Relationship with meetings
    meetings = relationship("Meeting", back_populates="user", cascade="all, delete-orphan")
    
    # Relationship with Slack integrations
    slack_integrations = relationship("SlackIntegration", back_populates="user", cascade="all, delete-orphan")
    
    # Relationship with Google Calendar integration
    google_calendar_integration = relationship("GoogleCalendarIntegration", back_populates="user", uselist=False, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"


class PasswordReset(Base):
    __tablename__ = "password_resets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    token = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship with user
    user = relationship("User", back_populates="password_resets")
    
    def __repr__(self):
        return f"<PasswordReset(id={self.id}, user_id={self.user_id})>"


class SlackIntegration(Base):
    """Slack workspace integration for users"""
    __tablename__ = "slack_integrations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Slack workspace info
    workspace_id = Column(String, nullable=False)  # Slack team ID
    workspace_name = Column(String, nullable=False)
    workspace_url = Column(String, nullable=True)
    
    # OAuth tokens
    access_token = Column(String, nullable=False)  # Bot token
    user_access_token = Column(String, nullable=True)  # User token for enhanced permissions
    
    # Bot info
    bot_user_id = Column(String, nullable=False)  # Bot user ID in workspace
    bot_access_token = Column(String, nullable=False)  # Bot access token
    
    # Integration settings
    default_channel_id = Column(String, nullable=True)  # Default channel for notifications
    default_channel_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="slack_integrations")
    
    def __repr__(self):
        return f"<SlackIntegration(id={self.id}, workspace={self.workspace_name})>"


class GoogleCalendarIntegration(Base):
    """Google Calendar integration for users"""
    __tablename__ = "google_calendar_integrations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # OAuth tokens for calendar access
    access_token = Column(String, nullable=False)
    refresh_token = Column(String, nullable=True)  # For offline access
    token_expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Calendar settings
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="google_calendar_integration")
    
    def __repr__(self):
        return f"<GoogleCalendarIntegration(id={self.id}, user_id={self.user_id})>"
