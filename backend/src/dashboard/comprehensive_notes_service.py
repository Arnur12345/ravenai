from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from .models import ComprehensiveNotes, Meeting, Transcript
from .schemas import (
    ComprehensiveNotesRequest, 
    ComprehensiveNotesResponse, 
    ComprehensiveNotesUpdate,
    TranscriptHighlight,
    NotesSearchRequest
)
from .openai_service import openai_service
import json
from datetime import datetime


class ComprehensiveNotesService:
    """Service for managing comprehensive notes that combine AI summaries, user notes, and transcript highlights"""
    
    async def create_comprehensive_notes(
        self, 
        db: AsyncSession,
        meeting_id: str,
        user_id: str,
        request: ComprehensiveNotesRequest
    ) -> ComprehensiveNotesResponse:
        """
        Create comprehensive notes for a meeting
        
        Args:
            db: Database session
            meeting_id: Meeting ID
            user_id: User ID
            request: Comprehensive notes request data
            
        Returns:
            Created comprehensive notes
        """
        try:
            print(f"🔍 DEBUG: Creating comprehensive notes for meeting {meeting_id}, user {user_id}")
            print(f"🔍 DEBUG: Request data: {request}")
            
            # Get meeting data
            meeting_query = select(Meeting).where(
                and_(Meeting.id == meeting_id, Meeting.user_id == user_id)
            )
            meeting_result = await db.execute(meeting_query)
            meeting = meeting_result.scalar_one_or_none()
            
            if not meeting:
                print(f"❌ DEBUG: Meeting not found for id {meeting_id} and user {user_id}")
                raise Exception("Meeting not found")
            
            print(f"✅ DEBUG: Found meeting: {meeting.title}, user_notes: {meeting.user_notes}, summary: {meeting.summary}")
            
            # Get transcripts
            transcripts_query = select(Transcript).where(Transcript.meeting_id == meeting_id)
            transcripts_result = await db.execute(transcripts_query)
            transcripts = transcripts_result.scalars().all()
            
            print(f"🔍 DEBUG: Found {len(transcripts)} transcripts")
            
            # Build transcript text
            transcript_text = "\n".join([
                f"{t.speaker or 'Unknown'} ({t.timestamp or 'Unknown time'}): {t.text}"
                for t in transcripts
            ])
            
            print(f"🔍 DEBUG: Transcript text length: {len(transcript_text)}")
            if len(transcript_text) == 0:
                print("⚠️ DEBUG: No transcript text found! Checking meeting status before sync...")
                
                # Check if meeting is ended before attempting sync
                if meeting.status == "ended":
                    print(f"🛑 Meeting {meeting_id} has ended. Skipping transcript sync.")
                elif meeting.status == "active":
                    try:
                        # Import dashboard_service to sync transcripts
                        from .service import dashboard_service
                        synced_transcripts = await dashboard_service.sync_transcripts(db, meeting_id, user_id)
                        print(f"✅ DEBUG: Synced {len(synced_transcripts)} transcripts")
                        
                        # Re-fetch transcripts after sync
                        transcripts_query = select(Transcript).where(Transcript.meeting_id == meeting_id)
                        transcripts_result = await db.execute(transcripts_query)
                        transcripts = transcripts_result.scalars().all()
                        
                        # Rebuild transcript text
                        transcript_text = "\n".join([
                            f"{t.speaker or 'Unknown'} ({t.timestamp or 'Unknown time'}): {t.text}"
                            for t in transcripts
                        ])
                        print(f"🔍 DEBUG: After sync, transcript text length: {len(transcript_text)}")
                    except Exception as sync_error:
                        print(f"⚠️ DEBUG: Failed to sync transcripts: {str(sync_error)}")
                        # Continue with empty transcripts
                else:
                    print(f"⚠️ Meeting status is '{meeting.status}'. Skipping transcript sync.")
            
            # Prepare data for AI generation
            user_notes = meeting.user_notes if request.include_user_notes else None
            ai_summary = meeting.summary if request.include_ai_summary else None
            
            print(f"🔍 DEBUG: Using user_notes: {user_notes}, ai_summary: {ai_summary}")
            
            # Process transcript highlights
            transcript_highlights = None
            if request.include_transcript_highlights and request.transcript_highlights:
                transcript_highlights = request.transcript_highlights
            elif request.include_transcript_highlights and not request.transcript_highlights:
                # Auto-generate smart highlights
                try:
                    print("🔄 DEBUG: Generating smart highlights...")
                    smart_highlights = await openai_service.generate_smart_highlights(transcript_text)
                    transcript_highlights = [
                        TranscriptHighlight(
                            transcript_id="auto",
                            speaker=h.get("speaker"),
                            text=h.get("text"),
                            timestamp=None,
                            highlight_reason=h.get("reason")
                        )
                        for h in smart_highlights
                    ]
                    print(f"✅ DEBUG: Generated {len(transcript_highlights)} smart highlights")
                except Exception as e:
                    print(f"⚠️ Failed to generate smart highlights: {str(e)}")
            
            # Generate comprehensive notes using AI
            comprehensive_notes_text = ""
            if transcript_text:
                try:
                    print("🔄 DEBUG: Generating comprehensive notes with AI...")
                    comprehensive_notes_text = await openai_service.generate_comprehensive_notes(
                        transcript_text=transcript_text,
                        user_notes=user_notes,
                        ai_summary=ai_summary,
                        transcript_highlights=transcript_highlights,
                        template_type=request.template_type,
                        custom_prompt=request.custom_prompt,
                        meeting_context=f"Meeting Platform: {meeting.meeting_platform}, Bot: {meeting.bot_name}"
                    )
                    print(f"✅ DEBUG: Generated comprehensive notes, length: {len(comprehensive_notes_text)}")
                except Exception as e:
                    print(f"⚠️ Failed to generate comprehensive notes: {str(e)}")
                    comprehensive_notes_text = "Failed to generate comprehensive notes. Please try again."
            else:
                print("⚠️ DEBUG: No transcript text available, creating notes with available data only")
                comprehensive_notes_text = f"""
# Comprehensive Notes

## Meeting Information
- **Meeting Platform:** {meeting.meeting_platform}
- **Bot:** {meeting.bot_name}

## User Notes
{user_notes if user_notes else 'No user notes available'}

## AI Summary
{ai_summary if ai_summary else 'No AI summary available'}

## Transcript Information
No transcript data is currently available for this meeting. This could be because:
- The meeting transcription is still in progress
- The meeting hasn't started yet
- There was an issue with the transcription service

Please try again later or contact support if this issue persists.
"""
            
            # Create comprehensive notes record
            comprehensive_notes = ComprehensiveNotes(
                meeting_id=meeting_id,
                user_id=user_id,
                user_notes=user_notes,
                ai_summary=ai_summary,
                transcript_highlights=json.dumps([h.dict() for h in transcript_highlights]) if transcript_highlights else None,
                comprehensive_notes=comprehensive_notes_text,
                template_type=request.template_type,
                tags=request.tags,
                include_ai_summary=request.include_ai_summary,
                include_user_notes=request.include_user_notes,
                include_transcript_highlights=request.include_transcript_highlights,
                custom_prompt=request.custom_prompt
            )
            
            db.add(comprehensive_notes)
            await db.commit()
            await db.refresh(comprehensive_notes)
            
            print(f"✅ Created comprehensive notes for meeting {meeting_id}")
            
            return ComprehensiveNotesResponse.from_orm(comprehensive_notes)
            
        except Exception as e:
            print(f"❌ Error creating comprehensive notes: {str(e)}")
            raise Exception(f"Failed to create comprehensive notes: {str(e)}")
    
    async def get_comprehensive_notes(
        self, 
        db: AsyncSession,
        meeting_id: str,
        user_id: str
    ) -> Optional[ComprehensiveNotesResponse]:
        """Get comprehensive notes for a meeting"""
        try:
            query = select(ComprehensiveNotes).where(
                and_(
                    ComprehensiveNotes.meeting_id == meeting_id,
                    ComprehensiveNotes.user_id == user_id
                )
            ).order_by(ComprehensiveNotes.created_at.desc())
            
            result = await db.execute(query)
            notes = result.scalar_one_or_none()
            
            if not notes:
                return None
            
            return ComprehensiveNotesResponse.from_orm(notes)
            
        except Exception as e:
            print(f"❌ Error getting comprehensive notes: {str(e)}")
            return None
    
    async def update_comprehensive_notes(
        self, 
        db: AsyncSession,
        notes_id: str,
        user_id: str,
        update_data: ComprehensiveNotesUpdate
    ) -> Optional[ComprehensiveNotesResponse]:
        """Update comprehensive notes"""
        try:
            query = select(ComprehensiveNotes).where(
                and_(
                    ComprehensiveNotes.id == notes_id,
                    ComprehensiveNotes.user_id == user_id
                )
            )
            
            result = await db.execute(query)
            notes = result.scalar_one_or_none()
            
            if not notes:
                return None
            
            # Update fields
            if update_data.user_notes is not None:
                notes.user_notes = update_data.user_notes
            if update_data.tags is not None:
                notes.tags = update_data.tags
            if update_data.is_favorite is not None:
                notes.is_favorite = update_data.is_favorite
            if update_data.template_type is not None:
                notes.template_type = update_data.template_type
            
            notes.updated_at = datetime.utcnow()
            
            await db.commit()
            await db.refresh(notes)
            
            return ComprehensiveNotesResponse.from_orm(notes)
            
        except Exception as e:
            print(f"❌ Error updating comprehensive notes: {str(e)}")
            return None
    
    async def search_comprehensive_notes(
        self, 
        db: AsyncSession,
        user_id: str,
        search_request: NotesSearchRequest
    ) -> List[ComprehensiveNotesResponse]:
        """Search comprehensive notes"""
        try:
            query = select(ComprehensiveNotes).where(ComprehensiveNotes.user_id == user_id)
            
            # Apply filters
            if search_request.query:
                search_term = f"%{search_request.query}%"
                query = query.where(
                    or_(
                        ComprehensiveNotes.comprehensive_notes.ilike(search_term),
                        ComprehensiveNotes.user_notes.ilike(search_term),
                        ComprehensiveNotes.tags.ilike(search_term)
                    )
                )
            
            if search_request.template_type:
                query = query.where(ComprehensiveNotes.template_type == search_request.template_type)
            
            if search_request.favorites_only:
                query = query.where(ComprehensiveNotes.is_favorite == True)
            
            if search_request.tags:
                for tag in search_request.tags:
                    query = query.where(ComprehensiveNotes.tags.ilike(f"%{tag}%"))
            
            if search_request.date_from:
                query = query.where(ComprehensiveNotes.created_at >= search_request.date_from)
            
            if search_request.date_to:
                query = query.where(ComprehensiveNotes.created_at <= search_request.date_to)
            
            # Order by creation date (newest first)
            query = query.order_by(ComprehensiveNotes.created_at.desc())
            
            result = await db.execute(query)
            notes_list = result.scalars().all()
            
            return [ComprehensiveNotesResponse.from_orm(notes) for notes in notes_list]
            
        except Exception as e:
            print(f"❌ Error searching comprehensive notes: {str(e)}")
            return []
    
    async def get_notes_statistics(
        self, 
        db: AsyncSession,
        user_id: str
    ) -> Dict[str, Any]:
        """Get statistics about user's comprehensive notes"""
        try:
            # Total notes count
            total_query = select(func.count(ComprehensiveNotes.id)).where(
                ComprehensiveNotes.user_id == user_id
            )
            total_result = await db.execute(total_query)
            total_notes = total_result.scalar() or 0
            
            # Favorite notes count
            favorites_query = select(func.count(ComprehensiveNotes.id)).where(
                and_(
                    ComprehensiveNotes.user_id == user_id,
                    ComprehensiveNotes.is_favorite == True
                )
            )
            favorites_result = await db.execute(favorites_query)
            favorite_notes = favorites_result.scalar() or 0
            
            # Template type distribution
            template_query = select(
                ComprehensiveNotes.template_type,
                func.count(ComprehensiveNotes.id).label('count')
            ).where(
                ComprehensiveNotes.user_id == user_id
            ).group_by(ComprehensiveNotes.template_type)
            
            template_result = await db.execute(template_query)
            template_distribution = {row.template_type: row.count for row in template_result}
            
            return {
                "total_notes": total_notes,
                "favorite_notes": favorite_notes,
                "template_distribution": template_distribution,
                "notes_this_month": 0,  # TODO: Implement month filter
                "average_notes_per_meeting": 0  # TODO: Implement calculation
            }
            
        except Exception as e:
            print(f"❌ Error getting notes statistics: {str(e)}")
            return {
                "total_notes": 0,
                "favorite_notes": 0,
                "template_distribution": {},
                "notes_this_month": 0,
                "average_notes_per_meeting": 0
            }

    async def delete_comprehensive_notes(
        self, 
        db: AsyncSession,
        notes_id: str,
        user_id: str
    ) -> bool:
        """Delete comprehensive notes"""
        try:
            query = select(ComprehensiveNotes).where(
                and_(
                    ComprehensiveNotes.id == notes_id,
                    ComprehensiveNotes.user_id == user_id
                )
            )
            
            result = await db.execute(query)
            notes = result.scalar_one_or_none()
            
            if not notes:
                return False
            
            await db.delete(notes)
            await db.commit()
            
            print(f"✅ Deleted comprehensive notes {notes_id}")
            return True
            
        except Exception as e:
            print(f"❌ Error deleting comprehensive notes: {str(e)}")
            return False

    async def generate_structured_meeting_notes(
        self, 
        db: AsyncSession,
        meeting_id: str,
        user_id: str,
        request: Optional[Dict] = None
    ) -> Dict:
        """
        Generate structured meeting notes using GPT-4o-mini
        
        Args:
            db: Database session
            meeting_id: Meeting ID
            user_id: User ID
            request: Optional request parameters
            
        Returns:
            Structured notes with to_do, key_updates, and brainstorming_ideas
        """
        try:
            print(f"🔍 DEBUG: Generating structured notes for meeting {meeting_id}, user {user_id}")
            
            # Get meeting data
            meeting_query = select(Meeting).where(
                and_(Meeting.id == meeting_id, Meeting.user_id == user_id)
            )
            meeting_result = await db.execute(meeting_query)
            meeting = meeting_result.scalar_one_or_none()
            
            if not meeting:
                print(f"❌ DEBUG: Meeting not found for id {meeting_id} and user {user_id}")
                raise Exception("Meeting not found")
            
            print(f"✅ DEBUG: Found meeting: {meeting.title if hasattr(meeting, 'title') else 'N/A'}")
            
            # Get transcripts
            transcripts_query = select(Transcript).where(Transcript.meeting_id == meeting_id)
            transcripts_result = await db.execute(transcripts_query)
            transcripts = transcripts_result.scalars().all()
            
            print(f"🔍 DEBUG: Found {len(transcripts)} transcripts")
            
            # Build transcript text
            transcript_text = "\n".join([
                f"{t.speaker or 'Speaker'} ({t.timestamp or 'Time'}): {t.text}"
                for t in transcripts
            ])
            
            print(f"🔍 DEBUG: Transcript text length: {len(transcript_text)}")
            
            # If no transcripts, try to sync from Vexa first (only for active meetings)
            if len(transcript_text.strip()) < 50:
                print("⚠️ DEBUG: No meaningful transcript found! Checking meeting status before sync...")
                
                # Only attempt sync for active meetings
                if meeting.status == "ended":
                    print(f"🛑 Meeting {meeting_id} has ended. Skipping transcript sync.")
                elif meeting.status == "active":
                    try:
                        from .service import dashboard_service
                        synced_transcripts = await dashboard_service.sync_transcripts(db, meeting_id, user_id)
                        print(f"✅ DEBUG: Synced {len(synced_transcripts)} transcripts")
                        
                        # Re-fetch transcripts after sync
                        transcripts_query = select(Transcript).where(Transcript.meeting_id == meeting_id)
                        transcripts_result = await db.execute(transcripts_query)
                        transcripts = transcripts_result.scalars().all()
                        
                        # Rebuild transcript text
                        transcript_text = "\n".join([
                            f"{t.speaker or 'Speaker'} ({t.timestamp or 'Time'}): {t.text}"
                            for t in transcripts
                        ])
                        print(f"🔍 DEBUG: After sync, transcript text length: {len(transcript_text)}")
                    except Exception as sync_error:
                        print(f"⚠️ DEBUG: Failed to sync transcripts: {str(sync_error)}")
                else:
                    print(f"⚠️ Meeting status is '{meeting.status}'. Skipping transcript sync.")
            
            # Final check for transcript requirement
            if len(transcript_text.strip()) < 50:
                raise Exception("No meaningful transcript data available. Cannot generate structured notes without sufficient meeting content.")
            
            # Prepare meeting context
            context_parts = []
            if hasattr(meeting, 'meeting_platform') and meeting.meeting_platform:
                context_parts.append(f"Platform: {meeting.meeting_platform}")
            if hasattr(meeting, 'bot_name') and meeting.bot_name:
                context_parts.append(f"Bot: {meeting.bot_name}")
            if request and request.get('custom_context'):
                context_parts.append(request['custom_context'])
            
            meeting_context = ", ".join(context_parts) if context_parts else None
            
            # Generate structured notes using OpenAI
            print("🔄 DEBUG: Calling OpenAI to generate structured notes...")
            structured_notes = await openai_service.generate_structured_notes(
                transcript_text=transcript_text,
                meeting_context=meeting_context
            )
            
            print(f"✅ DEBUG: Generated structured notes successfully")
            
            # Add metadata
            result = {
                "id": f"structured-{meeting_id}",
                "meeting_id": meeting_id,
                "user_id": user_id,
                "notes": structured_notes.get("notes", {
                    "to_do": [],
                    "key_updates": [], 
                    "brainstorming_ideas": []
                }),
                "generated_at": datetime.utcnow().isoformat(),
                "transcript_length": len(transcript_text)
            }
            
            return result
            
        except Exception as e:
            print(f"❌ Error generating structured notes: {str(e)}")
            raise Exception(f"Failed to generate structured notes: {str(e)}")

    async def generate_comprehensive_notes(
        self, 
        db: AsyncSession,
        meeting_id: str,
        user_id: str,
        request: ComprehensiveNotesRequest
    ) -> ComprehensiveNotesResponse:
        """
        Generate comprehensive notes for a meeting (alias for create_comprehensive_notes)
        
        This method is called by the API endpoint and delegates to create_comprehensive_notes
        """
        return await self.create_comprehensive_notes(db, meeting_id, user_id, request)

    async def get_meeting_notes(
        self, 
        db: AsyncSession,
        meeting_id: str,
        user_id: str
    ) -> List[ComprehensiveNotesResponse]:
        """
        Get all comprehensive notes for a specific meeting
        
        Returns all versions of comprehensive notes for the meeting.
        """
        try:
            query = select(ComprehensiveNotes).where(
                and_(
                    ComprehensiveNotes.meeting_id == meeting_id,
                    ComprehensiveNotes.user_id == user_id
                )
            ).order_by(ComprehensiveNotes.created_at.desc())
            
            result = await db.execute(query)
            notes_list = result.scalars().all()
            
            return [ComprehensiveNotesResponse.from_orm(notes) for notes in notes_list]
            
        except Exception as e:
            print(f"❌ Error getting meeting notes: {str(e)}")
            return []


# Global service instance
comprehensive_notes_service = ComprehensiveNotesService()
