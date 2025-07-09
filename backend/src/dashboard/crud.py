from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc, func, extract
from typing import Optional, List, Dict
from datetime import datetime, date, timedelta

from .models import Meeting, Transcript, ComprehensiveNotes, Summary
from .schemas import MeetingCreate, MeetingUpdate, TranscriptBase, SummaryCreate, SummaryUpdate
from auth.models import User


# Meeting CRUD operations
async def create_meeting(db: AsyncSession, meeting_data: MeetingCreate, user_id: str) -> Meeting:
    """Create a new meeting"""
    meeting = Meeting(
        user_id=user_id,
        name=meeting_data.name,
        meeting_url=meeting_data.meeting_url,
        meeting_platform=meeting_data.meeting_platform,
        bot_name=meeting_data.bot_name,
        user_notes=meeting_data.user_notes,
        meeting_date=meeting_data.meeting_date,
        status="created"
    )
    
    db.add(meeting)
    await db.commit()
    await db.refresh(meeting)
    return meeting


async def get_meeting_by_id(db: AsyncSession, meeting_id: str, user_id: str) -> Optional[Meeting]:
    """Get meeting by ID for a specific user"""
    print(f"🔍 CRUD DEBUG: Looking for meeting_id={meeting_id}, user_id={user_id}")
    
    result = await db.execute(
        select(Meeting).where(
            and_(Meeting.id == meeting_id, Meeting.user_id == user_id)
        )
    )
    meeting = result.scalar_one_or_none()
    
    print(f"🔍 CRUD DEBUG: Meeting found: {meeting is not None}")
    if meeting:
        print(f"🔍 CRUD DEBUG: Meeting details - id={meeting.id}, user_id={meeting.user_id}, status={meeting.status}")
    else:
        # Let's check if the meeting exists with any user
        all_result = await db.execute(select(Meeting).where(Meeting.id == meeting_id))
        any_meeting = all_result.scalar_one_or_none()
        if any_meeting:
            print(f"🔍 CRUD DEBUG: Meeting exists but for different user_id: {any_meeting.user_id}")
        else:
            print(f"🔍 CRUD DEBUG: Meeting does not exist in database")
    
    return meeting


async def get_meetings_by_user(
    db: AsyncSession, 
    user_id: str, 
    skip: int = 0, 
    limit: int = 20
) -> List[Meeting]:
    """Get all meetings for a user with pagination"""
    result = await db.execute(
        select(Meeting)
        .where(Meeting.user_id == user_id)
        .order_by(desc(Meeting.created_at))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def count_meetings_by_user(db: AsyncSession, user_id: str) -> int:
    """Count total meetings for a user"""
    result = await db.execute(
        select(func.count(Meeting.id)).where(Meeting.user_id == user_id)
    )
    return result.scalar() or 0


async def count_meetings_by_user_this_month(db: AsyncSession, user_id: str) -> int:
    """Count meetings for a user in current month"""
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    result = await db.execute(
        select(func.count(Meeting.id)).where(
            and_(
                Meeting.user_id == user_id,
                extract('month', Meeting.meeting_date) == current_month,
                extract('year', Meeting.meeting_date) == current_year
            )
        )
    )
    return result.scalar() or 0


async def get_meeting_heatmap_data(db: AsyncSession, user_id: str, year: int = None) -> List[Dict]:
    """Get meeting count by date for heatmap visualization"""
    if year is None:
        year = datetime.now().year
    
    result = await db.execute(
        select(
            Meeting.meeting_date,
            func.count(Meeting.id).label('meeting_count')
        ).where(
            and_(
                Meeting.user_id == user_id,
                extract('year', Meeting.meeting_date) == year
            )
        ).group_by(Meeting.meeting_date)
        .order_by(Meeting.meeting_date)
    )
    
    return [
        {"date": row.meeting_date.isoformat(), "meeting_count": row.meeting_count}
        for row in result.fetchall()
    ]


async def get_meeting_trends_data(db: AsyncSession, user_id: str, days: int = 7) -> List[Dict]:
    """Get meeting trends data for the last N days"""
    # Calculate date range
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days-1)
    
    # Get meeting data
    result = await db.execute(
        select(
            Meeting.meeting_date,
            func.count(Meeting.id).label('meeting_count')
        ).where(
            and_(
                Meeting.user_id == user_id,
                Meeting.meeting_date >= start_date,
                Meeting.meeting_date <= end_date
            )
        ).group_by(Meeting.meeting_date)
        .order_by(Meeting.meeting_date)
    )
    
    meeting_data = {row.meeting_date: row.meeting_count for row in result.fetchall()}
    
    # Get summary data
    summary_result = await db.execute(
        select(
            func.date(Summary.created_at).label('summary_date'),
            func.count(Summary.id).label('summary_count')
        ).where(
            and_(
                Summary.user_id == user_id,
                func.date(Summary.created_at) >= start_date,
                func.date(Summary.created_at) <= end_date
            )
        ).group_by(func.date(Summary.created_at))
        .order_by(func.date(Summary.created_at))
    )
    
    summary_data = {row.summary_date: row.summary_count for row in summary_result.fetchall()}
    
    # Create trends data for each day
    trends = []
    for i in range(days):
        current_date = start_date + timedelta(days=i)
        trends.append({
            "date": current_date.isoformat(),
            "meetings": meeting_data.get(current_date, 0),
            "summaries": summary_data.get(current_date, 0)
        })
    
    return trends


async def update_meeting(
    db: AsyncSession, 
    meeting_id: str, 
    user_id: str, 
    update_data: MeetingUpdate
) -> Optional[Meeting]:
    """Update meeting details"""
    meeting = await get_meeting_by_id(db, meeting_id, user_id)
    if not meeting:
        return None
    
    # Update fields if provided
    if update_data.name is not None:
        meeting.name = update_data.name
    if update_data.user_notes is not None:
        meeting.user_notes = update_data.user_notes
    if update_data.status is not None:
        meeting.status = update_data.status
    if hasattr(update_data, 'vexa_meeting_id') and update_data.vexa_meeting_id is not None:
        meeting.vexa_meeting_id = update_data.vexa_meeting_id
    if hasattr(update_data, 'started_at') and update_data.started_at is not None:
        meeting.started_at = update_data.started_at
    if hasattr(update_data, 'ended_at') and update_data.ended_at is not None:
        meeting.ended_at = update_data.ended_at
    if update_data.meeting_date is not None:
        meeting.meeting_date = update_data.meeting_date
    
    await db.commit()
    await db.refresh(meeting)
    return meeting


async def update_meeting_vexa_id(
    db: AsyncSession, 
    meeting_id: str, 
    user_id: str, 
    vexa_meeting_id: str
) -> Optional[Meeting]:
    """Update meeting with Vexa meeting ID"""
    meeting = await get_meeting_by_id(db, meeting_id, user_id)
    if not meeting:
        return None
    
    meeting.vexa_meeting_id = vexa_meeting_id
    meeting.status = "active"
    meeting.started_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(meeting)
    return meeting


async def end_meeting(
    db: AsyncSession, 
    meeting_id: str, 
    user_id: str, 
    user_notes: Optional[str] = None
) -> Optional[Meeting]:
    """End a meeting and update status"""
    meeting = await get_meeting_by_id(db, meeting_id, user_id)
    if not meeting:
        return None
    
    meeting.status = "ended"
    meeting.ended_at = datetime.utcnow()
    
    if user_notes is not None:
        meeting.user_notes = user_notes
    
    await db.commit()
    await db.refresh(meeting)
    return meeting


async def delete_meeting(db: AsyncSession, meeting_id: str, user_id: str) -> bool:
    """Delete a meeting"""
    meeting = await get_meeting_by_id(db, meeting_id, user_id)
    if not meeting:
        return False
    
    await db.delete(meeting)
    await db.commit()
    return True


# Summary CRUD operations
async def create_summary(db: AsyncSession, summary_data: SummaryCreate, user_id: str) -> Summary:
    """Create a new summary"""
    # Calculate word count and reading time
    word_count = len(summary_data.content.split())
    reading_time = max(1, word_count // 200)  # Average reading speed 200 words/minute
    
    summary = Summary(
        meeting_id=summary_data.meeting_id,
        user_id=user_id,
        title=summary_data.title,
        content=summary_data.content,
        summary_type=summary_data.summary_type,
        key_points=summary_data.key_points,
        action_items=summary_data.action_items,
        decisions=summary_data.decisions,
        participants=summary_data.participants,
        tags=summary_data.tags,
        is_favorite=summary_data.is_favorite,
        word_count=word_count,
        reading_time_minutes=reading_time
    )
    
    db.add(summary)
    await db.commit()
    await db.refresh(summary)
    return summary


async def get_summary_by_id(db: AsyncSession, summary_id: str, user_id: str) -> Optional[Summary]:
    """Get summary by ID for a specific user"""
    result = await db.execute(
        select(Summary).where(
            and_(Summary.id == summary_id, Summary.user_id == user_id)
        )
    )
    return result.scalar_one_or_none()


async def get_summaries_by_user(
    db: AsyncSession, 
    user_id: str, 
    skip: int = 0, 
    limit: int = 20
) -> List[Summary]:
    """Get all summaries for a user with pagination"""
    result = await db.execute(
        select(Summary)
        .where(Summary.user_id == user_id)
        .order_by(desc(Summary.created_at))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def get_summaries_by_meeting(db: AsyncSession, meeting_id: str, user_id: str) -> List[Summary]:
    """Get all summaries for a specific meeting"""
    result = await db.execute(
        select(Summary).where(
            and_(Summary.meeting_id == meeting_id, Summary.user_id == user_id)
        ).order_by(desc(Summary.created_at))
    )
    return result.scalars().all()


async def count_summaries_by_user(db: AsyncSession, user_id: str) -> int:
    """Count total summaries for a user"""
    result = await db.execute(
        select(func.count(Summary.id)).where(Summary.user_id == user_id)
    )
    return result.scalar() or 0


async def count_summaries_by_user_this_month(db: AsyncSession, user_id: str) -> int:
    """Count summaries for a user in current month"""
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    result = await db.execute(
        select(func.count(Summary.id)).where(
            and_(
                Summary.user_id == user_id,
                extract('month', Summary.created_at) == current_month,
                extract('year', Summary.created_at) == current_year
            )
        )
    )
    return result.scalar() or 0


async def count_action_items_by_user(db: AsyncSession, user_id: str) -> int:
    """Count total action items (tasks) for a user"""
    # This is a simplified count - in reality, you'd parse the JSON action_items
    # For now, we'll count summaries that have action_items
    result = await db.execute(
        select(func.count(Summary.id)).where(
            and_(
                Summary.user_id == user_id,
                Summary.action_items.isnot(None),
                Summary.action_items != ""
            )
        )
    )
    return result.scalar() or 0


async def get_avg_meeting_duration_by_user(db: AsyncSession, user_id: str) -> float:
    """Get average meeting duration in minutes for a user"""
    result = await db.execute(
        select(func.avg(
            func.julianday(Meeting.ended_at) - func.julianday(Meeting.started_at)
        ) * 24 * 60).where(
            and_(
                Meeting.user_id == user_id,
                Meeting.started_at.isnot(None),
                Meeting.ended_at.isnot(None)
            )
        )
    )
    avg_duration = result.scalar()
    return round(avg_duration or 0.0, 1)


async def update_summary(
    db: AsyncSession, 
    summary_id: str, 
    user_id: str, 
    update_data: SummaryUpdate
) -> Optional[Summary]:
    """Update summary details"""
    summary = await get_summary_by_id(db, summary_id, user_id)
    if not summary:
        return None
    
    # Update fields if provided
    if update_data.title is not None:
        summary.title = update_data.title
    if update_data.content is not None:
        summary.content = update_data.content
        # Recalculate word count and reading time
        summary.word_count = len(update_data.content.split())
        summary.reading_time_minutes = max(1, summary.word_count // 200)
    if update_data.key_points is not None:
        summary.key_points = update_data.key_points
    if update_data.action_items is not None:
        summary.action_items = update_data.action_items
    if update_data.decisions is not None:
        summary.decisions = update_data.decisions
    if update_data.participants is not None:
        summary.participants = update_data.participants
    if update_data.tags is not None:
        summary.tags = update_data.tags
    if update_data.is_favorite is not None:
        summary.is_favorite = update_data.is_favorite
    
    summary.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(summary)
    return summary


async def delete_summary(db: AsyncSession, summary_id: str, user_id: str) -> bool:
    """Delete a summary"""
    summary = await get_summary_by_id(db, summary_id, user_id)
    if not summary:
        return False
    
    await db.delete(summary)
    await db.commit()
    return True


# Transcript CRUD operations
async def create_transcript(
    db: AsyncSession, 
    meeting_id: str, 
    transcript_data: TranscriptBase
) -> Transcript:
    """Create a new transcript entry"""
    transcript = Transcript(
        meeting_id=meeting_id,
        speaker=transcript_data.speaker,
        text=transcript_data.text,
        timestamp=transcript_data.timestamp
    )
    
    db.add(transcript)
    await db.commit()
    await db.refresh(transcript)
    return transcript


async def get_transcripts_by_meeting(
    db: AsyncSession, 
    meeting_id: str, 
    user_id: str
) -> List[Transcript]:
    """Get all transcripts for a meeting"""
    # First verify the meeting belongs to the user
    meeting = await get_meeting_by_id(db, meeting_id, user_id)
    if not meeting:
        return []
    
    result = await db.execute(
        select(Transcript)
        .where(Transcript.meeting_id == meeting_id)
        .order_by(Transcript.created_at)
    )
    return result.scalars().all()


async def bulk_create_transcripts(
    db: AsyncSession, 
    meeting_id: str, 
    transcripts_data: List[TranscriptBase]
) -> List[Transcript]:
    """Create multiple transcript entries at once"""
    transcripts = []
    
    for transcript_data in transcripts_data:
        transcript = Transcript(
            meeting_id=meeting_id,
            speaker=transcript_data.speaker,
            text=transcript_data.text,
            timestamp=transcript_data.timestamp
        )
        transcripts.append(transcript)
    
    db.add_all(transcripts)
    await db.commit()
    
    # Refresh all transcripts
    for transcript in transcripts:
        await db.refresh(transcript)
    
    return transcripts


async def clear_meeting_transcripts(db: AsyncSession, meeting_id: str, user_id: str) -> bool:
    """Clear all transcripts for a meeting"""
    # First verify the meeting belongs to the user
    meeting = await get_meeting_by_id(db, meeting_id, user_id)
    if not meeting:
        return False
    
    result = await db.execute(
        select(Transcript).where(Transcript.meeting_id == meeting_id)
    )
    transcripts = result.scalars().all()
    
    for transcript in transcripts:
        await db.delete(transcript)
    
    await db.commit()
    return True


# Comprehensive Notes CRUD operations
async def create_comprehensive_notes(
    db: AsyncSession,
    meeting_id: str,
    user_id: str,
    notes_data: Dict
) -> ComprehensiveNotes:
    """Create comprehensive notes"""
    notes = ComprehensiveNotes(
        meeting_id=meeting_id,
        user_id=user_id,
        **notes_data
    )
    
    db.add(notes)
    await db.commit()
    await db.refresh(notes)
    return notes


async def get_comprehensive_notes_by_meeting(
    db: AsyncSession,
    meeting_id: str,
    user_id: str
) -> Optional[ComprehensiveNotes]:
    """Get comprehensive notes by meeting ID"""
    query = select(ComprehensiveNotes).where(
        and_(
            ComprehensiveNotes.meeting_id == meeting_id,
            ComprehensiveNotes.user_id == user_id
        )
    ).order_by(ComprehensiveNotes.created_at.desc())
    
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def get_comprehensive_notes_by_id(
    db: AsyncSession,
    notes_id: str,
    user_id: str
) -> Optional[ComprehensiveNotes]:
    """Get comprehensive notes by ID"""
    query = select(ComprehensiveNotes).where(
        and_(
            ComprehensiveNotes.id == notes_id,
            ComprehensiveNotes.user_id == user_id
        )
    )
    
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def update_comprehensive_notes(
    db: AsyncSession,
    notes_id: str,
    user_id: str,
    update_data: Dict
) -> Optional[ComprehensiveNotes]:
    """Update comprehensive notes"""
    notes = await get_comprehensive_notes_by_id(db, notes_id, user_id)
    if not notes:
        return None
    
    for key, value in update_data.items():
        if hasattr(notes, key):
            setattr(notes, key, value)
    
    notes.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(notes)
    return notes


async def delete_comprehensive_notes(
    db: AsyncSession,
    notes_id: str,
    user_id: str
) -> bool:
    """Delete comprehensive notes"""
    notes = await get_comprehensive_notes_by_id(db, notes_id, user_id)
    if not notes:
        return False
    
    await db.delete(notes)
    await db.commit()
    return True


# Global Statistics CRUD operations
async def get_total_users_count(db: AsyncSession) -> int:
    """Get total count of all users in the system"""
    result = await db.execute(select(func.count(User.id)))
    return result.scalar() or 0


async def get_total_meetings_count(db: AsyncSession) -> int:
    """Get total count of all meetings in the system"""
    result = await db.execute(select(func.count(Meeting.id)))
    return result.scalar() or 0


async def get_total_processed_meetings_count(db: AsyncSession) -> int:
    """Get total count of all processed meetings (ended status) in the system"""
    result = await db.execute(
        select(func.count(Meeting.id)).where(Meeting.status == "ended")
    )
    return result.scalar() or 0 
