from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Tuple, Optional
from datetime import datetime, date

from .models import Meeting, Transcript
from .schemas import (
    MeetingCreate, MeetingUpdate, MeetingEnd, MeetingResponse, 
    MeetingWithTranscripts, MeetingListResponse, TranscriptResponse,
    TranscriptBase, MessageResponse
)
from . import crud
from .vexa_service import vexa_service
from .openai_service import openai_service
from auth.models import User


class DashboardService:
    """Main service for dashboard operations"""
    
    async def create_meeting(
        self, 
        db: AsyncSession, 
        meeting_data: MeetingCreate, 
        user_id: str
    ) -> MeetingResponse:
        """
        Create a new meeting and start the Vexa bot
        
        Args:
            db: Database session
            meeting_data: Meeting creation data
            user_id: ID of the user creating the meeting
            
        Returns:
            Created meeting with Vexa bot information
            
        Raises:
            Exception: If meeting creation or bot start fails
        """
        try:
            # Set meeting_date to today if not provided
            if not meeting_data.meeting_date:
                meeting_data.meeting_date = date.today()
            
            # Create meeting in database
            meeting = await crud.create_meeting(db, meeting_data, user_id)
            
            print(f"📅 Created meeting {meeting.id} for user {user_id}")
            
            # Start Vexa bot
            try:
                vexa_response = await vexa_service.create_bot(
                    meeting_url=meeting.meeting_url,
                    bot_name=meeting.bot_name
                )
                
                # Update meeting with Vexa information
                vexa_meeting_id = vexa_response.get('meeting_id') or vexa_response.get('id')
                
                if vexa_meeting_id:
                    # Update meeting in database with proper status transition
                    updated_meeting = await crud.update_meeting(
                        db, meeting.id, user_id, 
                        MeetingUpdate(
                            vexa_meeting_id=vexa_meeting_id,
                            status="active",
                            started_at=datetime.utcnow()
                        )
                    )
                    
                    if updated_meeting:
                        meeting.vexa_meeting_id = updated_meeting.vexa_meeting_id
                        meeting.status = updated_meeting.status
                        meeting.started_at = updated_meeting.started_at
                    
                    print(f"🤖 Vexa bot started successfully for meeting {meeting.id}")
                else:
                    print(f"⚠️ Vexa bot created but no meeting_id returned")
                    
            except Exception as vexa_error:
                print(f"❌ Failed to start Vexa bot: {str(vexa_error)}")
                # Update meeting status to error
                await crud.update_meeting(
                    db, meeting.id, user_id, 
                    MeetingUpdate(status="error")
                )
                meeting.status = "error"
                # Don't raise exception - meeting is still created
            
            return MeetingResponse.from_orm(meeting)
            
        except Exception as e:
            print(f"❌ Error creating meeting: {str(e)}")
            raise Exception(f"Failed to create meeting: {str(e)}")
    
    async def get_user_meetings(
        self, 
        db: AsyncSession, 
        user_id: str, 
        page: int = 1, 
        per_page: int = 20
    ) -> MeetingListResponse:
        """
        Get all meetings for a user with pagination
        
        Args:
            db: Database session
            user_id: User ID
            page: Page number (1-based)
            per_page: Items per page
            
        Returns:
            Paginated list of meetings
        """
        try:
            skip = (page - 1) * per_page
            meetings = await crud.get_meetings_by_user(db, user_id, skip, per_page)
            total_count = await crud.count_meetings_by_user(db, user_id)
            
            meeting_responses = [MeetingResponse.from_orm(meeting) for meeting in meetings]
            
            return MeetingListResponse(
                meetings=meeting_responses,
                total=total_count,
                page=page,
                per_page=per_page
            )
            
        except Exception as e:
            print(f"❌ Error getting user meetings: {str(e)}")
            raise Exception(f"Failed to get meetings: {str(e)}")
    
    async def get_meeting_with_transcripts(
        self, 
        db: AsyncSession, 
        meeting_id: str, 
        user_id: str
    ) -> Optional[MeetingWithTranscripts]:
        """
        Get a meeting with its transcripts
        
        Args:
            db: Database session
            meeting_id: Meeting ID
            user_id: User ID
            
        Returns:
            Meeting with transcripts or None if not found
        """
        try:
            meeting = await crud.get_meeting_by_id(db, meeting_id, user_id)
            if not meeting:
                return None
            
            transcripts = await crud.get_transcripts_by_meeting(db, meeting_id, user_id)
            transcript_responses = [TranscriptResponse.from_orm(t) for t in transcripts]
            
            meeting_response = MeetingResponse.from_orm(meeting)
            
            return MeetingWithTranscripts(
                **meeting_response.dict(),
                transcripts=transcript_responses
            )
            
        except Exception as e:
            print(f"❌ Error getting meeting with transcripts: {str(e)}")
            raise Exception(f"Failed to get meeting: {str(e)}")
    
    async def sync_transcripts(
        self, 
        db: AsyncSession, 
        meeting_id: str, 
        user_id: str
    ) -> List[TranscriptResponse]:
        """
        Sync transcripts from Vexa for a meeting
        
        Args:
            db: Database session
            meeting_id: Meeting ID
            user_id: User ID
            
        Returns:
            List of new transcript items
            
        Raises:
            Exception: If sync fails or meeting is ended
        """
        try:
            meeting = await crud.get_meeting_by_id(db, meeting_id, user_id)
            if not meeting or not meeting.vexa_meeting_id:
                raise Exception("Meeting not found or Vexa bot not started")
            
            # 🛑 STOP SYNCING FOR ENDED MEETINGS
            if meeting.status == "ended":
                print(f"🛑 Meeting {meeting_id} has ended. Stopping transcript sync to reduce server load.")
                raise Exception("Meeting has ended. No longer syncing transcripts to avoid server overload.")
            
            # Only sync for active meetings
            if meeting.status != "active":
                print(f"⚠️ Meeting {meeting_id} status is '{meeting.status}'. Skipping transcript sync.")
                return []
            
            # Get transcripts from Vexa using the native meeting ID
            # Extract native meeting ID from the meeting URL
            native_meeting_id = vexa_service.extract_meeting_id_from_url(meeting.meeting_url)
            vexa_transcripts = await vexa_service.get_transcripts(native_meeting_id)
            
            if not vexa_transcripts:
                return []
            
            # Convert Vexa transcripts to our format
            transcript_data = []
            for vexa_transcript in vexa_transcripts:
                transcript_data.append(TranscriptBase(
                    speaker=vexa_transcript.speaker,
                    text=vexa_transcript.text,
                    timestamp=vexa_transcript.time
                ))
            
            # Clear existing transcripts and add new ones
            await crud.clear_meeting_transcripts(db, meeting_id, user_id)
            new_transcripts = await crud.bulk_create_transcripts(db, meeting_id, transcript_data)
            
            print(f"📝 Synced {len(new_transcripts)} transcripts for meeting {meeting_id}")
            
            return [TranscriptResponse.from_orm(t) for t in new_transcripts]
            
        except Exception as e:
            print(f"❌ Error syncing transcripts: {str(e)}")
            raise Exception(f"Failed to sync transcripts: {str(e)}")
    
    async def end_meeting(
        self, 
        db: AsyncSession, 
        meeting_id: str, 
        user_id: str, 
        end_data: MeetingEnd
    ) -> MeetingResponse:
        """
        End a meeting, stop the bot, and generate AI summary
        
        Args:
            db: Database session
            meeting_id: Meeting ID
            user_id: User ID
            end_data: Meeting end data
            
        Returns:
            Updated meeting with summary
            
        Raises:
            Exception: If ending meeting fails
        """
        try:
            print(f"🔍 DEBUG: Attempting to end meeting - meeting_id: {meeting_id}, user_id: {user_id}")
            print(f"🔍 DEBUG: end_data: {end_data}, type: {type(end_data)}")
            
            # Handle case where end_data might be None
            if end_data is None:
                print(f"⚠️ DEBUG: end_data is None, creating default")
                end_data = MeetingEnd(user_notes=None)
            
            print(f"🔍 DEBUG: end_data.user_notes: {getattr(end_data, 'user_notes', 'ATTRIBUTE_NOT_FOUND')}")
            
            meeting = await crud.get_meeting_by_id(db, meeting_id, user_id)
            print(f"🔍 DEBUG: Meeting found: {meeting is not None}")
            
            if not meeting:
                print(f"❌ DEBUG: Meeting not found - meeting_id: {meeting_id}, user_id: {user_id}")
                # Let's try to get the meeting without user_id check
                from sqlalchemy import select
                from .models import Meeting
                result = await db.execute(select(Meeting).where(Meeting.id == meeting_id))
                meeting_any_user = result.scalar_one_or_none()
                if meeting_any_user:
                    print(f"🔍 DEBUG: Meeting exists but with different user_id: {meeting_any_user.user_id}")
                else:
                    print(f"🔍 DEBUG: Meeting does not exist in database at all")
                raise Exception("Meeting not found")
            
            print(f"🔍 DEBUG: Meeting details - status: {meeting.status}, vexa_id: {meeting.vexa_meeting_id}")
            
            # Stop Vexa bot if it's running
            if meeting.vexa_meeting_id and meeting.status == "active":
                try:
                    # Use native meeting ID for stopping the bot
                    native_meeting_id = vexa_service.extract_meeting_id_from_url(meeting.meeting_url)
                    await vexa_service.stop_bot(native_meeting_id)
                    print(f"🛑 Stopped Vexa bot for meeting {meeting_id}")
                except Exception as e:
                    print(f"⚠️ Failed to stop Vexa bot: {str(e)}")
                    # Continue even if stopping bot fails
            
            # End the meeting - safely get user_notes
            user_notes = None
            if end_data and hasattr(end_data, 'user_notes'):
                user_notes = end_data.user_notes
            
            print(f"🔍 DEBUG: Calling crud.end_meeting with user_notes: {user_notes}")
            meeting = await crud.end_meeting(db, meeting_id, user_id, user_notes)
            print(f"🔍 DEBUG: Meeting after ending: {meeting is not None}")
            
            # Sync final transcripts
            try:
                await self.sync_transcripts(db, meeting_id, user_id)
            except Exception as e:
                print(f"⚠️ Failed to sync final transcripts: {str(e)}")
            
            # Generate AI summary
            try:
                await self.generate_meeting_summary(db, meeting_id, user_id)
            except Exception as e:
                print(f"⚠️ Failed to generate AI summary: {str(e)}")
            
            print(f"✅ Meeting {meeting_id} ended successfully")
            
            return MeetingResponse.from_orm(meeting)
            
        except Exception as e:
            print(f"❌ Error ending meeting: {str(e)}")
            raise Exception(f"Failed to end meeting: {str(e)}")
    
    async def update_meeting_notes(
        self, 
        db: AsyncSession, 
        meeting_id: str, 
        user_id: str, 
        user_notes: str
    ) -> MeetingResponse:
        """
        Update user notes for a meeting
        
        Args:
            db: Database session
            meeting_id: Meeting ID
            user_id: User ID
            user_notes: Updated notes
            
        Returns:
            Updated meeting
        """
        try:
            meeting = await crud.update_meeting(
                db, meeting_id, user_id, 
                MeetingUpdate(user_notes=user_notes)
            )
            
            if not meeting:
                raise Exception("Meeting not found")
            
            return MeetingResponse.from_orm(meeting)
            
        except Exception as e:
            print(f"❌ Error updating meeting notes: {str(e)}")
            raise Exception(f"Failed to update notes: {str(e)}")
    
    async def delete_meeting(
        self, 
        db: AsyncSession, 
        meeting_id: str, 
        user_id: str
    ) -> MessageResponse:
        """
        Delete a meeting and stop its bot if running
        
        Args:
            db: Database session
            meeting_id: Meeting ID
            user_id: User ID
            
        Returns:
            Success message
        """
        try:
            meeting = await crud.get_meeting_by_id(db, meeting_id, user_id)
            if not meeting:
                raise Exception("Meeting not found")
            
            # Stop Vexa bot if it's running
            if meeting.vexa_meeting_id and meeting.status == "active":
                try:
                    await vexa_service.stop_bot(meeting.vexa_meeting_id)
                    print(f"🛑 Stopped Vexa bot before deleting meeting {meeting_id}")
                except Exception as e:
                    print(f"⚠️ Failed to stop Vexa bot: {str(e)}")
            
            # Delete the meeting
            success = await crud.delete_meeting(db, meeting_id, user_id)
            
            if not success:
                raise Exception("Failed to delete meeting")
            
            print(f"🗑️ Deleted meeting {meeting_id}")
            
            return MessageResponse(message="Meeting deleted successfully")
            
        except Exception as e:
            print(f"❌ Error deleting meeting: {str(e)}")
            raise Exception(f"Failed to delete meeting: {str(e)}")

    async def generate_meeting_summary(
        self, 
        db: AsyncSession, 
        meeting_id: str, 
        user_id: str
    ) -> None:
        """
        Generate AI-powered meeting summary and save to database
        
        Args:
            db: Database session
            meeting_id: Meeting ID
            user_id: User ID
            
        Raises:
            Exception: If summary generation fails
        """
        try:
            # Get meeting with transcripts
            meeting = await crud.get_meeting_by_id(db, meeting_id, user_id)
            if not meeting:
                raise Exception("Meeting not found")
            
            # Get all transcripts for the meeting
            transcripts = await crud.get_transcripts_by_meeting(db, meeting_id, user_id)
            
            if not transcripts:
                print(f"⚠️ No transcripts found for meeting {meeting_id}, skipping summary generation")
                return
            
            # Format transcripts for AI processing
            transcript_text = "\n".join([
                f"[{transcript.timestamp or 'Unknown'}] {transcript.speaker or 'Unknown'}: {transcript.text}"
                for transcript in transcripts
            ])
            
            # Generate AI summary using GPT-4o
            print(f"🤖 Generating AI summary for meeting {meeting_id}")
            summary_response = await openai_service.summarize_meeting(
                transcript_text=transcript_text,
                meeting_context=f"Meeting URL: {meeting.meeting_url}, Platform: {meeting.meeting_platform}"
            )
            
            # Update meeting with generated summary
            await crud.update_meeting_summary(
                db, 
                meeting_id, 
                user_id, 
                summary_response.summary
            )
            
            print(f"✅ AI summary generated successfully for meeting {meeting_id}")
            
        except Exception as e:
            print(f"❌ Error generating meeting summary: {str(e)}")
            raise Exception(f"Failed to generate summary: {str(e)}")

    async def get_dashboard_overview(
        self, 
        db: AsyncSession, 
        user_id: str
    ) -> dict:
        """
        Get dashboard overview with stats, recent meetings, and heatmap data
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            Dictionary with dashboard overview data
        """
        try:
            # Get statistics
            total_meetings = await crud.count_meetings_by_user(db, user_id)
            total_summaries = await crud.count_summaries_by_user(db, user_id)
            total_tasks = await crud.count_action_items_by_user(db, user_id)
            meetings_this_month = await crud.count_meetings_by_user_this_month(db, user_id)
            summaries_this_month = await crud.count_summaries_by_user_this_month(db, user_id)
            avg_meeting_duration = await crud.get_avg_meeting_duration_by_user(db, user_id)
            
            # Get recent meetings (last 5)
            recent_meetings = await crud.get_meetings_by_user(db, user_id, skip=0, limit=5)
            recent_meetings_response = [MeetingResponse.from_orm(meeting) for meeting in recent_meetings]
            
            # Get heatmap data for current year
            heatmap_data = await crud.get_meeting_heatmap_data(db, user_id)
            
            stats = {
                "total_meetings": total_meetings,
                "total_summaries": total_summaries,
                "total_tasks": total_tasks,
                "meetings_this_month": meetings_this_month,
                "summaries_this_month": summaries_this_month,
                "avg_meeting_duration_minutes": avg_meeting_duration
            }
            
            return {
                "stats": stats,
                "recent_meetings": recent_meetings_response,
                "heatmap_data": heatmap_data
            }
            
        except Exception as e:
            print(f"❌ Error getting dashboard overview: {str(e)}")
            raise Exception(f"Failed to get dashboard overview: {str(e)}")


    async def get_dashboard_stats(
        self, 
        db: AsyncSession, 
        user_id: str
    ) -> dict:
        """
        Get dashboard statistics only
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            Dictionary with dashboard statistics
        """
        try:
            total_meetings = await crud.count_meetings_by_user(db, user_id)
            total_summaries = await crud.count_summaries_by_user(db, user_id)
            total_tasks = await crud.count_action_items_by_user(db, user_id)
            meetings_this_month = await crud.count_meetings_by_user_this_month(db, user_id)
            summaries_this_month = await crud.count_summaries_by_user_this_month(db, user_id)
            avg_meeting_duration = await crud.get_avg_meeting_duration_by_user(db, user_id)
            
            return {
                "total_meetings": total_meetings,
                "total_summaries": total_summaries,
                "total_tasks": total_tasks,
                "meetings_this_month": meetings_this_month,
                "summaries_this_month": summaries_this_month,
                "avg_meeting_duration_minutes": avg_meeting_duration
            }
            
        except Exception as e:
            print(f"❌ Error getting dashboard stats: {str(e)}")
            raise Exception(f"Failed to get dashboard stats: {str(e)}")


# Global service instance
dashboard_service = DashboardService() 