"""
Usage tracking and limits enforcement for subscription tiers
"""
import logging
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import Optional, Dict, Any

from auth.models import User
from dashboard.models import Meeting

logger = logging.getLogger(__name__)


class UsageTracker:
    """Service for tracking and enforcing usage limits"""
    
    # Subscription tier limits
    TIER_LIMITS = {
        'free': {
            'monthly_meetings': 5,
            'monthly_transcription_minutes': 60,  # 1 hour
            'features': ['basic_transcription', 'basic_summaries']
        },
        'pro': {
            'monthly_meetings': 100,
            'monthly_transcription_minutes': 1200,  # 20 hours
            'features': [
                'advanced_transcription', 
                'ai_summaries', 
                'slack_integration',
                'google_calendar',
                'export_options'
            ]
        },
        'enterprise': {
            'monthly_meetings': None,  # Unlimited
            'monthly_transcription_minutes': None,  # Unlimited
            'features': [
                'unlimited_transcription',
                'advanced_ai_features',
                'custom_integrations',
                'priority_support',
                'custom_branding',
                'team_management'
            ]
        }
    }
    
    @classmethod
    async def check_meeting_limit(cls, user: User, db: AsyncSession) -> bool:
        """Check if user can create a new meeting"""
        await cls._reset_usage_if_needed(user, db)
        
        tier_limits = cls.TIER_LIMITS.get(user.subscription_tier, cls.TIER_LIMITS['free'])
        monthly_limit = tier_limits.get('monthly_meetings')
        
        # Unlimited for enterprise
        if monthly_limit is None:
            return True
        
        return user.monthly_meetings_count < monthly_limit
    
    @classmethod
    async def check_transcription_limit(cls, user: User, minutes: int, db: AsyncSession) -> bool:
        """Check if user can use additional transcription minutes"""
        await cls._reset_usage_if_needed(user, db)
        
        tier_limits = cls.TIER_LIMITS.get(user.subscription_tier, cls.TIER_LIMITS['free'])
        monthly_limit = tier_limits.get('monthly_transcription_minutes')
        
        # Unlimited for enterprise
        if monthly_limit is None:
            return True
        
        return (user.monthly_transcription_minutes + minutes) <= monthly_limit
    
    @classmethod
    async def increment_meeting_count(cls, user: User, db: AsyncSession) -> None:
        """Increment user's monthly meeting count"""
        await cls._reset_usage_if_needed(user, db)
        
        user.monthly_meetings_count += 1
        await db.commit()
        
        logger.info(f"User {user.email} meeting count: {user.monthly_meetings_count}")
    
    @classmethod
    async def add_transcription_minutes(cls, user: User, minutes: int, db: AsyncSession) -> None:
        """Add transcription minutes to user's usage"""
        await cls._reset_usage_if_needed(user, db)
        
        user.monthly_transcription_minutes += minutes
        await db.commit()
        
        logger.info(f"User {user.email} transcription minutes: {user.monthly_transcription_minutes}")
    
    @classmethod
    async def get_usage_summary(cls, user: User, db: AsyncSession) -> Dict[str, Any]:
        """Get comprehensive usage summary for user"""
        await cls._reset_usage_if_needed(user, db)
        
        tier_limits = cls.TIER_LIMITS.get(user.subscription_tier, cls.TIER_LIMITS['free'])
        
        # Calculate remaining usage
        meetings_limit = tier_limits.get('monthly_meetings')
        meetings_remaining = None if meetings_limit is None else max(0, meetings_limit - user.monthly_meetings_count)
        
        transcription_limit = tier_limits.get('monthly_transcription_minutes')
        transcription_remaining = None if transcription_limit is None else max(0, transcription_limit - user.monthly_transcription_minutes)
        
        return {
            'tier': user.subscription_tier,
            'subscription_status': user.subscription_status,
            'usage': {
                'meetings': {
                    'used': user.monthly_meetings_count,
                    'limit': meetings_limit,
                    'remaining': meetings_remaining,
                    'unlimited': meetings_limit is None
                },
                'transcription_minutes': {
                    'used': user.monthly_transcription_minutes,
                    'limit': transcription_limit,
                    'remaining': transcription_remaining,
                    'unlimited': transcription_limit is None
                }
            },
            'features': tier_limits.get('features', []),
            'usage_reset_date': user.usage_reset_date,
            'can_create_meeting': await cls.check_meeting_limit(user, db)
        }
    
    @classmethod
    async def has_feature(cls, user: User, feature: str) -> bool:
        """Check if user's subscription tier includes a specific feature"""
        tier_limits = cls.TIER_LIMITS.get(user.subscription_tier, cls.TIER_LIMITS['free'])
        return feature in tier_limits.get('features', [])
    
    @classmethod
    async def _reset_usage_if_needed(cls, user: User, db: AsyncSession) -> None:
        """Reset usage counters if a new billing period has started"""
        now = datetime.utcnow()
        
        # If no reset date is set, set it to beginning of current month
        if user.usage_reset_date is None:
            user.usage_reset_date = datetime(now.year, now.month, 1)
            user.monthly_meetings_count = 0
            user.monthly_transcription_minutes = 0
            await db.commit()
            return
        
        # Check if we've passed the reset date
        if now >= user.usage_reset_date:
            # Calculate next reset date (beginning of next month)
            if user.usage_reset_date.month == 12:
                next_reset = datetime(user.usage_reset_date.year + 1, 1, 1)
            else:
                next_reset = datetime(user.usage_reset_date.year, user.usage_reset_date.month + 1, 1)
            
            user.usage_reset_date = next_reset
            user.monthly_meetings_count = 0
            user.monthly_transcription_minutes = 0
            await db.commit()
            
            logger.info(f"Reset usage for user {user.email}, next reset: {next_reset}")
    
    @classmethod
    async def get_tier_info(cls, tier: str) -> Dict[str, Any]:
        """Get information about a subscription tier"""
        return cls.TIER_LIMITS.get(tier, cls.TIER_LIMITS['free'])


# Helper functions for easy import
async def can_create_meeting(user: User, db: AsyncSession) -> bool:
    """Check if user can create a meeting"""
    return await UsageTracker.check_meeting_limit(user, db)


async def can_use_transcription(user: User, minutes: int, db: AsyncSession) -> bool:
    """Check if user can use transcription minutes"""
    return await UsageTracker.check_transcription_limit(user, minutes, db)


async def track_meeting_created(user: User, db: AsyncSession) -> None:
    """Track that a meeting was created"""
    await UsageTracker.increment_meeting_count(user, db)


async def track_transcription_used(user: User, minutes: int, db: AsyncSession) -> None:
    """Track transcription minutes used"""
    await UsageTracker.add_transcription_minutes(user, minutes, db)


async def get_user_usage(user: User, db: AsyncSession) -> Dict[str, Any]:
    """Get user's usage summary"""
    return await UsageTracker.get_usage_summary(user, db)


async def user_has_feature(user: User, feature: str) -> bool:
    """Check if user has access to a feature"""
    return await UsageTracker.has_feature(user, feature)