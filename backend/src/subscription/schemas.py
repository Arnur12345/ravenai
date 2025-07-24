"""
Pydantic schemas for subscription API
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class CheckoutRequest(BaseModel):
    """Request model for creating checkout session"""
    plan_type: str = Field(..., description="Subscription plan type (pro, enterprise)")
    billing_cycle: str = Field(default="monthly", description="Billing cycle (monthly, yearly)")


class CheckoutResponse(BaseModel):
    """Response model for checkout session creation"""
    checkout_id: str
    checkout_url: str
    status: str


class SubscriptionStatusResponse(BaseModel):
    """Response model for subscription status"""
    is_active: bool
    tier: str
    subscription_id: Optional[str] = None
    ends_at: Optional[datetime] = None
    monthly_meetings_used: int = 0
    monthly_transcription_minutes_used: int = 0
    can_create_meeting: bool = True
    subscription_details: Optional[Dict[str, Any]] = None


class CustomerPortalResponse(BaseModel):
    """Response model for customer portal session"""
    portal_url: str


class UsageLimitsResponse(BaseModel):
    """Response model for usage limits"""
    tier: str
    monthly_meetings_limit: Optional[int] = None  # None = unlimited
    monthly_transcription_minutes_limit: Optional[int] = None  # None = unlimited
    monthly_meetings_used: int = 0
    monthly_transcription_minutes_used: int = 0
    can_create_meeting: bool = True
    usage_reset_date: Optional[datetime] = None


class WebhookEventModel(BaseModel):
    """Model for webhook event processing"""
    event_type: str
    data: Dict[str, Any]