"""
Polar SDK client configuration and wrapper functions
"""
import os
import logging
from typing import Optional, Dict, Any
from polar_sdk import Polar
from settings import settings

logger = logging.getLogger(__name__)

class PolarService:
    """Service class for interacting with Polar API"""
    
    def __init__(self):
        self.client = self._initialize_client()
        
    def _initialize_client(self) -> Optional[Polar]:
        """Initialize Polar SDK client"""
        try:
            if not settings.POLAR_ACCESS_TOKEN:
                logger.warning("POLAR_ACCESS_TOKEN not configured")
                return None
                
            # Initialize client based on environment
            if settings.POLAR_ENVIRONMENT == "production":
                client = Polar(access_token=settings.POLAR_ACCESS_TOKEN)
            else:
                client = Polar(
                    server="sandbox",
                    access_token=settings.POLAR_ACCESS_TOKEN
                )
            
            logger.info(f"Polar client initialized for {settings.POLAR_ENVIRONMENT} environment")
            return client
            
        except Exception as e:
            logger.error(f"Failed to initialize Polar client: {e}")
            return None
    
    def is_configured(self) -> bool:
        """Check if Polar is properly configured"""
        return self.client is not None
    
    async def create_checkout_session(
        self, 
        user_email: str, 
        product_price_id: str, 
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """Create a checkout session for subscription"""
        if not self.client:
            logger.error("Polar client not configured")
            return None
            
        try:
            success_url = f"{settings.FRONTEND_SUCCESS_URL}?session_id={{CHECKOUT_SESSION_ID}}"
            cancel_url = settings.FRONTEND_CANCEL_URL
            
            checkout_data = {
                "product_price_id": product_price_id,
                "success_url": success_url,
                "customer_email": user_email,
                "metadata": metadata or {}
            }
            
            checkout = self.client.checkouts.create(checkout_data)
            
            return {
                "checkout_id": checkout.id,
                "checkout_url": checkout.url,
                "status": "created"
            }
            
        except Exception as e:
            logger.error(f"Failed to create checkout session: {e}")
            return None
    
    async def get_checkout_session(self, checkout_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve checkout session details"""
        if not self.client:
            return None
            
        try:
            checkout = self.client.checkouts.get(checkout_id)
            return {
                "id": checkout.id,
                "status": checkout.status,
                "customer_email": getattr(checkout, 'customer_email', None),
                "metadata": getattr(checkout, 'metadata', {})
            }
        except Exception as e:
            logger.error(f"Failed to get checkout session: {e}")
            return None
    
    async def get_subscription(self, subscription_id: str) -> Optional[Dict[str, Any]]:
        """Get subscription details from Polar"""
        if not self.client:
            return None
            
        try:
            subscription = self.client.subscriptions.get(subscription_id)
            return {
                "id": subscription.id,
                "status": subscription.status,
                "customer_id": subscription.customer_id,
                "product_id": subscription.product_id,
                "current_period_start": subscription.current_period_start,
                "current_period_end": subscription.current_period_end,
                "metadata": getattr(subscription, 'metadata', {})
            }
        except Exception as e:
            logger.error(f"Failed to get subscription: {e}")
            return None
    
    async def cancel_subscription(self, subscription_id: str) -> bool:
        """Cancel a subscription"""
        if not self.client:
            return False
            
        try:
            self.client.subscriptions.cancel(subscription_id)
            return True
        except Exception as e:
            logger.error(f"Failed to cancel subscription: {e}")
            return False
    
    async def create_customer_portal_session(self, customer_id: str) -> Optional[str]:
        """Create customer portal session for subscription management"""
        if not self.client:
            return None
            
        try:
            portal_session = self.client.customers.portal.create(
                customer_id=customer_id,
                return_url=f"{settings.APP_BASE_URL}/dashboard"
            )
            return portal_session.url
        except Exception as e:
            logger.error(f"Failed to create customer portal session: {e}")
            return None

# Global instance
polar_service = PolarService()

# Product price IDs - these should be configured in environment or database
SUBSCRIPTION_PLANS = {
    "pro_monthly": os.getenv("POLAR_PRO_MONTHLY_PRICE_ID", ""),
    "pro_yearly": os.getenv("POLAR_PRO_YEARLY_PRICE_ID", ""),
    "enterprise_monthly": os.getenv("POLAR_ENTERPRISE_MONTHLY_PRICE_ID", ""),
    "enterprise_yearly": os.getenv("POLAR_ENTERPRISE_YEARLY_PRICE_ID", "")
}

def get_price_id_for_plan(plan_type: str, billing_cycle: str = "monthly") -> Optional[str]:
    """Get Polar price ID for a subscription plan"""
    plan_key = f"{plan_type}_{billing_cycle}"
    return SUBSCRIPTION_PLANS.get(plan_key)