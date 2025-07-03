import openai
from typing import Dict, List, Optional
from datetime import datetime
from settings import settings
from .schemas import OpenAISummaryRequest, OpenAISummaryResponse, TranscriptHighlight
from .structured_notes_models import (
    StructuredNotesResponse, 
    StructuredNotesContent
)
import json


class OpenAIService:
    """Service for interacting with OpenAI API for meeting summarization"""
    
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.is_available = False
        
        if not self.api_key:
            raise Exception(
                "OPENAI_API_KEY is required for AI features. "
                "Please set OPENAI_API_KEY environment variable. "
                "You can create a .env file in the backend directory with: OPENAI_API_KEY=sk-your-api-key-here"
            )
        
        try:
            # Configure OpenAI client
            openai.api_key = self.api_key
            self.client = openai.OpenAI(api_key=self.api_key)
            self.is_available = True
            print("✅ OpenAI service initialized successfully with GPT-4o")
        except Exception as e:
            raise Exception(f"Failed to initialize OpenAI service: {str(e)}")
    
    def _check_availability(self):
        """Check if OpenAI service is available"""
        if not self.is_available:
            print("❌ DEBUG: OpenAI service is not available")
            print(f"   API Key present: {bool(self.api_key)}")
            print(f"   Client initialized: {self.client is not None}")
            raise Exception("OpenAI service is not available. API key not configured.")
    
    def _get_template_prompt(self, template_type: str) -> str:
        """Get the appropriate prompt template based on template type"""
        templates = {
            "general": """
You are an expert meeting analyst. Create comprehensive meeting notes that combine AI analysis, user notes, and key transcript moments.

Structure your response as follows:

## Executive Summary
[2-3 sentence overview of the meeting's main purpose and outcomes]

## Key Discussion Points
[Main topics with bullet points]

## Decisions Made
[Concrete decisions with context]

## Action Items
[Specific tasks with assignments and deadlines]

## Important Insights
[Key insights or implications from the discussion]

## Next Steps
[What should happen next]
""",
            "executive": """
You are creating executive-level meeting notes for senior leadership. Focus on strategic implications, high-level decisions, and business impact.

Structure your response as follows:

## Strategic Overview
[High-level summary focusing on business impact]

## Key Decisions & Rationale
[Important decisions with business justification]

## Resource & Budget Implications
[Financial or resource impacts]

## Risk Assessment
[Potential risks or concerns identified]

## Strategic Action Items
[High-priority actions with business impact]

## Executive Recommendations
[Recommendations for leadership consideration]
""",
            "technical": """
You are creating technical meeting notes for engineering and development teams. Focus on technical decisions, implementation details, and development priorities.

Structure your response as follows:

## Technical Summary
[Overview of technical topics discussed]

## Architecture & Design Decisions
[Technical decisions with reasoning]

## Implementation Details
[Specific technical requirements or approaches]

## Technical Risks & Challenges
[Technical issues or blockers identified]

## Development Action Items
[Technical tasks with specifications]

## Technical Recommendations
[Technical best practices or suggestions]
""",
            "client": """
You are creating client-focused meeting notes that emphasize relationship management, client needs, and business outcomes.

Structure your response as follows:

## Client Relationship Summary
[Overview of client interaction and relationship status]

## Client Needs & Requirements
[Key client requirements or requests]

## Solutions Discussed
[Proposed solutions or approaches]

## Client Concerns & Questions
[Issues raised by the client]

## Follow-up Actions
[Client-related action items with timelines]

## Relationship Next Steps
[How to advance the client relationship]
"""
        }
        return templates.get(template_type, templates["general"])

    def _create_summarization_prompt(self, transcript_text: str, meeting_context: Optional[str] = None) -> str:
        """
        Create a comprehensive prompt for meeting summarization
        
        Args:
            transcript_text: Full transcript of the meeting
            meeting_context: Optional context about the meeting
            
        Returns:
            Formatted prompt for GPT-4o
        """
        base_prompt = """
You are an expert meeting analyst. Create a concise, well-structured meeting summary following this exact format:

## Meeting Summary
📅 **Date:** [Extract date from context or use current date]
⏰ **Duration:** [Estimate duration from transcript]
👥 **Participants:** [List all speakers mentioned]

## Key Updates
[Summarize the main topics discussed in 2-3 concise bullet points with brief explanations]

## Action Items
[List specific tasks or decisions made with assignees if mentioned]
- [ ] [Action item] - [Person if mentioned]

## Next Steps
[Summarize what should happen next]

---

Guidelines:
- Keep the summary concise and focused
- Use emojis for visual appeal as shown in the format
- Focus on actionable insights and key decisions
- Maximum 300 words total
- Use bullet points for clarity

Please analyze the following meeting transcript:

"""
        
        if meeting_context:
            base_prompt += f"\n**Meeting Context:** {meeting_context}\n"
        
        base_prompt += f"\n**Transcript:**\n{transcript_text}"
        
        return base_prompt
    
    async def summarize_meeting(self, transcript_text: str, meeting_context: Optional[str] = None) -> OpenAISummaryResponse:
        """
        Generate AI-powered meeting summary using GPT-4o
        
        Args:
            transcript_text: Full transcript of the meeting
            meeting_context: Optional context about the meeting
            
        Returns:
            Structured summary with key points, action items, and participants
            
        Raises:
            Exception: If summarization fails
        """
        self._check_availability()
        
        try:
            print(f"🤖 Generating AI summary for meeting transcript ({len(transcript_text)} characters)")
            
            # Create the prompt
            prompt = self._create_summarization_prompt(transcript_text, meeting_context)
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert meeting analyst who creates comprehensive, well-structured meeting summaries. Always provide detailed, actionable insights and maintain a professional tone."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=2000,
                temperature=0.3,  # Lower temperature for more consistent, factual output
                top_p=0.9
            )
            
            # Extract the summary
            summary_text = response.choices[0].message.content.strip()
            
            # Parse the summary to extract structured data
            parsed_summary = self._parse_summary_response(summary_text)
            
            print(f"✅ AI summary generated successfully")
            
            return OpenAISummaryResponse(
                summary=summary_text,
                key_points=parsed_summary.get("key_points", []),
                action_items=parsed_summary.get("action_items", []),
                participants=parsed_summary.get("participants", [])
            )
            
        except Exception as e:
            print(f"❌ Error generating AI summary: {str(e)}")
            raise Exception(f"Failed to generate AI summary: {str(e)}")
    
    def _parse_summary_response(self, summary_text: str) -> Dict[str, List[str]]:
        """
        Parse the AI-generated summary to extract structured data
        
        Args:
            summary_text: The full summary text from GPT-4o
            
        Returns:
            Dictionary with parsed key_points, action_items, and participants
        """
        try:
            parsed_data = {
                "key_points": [],
                "action_items": [],
                "participants": []
            }
            
            lines = summary_text.split('\n')
            current_section = None
            
            for line in lines:
                line = line.strip()
                
                # Identify sections
                if "## Key Discussion Points" in line:
                    current_section = "key_points"
                elif "## Action Items" in line:
                    current_section = "action_items"
                elif "## Key Participants" in line:
                    current_section = "participants"
                elif line.startswith("## "):
                    current_section = None
                
                # Extract content from sections
                elif current_section and line.startswith("- "):
                    content = line[2:].strip()  # Remove "- " prefix
                    
                    if current_section == "key_points":
                        # Extract topic name before colon
                        if ":" in content:
                            topic = content.split(":")[0].strip()
                            parsed_data["key_points"].append(topic)
                        else:
                            parsed_data["key_points"].append(content)
                    
                    elif current_section == "action_items":
                        # Clean up action items (remove checkboxes)
                        content = content.replace("[ ]", "").strip()
                        parsed_data["action_items"].append(content)
                    
                    elif current_section == "participants":
                        # Extract participant name before colon
                        if ":" in content:
                            participant = content.split(":")[0].strip()
                            parsed_data["participants"].append(participant)
                        else:
                            parsed_data["participants"].append(content)
            
            return parsed_data
            
        except Exception as e:
            print(f"⚠️ Error parsing summary response: {str(e)}")
            # Return empty structure if parsing fails
            return {
                "key_points": [],
                "action_items": [],
                "participants": []
            }
    
    async def generate_meeting_title(self, transcript_text: str) -> str:
        """
        Generate a concise meeting title based on the transcript
        
        Args:
            transcript_text: Full transcript of the meeting
            
        Returns:
            Suggested meeting title
        """
        self._check_availability()
        
        try:
            print(f"📝 Generating meeting title from transcript")
            
            # Create a simple prompt for title generation
            prompt = f"""
Based on the following meeting transcript, generate a concise, professional meeting title (maximum 60 characters).
The title should capture the main purpose or topic of the meeting.

Examples of good titles:
- "Q3 Marketing Strategy Review"
- "Product Launch Planning Session"
- "Weekly Team Standup - Engineering"
- "Client Onboarding Discussion"

Transcript (first 1000 characters):
{transcript_text[:1000]}...

Meeting Title:"""

            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=50,
                temperature=0.5
            )
            
            title = response.choices[0].message.content.strip()
            
            # Clean up the title (remove quotes if present)
            title = title.strip('"').strip("'")
            
            # Ensure it's not too long
            if len(title) > 60:
                title = title[:57] + "..."
            
            print(f"✅ Generated meeting title: {title}")
            
            return title
            
        except Exception as e:
            print(f"❌ Error generating meeting title: {str(e)}")
            return "Meeting Summary"

    async def generate_comprehensive_notes(
        self, 
        transcript_text: str,
        user_notes: Optional[str] = None,
        ai_summary: Optional[str] = None,
        transcript_highlights: Optional[List[TranscriptHighlight]] = None,
        template_type: str = "general",
        custom_prompt: Optional[str] = None,
        meeting_context: Optional[str] = None
    ) -> str:
        """
        Generate comprehensive notes combining AI summary, user notes, and transcript highlights
        
        Args:
            transcript_text: Full transcript of the meeting
            user_notes: User's manual notes
            ai_summary: Previously generated AI summary
            transcript_highlights: Selected important transcript moments
            template_type: Type of notes template to use
            custom_prompt: Custom user-defined prompt
            meeting_context: Additional meeting context
            
        Returns:
            Comprehensive notes combining all sources
        """
        self._check_availability()
        
        try:
            print(f"🤖 Generating comprehensive notes using {template_type} template")
            
            # Build the comprehensive prompt
            prompt = custom_prompt if custom_prompt else self._get_template_prompt(template_type)
            
            # Add data sources
            prompt += "\n\n---\n\n"
            prompt += "Based on the following information, create comprehensive meeting notes:\n\n"
            
            if meeting_context:
                prompt += f"**Meeting Context:**\n{meeting_context}\n\n"
            
            if ai_summary:
                prompt += f"**AI-Generated Summary:**\n{ai_summary}\n\n"
            
            if user_notes:
                prompt += f"**User Notes:**\n{user_notes}\n\n"
            
            if transcript_highlights:
                prompt += "**Key Transcript Moments:**\n"
                for highlight in transcript_highlights:
                    speaker = highlight.speaker or "Unknown Speaker"
                    timestamp = f" ({highlight.timestamp})" if highlight.timestamp else ""
                    reason = f" - {highlight.highlight_reason}" if highlight.highlight_reason else ""
                    prompt += f"- {speaker}{timestamp}: {highlight.text}{reason}\n"
                prompt += "\n"
            
            # Add full transcript for context
            prompt += f"**Full Transcript:**\n{transcript_text[:3000]}..."  # Limit to avoid token limits
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": f"You are an expert meeting analyst creating {template_type} meeting notes. Combine all provided information into comprehensive, actionable notes that provide maximum value to the reader."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=3000,
                temperature=0.3,
                top_p=0.9
            )
            
            comprehensive_notes = response.choices[0].message.content.strip()
            
            print(f"✅ Comprehensive notes generated successfully ({len(comprehensive_notes)} characters)")
            
            return comprehensive_notes
            
        except Exception as e:
            print(f"❌ Error generating comprehensive notes: {str(e)}")
            raise Exception(f"Failed to generate comprehensive notes: {str(e)}")

    async def generate_smart_highlights(self, transcript_text: str, max_highlights: int = 5) -> List[Dict]:
        """
        Generate smart highlights from transcript text
        
        Args:
            transcript_text: Meeting transcript
            max_highlights: Maximum number of highlights to generate
            
        Returns:
            List of highlight dictionaries with speaker, text, and reason
        """
        self._check_availability()
        
        if not transcript_text or len(transcript_text.strip()) < 50:
            return []
        
        prompt = f"""
Analyze this meeting transcript and identify the {max_highlights} most important moments or statements.
For each highlight, provide the speaker (if available), the exact text, and a brief reason why it's important.

Format your response as a JSON array of objects with these fields:
- speaker: The person who said it (or "Unknown" if not clear)
- text: The exact quote or paraphrase
- reason: Why this moment is significant

Transcript:
{transcript_text[:3000]}  # Limit to avoid token limits

Return only the JSON array, no other text.
"""
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert meeting analyst. Extract the most important highlights from meeting transcripts and return them as valid JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=1000,
                temperature=0.3
            )
            
            response_text = response.choices[0].message.content.strip()
            
            # Parse JSON response
            import json
            highlights = json.loads(response_text)
            
            # Validate and clean the response
            cleaned_highlights = []
            for highlight in highlights[:max_highlights]:
                if isinstance(highlight, dict) and 'text' in highlight:
                    cleaned_highlights.append({
                        'speaker': highlight.get('speaker', 'Unknown'),
                        'text': highlight.get('text', ''),
                        'reason': highlight.get('reason', 'Important moment')
                    })
            
            return cleaned_highlights
            
        except Exception as e:
            print(f"❌ Error generating smart highlights: {str(e)}")
            return []

    async def generate_structured_notes(
        self, 
        transcript_text: str,
        meeting_context: Optional[str] = None
    ) -> Dict:
        """
        Generate structured notes from meeting transcript using GPT-4o with Pydantic validation
        
        Args:
            transcript_text: Full transcript of the meeting
            meeting_context: Optional context about the meeting
            
        Returns:
            Structured notes with to_do, key_updates, and brainstorming_ideas
        """
        print(f"🚀 Generating high-quality structured notes with GPT-4o")
        print(f"   Transcript length: {len(transcript_text) if transcript_text else 0} characters")
        
        # Validate inputs
        if not transcript_text or len(transcript_text.strip()) < 50:
            raise Exception("Transcript is too short or empty. Need at least 50 characters to generate meaningful notes.")
        
        # Ensure OpenAI is available
        if not self.is_available:
            raise Exception("OpenAI service is not available. Cannot generate structured notes without API access.")
        
        # Enhanced system prompt for GPT-4o
        system_prompt = """You are an expert meeting analyst and note-taker with years of experience in extracting actionable insights from business conversations.

Your task is to analyze meeting transcripts and create high-quality structured notes with three categories:

1. **Action Items (to_do)**: Specific, actionable tasks that someone needs to complete
   - Must have clear task names and detailed descriptions  
   - Include realistic deadlines (typically 1-4 weeks from meeting date)
   - Assign to specific people if mentioned, otherwise use "Team" or "TBD"
   - Focus on concrete next steps, not general ideas

2. **Key Updates (key_updates)**: Important information, decisions, and announcements
   - Major decisions made during the meeting
   - Status updates on ongoing projects
   - Important announcements or policy changes
   - Critical information that affects the team or project

3. **Ideas & Insights (brainstorming_ideas)**: Creative thinking and strategic suggestions
   - Innovative solutions proposed
   - Future possibilities discussed
   - Strategic insights and recommendations
   - Process improvements and optimizations

QUALITY STANDARDS:
- Use professional, business-appropriate language
- Be specific and detailed - avoid vague statements
- Prioritize the most important and actionable items
- Ensure all content is directly derived from the transcript
- Use realistic deadlines based on context and urgency
- Make action items truly actionable with clear next steps"""

        # Enhanced user prompt with comprehensive instructions
        user_prompt = f"""Analyze this meeting transcript and extract high-quality structured notes. Focus on actionable insights and important information that participants would want to remember and act upon.

{f"**Meeting Context:** {meeting_context}" if meeting_context else ""}

**Meeting Transcript:**
{transcript_text}

**Instructions:**
- Extract only the most important and actionable items from the discussion
- Ensure action items have specific tasks with clear ownership
- Include key decisions, updates, and announcements in key_updates
- Capture innovative ideas and strategic insights in brainstorming_ideas
- Use professional language and be specific about details
- Prioritize quality over quantity - better to have fewer high-quality items
- Set realistic deadlines between {datetime.now().strftime('%Y-%m-%d')} and {(datetime.now().replace(month=datetime.now().month+1) if datetime.now().month < 12 else datetime.now().replace(year=datetime.now().year+1, month=1)).strftime('%Y-%m-%d')}"""
        
        try:
            print("🤖 Calling GPT-4o with enhanced structured analysis...")
            
            response = self.client.beta.chat.completions.parse(
                model="gpt-4o",  # Using GPT-4o for superior analysis
                messages=[
                    {
                        "role": "system", 
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": user_prompt
                    }
                ],
                response_format=StructuredNotesResponse,
                max_tokens=3000,        # Increased for comprehensive analysis
                temperature=0.1,        # Very low temperature for consistent, focused output
                top_p=0.9               # Slightly focused sampling
            )
            
            # Get the parsed response
            structured_notes = response.choices[0].message.parsed
            
            if structured_notes is None:
                raise Exception("GPT-4o failed to generate valid structured content")
            
            # Validate content quality
            notes_content = structured_notes.notes
            total_items = len(notes_content.to_do) + len(notes_content.key_updates) + len(notes_content.brainstorming_ideas)
            
            if total_items == 0:
                raise Exception("Generated notes are empty - transcript may not contain sufficient actionable content")
            
            print(f"✅ Successfully generated high-quality structured notes:")
            print(f"   📋 {len(notes_content.to_do)} action items")
            print(f"   🔄 {len(notes_content.key_updates)} key updates") 
            print(f"   💡 {len(notes_content.brainstorming_ideas)} ideas & insights")
            
            # Return as dictionary for API compatibility
            return structured_notes.model_dump()
            
        except Exception as e:
            print(f"❌ Failed to generate structured notes: {str(e)}")
            raise Exception(f"Unable to generate structured notes: {str(e)}")
    



# Global service instance
openai_service = OpenAIService() 