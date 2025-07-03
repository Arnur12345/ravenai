import httpx
import re
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession

from auth.crud import get_google_calendar_integration
from .schemas import CalendarEvent, CalendarAttendee, UpcomingEventsResponse


class GoogleCalendarService:
    """Service for interacting with Google Calendar API"""
    
    BASE_URL = "https://www.googleapis.com/calendar/v3"
    
    def __init__(self):
        self.session = None
    
    async def _get_access_token(self, db: AsyncSession, user_id: str) -> Optional[str]:
        """Get valid access token for user"""
        integration = await get_google_calendar_integration(db, user_id)
        if not integration:
            return None
        
        # TODO: Check if token is expired and refresh if needed
        # For now, just return the stored token
        return integration.access_token
    
    def _extract_meeting_urls(self, event_data: dict) -> Optional[str]:
        """Extract meeting URLs from event data"""
        # Check hangoutLink (Google Meet)
        if 'hangoutLink' in event_data:
            return event_data['hangoutLink']
        
        # Check conferenceData for other meeting platforms
        if 'conferenceData' in event_data:
            conf_data = event_data['conferenceData']
            if 'entryPoints' in conf_data:
                for entry_point in conf_data['entryPoints']:
                    if entry_point.get('entryPointType') == 'video':
                        return entry_point.get('uri')
        
        # Check description for meeting links
        description = event_data.get('description', '')
        if description:
            # Look for common meeting URLs
            url_patterns = [
                r'https://meet\.google\.com/[a-z-]+',
                r'https://.*\.zoom\.us/j/\d+',
                r'https://teams\.microsoft\.com/.*',
                r'https://.*\.webex\.com/.*'
            ]
            
            for pattern in url_patterns:
                match = re.search(pattern, description)
                if match:
                    return match.group()
        
        return None
    
    def _parse_datetime(self, dt_data: dict) -> datetime:
        """Parse datetime from Google Calendar API response"""
        if 'dateTime' in dt_data:
            # Parse ISO format datetime
            dt_str = dt_data['dateTime']
            # Remove timezone info for simplicity (convert to UTC)
            if '+' in dt_str:
                dt_str = dt_str.split('+')[0]
            elif 'Z' in dt_str:
                dt_str = dt_str.replace('Z', '')
            
            return datetime.fromisoformat(dt_str)
        elif 'date' in dt_data:
            # All-day event, use start of day
            date_str = dt_data['date']
            return datetime.fromisoformat(date_str + 'T00:00:00')
        
        return datetime.utcnow()
    
    def _parse_attendees(self, attendees_data: List[dict]) -> List[CalendarAttendee]:
        """Parse attendees from Google Calendar API response"""
        attendees = []
        for attendee_data in attendees_data:
            attendee = CalendarAttendee(
                email=attendee_data.get('email', ''),
                name=attendee_data.get('displayName'),
                status=attendee_data.get('responseStatus')
            )
            attendees.append(attendee)
        return attendees
    
    async def get_upcoming_events(
        self, 
        db: AsyncSession, 
        user_id: str, 
        limit: int = 10,
        days_ahead: int = 7
    ) -> UpcomingEventsResponse:
        """Get upcoming calendar events with meeting links"""
        access_token = await self._get_access_token(db, user_id)
        if not access_token:
            return UpcomingEventsResponse(events=[], total_count=0)
        
        # Calculate time range
        now = datetime.utcnow()
        end_time = now + timedelta(days=days_ahead)
        
        # Format times for Google Calendar API
        time_min = now.isoformat() + 'Z'
        time_max = end_time.isoformat() + 'Z'
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.BASE_URL}/calendars/primary/events",
                    headers={
                        'Authorization': f'Bearer {access_token}',
                        'Accept': 'application/json'
                    },
                    params={
                        'timeMin': time_min,
                        'timeMax': time_max,
                        'maxResults': limit * 2,  # Get more to filter for meetings
                        'singleEvents': True,
                        'orderBy': 'startTime'
                    }
                )
                
                if response.status_code != 200:
                    print(f"❌ Calendar API error: {response.status_code} - {response.text}")
                    return UpcomingEventsResponse(events=[], total_count=0)
                
                data = response.json()
                events = []
                
                for item in data.get('items', []):
                    # Extract meeting URL
                    meeting_url = self._extract_meeting_urls(item)
                    
                    # Only include events with meeting links
                    if not meeting_url:
                        continue
                    
                    # Parse event data
                    start_time = self._parse_datetime(item.get('start', {}))
                    end_time = self._parse_datetime(item.get('end', {}))
                    
                    # Parse attendees
                    attendees_data = item.get('attendees', [])
                    attendees = self._parse_attendees(attendees_data)
                    
                    # Parse organizer
                    organizer = None
                    if 'organizer' in item:
                        org_data = item['organizer']
                        organizer = CalendarAttendee(
                            email=org_data.get('email', ''),
                            name=org_data.get('displayName')
                        )
                    
                    event = CalendarEvent(
                        id=item.get('id', ''),
                        title=item.get('summary', 'Untitled Event'),
                        description=item.get('description'),
                        start_time=start_time,
                        end_time=end_time,
                        meeting_url=meeting_url,
                        attendees=attendees,
                        organizer=organizer,
                        location=item.get('location')
                    )
                    
                    events.append(event)
                    
                    # Stop if we have enough events
                    if len(events) >= limit:
                        break
                
                return UpcomingEventsResponse(
                    events=events,
                    total_count=len(events)
                )
                
        except Exception as e:
            print(f"❌ Error fetching calendar events: {str(e)}")
            return UpcomingEventsResponse(events=[], total_count=0)


# Global service instance
google_calendar_service = GoogleCalendarService() 