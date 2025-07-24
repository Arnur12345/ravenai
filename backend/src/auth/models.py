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
    
    # Subscription-related fields
    polar_customer_id = Column(String, unique=True, nullable=True)
    subscription_status = Column(String, default='free')  # free, active, inactive, canceled
    subscription_tier = Column(String, default='free')  # free, pro, enterprise
    current_subscription_id = Column(String, nullable=True)
    subscription_ends_at = Column(DateTime(timezone=True), nullable=True)
    
    # Usage tracking for limits
    monthly_transcription_minutes = Column(Integer, default=0)
    monthly_meetings_count = Column(Integer, default=0)
    usage_reset_date = Column(DateTime(timezone=True), nullable=True)
    
    # Relationship with password reset tokens
    password_resets = relationship("PasswordReset", back_populates="user", cascade="all, delete-orphan")
    
    # Relationship with meetings
    meetings = relationship("Meeting", back_populates="user", cascade="all, delete-orphan")
    
    # Relationship with Slack integrations
    slack_integrations = relationship("SlackIntegration", back_populates="user", cascade="all, delete-orphan")
    
    # Relationship with Google Calendar integration
    google_calendar_integration = relationship("GoogleCalendarIntegration", back_populates="user", uselist=False, cascade="all, delete-orphan")
    
    # Relationship with subscriptions
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"
    
    def is_pro_user(self) -> bool:
        """Check if user has active pro subscription"""
        return self.subscription_status == 'active' and self.subscription_tier in ['pro', 'enterprise']
    
    def can_create_meeting(self) -> bool:
        """Check if user can create a new meeting based on their plan"""
        if self.subscription_tier == 'free':
            return self.monthly_meetings_count < 5  # Free tier limit
        elif self.subscription_tier == 'pro':
            return self.monthly_meetings_count < 100  # Pro tier limit
        else:  # enterprise
            return True  # Unlimited
    
    def can_use_transcription_minutes(self, minutes: int) -> bool:
        """Check if user has enough transcription minutes remaining"""
        if self.subscription_tier == 'free':
            return (self.monthly_transcription_minutes + minutes) <= 60  # 1 hour limit
        elif self.subscription_tier == 'pro':
            return (self.monthly_transcription_minutes + minutes) <= 1200  # 20 hours limit
        else:  # enterprise
            return True  # Unlimited


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


class Subscription(Base):
    """Subscription model for tracking user subscriptions"""
    __tablename__ = "subscriptions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Polar subscription details
    polar_subscription_id = Column(String, unique=True, nullable=False)
    polar_customer_id = Column(String, nullable=False)
    
    # Subscription details
    status = Column(String, nullable=False)  # active, inactive, canceled, past_due
    tier = Column(String, nullable=False)  # pro, enterprise
    product_id = Column(String, nullable=False)
    price_id = Column(String, nullable=False)
    
    # Billing information
    current_period_start = Column(DateTime(timezone=True), nullable=True)
    current_period_end = Column(DateTime(timezone=True), nullable=True)
    cancel_at_period_end = Column(Boolean, default=False)
    canceled_at = Column(DateTime(timezone=True), nullable=True)
    
    # Metadata
    subscription_metadata = Column(Text, nullable=True)  # JSON format for additional data
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="subscriptions")
    
    def __repr__(self):
        return f"<Subscription(id={self.id}, user_id={self.user_id}, status={self.status})>"


class WebhookEvent(Base):
    """Webhook event model for tracking Polar webhook events"""
    __tablename__ = "webhook_events"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Event details
    polar_event_id = Column(String, unique=True, nullable=False)
    event_type = Column(String, nullable=False)
    processed = Column(Boolean, default=False)
    processing_attempts = Column(Integer, default=0)
    
    # Event payload
    payload = Column(Text, nullable=False)  # JSON format
    
    # Error tracking
    last_error = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<WebhookEvent(id={self.id}, event_type={self.event_type}, processed={self.processed})>"
