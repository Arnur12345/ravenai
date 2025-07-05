from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime, date


# Base schemas
class MeetingBase(BaseModel):
    name: Optional[str] = Field(None, description="Custom name for the meeting")
    meeting_url: str = Field(..., description="URL of the meeting to join")
    meeting_platform: str = Field(default="google_meet", description="Platform of the meeting")
    bot_name: str = Field(default="RavenAI Bot", description="Name of the bot to join the meeting")
    user_notes: Optional[str] = Field(None, description="User's personal notes for the meeting")
    meeting_date: date = Field(..., description="Date of the meeting for heatmap analysis")


class SummaryBase(BaseModel):
    title: str = Field(..., description="Title of the summary")
    content: str = Field(..., description="Content of the summary")
    summary_type: str = Field(default="ai_generated", description="Type of summary")
    key_points: Optional[str] = Field(None, description="Key points in JSON format")
    action_items: Optional[str] = Field(None, description="Action items in JSON format")
    decisions: Optional[str] = Field(None, description="Decisions made in JSON format")
    participants: Optional[str] = Field(None, description="Participants in JSON format")
    tags: Optional[str] = Field(None, description="Comma-separated tags")
    is_favorite: bool = Field(default=False, description="Whether the summary is marked as favorite")


class TranscriptBase(BaseModel):
    speaker: Optional[str] = Field(None, description="Name of the speaker")
    text: str = Field(..., description="Transcript text")
    timestamp: Optional[str] = Field(None, description="Timestamp within the meeting")


# Request schemas
class MeetingCreate(MeetingBase):
    """Schema for creating a new meeting"""
    pass


class SummaryCreate(SummaryBase):
    """Schema for creating a new summary"""
    meeting_id: str = Field(..., description="ID of the meeting this summary belongs to")


class SummaryUpdate(BaseModel):
    """Schema for updating a summary"""
    title: Optional[str] = None
    content: Optional[str] = None
    key_points: Optional[str] = None
    action_items: Optional[str] = None
    decisions: Optional[str] = None
    participants: Optional[str] = None
    tags: Optional[str] = None
    is_favorite: Optional[bool] = None


class MeetingUpdate(BaseModel):
    """Schema for updating meeting details"""
    name: Optional[str] = None
    user_notes: Optional[str] = None
    status: Optional[str] = None
    vexa_meeting_id: Optional[str] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    meeting_date: Optional[date] = None


class MeetingEnd(BaseModel):
    """Schema for ending a meeting"""
    user_notes: Optional[str] = None


class TranscriptCreate(TranscriptBase):
    """Schema for creating a transcript entry"""
    meeting_id: str = Field(..., description="ID of the meeting this transcript belongs to")


# Response schemas
class TranscriptResponse(TranscriptBase):
    """Schema for transcript response"""
    id: str
    meeting_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class SummaryResponse(SummaryBase):
    """Schema for summary response"""
    id: str
    meeting_id: str
    user_id: str
    word_count: int
    reading_time_minutes: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class MeetingResponse(MeetingBase):
    """Schema for meeting response"""
    id: str
    user_id: str
    vexa_meeting_id: Optional[str]
    status: str
    summary: Optional[str]
    summary_generated_at: Optional[datetime]
    created_at: datetime
    started_at: Optional[datetime]
    ended_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class MeetingWithTranscripts(MeetingResponse):
    """Schema for meeting response with transcripts"""
    transcripts: List[TranscriptResponse] = []
    
    class Config:
        from_attributes = True


class MeetingWithSummaries(MeetingResponse):
    """Schema for meeting response with summaries"""
    summaries: List[SummaryResponse] = []
    
    class Config:
        from_attributes = True


class MeetingListResponse(BaseModel):
    """Schema for meeting list response"""
    meetings: List[MeetingResponse]
    total: int
    page: int
    per_page: int


class SummaryListResponse(BaseModel):
    """Schema for summary list response"""
    summaries: List[SummaryResponse]
    total: int
    page: int
    per_page: int


# Dashboard analytics schemas
class DashboardStats(BaseModel):
    """Schema for dashboard statistics"""
    total_meetings: int
    total_summaries: int
    total_tasks: int  # Can be derived from action_items
    meetings_this_month: int
    summaries_this_month: int
    avg_meeting_duration_minutes: float


class HeatmapData(BaseModel):
    """Schema for heatmap data"""
    date: str  # Date as string in YYYY-MM-DD format
    meeting_count: int


class DashboardResponse(BaseModel):
    """Schema for dashboard overview response"""
    stats: DashboardStats
    recent_meetings: List[MeetingResponse]
    heatmap_data: List[HeatmapData]


# Vexa API schemas
class VexaBotRequest(BaseModel):
    """Schema for Vexa bot creation request"""
    platform: str = "google_meet"
    native_meeting_id: str
    bot_name: str = "AfterTalkBot"


class VexaBotResponse(BaseModel):
    """Schema for Vexa bot creation response (real API format)"""
    id: int
    user_id: int
    platform: str
    native_meeting_id: str
    constructed_meeting_url: str
    status: str
    bot_container_id: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    data: Optional[dict] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class VexaTranscriptSegment(BaseModel):
    """Schema for individual Vexa transcript segment (real API format)"""
    start: float
    end: float
    text: str
    language: Optional[str] = None
    speaker: Optional[str] = None
    absolute_start_time: Optional[str] = None
    absolute_end_time: Optional[str] = None
    created_at: Optional[str] = None


class VexaTranscriptResponse(BaseModel):
    """Schema for Vexa transcript response (real API format)"""
    id: int
    platform: str
    native_meeting_id: str
    status: str
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    segments: List[VexaTranscriptSegment] = []


# Legacy schema for backward compatibility
class VexaTranscriptItem(BaseModel):
    """Legacy schema for individual Vexa transcript item (for internal use)"""
    time: str
    speaker: str
    text: str


# OpenAI API schemas
class OpenAISummaryRequest(BaseModel):
    """Schema for OpenAI summary request"""
    transcript_text: str
    meeting_context: Optional[str] = None


class OpenAISummaryResponse(BaseModel):
    """Schema for OpenAI summary response"""
    summary: str
    key_points: List[str]
    action_items: List[str]
    participants: List[str]


# Comprehensive Notes schemas
class TranscriptHighlight(BaseModel):
    """Schema for transcript highlights"""
    transcript_id: str
    speaker: Optional[str]
    text: str
    timestamp: Optional[str]
    highlight_reason: Optional[str] = None  # Why this was highlighted


class ComprehensiveNotesRequest(BaseModel):
    """Schema for creating comprehensive notes"""
    template_type: str = Field(default="general", description="Template type (general, executive, technical, etc.)")
    include_ai_summary: bool = Field(default=True, description="Include AI-generated summary")
    include_user_notes: bool = Field(default=True, description="Include user's manual notes")
    include_transcript_highlights: bool = Field(default=True, description="Include transcript highlights")
    transcript_highlights: Optional[List[TranscriptHighlight]] = Field(default=None, description="Selected transcript highlights")
    custom_prompt: Optional[str] = Field(default=None, description="Custom generation prompt")
    tags: Optional[str] = Field(default=None, description="Comma-separated tags")


class ComprehensiveNotesUpdate(BaseModel):
    """Schema for updating comprehensive notes"""
    user_notes: Optional[str] = None
    tags: Optional[str] = None
    is_favorite: Optional[bool] = None
    template_type: Optional[str] = None


class ComprehensiveNotesResponse(BaseModel):
    """Schema for comprehensive notes response"""
    id: str
    meeting_id: str
    user_id: str
    user_notes: Optional[str]
    ai_summary: Optional[str]
    transcript_highlights: Optional[str]  # JSON string of highlights
    comprehensive_notes: Optional[str]
    notes_version: int
    template_type: str
    tags: Optional[str]
    is_favorite: bool
    include_ai_summary: bool
    include_user_notes: bool
    include_transcript_highlights: bool
    custom_prompt: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class NotesSearchRequest(BaseModel):
    """Schema for searching notes"""
    query: str = Field(..., description="Search query")
    tags: Optional[List[str]] = Field(default=None, description="Filter by tags")
    template_type: Optional[str] = Field(default=None, description="Filter by template type")
    favorites_only: bool = Field(default=False, description="Show only favorite notes")
    date_from: Optional[datetime] = Field(default=None, description="Filter from date")
    date_to: Optional[datetime] = Field(default=None, description="Filter to date")


class NotesExportRequest(BaseModel):
    """Schema for exporting notes"""
    format: str
    include_metadata: Optional[bool] = True
    include_transcript: Optional[bool] = True


# General response schemas
class StatisticsResponse(BaseModel):
    """Schema for application statistics response"""
    total_users: int
    total_meetings: int
    total_processed_meetings: int


class MessageResponse(BaseModel):
    """Schema for general message response"""
    message: str


class ErrorResponse(BaseModel):
    """Schema for error response"""
    error: str
    detail: Optional[str] = None


# Structured Notes Models (New Implementation)
class TaskItem(BaseModel):
    task_name: str
    task_description: str
    deadline: str  # YYYY-MM-DD format
    assignee: str


class KeyUpdate(BaseModel):
    update_number: int
    update_description: str


class BrainstormingIdea(BaseModel):
    idea_number: int
    idea_description: str


class StructuredNotes(BaseModel):
    to_do: List[TaskItem] = []
    key_updates: List[KeyUpdate] = []
    brainstorming_ideas: List[BrainstormingIdea] = []


class StructuredNotesResponse(BaseModel):
    notes: StructuredNotes


class GenerateStructuredNotesRequest(BaseModel):
    include_user_notes: Optional[bool] = True
    custom_context: Optional[str] = None


class StructuredMeetingNotesResponse(BaseModel):
    id: str
    meeting_id: str
    user_id: str
    notes: StructuredNotes
    generated_at: datetime
    transcript_length: int
    
    class Config:
        from_attributes = True 