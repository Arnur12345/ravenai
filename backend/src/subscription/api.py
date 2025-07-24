"""
Subscription API endpoints for Polar integration
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any, Optional
import json
import logging

from database import get_async_db
from auth.dependencies import get_current_user
from auth.models import User, Subscription, WebhookEvent
from .polar_client import polar_service, get_price_id_for_plan
from .usage_tracker import get_user_usage, UsageTracker
from .schemas import (
    CheckoutRequest, 
    CheckoutResponse, 
    SubscriptionStatusResponse,
    CustomerPortalResponse,
    UsageLimitsResponse
)
from .webhook_handler import handle_webhook_event

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/create-checkout", response_model=CheckoutResponse)
async def create_checkout_session(
    request: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Create a checkout session for subscription"""
    
    # Check if Polar is configured
    if not polar_service.is_configured():
        raise HTTPException(
            status_code=503,
            detail="Payment service is not configured"
        )
    
    # Get price ID for the requested plan
    price_id = get_price_id_for_plan(request.plan_type, request.billing_cycle)
    if not price_id:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid plan: {request.plan_type}_{request.billing_cycle}"
        )
    
    # Check if user already has an active subscription
    existing_subscription = await db.execute(
        select(Subscription).where(
            Subscription.user_id == current_user.id,
            Subscription.status == "active"
        )
    )
    if existing_subscription.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="User already has an active subscription"
        )
    
    # Create checkout session
    metadata = {
        "user_id": current_user.id,
        "plan_type": request.plan_type,
        "billing_cycle": request.billing_cycle
    }
    
    checkout_session = await polar_service.create_checkout_session(
        user_email=current_user.email,
        product_price_id=price_id,
        metadata=metadata
    )
    
    if not checkout_session:
        raise HTTPException(
            status_code=500,
            detail="Failed to create checkout session"
        )
    
    return CheckoutResponse(**checkout_session)


@router.get("/status", response_model=SubscriptionStatusResponse)
async def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get current user's subscription status"""
    
    # Get active subscription
    subscription_query = await db.execute(
        select(Subscription).where(
            Subscription.user_id == current_user.id,
            Subscription.status == "active"
        )
    )
    subscription = subscription_query.scalar_one_or_none()
    
    return SubscriptionStatusResponse(
        is_active=current_user.subscription_status == "active",
        tier=current_user.subscription_tier,
        subscription_id=current_user.current_subscription_id,
        ends_at=current_user.subscription_ends_at,
        monthly_meetings_used=current_user.monthly_meetings_count,
        monthly_transcription_minutes_used=current_user.monthly_transcription_minutes,
        can_create_meeting=current_user.can_create_meeting(),
        subscription_details=subscription.__dict__ if subscription else None
    )


@router.post("/customer-portal", response_model=CustomerPortalResponse)
async def create_customer_portal_session(
    current_user: User = Depends(get_current_user)
):
    """Create customer portal session for subscription management"""
    
    if not current_user.polar_customer_id:
        raise HTTPException(
            status_code=400,
            detail="User has no customer ID"
        )
    
    portal_url = await polar_service.create_customer_portal_session(
        customer_id=current_user.polar_customer_id
    )
    
    if not portal_url:
        raise HTTPException(
            status_code=500,
            detail="Failed to create customer portal session"
        )
    
    return CustomerPortalResponse(portal_url=portal_url)


@router.post("/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Cancel user's current subscription"""
    
    if not current_user.current_subscription_id:
        raise HTTPException(
            status_code=400,
            detail="User has no active subscription"
        )
    
    # Cancel subscription via Polar
    success = await polar_service.cancel_subscription(
        current_user.current_subscription_id
    )
    
    if not success:
        raise HTTPException(
            status_code=500,
            detail="Failed to cancel subscription"
        )
    
    return {"message": "Subscription cancellation requested"}


@router.get("/plans")
async def get_available_plans():
    """Get available subscription plans"""
    return {
        "plans": [
            {
                "id": "pro",
                "name": "Pro Plan",
                "description": "Perfect for small teams and individuals",
                "features": [
                    "100 meetings per month",
                    "20 hours of transcription",
                    "AI summaries and notes",
                    "Slack integration",
                    "Priority support"
                ],
                "pricing": {
                    "monthly": {"amount": 2900, "currency": "USD"},  # $29/month
                    "yearly": {"amount": 29000, "currency": "USD"}   # $290/year (2 months free)
                }
            },
            {
                "id": "enterprise",
                "name": "Enterprise Plan",
                "description": "For larger teams and organizations",
                "features": [
                    "Unlimited meetings",
                    "Unlimited transcription",
                    "Advanced AI features",
                    "Multiple integrations",
                    "Dedicated support",
                    "Custom branding"
                ],
                "pricing": {
                    "monthly": {"amount": 9900, "currency": "USD"},  # $99/month
                    "yearly": {"amount": 99000, "currency": "USD"}   # $990/year (2 months free)
                }
            }
        ]
    }


@router.post("/webhooks/polar")
async def handle_polar_webhook(
    request: Request,
    db: AsyncSession = Depends(get_async_db)
):
    """Handle Polar webhook events"""
    
    # Get raw payload and signature
    payload = await request.body()
    signature = request.headers.get("polar-signature")
    
    if not signature:
        raise HTTPException(status_code=400, detail="Missing signature")
    
    try:
        # Verify webhook signature and process event
        success = await handle_webhook_event(payload, signature, db)
        
        if success:
            return {"status": "success"}
        else:
            raise HTTPException(status_code=400, detail="Webhook processing failed")
            
    except Exception as e:
        logger.error(f"Webhook processing error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/usage", response_model=UsageLimitsResponse)
async def get_usage_limits(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get user's current usage and limits"""
    usage_data = await get_user_usage(current_user, db)
    
    return UsageLimitsResponse(
        tier=usage_data['tier'],
        monthly_meetings_limit=usage_data['usage']['meetings']['limit'],
        monthly_transcription_minutes_limit=usage_data['usage']['transcription_minutes']['limit'],
        monthly_meetings_used=usage_data['usage']['meetings']['used'],
        monthly_transcription_minutes_used=usage_data['usage']['transcription_minutes']['used'],
        can_create_meeting=usage_data['can_create_meeting'],
        usage_reset_date=usage_data['usage_reset_date']
    )


@router.get("/tier-info/{tier}")
async def get_tier_information(tier: str):
    """Get information about a specific subscription tier"""
    tier_info = await UsageTracker.get_tier_info(tier)
    if not tier_info:
        raise HTTPException(status_code=404, detail="Tier not found")
    
    return {
        "tier": tier,
        "limits": {
            "monthly_meetings": tier_info.get('monthly_meetings'),
            "monthly_transcription_minutes": tier_info.get('monthly_transcription_minutes')
        },
        "features": tier_info.get('features', [])
    }


@router.get("/health")
async def subscription_health_check():
    """Health check for subscription service"""
    return {
        "status": "healthy",
        "polar_configured": polar_service.is_configured(),
        "features": ["subscription_management", "polar_integration", "webhook_processing"]
    }