from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from database import get_async_db
from auth.dependencies import get_current_user
from auth.models import User
from .service import google_calendar_service
from .schemas import UpcomingEventsResponse

router = APIRouter(prefix="/api/calendar", tags=["calendar"])


@router.get("/upcoming-events", response_model=UpcomingEventsResponse)
async def get_upcoming_events(
    limit: int = Query(default=3, le=20, description="Maximum number of events to return"),
    days_ahead: int = Query(default=7, le=30, description="Number of days ahead to search"),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get upcoming calendar events with meeting links for the current user
    
    This endpoint fetches upcoming events from the user's Google Calendar
    that contain meeting links (Google Meet, Zoom, Teams, etc.)
    """
    try:
        events_response = await google_calendar_service.get_upcoming_events(
            db=db,
            user_id=current_user.id,
            limit=limit,
            days_ahead=days_ahead
        )
        
        return events_response
        
    except Exception as e:
        print(f"❌ Error in get_upcoming_events: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch upcoming events: {str(e)}"
        )


@router.get("/health")
async def calendar_health():
    """Health check endpoint for calendar service"""
    return {"status": "healthy", "service": "calendar"} 