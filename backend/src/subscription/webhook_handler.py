"""
Webhook handler for Polar events
"""
import json
import logging
from datetime import datetime
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from polar_sdk.webhooks import construct_event

from auth.models import User, Subscription, WebhookEvent
from settings import settings

logger = logging.getLogger(__name__)


async def handle_webhook_event(payload: bytes, signature: str, db: AsyncSession) -> bool:
    """
    Handle and process Polar webhook events
    """
    try:
        # Verify webhook signature
        event = construct_event(payload, signature, settings.POLAR_WEBHOOK_SECRET)
        
        # Store webhook event for tracking
        webhook_event = WebhookEvent(
            polar_event_id=event.get('id', ''),
            event_type=event.get('type', ''),
            payload=json.dumps(event),
            processed=False
        )
        db.add(webhook_event)
        await db.commit()
        
        # Process event based on type
        success = False
        try:
            if event['type'] == 'checkout.created':
                success = await handle_checkout_created(event['data'], db)
            elif event['type'] == 'order.created':
                success = await handle_order_created(event['data'], db)
            elif event['type'] == 'subscription.created':
                success = await handle_subscription_created(event['data'], db)
            elif event['type'] == 'subscription.updated':
                success = await handle_subscription_updated(event['data'], db)
            elif event['type'] == 'subscription.canceled':
                success = await handle_subscription_canceled(event['data'], db)
            else:
                logger.info(f"Unhandled webhook event type: {event['type']}")
                success = True  # Don't fail for unhandled events
            
            # Update webhook event status
            webhook_event.processed = success
            if success:
                webhook_event.processed_at = datetime.utcnow()
            await db.commit()
            
        except Exception as e:
            logger.error(f"Error processing webhook event {event['type']}: {e}")
            webhook_event.last_error = str(e)
            webhook_event.processing_attempts += 1
            await db.commit()
            success = False
        
        return success
        
    except Exception as e:
        logger.error(f"Failed to verify webhook signature: {e}")
        return False


async def handle_checkout_created(data: Dict[str, Any], db: AsyncSession) -> bool:
    """Handle checkout.created event"""
    logger.info(f"Processing checkout.created event")
    # Usually just for logging, the actual subscription is created on subscription.created
    return True


async def handle_order_created(data: Dict[str, Any], db: AsyncSession) -> bool:
    """Handle order.created event"""
    logger.info(f"Processing order.created event")
    # Handle one-time payments if needed
    return True


async def handle_subscription_created(data: Dict[str, Any], db: AsyncSession) -> bool:
    """Handle subscription.created event"""
    try:
        subscription_data = data.get('object', {})
        customer_email = subscription_data.get('customer', {}).get('email')
        
        if not customer_email:
            logger.error("No customer email in subscription.created event")
            return False
        
        # Find user by email
        user_query = await db.execute(
            select(User).where(User.email == customer_email)
        )
        user = user_query.scalar_one_or_none()
        
        if not user:
            logger.error(f"User not found for email: {customer_email}")
            return False
        
        # Extract subscription details
        polar_subscription_id = subscription_data.get('id')
        polar_customer_id = subscription_data.get('customer', {}).get('id')
        status = subscription_data.get('status', 'active')
        product_id = subscription_data.get('product', {}).get('id')
        price_id = subscription_data.get('price', {}).get('id')
        
        # Determine tier from metadata or product
        metadata = subscription_data.get('metadata', {})
        tier = metadata.get('plan_type', 'pro')  # Default to pro
        
        # Create subscription record
        subscription = Subscription(
            user_id=user.id,
            polar_subscription_id=polar_subscription_id,
            polar_customer_id=polar_customer_id,
            status=status,
            tier=tier,
            product_id=product_id,
            price_id=price_id,
            current_period_start=subscription_data.get('current_period_start'),
            current_period_end=subscription_data.get('current_period_end'),
            subscription_metadata=json.dumps(metadata)
        )
        db.add(subscription)
        
        # Update user subscription status
        user.polar_customer_id = polar_customer_id
        user.subscription_status = status
        user.subscription_tier = tier
        user.current_subscription_id = polar_subscription_id
        user.subscription_ends_at = subscription_data.get('current_period_end')
        
        await db.commit()
        
        logger.info(f"Created subscription for user {user.email}: {tier} tier")
        return True
        
    except Exception as e:
        logger.error(f"Error handling subscription.created: {e}")
        return False


async def handle_subscription_updated(data: Dict[str, Any], db: AsyncSession) -> bool:
    """Handle subscription.updated event"""
    try:
        subscription_data = data.get('object', {})
        polar_subscription_id = subscription_data.get('id')
        
        if not polar_subscription_id:
            logger.error("No subscription ID in subscription.updated event")
            return False
        
        # Find existing subscription
        subscription_query = await db.execute(
            select(Subscription).where(
                Subscription.polar_subscription_id == polar_subscription_id
            )
        )
        subscription = subscription_query.scalar_one_or_none()
        
        if not subscription:
            logger.error(f"Subscription not found: {polar_subscription_id}")
            return False
        
        # Update subscription details
        subscription.status = subscription_data.get('status', subscription.status)
        subscription.current_period_start = subscription_data.get('current_period_start')
        subscription.current_period_end = subscription_data.get('current_period_end')
        subscription.cancel_at_period_end = subscription_data.get('cancel_at_period_end', False)
        subscription.updated_at = datetime.utcnow()
        
        # Update user status
        user_query = await db.execute(
            select(User).where(User.id == subscription.user_id)
        )
        user = user_query.scalar_one_or_none()
        
        if user:
            user.subscription_status = subscription.status
            user.subscription_ends_at = subscription.current_period_end
            
        await db.commit()
        
        logger.info(f"Updated subscription: {polar_subscription_id}")
        return True
        
    except Exception as e:
        logger.error(f"Error handling subscription.updated: {e}")
        return False


async def handle_subscription_canceled(data: Dict[str, Any], db: AsyncSession) -> bool:
    """Handle subscription.canceled event"""
    try:
        subscription_data = data.get('object', {})
        polar_subscription_id = subscription_data.get('id')
        
        if not polar_subscription_id:
            logger.error("No subscription ID in subscription.canceled event")
            return False
        
        # Find existing subscription
        subscription_query = await db.execute(
            select(Subscription).where(
                Subscription.polar_subscription_id == polar_subscription_id
            )
        )
        subscription = subscription_query.scalar_one_or_none()
        
        if not subscription:
            logger.error(f"Subscription not found: {polar_subscription_id}")
            return False
        
        # Update subscription status
        subscription.status = 'canceled'
        subscription.canceled_at = datetime.utcnow()
        subscription.updated_at = datetime.utcnow()
        
        # Update user status
        user_query = await db.execute(
            select(User).where(User.id == subscription.user_id)
        )
        user = user_query.scalar_one_or_none()
        
        if user:
            user.subscription_status = 'canceled'
            user.subscription_tier = 'free'  # Revert to free tier
            user.current_subscription_id = None
            
        await db.commit()
        
        logger.info(f"Canceled subscription: {polar_subscription_id}")
        return True
        
    except Exception as e:
        logger.error(f"Error handling subscription.canceled: {e}")
        return False