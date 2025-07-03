from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
import secrets
import uuid

from database import get_async_db
from auth.dependencies import get_current_user
from auth.models import User
from dashboard.models import Meeting
from dashboard import crud as dashboard_crud

from .schemas import (
    SlackOAuthRequest, SlackOAuthUrlResponse, SlackChannelsResponse,
    SlackIntegrationResponse, SlackIntegrationsListResponse,
    SlackSetChannelRequest, SlackSendMessageRequest, MessageResponse,
    SlackChannelInfo, SlackWorkspaceInfo
)
from .slack_service import slack_service
from .crud import slack_crud

# Create Slack router
slack_router = APIRouter()


@slack_router.get("/oauth/url", response_model=SlackOAuthUrlResponse)
async def get_slack_oauth_url(
    redirect_uri: str = Query(..., description="Frontend redirect URI"),
    current_user: User = Depends(get_current_user)
):
    """
    Get Slack OAuth authorization URL
    
    This endpoint generates a Slack OAuth URL for the user to authorize
    the app to access their Slack workspace.
    """
    if not slack_service.client_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Slack integration is not configured"
        )
    
    # Generate state parameter for security
    state = f"{current_user.id}:{secrets.token_urlsafe(16)}"
    
    oauth_url = slack_service.get_oauth_url(state, redirect_uri)
    
    return SlackOAuthUrlResponse(
        oauth_url=oauth_url,
        state=state
    )


@slack_router.post("/oauth/callback", response_model=SlackIntegrationResponse)
async def slack_oauth_callback(
    oauth_data: SlackOAuthRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Handle Slack OAuth callback
    
    Exchanges the authorization code for access tokens and saves
    the integration to the database.
    """
    try:
        # Exchange code for tokens
        token_response = await slack_service.exchange_code_for_token(
            oauth_data.code, 
            oauth_data.redirect_uri
        )
        
        if not token_response.get('ok'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"OAuth error: {token_response.get('error', 'Unknown error')}"
            )
        
        # Get workspace info
        bot_token = token_response['access_token']
        workspace_info = await slack_service.get_workspace_info(bot_token)
        
        # Check if integration already exists
        existing_integration = await slack_crud.get_slack_integration_by_workspace(
            db, current_user.id, workspace_info['id']
        )
        
        if existing_integration:
            # Update existing integration
            updated_integration = await slack_crud.update_slack_integration(
                db, 
                existing_integration.id, 
                current_user.id,
                {
                    'access_token': token_response['access_token'],
                    'bot_access_token': token_response['access_token'],
                    'user_access_token': token_response.get('authed_user', {}).get('access_token'),
                    'is_active': True
                }
            )
            return SlackIntegrationResponse.from_orm(updated_integration)
        
        # Create new integration
        integration_data = {
            'workspace_id': workspace_info['id'],
            'workspace_name': workspace_info['name'],
            'workspace_url': workspace_info.get('url'),
            'access_token': token_response['access_token'],
            'user_access_token': token_response.get('authed_user', {}).get('access_token'),
            'bot_user_id': token_response['bot_user_id'],
            'bot_access_token': token_response['access_token']
        }
        
        integration = await slack_crud.create_slack_integration(
            db, current_user.id, integration_data
        )
        
        return SlackIntegrationResponse.from_orm(integration)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to complete Slack integration: {str(e)}"
        )


@slack_router.get("/integrations", response_model=SlackIntegrationsListResponse)
async def get_slack_integrations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get all Slack integrations for the current user
    """
    integrations = await slack_crud.get_user_slack_integrations(db, current_user.id)
    
    return SlackIntegrationsListResponse(
        integrations=[SlackIntegrationResponse.from_orm(i) for i in integrations],
        total=len(integrations)
    )


@slack_router.get("/integrations/{integration_id}/channels", response_model=SlackChannelsResponse)
async def get_slack_channels(
    integration_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get channels for a specific Slack integration
    """
    integration = await slack_crud.get_slack_integration_by_id(
        db, integration_id, current_user.id
    )
    
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slack integration not found"
        )
    
    try:
        # Get channels using bot token
        channels_data = await slack_service.get_channels(integration.bot_access_token)
        
        channels = [
            SlackChannelInfo(
                id=channel['id'],
                name=channel['name'],
                is_private=channel.get('is_private', False),
                is_member=channel.get('is_member', False),
                num_members=channel.get('num_members')
            )
            for channel in channels_data
        ]
        
        workspace = SlackWorkspaceInfo(
            id=integration.workspace_id,
            name=integration.workspace_name,
            url=integration.workspace_url
        )
        
        return SlackChannelsResponse(
            channels=channels,
            workspace=workspace
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get channels: {str(e)}"
        )


@slack_router.post("/integrations/{integration_id}/channel", response_model=SlackIntegrationResponse)
async def set_default_channel(
    integration_id: str,
    channel_data: SlackSetChannelRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Set default channel for Slack integration
    """
    updated_integration = await slack_crud.set_default_channel(
        db, 
        integration_id, 
        current_user.id, 
        channel_data.channel_id,
        channel_data.channel_name
    )
    
    if not updated_integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slack integration not found"
        )
    
    return SlackIntegrationResponse.from_orm(updated_integration)


@slack_router.post("/send-message", response_model=MessageResponse)
async def send_slack_message(
    message_data: SlackSendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Send message to Slack channel
    """
    integration = await slack_crud.get_slack_integration_by_id(
        db, message_data.integration_id, current_user.id
    )
    
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slack integration not found"
        )
    
    # Determine target channel
    target_channel = message_data.channel_id or integration.default_channel_id
    
    if not target_channel:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No channel specified and no default channel set"
        )
    
    try:
        # If meeting_id is provided, format as meeting summary
        if message_data.meeting_id:
            meeting = await dashboard_crud.get_meeting_by_id(
                db, message_data.meeting_id, current_user.id
            )
            
            if not meeting:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Meeting not found"
                )
            
            # Format as meeting summary
            meeting_title = f"Meeting Summary - {meeting.bot_name}"
            meeting_url = f"/meetings/{meeting.id}"  # Frontend URL
            
            blocks = slack_service.format_meeting_summary_blocks(
                meeting_title, 
                message_data.message, 
                meeting_url
            )
            
            await slack_service.send_message(
                integration.bot_access_token,
                target_channel,
                message_data.message,
                blocks
            )
        else:
            # Send simple message
            await slack_service.send_message(
                integration.bot_access_token,
                target_channel,
                message_data.message
            )
        
        return MessageResponse(message="Message sent successfully")
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to send message: {str(e)}"
        )


@slack_router.post("/integrations/{integration_id}/send-meeting-summary/{meeting_id}", response_model=MessageResponse)
async def send_meeting_summary_to_slack(
    integration_id: str,
    meeting_id: str,
    channel_id: str = Query(None, description="Target channel ID (optional, uses default if not provided)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Send meeting summary to Slack channel
    
    This endpoint is designed to be called from the meeting workspace
    after a meeting ends.
    """
    # Get integration
    integration = await slack_crud.get_slack_integration_by_id(
        db, integration_id, current_user.id
    )
    
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slack integration not found"
        )
    
    # Get meeting
    meeting = await dashboard_crud.get_meeting_by_id(db, meeting_id, current_user.id)
    
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found"
        )
    
    if not meeting.summary:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Meeting summary not available"
        )
    
    # Determine target channel
    target_channel = channel_id or integration.default_channel_id
    
    if not target_channel:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No channel specified and no default channel set"
        )
    
    try:
        # Format meeting summary
        meeting_title = f"Итоги встречи - {meeting.bot_name}"
        meeting_url = f"/meetings/{meeting.id}"  # Frontend URL
        
        blocks = slack_service.format_meeting_summary_blocks(
            meeting_title,
            meeting.summary,
            meeting_url
        )
        
        await slack_service.send_message(
            integration.bot_access_token,
            target_channel,
            f"📋 Итоги встречи готовы!\n\n{meeting.summary}",
            blocks
        )
        
        return MessageResponse(message="Meeting summary sent to Slack successfully")
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to send meeting summary: {str(e)}"
        )


@slack_router.delete("/integrations/{integration_id}", response_model=MessageResponse)
async def delete_slack_integration(
    integration_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Delete (deactivate) Slack integration
    """
    success = await slack_crud.delete_slack_integration(
        db, integration_id, current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slack integration not found"
        )
    
    return MessageResponse(message="Slack integration removed successfully")


@slack_router.get("/integrations/{integration_id}/test", response_model=MessageResponse)
async def test_slack_integration(
    integration_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Test Slack integration connection
    """
    integration = await slack_crud.get_slack_integration_by_id(
        db, integration_id, current_user.id
    )
    
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slack integration not found"
        )
    
    # Test connection
    is_valid = await slack_service.test_connection(integration.bot_access_token)
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slack integration connection failed"
        )
    
    return MessageResponse(message="Slack integration is working correctly") 