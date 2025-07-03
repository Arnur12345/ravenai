from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, Integer, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid


class Meeting(Base):
    """Meeting model for storing meeting information"""
    __tablename__ = "meetings"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Meeting details
    name = Column(String(255), nullable=True)  # Custom meeting name
    meeting_url = Column(String, nullable=False)
    meeting_platform = Column(String, default="google_meet")  # google_meet, zoom, teams
    vexa_meeting_id = Column(String, nullable=True)  # ID returned by Vexa API
    bot_name = Column(String, default="RavenAI Bot")
    
    # Meeting status
    status = Column(String, default="created")  # created, active, ended, error
    
    # AI-generated summary
    summary = Column(Text, nullable=True)
    summary_generated_at = Column(DateTime, nullable=True)
    
    # User notes
    user_notes = Column(Text, nullable=True)
    
    # Meeting date for heatmap analysis
    meeting_date = Column(Date, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="meetings")
    transcripts = relationship("Transcript", back_populates="meeting", cascade="all, delete-orphan")
    comprehensive_notes = relationship("ComprehensiveNotes", back_populates="meeting", cascade="all, delete-orphan")
    summaries = relationship("Summary", back_populates="meeting", cascade="all, delete-orphan")


class Summary(Base):
    """Summary model for storing meeting summaries"""
    __tablename__ = "summaries"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String, ForeignKey("meetings.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Summary content
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    summary_type = Column(String, default="ai_generated")  # ai_generated, manual, hybrid
    
    # Structured content
    key_points = Column(Text, nullable=True)  # JSON format
    action_items = Column(Text, nullable=True)  # JSON format
    decisions = Column(Text, nullable=True)  # JSON format
    participants = Column(Text, nullable=True)  # JSON format
    
    # Metadata
    tags = Column(String, nullable=True)  # Comma-separated tags
    is_favorite = Column(Boolean, default=False)
    word_count = Column(Integer, default=0)
    reading_time_minutes = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    meeting = relationship("Meeting", back_populates="summaries")
    user = relationship("User")


class Transcript(Base):
    """Transcript model for storing individual transcript lines"""
    __tablename__ = "transcripts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String, ForeignKey("meetings.id"), nullable=False)
    
    # Transcript details
    speaker = Column(String, nullable=True)
    text = Column(Text, nullable=False)
    timestamp = Column(String, nullable=True)  # Time within the meeting (e.g., "00:01:15")
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    meeting = relationship("Meeting", back_populates="transcripts")


class ComprehensiveNotes(Base):
    """Comprehensive notes model combining AI summary, user notes, and transcript highlights"""
    __tablename__ = "comprehensive_notes"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String, ForeignKey("meetings.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Notes content
    user_notes = Column(Text, nullable=True)  # User's manual notes
    ai_summary = Column(Text, nullable=True)  # AI-generated summary
    transcript_highlights = Column(Text, nullable=True)  # Selected transcript snippets (JSON format)
    comprehensive_notes = Column(Text, nullable=True)  # Combined AI-enhanced notes
    
    # Metadata
    notes_version = Column(Integer, default=1)  # Version control
    template_type = Column(String, default="general")  # Template used (general, executive, technical, etc.)
    tags = Column(String, nullable=True)  # Comma-separated tags for search
    is_favorite = Column(Boolean, default=False)  # User can mark important notes
    
    # Generation settings
    include_ai_summary = Column(Boolean, default=True)
    include_user_notes = Column(Boolean, default=True)
    include_transcript_highlights = Column(Boolean, default=True)
    custom_prompt = Column(Text, nullable=True)  # Custom generation prompt
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    meeting = relationship("Meeting", back_populates="comprehensive_notes")
    user = relationship("User") 