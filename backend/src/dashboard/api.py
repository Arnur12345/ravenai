from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Optional
from datetime import datetime

from database import get_async_db
from auth.dependencies import get_current_user
from auth.models import User
from .schemas import (
    MeetingCreate, MeetingUpdate, MeetingEnd, MeetingResponse,
    MeetingWithTranscripts, MeetingListResponse, TranscriptResponse,
    MessageResponse, ComprehensiveNotesRequest, ComprehensiveNotesResponse, ComprehensiveNotesUpdate,
    NotesSearchRequest, NotesExportRequest, SummaryCreate, SummaryUpdate, SummaryResponse,
    SummaryListResponse, DashboardResponse, DashboardStats, HeatmapData,
    StructuredNotesResponse, GenerateStructuredNotesRequest, StructuredMeetingNotesResponse,
    StatisticsResponse
)
from .service import dashboard_service
from .comprehensive_notes_service import comprehensive_notes_service
from .pdf_service import pdf_service

from . import crud

# Create dashboard router
dashboard_router = APIRouter()


@dashboard_router.post("/meetings", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
async def create_meeting(
    meeting_data: MeetingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Create a new meeting and start the Vexa bot
    
    This endpoint:
    1. Creates a meeting record in the database
    2. Starts a Vexa bot for the meeting URL
    3. Returns the meeting details with bot status
    """
    try:
        meeting = await dashboard_service.create_meeting(db, meeting_data, current_user.id)
        return meeting
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@dashboard_router.get("/meetings", response_model=MeetingListResponse)
async def get_user_meetings(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get all meetings for the current user with pagination
    
    Returns a paginated list of meetings ordered by creation date (newest first).
    """
    try:
        meetings = await dashboard_service.get_user_meetings(db, current_user.id, page, per_page)
        return meetings
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@dashboard_router.get("/meetings/{meeting_id}", response_model=MeetingWithTranscripts)
async def get_meeting_details(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get detailed information about a specific meeting including transcripts
    
    Returns meeting details with all associated transcripts.
    """
    try:
        meeting = await dashboard_service.get_meeting_with_transcripts(db, meeting_id, current_user.id)
        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting not found"
            )
        return meeting
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@dashboard_router.patch("/meetings/{meeting_id}", response_model=MeetingResponse)
async def update_meeting(
    meeting_id: str,
    update_data: MeetingUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Update meeting details
    
    Allows updating user notes, status, and other meeting metadata.
    """
    try:
        meeting = await crud.update_meeting(db, meeting_id, current_user.id, update_data)
        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting not found"
            )
        return MeetingResponse.from_orm(meeting)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@dashboard_router.post("/meetings/{meeting_id}/end", response_model=MeetingResponse)
async def end_meeting(
    meeting_id: str,
    end_data: Optional[MeetingEnd] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    End a meeting and optionally add final notes
    
    This endpoint:
    1. Updates the meeting status to 'ended'
    2. Sets the end timestamp
    3. Optionally updates user notes
    """
    try:
        print(f"🔍 API DEBUG: Received end_meeting request")
        print(f"🔍 API DEBUG: meeting_id: {meeting_id}")
        print(f"🔍 API DEBUG: end_data: {end_data}")
        print(f"🔍 API DEBUG: end_data type: {type(end_data)}")
        print(f"🔍 API DEBUG: current_user.id: {current_user.id}")
        
        # Create default end_data if none provided
        if end_data is None:
            print(f"🔍 API DEBUG: Creating default end_data")
            end_data = MeetingEnd(user_notes=None)
        
        meeting = await dashboard_service.end_meeting(db, meeting_id, current_user.id, end_data)
        return meeting
    except Exception as e:
        print(f"❌ API DEBUG: Exception in end_meeting: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@dashboard_router.delete("/meetings/{meeting_id}", response_model=MessageResponse)
async def delete_meeting(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Delete a meeting and all associated data
    
    This will permanently delete the meeting, its transcripts, and notes.
    """
    try:
        success = await crud.delete_meeting(db, meeting_id, current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting not found"
            )
        return MessageResponse(message="Meeting deleted successfully")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@dashboard_router.get("/meetings/{meeting_id}/summary")
async def get_meeting_summary(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get AI-generated meeting summary
    
    Returns the meeting summary if it exists, otherwise triggers generation.
    """
    try:
        meeting = await dashboard_service.get_meeting_with_transcripts(db, meeting_id, current_user.id)
        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting not found"
            )
        
        # If no summary exists and meeting is ended, generate it
        if not meeting.summary and meeting.status == "ended":
            try:
                await dashboard_service.generate_meeting_summary(db, meeting_id, current_user.id)
                # Refresh meeting data
                meeting = await dashboard_service.get_meeting_with_transcripts(db, meeting_id, current_user.id)
            except Exception as e:
                print(f"Failed to generate summary: {str(e)}")
                
        return {
            "meeting_id": meeting.id,
            "summary": meeting.summary,
            "summary_generated_at": meeting.summary_generated_at,
            "status": meeting.status,
            "participants": list(set([t.speaker for t in meeting.transcripts if t.speaker and t.speaker != "Unknown Speaker"])),
            "transcript_count": len(meeting.transcripts),
            "meeting_platform": meeting.meeting_platform,
            "started_at": meeting.started_at,
            "ended_at": meeting.ended_at
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# Health check endpoint for dashboard
@dashboard_router.get("/health", response_model=MessageResponse)
async def dashboard_health():
    """
    Health check endpoint for dashboard service
    
    Returns a simple message indicating the service is running.
    """
    return MessageResponse(message="Dashboard service is healthy")


@dashboard_router.get("/overview", response_model=DashboardResponse)
async def get_dashboard_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get complete dashboard overview including stats, recent meetings, and heatmap data
    
    Returns:
        Complete dashboard data for the current user
    """
    try:
        overview = await dashboard_service.get_dashboard_overview(db, current_user.id)
        return DashboardResponse(**overview)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@dashboard_router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get dashboard statistics only
    
    Returns:
        Statistics about meetings, summaries, and tasks for the current user
    """
    try:
        stats = await dashboard_service.get_dashboard_stats(db, current_user.id)
        return DashboardStats(**stats)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@dashboard_router.get("/heatmap", response_model=List[HeatmapData])
async def get_dashboard_heatmap(
    year: Optional[int] = Query(None, description="Year for heatmap data"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get meeting heatmap data for a specific year
    
    Returns:
        Heatmap data showing meeting count by date
    """
    try:
        heatmap_data = await crud.get_meeting_heatmap_data(db, current_user.id, year)
        return [HeatmapData(**item) for item in heatmap_data]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@dashboard_router.get("/trends")
async def get_meeting_trends(
    days: int = Query(7, ge=1, le=30, description="Number of days for trends data"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get meeting trends data for the last N days
    
    Returns:
        Trends data showing meetings and summaries count by date
    """
    try:
        trends_data = await crud.get_meeting_trends_data(db, current_user.id, days)
        return trends_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# Summary endpoints
@dashboard_router.post("/summaries", response_model=SummaryResponse, status_code=status.HTTP_201_CREATED)
async def create_summary(
    summary_data: SummaryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Create a new summary for a meeting
    """
    try:
        summary = await crud.create_summary(db, summary_data, current_user.id)
        return SummaryResponse.from_orm(summary)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@dashboard_router.get("/summaries", response_model=SummaryListResponse)
async def get_user_summaries(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get all summaries for the current user with pagination
    """
    try:
        skip = (page - 1) * per_page
        summaries = await crud.get_summaries_by_user(db, current_user.id, skip, per_page)
        total = await crud.count_summaries_by_user(db, current_user.id)
        
        summary_responses = [SummaryResponse.from_orm(summary) for summary in summaries]
        
        return SummaryListResponse(
            summaries=summary_responses,
            total=total,
            page=page,
            per_page=per_page
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@dashboard_router.get("/meetings/{meeting_id}/summaries", response_model=List[SummaryResponse])
async def get_meeting_summaries(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get all summaries for a specific meeting
    """
    try:
        summaries = await crud.get_summaries_by_meeting(db, meeting_id, current_user.id)
        return [SummaryResponse.from_orm(summary) for summary in summaries]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@dashboard_router.patch("/summaries/{summary_id}", response_model=SummaryResponse)
async def update_summary(
    summary_id: str,
    update_data: SummaryUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Update summary details
    """
    try:
        summary = await crud.update_summary(db, summary_id, current_user.id, update_data)
        if not summary:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Summary not found"
            )
        return SummaryResponse.from_orm(summary)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@dashboard_router.delete("/summaries/{summary_id}", response_model=MessageResponse)
async def delete_summary(
    summary_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Delete a summary
    """
    try:
        success = await crud.delete_summary(db, summary_id, current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Summary not found"
            )
        return MessageResponse(message="Summary deleted successfully")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# Analytics endpoints
# Comprehensive Notes endpoints
@dashboard_router.post("/meetings/{meeting_id}/comprehensive-notes", response_model=ComprehensiveNotesResponse)
async def create_comprehensive_notes(
    meeting_id: str,
    notes_request: ComprehensiveNotesRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Generate comprehensive notes for a meeting
    
    This endpoint combines AI summary, user notes, and transcript highlights
    into a comprehensive notes document using AI enhancement.
    """
    try:
        notes = await comprehensive_notes_service.generate_comprehensive_notes(
            db, meeting_id, current_user.id, notes_request
        )
        return notes
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@dashboard_router.get("/meetings/{meeting_id}/comprehensive-notes", response_model=List[ComprehensiveNotesResponse])
async def get_meeting_comprehensive_notes(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get all comprehensive notes for a specific meeting
    
    Returns all versions of comprehensive notes for the meeting.
    """
    try:
        notes_list = await comprehensive_notes_service.get_meeting_notes(db, meeting_id, current_user.id)
        return notes_list
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@dashboard_router.get("/meetings/{meeting_id}/transcripts", response_model=List[TranscriptResponse])
async def sync_meeting_transcripts(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Sync and get the latest transcripts for a meeting
    
    This endpoint:
    1. Checks if meeting is still active (prevents sync for ended meetings)
    2. Fetches the latest transcripts from Vexa (only for active meetings)
    3. Updates the database with new transcript data
    4. Returns all transcript entries for the meeting
    
    Note: Transcript syncing is automatically stopped for ended meetings to reduce server load.
    """
    try:
        transcripts = await dashboard_service.sync_transcripts(db, meeting_id, current_user.id)
        return transcripts
    except Exception as e:
        # Enhanced error message for ended meetings
        if "Meeting has ended" in str(e) or "avoid server overload" in str(e):
            raise HTTPException(
                status_code=status.HTTP_410_GONE,  # 410 Gone - resource no longer available
                detail="Meeting has ended. Transcript syncing is no longer available to reduce server load."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@dashboard_router.put("/meetings/{meeting_id}/notes", response_model=MeetingResponse)
async def update_meeting_notes(
    meeting_id: str,
    notes_data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Update user notes for a meeting
    
    Allows users to add or update their personal notes for a meeting.
    """
    try:
        user_notes = notes_data.get("user_notes", "")
        meeting = await dashboard_service.update_meeting_notes(db, meeting_id, current_user.id, user_notes)
        return meeting
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@dashboard_router.post("/comprehensive-notes/search", response_model=List[ComprehensiveNotesResponse])
async def search_comprehensive_notes(
    search_request: NotesSearchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Search comprehensive notes
    
    Search across all user's comprehensive notes using text search, filters,
    and date ranges.
    """
    try:
        notes_list = await comprehensive_notes_service.search_comprehensive_notes(
            db, current_user.id, search_request
        )
        return notes_list
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@dashboard_router.get("/comprehensive-notes/statistics")
async def get_notes_statistics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get comprehensive notes statistics
    
    Returns statistics about the user's comprehensive notes including counts,
    template distribution, and usage patterns.
    """
    try:
        stats = await comprehensive_notes_service.get_notes_statistics(
            db, current_user.id
        )
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@dashboard_router.delete("/comprehensive-notes/{notes_id}")
async def delete_comprehensive_notes(
    notes_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Delete comprehensive notes
    
    Permanently deletes the specified comprehensive notes.
    """
    try:
        success = await comprehensive_notes_service.delete_comprehensive_notes(
            db, notes_id, current_user.id
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comprehensive notes not found"
            )
        return {"message": "Comprehensive notes deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# Structured Notes endpoints (New Implementation)
@dashboard_router.post("/meetings/{meeting_id}/structured-notes", response_model=SummaryResponse)
async def generate_structured_meeting_notes(
    meeting_id: str,
    request: Optional[GenerateStructuredNotesRequest] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Generate structured meeting notes using GPT-4o and save as summary
    
    This endpoint creates beautifully structured notes with:
    - Action items with tasks, descriptions, deadlines, and assignees
    - Key Updates with important information and decisions
    - Ideas & Insights with creative suggestions and future possibilities
    
    The notes are generated from meeting transcripts using AI analysis and saved as a summary.
    If a summary already exists for this meeting, it returns the existing one instead of creating a duplicate.
    """
    try:
        # First, check if we already have a structured summary for this meeting
        existing_summaries = await crud.get_summaries_by_meeting(db, meeting_id, current_user.id)
        
        # Look for AI-generated structured notes summary
        for summary in existing_summaries:
            if (summary.summary_type == "ai_generated" and 
                summary.tags and "structured_notes" in summary.tags):
                print(f"✅ Found existing structured summary for meeting {meeting_id}")
                return SummaryResponse.from_orm(summary)
        
        print(f"🔍 No existing structured summary found, generating new one for meeting {meeting_id}")
        
        # Generate structured notes using AI
        structured_notes = await comprehensive_notes_service.generate_structured_meeting_notes(
            db, meeting_id, current_user.id, request.model_dump() if request else {}
        )
        
        # Convert structured notes to summary format
        import json
        summary_content = "# 📋 Meeting Summary\n\n"
        
        if structured_notes['notes']['to_do']:
            summary_content += "## 🎯 Action Items\n\n"
            for i, item in enumerate(structured_notes['notes']['to_do'], 1):
                summary_content += f"### {i}. {item['task_name']} 📋\n\n"
                summary_content += f"**Assignee:** {item['assignee']}\n\n"
                summary_content += f"**Deadline:** {item['deadline']}\n\n"
                summary_content += f"**Description:** {item['task_description']}\n\n"
                summary_content += "---\n\n"
        
        if structured_notes['notes']['key_updates']:
            summary_content += "## 📢 Key Updates\n\n"
            for update in structured_notes['notes']['key_updates']:
                summary_content += f"### {update['update_number']}. Update #{update['update_number']} 📋\n\n"
                summary_content += f"**Description:** {update['update_description']}\n\n"
                summary_content += "---\n\n"
        
        if structured_notes['notes']['brainstorming_ideas']:
            summary_content += "## 💡 Ideas & Insights\n\n"
            for idea in structured_notes['notes']['brainstorming_ideas']:
                summary_content += f"### {idea['idea_number']}. Idea #{idea['idea_number']} 💡\n\n"
                summary_content += f"**Description:** {idea['idea_description']}\n\n"
                summary_content += "---\n\n"
        
        # Create summary data
        from .schemas import SummaryCreate
        summary_data = SummaryCreate(
            meeting_id=meeting_id,
            title=f"AI Meeting Summary - {datetime.now().strftime('%B %d, %Y')}",
            content=summary_content,
            summary_type="ai_generated",
            action_items=json.dumps(structured_notes['notes']['to_do']) if structured_notes['notes']['to_do'] else None,
            key_points=json.dumps(structured_notes['notes']['key_updates']) if structured_notes['notes']['key_updates'] else None,
            decisions=json.dumps(structured_notes['notes']['brainstorming_ideas']) if structured_notes['notes']['brainstorming_ideas'] else None,
            tags="ai_generated,structured_notes",
            is_favorite=False
        )
        
        # Save as summary in database
        summary = await crud.create_summary(db, summary_data, current_user.id)
        print(f"✅ Created new structured summary for meeting {meeting_id}")
        return SummaryResponse.from_orm(summary)
        
    except Exception as e:
        print(f"❌ Error in generate_structured_meeting_notes: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@dashboard_router.get("/meetings/{meeting_id}/structured-notes", response_model=SummaryResponse)
async def get_structured_meeting_notes(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get structured meeting notes (summary) for a specific meeting
    """
    try:
        summaries = await crud.get_summaries_by_meeting(db, meeting_id, current_user.id)
        
        # Find AI-generated summary
        ai_summary = None
        for summary in summaries:
            if summary.summary_type == "ai_generated" and "structured_notes" in (summary.tags or ""):
                ai_summary = summary
                break
        
        if not ai_summary:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No structured notes found for this meeting"
            )
        
        return SummaryResponse.from_orm(ai_summary)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# PDF Export endpoints
@dashboard_router.get("/summaries/{summary_id}/download-pdf")
async def download_summary_pdf(
    summary_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Download PDF version of a meeting summary
    
    Generates and returns a formatted PDF document containing the meeting summary
    with proper styling, meeting information, and metadata.
    """
    try:
        # Generate PDF
        pdf_bytes = await pdf_service.generate_summary_pdf(db, summary_id, current_user.id)
        
        if not pdf_bytes:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Summary not found or could not generate PDF"
            )
        
        # Get summary and meeting for filename
        summary = await crud.get_summary_by_id(db, summary_id, current_user.id)
        meeting = await crud.get_meeting_by_id(db, summary.meeting_id, current_user.id)
        
        filename = pdf_service.get_pdf_filename(summary, meeting)
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Type": "application/pdf"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error downloading summary PDF: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate PDF"
        )


@dashboard_router.get("/meetings/{meeting_id}/download-pdf")
async def download_meeting_pdf(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Download PDF version of latest meeting summary
    
    Generates and returns a formatted PDF document containing the latest
    meeting summary with proper styling, meeting information, and metadata.
    """
    try:
        # Generate PDF
        pdf_bytes = await pdf_service.generate_meeting_pdf(db, meeting_id, current_user.id)
        
        if not pdf_bytes:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting not found, no summaries available, or could not generate PDF"
            )
        
        # Get meeting for filename
        meeting = await crud.get_meeting_by_id(db, meeting_id, current_user.id)
        summaries = await crud.get_summaries_by_meeting(db, meeting_id, current_user.id)
        
        if not summaries:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No summaries found for this meeting"
            )
        
        filename = pdf_service.get_pdf_filename(summaries[0], meeting)
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Type": "application/pdf"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error downloading meeting PDF: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate PDF"
        )


@dashboard_router.get("/statistics", response_model=StatisticsResponse)
async def get_global_statistics(
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get global application statistics
    
    Returns total counts of users and meetings across the entire platform.
    This endpoint does not require authentication as it provides public statistics.
    """
    try:
        total_users = await crud.get_total_users_count(db)
        total_meetings = await crud.get_total_meetings_count(db)
        total_processed_meetings = await crud.get_total_processed_meetings_count(db)
        
        return StatisticsResponse(
            total_users=total_users,
            total_meetings=total_meetings,
            total_processed_meetings=total_processed_meetings
        )
        
    except Exception as e:
        print(f"❌ Error getting global statistics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve statistics"
        ) 