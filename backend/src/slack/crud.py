from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload
from typing import List, Optional, Dict, Any

from auth.models import User, SlackIntegration


class SlackCRUD:
    """CRUD operations for Slack integrations"""
    
    @staticmethod
    async def create_slack_integration(
        db: AsyncSession, 
        user_id: str, 
        integration_data: Dict[str, Any]
    ) -> SlackIntegration:
        """Create new Slack integration for user"""
        integration = SlackIntegration(
            user_id=user_id,
            workspace_id=integration_data['workspace_id'],
            workspace_name=integration_data['workspace_name'],
            workspace_url=integration_data.get('workspace_url'),
            access_token=integration_data['access_token'],
            user_access_token=integration_data.get('user_access_token'),
            bot_user_id=integration_data['bot_user_id'],
            bot_access_token=integration_data['bot_access_token'],
            default_channel_id=integration_data.get('default_channel_id'),
            default_channel_name=integration_data.get('default_channel_name'),
            is_active=True
        )
        
        db.add(integration)
        await db.commit()
        await db.refresh(integration)
        return integration
    
    @staticmethod
    async def get_user_slack_integrations(
        db: AsyncSession, 
        user_id: str
    ) -> List[SlackIntegration]:
        """Get all Slack integrations for user"""
        result = await db.execute(
            select(SlackIntegration)
            .where(SlackIntegration.user_id == user_id)
            .where(SlackIntegration.is_active == True)
        )
        return result.scalars().all()
    
    @staticmethod
    async def get_slack_integration_by_id(
        db: AsyncSession, 
        integration_id: str, 
        user_id: str
    ) -> Optional[SlackIntegration]:
        """Get specific Slack integration by ID"""
        result = await db.execute(
            select(SlackIntegration)
            .where(SlackIntegration.id == integration_id)
            .where(SlackIntegration.user_id == user_id)
            .where(SlackIntegration.is_active == True)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_slack_integration_by_workspace(
        db: AsyncSession, 
        user_id: str, 
        workspace_id: str
    ) -> Optional[SlackIntegration]:
        """Get Slack integration by workspace ID"""
        result = await db.execute(
            select(SlackIntegration)
            .where(SlackIntegration.user_id == user_id)
            .where(SlackIntegration.workspace_id == workspace_id)
            .where(SlackIntegration.is_active == True)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_slack_integration(
        db: AsyncSession, 
        integration_id: str, 
        user_id: str, 
        update_data: Dict[str, Any]
    ) -> Optional[SlackIntegration]:
        """Update Slack integration"""
        result = await db.execute(
            update(SlackIntegration)
            .where(SlackIntegration.id == integration_id)
            .where(SlackIntegration.user_id == user_id)
            .values(**update_data)
            .returning(SlackIntegration)
        )
        
        integration = result.scalar_one_or_none()
        if integration:
            await db.commit()
            await db.refresh(integration)
        
        return integration
    
    @staticmethod
    async def delete_slack_integration(
        db: AsyncSession, 
        integration_id: str, 
        user_id: str
    ) -> bool:
        """Delete (deactivate) Slack integration"""
        result = await db.execute(
            update(SlackIntegration)
            .where(SlackIntegration.id == integration_id)
            .where(SlackIntegration.user_id == user_id)
            .values(is_active=False)
        )
        
        if result.rowcount > 0:
            await db.commit()
            return True
        return False
    
    @staticmethod
    async def set_default_channel(
        db: AsyncSession, 
        integration_id: str, 
        user_id: str, 
        channel_id: str, 
        channel_name: str
    ) -> Optional[SlackIntegration]:
        """Set default channel for Slack integration"""
        return await SlackCRUD.update_slack_integration(
            db, 
            integration_id, 
            user_id, 
            {
                'default_channel_id': channel_id,
                'default_channel_name': channel_name
            }
        )


# Global instance
slack_crud = SlackCRUD() 