from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class SlackOAuthRequest(BaseModel):
    """Request schema for Slack OAuth callback"""
    code: str
    state: Optional[str] = None
    redirect_uri: str


class SlackChannelInfo(BaseModel):
    """Slack channel information"""
    id: str
    name: str
    is_private: bool = False
    is_member: bool = False
    num_members: Optional[int] = None


class SlackWorkspaceInfo(BaseModel):
    """Slack workspace information"""
    id: str
    name: str
    url: Optional[str] = None
    icon: Optional[Dict[str, Any]] = None


class SlackIntegrationResponse(BaseModel):
    """Response schema for Slack integration"""
    id: str
    workspace_id: str
    workspace_name: str
    workspace_url: Optional[str] = None
    default_channel_id: Optional[str] = None
    default_channel_name: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class SlackIntegrationCreate(BaseModel):
    """Schema for creating Slack integration"""
    workspace_id: str
    workspace_name: str
    workspace_url: Optional[str] = None
    access_token: str
    user_access_token: Optional[str] = None
    bot_user_id: str
    bot_access_token: str
    default_channel_id: Optional[str] = None
    default_channel_name: Optional[str] = None


class SlackIntegrationUpdate(BaseModel):
    """Schema for updating Slack integration"""
    default_channel_id: Optional[str] = None
    default_channel_name: Optional[str] = None
    is_active: Optional[bool] = None


class SlackSetChannelRequest(BaseModel):
    """Request to set default channel"""
    channel_id: str
    channel_name: str


class SlackSendMessageRequest(BaseModel):
    """Request to send message to Slack"""
    integration_id: str
    channel_id: Optional[str] = None  # If not provided, uses default channel
    message: str
    meeting_id: Optional[str] = None  # For formatted meeting summaries


class SlackOAuthUrlResponse(BaseModel):
    """Response with Slack OAuth URL"""
    oauth_url: str
    state: str


class SlackChannelsResponse(BaseModel):
    """Response with list of channels"""
    channels: List[SlackChannelInfo]
    workspace: SlackWorkspaceInfo


class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
    success: bool = True


class SlackIntegrationsListResponse(BaseModel):
    """Response with list of user's Slack integrations"""
    integrations: List[SlackIntegrationResponse]
    total: int 