from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, date


class TaskItem(BaseModel):
    """Model for a single task/action item"""
    task_name: str = Field(
        description="Clear, actionable task title (10-100 characters)",
        min_length=5,
        max_length=100
    )
    task_description: str = Field(
        description="Detailed description of what needs to be done (20-300 characters)",
        min_length=10,
        max_length=300
    )
    deadline: str = Field(
        description="Deadline in YYYY-MM-DD format (estimate based on urgency or meeting date + reasonable timeframe)",
        pattern=r"^\d{4}-\d{2}-\d{2}$"
    )
    assignee: str = Field(
        description="Person's name if mentioned, or 'Team' or 'TBD' if not specified",
        min_length=2,
        max_length=50
    )


class KeyUpdate(BaseModel):
    """Model for a key update/important information"""
    update_number: int = Field(
        description="Sequential number starting from 1",
        ge=1
    )
    update_description: str = Field(
        description="Important information, decisions, or announcements from the meeting (20-400 characters)",
        min_length=15,
        max_length=400
    )


class BrainstormingIdea(BaseModel):
    """Model for a brainstorming idea/creative suggestion"""
    idea_number: int = Field(
        description="Sequential number starting from 1",
        ge=1
    )
    idea_description: str = Field(
        description="Creative ideas, suggestions, or future possibilities discussed (15-300 characters)",
        min_length=10,
        max_length=300
    )


class StructuredNotesContent(BaseModel):
    """Container for all structured notes content"""
    to_do: List[TaskItem] = Field(
        description="List of action items and tasks (0-10 items)",
        max_items=10
    )
    key_updates: List[KeyUpdate] = Field(
        description="List of important updates and information (0-8 items)",
        max_items=8
    )
    brainstorming_ideas: List[BrainstormingIdea] = Field(
        description="List of creative ideas and suggestions (0-12 items)",
        max_items=12
    )


class StructuredNotesResponse(BaseModel):
    """Complete structured notes response"""
    notes: StructuredNotesContent = Field(
        description="The structured notes content"
    )


def get_structured_notes_schema() -> dict:
    """Get the JSON schema for structured notes"""
    return StructuredNotesResponse.model_json_schema()


def get_openai_function_schema() -> dict:
    """Get the function schema for OpenAI function calling"""
    return {
        "type": "function",
        "function": {
            "name": "create_structured_notes",
            "description": "Create structured meeting notes with action items, key updates, and brainstorming ideas",
            "parameters": StructuredNotesResponse.model_json_schema()
        }
    }


# Example usage and validation
def validate_structured_notes(data: dict) -> StructuredNotesResponse:
    """
    Validate and parse structured notes data
    
    Args:
        data: Raw data dictionary
        
    Returns:
        Validated StructuredNotesResponse object
        
    Raises:
        ValidationError: If data doesn't match schema
    """
    return StructuredNotesResponse.model_validate(data)


def create_example_notes() -> StructuredNotesResponse:
    """Create example structured notes for testing"""
    return StructuredNotesResponse(
        notes=StructuredNotesContent(
            to_do=[
                TaskItem(
                    task_name="Review API documentation",
                    task_description="Go through the new API endpoints and update integration code",
                    deadline="2025-01-15",
                    assignee="Alex Johnson"
                ),
                TaskItem(
                    task_name="Prepare presentation slides",
                    task_description="Create slides for next week's client meeting with project updates",
                    deadline="2025-01-20",
                    assignee="Sarah Chen"
                )
            ],
            key_updates=[
                KeyUpdate(
                    update_number=1,
                    update_description="Project timeline has been moved up by one week due to client requirements"
                ),
                KeyUpdate(
                    update_number=2,
                    update_description="New team member will be joining the development team next Monday"
                )
            ],
            brainstorming_ideas=[
                BrainstormingIdea(
                    idea_number=1,
                    idea_description="Consider implementing automated testing for better code quality"
                ),
                BrainstormingIdea(
                    idea_number=2,
                    idea_description="Explore using microservices architecture for better scalability"
                )
            ]
        )
    )


if __name__ == "__main__":
    # Test the models
    example = create_example_notes()
    print("Example notes:")
    print(example.model_dump_json(indent=2))
    
    print("\nJSON Schema:")
    print(get_structured_notes_schema()) 