import httpx
import re
from typing import Optional, Dict, Any, List
from urllib.parse import urlparse
from settings import settings
from .schemas import VexaBotRequest, VexaBotResponse, VexaTranscriptResponse, VexaTranscriptItem, VexaTranscriptSegment


class VexaService:
    """Service for interacting with Vexa.ai API"""
    
    def __init__(self):
        self.base_url = "http://74.161.160.54:18056"
        self.api_key = settings.VEXA_ADMIN_KEY
        
        if not self.api_key or self.api_key == "your-vexa-admin-key-here":
            raise ValueError(
                "VEXA_ADMIN_KEY is required for meeting functionality. "
                "Please set your Vexa.ai API key in the environment variables. "
                "Get your API key from: https://vexa.ai/get-started"
            )
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for Vexa API requests"""
        return {
            "X-API-Key": self.api_key,
            "Content-Type": "application/json"
        }
    
    def extract_meeting_id_from_url(self, meeting_url: str) -> str:
        """
        Extract meeting ID from Google Meet URL
        
        Examples:
        - https://meet.google.com/abc-defg-hij -> abc-defg-hij
        - https://meet.google.com/lookup/abc123?authuser=0 -> abc123
        """
        try:
            # Parse the URL
            parsed_url = urlparse(meeting_url)
            
            if "meet.google.com" not in parsed_url.netloc:
                raise ValueError("Only Google Meet URLs are supported currently")
            
            # Extract path without leading slash
            path = parsed_url.path.lstrip('/')
            
            # Handle different Google Meet URL formats
            if path.startswith('lookup/'):
                # Format: https://meet.google.com/lookup/abc123
                meeting_id = path.replace('lookup/', '')
            elif '/' not in path:
                # Format: https://meet.google.com/abc-defg-hij
                meeting_id = path
            else:
                # Other formats, take the last part
                meeting_id = path.split('/')[-1]
            
            # Clean up any query parameters
            meeting_id = meeting_id.split('?')[0]
            
            if not meeting_id:
                raise ValueError("Could not extract meeting ID from URL")
            
            return meeting_id
            
        except Exception as e:
            raise ValueError(f"Invalid meeting URL format: {str(e)}")
    
    async def create_bot(self, meeting_url: str, bot_name: str = "AfterTalkBot") -> Dict[str, Any]:
        """
        Create a bot for the meeting
        
        Args:
            meeting_url: Google Meet URL
            bot_name: Name for the bot
            
        Returns:
            Dict containing meeting_id, bot_id, and status
            
        Raises:
            Exception: If bot creation fails
        """
        try:
            # Extract meeting ID from URL
            native_meeting_id = self.extract_meeting_id_from_url(meeting_url)
            
            # Prepare request data
            request_data = VexaBotRequest(
                platform="google_meet",
                native_meeting_id=native_meeting_id,
                bot_name=bot_name
            )
            
            print(f"🤖 Creating Vexa bot for meeting: {native_meeting_id}")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/bots",
                    headers=self._get_headers(),
                    json=request_data.model_dump()
                )
                
                if response.status_code not in [200, 201]:
                    error_detail = response.text
                    print(f"❌ Vexa bot creation failed: {response.status_code} - {error_detail}")
                    raise Exception(f"Failed to create bot: {response.status_code} - {error_detail}")
                
                result = response.json()
                print(f"✅ Vexa bot created successfully: {result}")
                
                # Parse the real API response format
                bot_response = VexaBotResponse(**result)
                
                # Return the result in the expected format for internal use
                return {
                    "meeting_id": str(bot_response.id),  # Use the bot ID as meeting_id
                    "bot_id": bot_response.bot_container_id or f"bot_{native_meeting_id}",
                    "status": bot_response.status,
                    "platform": bot_response.platform,
                    "native_meeting_id": bot_response.native_meeting_id,
                    "bot_name": bot_name,
                    "vexa_bot_id": bot_response.id,
                    "constructed_meeting_url": bot_response.constructed_meeting_url
                }
                
        except httpx.RequestError as e:
            print(f"❌ Network error creating Vexa bot: {str(e)}")
            raise Exception(f"Network error: {str(e)}")
        except Exception as e:
            print(f"❌ Error creating Vexa bot: {str(e)}")
            raise
    
    async def get_transcripts(self, native_meeting_id: str) -> List[VexaTranscriptItem]:
        """
        Get transcripts for a meeting
        
        Args:
            native_meeting_id: Native meeting ID from the meeting URL (e.g., Google Meet ID)
            
        Returns:
            List of transcript items
            
        Raises:
            Exception: If transcript retrieval fails
        """
        try:
            print(f"📝 Fetching transcripts for meeting: {native_meeting_id}")
            
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.base_url}/transcripts/google_meet/{native_meeting_id}",
                    headers=self._get_headers()
                )
                
                if response.status_code == 404:
                    # No transcripts yet - this is normal for new meetings
                    print(f"📝 No transcripts available yet for meeting: {native_meeting_id}")
                    return []
                
                if response.status_code != 200:
                    error_detail = response.text
                    print(f"❌ Failed to get transcripts: {response.status_code} - {error_detail}")
                    raise Exception(f"Failed to get transcripts: {response.status_code} - {error_detail}")
                
                result = response.json()
                
                # Parse the real API response format
                transcript_response = VexaTranscriptResponse(**result)
                
                # Convert segments to legacy VexaTranscriptItem format for backward compatibility
                transcripts = []
                unknown_speaker_count = 0
                for segment in transcript_response.segments:
                    # Use absolute_start_time if available, otherwise use start time
                    time_str = segment.absolute_start_time or f"{segment.start}s"
                    
                    # Handle None speaker values with fallback
                    speaker_name = segment.speaker or "Unknown Speaker"
                    if not segment.speaker:
                        unknown_speaker_count += 1
                    
                    transcript_item = VexaTranscriptItem(
                        time=time_str,
                        speaker=speaker_name,
                        text=segment.text
                    )
                    transcripts.append(transcript_item)
                
                if unknown_speaker_count > 0:
                    print(f"⚠️ Found {unknown_speaker_count} segments with unknown speakers, using fallback names")
                
                print(f"✅ Retrieved {len(transcripts)} transcript items from {len(transcript_response.segments)} segments")
                return transcripts
                
        except httpx.RequestError as e:
            print(f"❌ Network error getting transcripts: {str(e)}")
            raise Exception(f"Network error: {str(e)}")
        except Exception as e:
            print(f"❌ Error getting transcripts: {str(e)}")
            raise
    
    async def stop_bot(self, native_meeting_id: str) -> bool:
        """
        Stop the bot for a meeting
        
        Args:
            native_meeting_id: Native meeting ID from the meeting URL (e.g., Google Meet ID)
            
        Returns:
            True if successful
            
        Raises:
            Exception: If stopping bot fails
        """
        try:
            print(f"🛑 Stopping Vexa bot for meeting: {native_meeting_id}")
            
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.delete(
                    f"{self.base_url}/bots/google_meet/{native_meeting_id}",
                    headers=self._get_headers()
                )
                
                if response.status_code not in [200, 204]:
                    error_detail = response.text
                    print(f"❌ Failed to stop bot: {response.status_code} - {error_detail}")
                    raise Exception(f"Failed to stop bot: {response.status_code} - {error_detail}")
                
                print(f"✅ Vexa bot stopped successfully")
                return True
                
        except httpx.RequestError as e:
            print(f"❌ Network error stopping bot: {str(e)}")
            raise Exception(f"Network error: {str(e)}")
        except Exception as e:
            print(f"❌ Error stopping bot: {str(e)}")
            raise


# Global service instance
vexa_service = VexaService() 