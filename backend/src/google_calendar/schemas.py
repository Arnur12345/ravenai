from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class CalendarAttendee(BaseModel):
    """Calendar event attendee information"""
    email: str
    name: Optional[str] = None
    status: Optional[str] = None  # 'accepted', 'declined', 'tentative', 'needsAction'


class CalendarEvent(BaseModel):
    """Calendar event information"""
    id: str
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    meeting_url: Optional[str] = None  # Google Meet, Zoom, etc.
    attendees: List[CalendarAttendee] = []
    organizer: Optional[CalendarAttendee] = None
    location: Optional[str] = None


class UpcomingEventsResponse(BaseModel):
    """Response for upcoming events API"""
    events: List[CalendarEvent]
    total_count: int 