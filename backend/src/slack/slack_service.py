import httpx
import json
from typing import Dict, List, Optional, Any
from urllib.parse import urlencode

from settings import settings


class SlackService:
    """Service for Slack API integration"""
    
    def __init__(self):
        self.client_id = settings.SLACK_CLIENT_ID
        self.client_secret = settings.SLACK_CLIENT_SECRET
        self.signing_secret = settings.SLACK_SIGNING_SECRET
        
        # Slack API base URLs
        self.api_base_url = "https://slack.com/api"
        self.oauth_base_url = "https://slack.com/oauth/v2"
    
    def get_oauth_url(self, state: str, redirect_uri: str) -> str:
        """Generate Slack OAuth authorization URL"""
        params = {
            'client_id': self.client_id,
            'scope': 'channels:read,chat:write,users:read',
            'user_scope': 'channels:read,users:read',
            'redirect_uri': redirect_uri,
            'state': state
        }
        
        return f"{self.oauth_base_url}/authorize?{urlencode(params)}"
    
    async def exchange_code_for_token(self, code: str, redirect_uri: str) -> Dict[str, Any]:
        """Exchange authorization code for access tokens"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.oauth_base_url}/access",
                data={
                    'client_id': self.client_id,
                    'client_secret': self.client_secret,
                    'code': code,
                    'redirect_uri': redirect_uri
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"Failed to exchange code: {response.status_code}")
            
            return response.json()
    
    async def get_channels(self, access_token: str) -> List[Dict[str, Any]]:
        """Get list of channels in workspace"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.api_base_url}/conversations.list",
                headers={'Authorization': f'Bearer {access_token}'},
                params={
                    'types': 'public_channel,private_channel',
                    'exclude_archived': True,
                    'limit': 100
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"Failed to get channels: {response.status_code}")
            
            data = response.json()
            if not data.get('ok'):
                raise Exception(f"Slack API error: {data.get('error')}")
            
            return data.get('channels', [])
    
    async def get_workspace_info(self, access_token: str) -> Dict[str, Any]:
        """Get workspace information"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.api_base_url}/team.info",
                headers={'Authorization': f'Bearer {access_token}'}
            )
            
            if response.status_code != 200:
                raise Exception(f"Failed to get workspace info: {response.status_code}")
            
            data = response.json()
            if not data.get('ok'):
                raise Exception(f"Slack API error: {data.get('error')}")
            
            return data.get('team', {})
    
    async def send_message(self, bot_token: str, channel: str, text: str, blocks: Optional[List[Dict]] = None) -> Dict[str, Any]:
        """Send message to Slack channel"""
        async with httpx.AsyncClient() as client:
            payload = {
                'channel': channel,
                'text': text
            }
            
            if blocks:
                payload['blocks'] = blocks
            
            response = await client.post(
                f"{self.api_base_url}/chat.postMessage",
                headers={
                    'Authorization': f'Bearer {bot_token}',
                    'Content-Type': 'application/json'
                },
                json=payload
            )
            
            if response.status_code != 200:
                raise Exception(f"Failed to send message: {response.status_code}")
            
            data = response.json()
            if not data.get('ok'):
                raise Exception(f"Slack API error: {data.get('error')}")
            
            return data
    
    def format_meeting_summary_blocks(self, meeting_title: str, summary: str, meeting_url: str = None) -> List[Dict]:
        """Format meeting summary as Slack blocks"""
        blocks = [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": f"📋 {meeting_title}"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Краткое содержание встречи:*\n{summary}"
                }
            }
        ]
        
        if meeting_url:
            blocks.append({
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "🔗 Открыть полную запись"
                        },
                        "url": meeting_url,
                        "action_id": "view_meeting"
                    }
                ]
            })
        
        return blocks
    
    async def test_connection(self, bot_token: str) -> bool:
        """Test if bot token is valid"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.api_base_url}/auth.test",
                    headers={'Authorization': f'Bearer {bot_token}'}
                )
                
                if response.status_code != 200:
                    return False
                
                data = response.json()
                return data.get('ok', False)
        except Exception:
            return False


# Global instance
slack_service = SlackService() 