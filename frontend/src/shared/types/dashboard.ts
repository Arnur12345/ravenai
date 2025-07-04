// Frontend types for Dashboard functionality
// Based on backend schemas in dashboard/schemas.py

export interface Meeting {
  id: string;
  user_id: string;
  name?: string;
  meeting_url: string;
  meeting_platform: string;
  bot_name: string;
  vexa_meeting_id?: string;
  status: MeetingStatus;
  summary?: string;
  summary_generated_at?: string;
  user_notes?: string;
  meeting_date: string; // Date string in YYYY-MM-DD format
  created_at: string;
  started_at?: string;
  ended_at?: string;
}

export interface Summary {
  id: string;
  meeting_id: string;
  user_id: string;
  title: string;
  content: string;
  summary_type: 'ai_generated' | 'manual' | 'hybrid';
  key_points?: string;
  action_items?: string;
  decisions?: string;
  participants?: string;
  tags?: string;
  is_favorite: boolean;
  word_count: number;
  reading_time_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_meetings: number;
  total_summaries: number;
  total_tasks: number;
  meetings_this_month: number;
  summaries_this_month: number;
  avg_meeting_duration_minutes: number;
}

export interface HeatmapData {
  date: string; // Date string in YYYY-MM-DD format
  meeting_count: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recent_meetings: Meeting[];
  heatmap_data: HeatmapData[];
}

export type MeetingStatus = 'created' | 'active' | 'ended' | 'error';

export interface Transcript {
  id: string;
  meeting_id: string;
  speaker?: string;
  text: string;
  timestamp?: string;
  created_at: string;
}

export interface MeetingWithTranscripts extends Meeting {
  transcripts: Transcript[];
}

export interface MeetingWithSummaries extends Meeting {
  summaries: Summary[];
}

// Request types
export interface CreateMeetingRequest {
  name?: string;
  meeting_url: string;
  meeting_platform?: string;
  bot_name?: string;
  user_notes?: string;
  meeting_date: string; // Date string in YYYY-MM-DD format
}

export interface CreateSummaryRequest {
  meeting_id: string;
  title: string;
  content: string;
  summary_type?: 'ai_generated' | 'manual' | 'hybrid';
  key_points?: string;
  action_items?: string;
  decisions?: string;
  participants?: string;
  tags?: string;
  is_favorite?: boolean;
}

export interface UpdateSummaryRequest {
  title?: string;
  content?: string;
  key_points?: string;
  action_items?: string;
  decisions?: string;
  participants?: string;
  tags?: string;
  is_favorite?: boolean;
}

export interface UpdateMeetingRequest {
  name?: string;
  user_notes?: string;
  status?: MeetingStatus;
  meeting_date?: string;
}

export interface UpdateMeetingNotesRequest {
  user_notes: string;
}

export interface EndMeetingRequest {
  user_notes?: string;
}

// Response types
export interface MeetingListResponse {
  meetings: Meeting[];
  total: number;
  page: number;
  per_page: number;
}

export interface SummaryListResponse {
  summaries: Summary[];
  total: number;
  page: number;
  per_page: number;
}

// API Error types
export interface ApiError {
  detail: string;
}

// Comprehensive Notes types
export interface TranscriptHighlight {
  transcript_id: string;
  speaker?: string;
  text: string;
  timestamp?: string;
  highlight_reason?: string;
}

export interface ComprehensiveNotesRequest {
  template_type?: string;
  include_ai_summary?: boolean;
  include_user_notes?: boolean;
  include_transcript_highlights?: boolean;
  transcript_highlights?: TranscriptHighlight[];
  custom_prompt?: string;
  tags?: string;
}

export interface ComprehensiveNotesUpdate {
  user_notes?: string;
  tags?: string;
  is_favorite?: boolean;
  template_type?: string;
}

export interface ComprehensiveNotes {
  id: string;
  meeting_id: string;
  user_id: string;
  user_notes?: string;
  ai_summary?: string;
  transcript_highlights?: string; // JSON string
  comprehensive_notes?: string;
  notes_version: number;
  template_type: string;
  tags?: string;
  is_favorite: boolean;
  include_ai_summary: boolean;
  include_user_notes: boolean;
  include_transcript_highlights: boolean;
  custom_prompt?: string;
  created_at: string;
  updated_at: string;
}

export interface NotesSearchRequest {
  query: string;
  tags?: string[];
  template_type?: string;
  favorites_only?: boolean;
  date_from?: string;
  date_to?: string;
}

export interface NotesExportRequest {
  format: string;
  include_metadata?: boolean;
  include_transcript?: boolean;
}

export interface NotesStatistics {
  total_notes: number;
  favorite_notes: number;
  template_distribution: Record<string, number>;
  notes_this_month: number;
  average_notes_per_meeting: number;
}

// Status display helpers
export const getStatusColor = (status: MeetingStatus): string => {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'ended':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'created':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'error':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const getStatusLabel = (status: MeetingStatus): string => {
  switch (status) {
    case 'active':
      return 'Live';
    case 'ended':
      return 'Complete';
    case 'created':
      return 'Starting...';
    case 'error':
      return 'Error';
    default:
      return 'Unknown';
  }
};

// Structured Notes Types (New Implementation)
export interface TaskItem {
  task_name: string;
  task_description: string;
  deadline: string; // YYYY-MM-DD format
  assignee: string;
}

export interface KeyUpdate {
  update_number: number;
  update_description: string;
}

export interface BrainstormingIdea {
  idea_number: number;
  idea_description: string;
}

export interface StructuredNotes {
  to_do: TaskItem[];
  key_updates: KeyUpdate[];
  brainstorming_ideas: BrainstormingIdea[];
}

export interface StructuredNotesResponse {
  notes: StructuredNotes;
}

export interface GenerateStructuredNotesRequest {
  include_user_notes?: boolean;
  custom_context?: string;
}

export interface StructuredMeetingNotesResponse {
  id: string;
  meeting_id: string;
  user_id: string;
  notes: StructuredNotes;
  generated_at: string;
  transcript_length: number;
  error?: string;
} 