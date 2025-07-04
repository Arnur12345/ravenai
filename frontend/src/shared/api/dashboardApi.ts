// Centralized API calls for Dashboard functionality
// Uses the backend endpoints from dashboard/api.py

import config from '@/shared/config/config';
import type {
  Meeting,
  MeetingWithTranscripts,
  MeetingListResponse,
  CreateMeetingRequest,
  UpdateMeetingNotesRequest,
  EndMeetingRequest,
  Transcript,
  Summary,
  CreateSummaryRequest,
  ComprehensiveNotes,
  ComprehensiveNotesRequest,
  ComprehensiveNotesUpdate,
  NotesSearchRequest,
  NotesStatistics,
  GenerateStructuredNotesRequest,
  StructuredMeetingNotesResponse
} from '@/shared/types/dashboard';

class DashboardApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${config.API_BASE_URL}/api/dashboard`;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('access_token');
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const url = `${this.baseUrl}${endpoint}`;
    const requestOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    console.log('🔍 API REQUEST DEBUG:', {
      url,
      method: requestOptions.method || 'GET',
      headers: requestOptions.headers,
      body: requestOptions.body,
    });

    const response = await fetch(url, requestOptions);

    console.log('🔍 API RESPONSE DEBUG:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('🔍 API ERROR DEBUG:', errorData);
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Meeting CRUD operations

  /**
   * Create a new meeting and start the Vexa bot
   * POST /api/dashboard/meetings
   */
  async createMeeting(meetingData: CreateMeetingRequest): Promise<Meeting> {
    return this.makeRequest<Meeting>('/meetings', {
      method: 'POST',
      body: JSON.stringify(meetingData),
    });
  }

  /**
   * Get all meetings for the current user with pagination
   * GET /api/dashboard/meetings
   */
  async getMeetings(page: number = 1, perPage: number = 20): Promise<MeetingListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    return this.makeRequest<MeetingListResponse>(`/meetings?${params}`);
  }

  /**
   * Get detailed meeting information including transcripts
   * GET /api/dashboard/meetings/{meeting_id}
   */
  async getMeetingDetails(meetingId: string): Promise<MeetingWithTranscripts> {
    return this.makeRequest<MeetingWithTranscripts>(`/meetings/${meetingId}`);
  }

  /**
   * Sync and get the latest transcripts for a meeting
   * GET /api/dashboard/meetings/{meeting_id}/transcripts
   * 
   * @throws Error with "410" status if meeting has ended
   */
  async syncMeetingTranscripts(meetingId: string): Promise<Transcript[]> {
    try {
      return this.makeRequest<Transcript[]>(`/meetings/${meetingId}/transcripts`);
    } catch (error) {
      // Re-throw with enhanced error information for better handling
      throw error;
    }
  }

  /**
   * End a meeting and generate AI summary
   * POST /api/dashboard/meetings/{meeting_id}/end
   */
  async endMeeting(meetingId: string, endData: EndMeetingRequest): Promise<Meeting> {
    return this.makeRequest<Meeting>(`/meetings/${meetingId}/end`, {
      method: 'POST',
      body: JSON.stringify(endData),
    });
  }

  /**
   * Update meeting details
   * PATCH /api/dashboard/meetings/{meeting_id}
   */
  async updateMeeting(meetingId: string, updateData: { name?: string; user_notes?: string; status?: string; meeting_date?: string }): Promise<Meeting> {
    return this.makeRequest<Meeting>(`/meetings/${meetingId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  /**
   * Update user notes for a meeting
   * PUT /api/dashboard/meetings/{meeting_id}/notes
   */
  async updateMeetingNotes(meetingId: string, userNotes: string): Promise<Meeting> {
    return this.makeRequest<Meeting>(`/meetings/${meetingId}/notes`, {
      method: 'PUT',
      body: JSON.stringify({ user_notes: userNotes }),
    });
  }

  /**
   * Delete a meeting
   * DELETE /api/dashboard/meetings/{meeting_id}
   */
  async deleteMeeting(meetingId: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/meetings/${meetingId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get AI-generated meeting summary
   * GET /api/dashboard/meetings/{meeting_id}/summary
   */
  async getMeetingSummary(meetingId: string): Promise<{
    meeting_id: string;
    summary: string | null;
    summary_generated_at: string | null;
    status: string;
    participants: string[];
    transcript_count: number;
    meeting_platform: string;
    started_at: string | null;
    ended_at: string | null;
  }> {
    return this.makeRequest(`/meetings/${meetingId}/summary`);
  }

  /**
   * Get all summaries for a specific meeting
   * GET /api/dashboard/meetings/{meeting_id}/summaries
   */
  async getMeetingSummaries(meetingId: string): Promise<Summary[]> {
    return this.makeRequest<Summary[]>(`/meetings/${meetingId}/summaries`);
  }

  /**
   * Create a new summary for a meeting
   * POST /api/dashboard/summaries
   */
  async createSummary(summaryData: CreateSummaryRequest): Promise<Summary> {
    return this.makeRequest<Summary>('/summaries', {
      method: 'POST',
      body: JSON.stringify(summaryData),
    });
  }

  /**
   * Health check for dashboard service
   * GET /api/dashboard/health
   */
  async healthCheck(): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/health');
  }

  // Utility methods for common patterns

  /**
   * Poll transcripts for a meeting (useful for real-time updates)
   * Automatically stops when meeting has ended (HTTP 410)
   */
  async pollTranscripts(
    meetingId: string,
    onUpdate: (transcripts: Transcript[]) => void,
    intervalMs: number = 10000 // 10 seconds
  ): Promise<() => void> {
    let isPolling = true;

    const poll = async () => {
      if (!isPolling) return;

      try {
        const transcripts = await this.syncMeetingTranscripts(meetingId);
        onUpdate(transcripts);
      } catch (error) {
        console.error('Error polling transcripts:', error);
        
        // Stop polling if meeting has ended (HTTP 410 Gone)
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('410') || errorMessage.includes('Meeting has ended')) {
          console.log(`🛑 Meeting ${meetingId} has ended. Stopping transcript polling to reduce server load.`);
          isPolling = false;
          return;
        }
        
        // Continue polling for other errors (network issues, temporary failures)
      }

      if (isPolling) {
        setTimeout(poll, intervalMs);
      }
    };

    // Start polling
    poll();

    // Return cleanup function
    return () => {
      isPolling = false;
    };
  }

  /**
   * Auto-save meeting notes with debouncing
   */
  async autoSaveNotes(
    meetingId: string,
    notes: string,
    debounceMs: number = 2000
  ): Promise<void> {
    // Clear existing timeout
    const timeoutKey = `notes-${meetingId}`;
    const existingTimeout = (window as any)[timeoutKey];
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    (window as any)[timeoutKey] = setTimeout(async () => {
      try {
        await this.updateMeetingNotes(meetingId, notes);
        console.log('Notes auto-saved successfully');
      } catch (error) {
        console.error('Failed to auto-save notes:', error);
      }
    }, debounceMs);
  }

  /**
   * Get meeting statistics for dashboard
   */
  async getMeetingStats(): Promise<{
    totalMeetings: number;
    activeMeetings: number;
    completedMeetings: number;
    totalDuration: string;
  }> {
    try {
      const response = await this.getMeetings(1, 100); // Get more meetings for stats
      const meetings = response.meetings;

      const totalMeetings = meetings.length;
      const activeMeetings = meetings.filter(m => m.status === 'active').length;
      const completedMeetings = meetings.filter(m => m.status === 'ended').length;

      // Calculate total duration
      let totalMinutes = 0;
      meetings.forEach(meeting => {
        if (meeting.started_at && meeting.ended_at) {
          const start = new Date(meeting.started_at);
          const end = new Date(meeting.ended_at);
          totalMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
        }
      });

      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.floor(totalMinutes % 60);
      const totalDuration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      return {
        totalMeetings,
        activeMeetings,
        completedMeetings,
        totalDuration,
      };
    } catch (error) {
      console.error('Error fetching meeting stats:', error);
      return {
        totalMeetings: 0,
        activeMeetings: 0,
        completedMeetings: 0,
        totalDuration: '0m',
      };
    }
  }

  /**
   * Get dashboard overview with stats, recent meetings, and heatmap data
   * GET /api/dashboard/overview
   */
  async getDashboardOverview(): Promise<{
    stats: {
      total_meetings: number;
      total_summaries: number;
      total_tasks: number;
      meetings_this_month: number;
      summaries_this_month: number;
      avg_meeting_duration_minutes: number;
    };
    recent_meetings: Meeting[];
    heatmap_data: Array<{
      date: string;
      meeting_count: number;
    }>;
  }> {
    return this.makeRequest('/overview');
  }

  /**
   * Get dashboard statistics only
   * GET /api/dashboard/stats
   */
  async getDashboardStats(): Promise<{
    total_meetings: number;
    total_summaries: number;
    total_tasks: number;
    meetings_this_month: number;
    summaries_this_month: number;
    avg_meeting_duration_minutes: number;
  }> {
    return this.makeRequest('/stats');
  }

  /**
   * Get meeting heatmap data for a specific year
   * GET /api/dashboard/heatmap
   */
  async getHeatmapData(year?: number): Promise<Array<{
    date: string;
    meeting_count: number;
  }>> {
    const params = year ? `?year=${year}` : '';
    return this.makeRequest(`/heatmap${params}`);
  }

  /**
   * Get meeting trends for chart
   * GET /api/dashboard/trends
   */
  async getMeetingTrends(days: number = 7): Promise<Array<{
    date: string;
    meetings: number;
    summaries: number;
  }>> {
    const params = new URLSearchParams({ days: days.toString() });
    return this.makeRequest(`/trends?${params}`);
  }

  /**
   * Create comprehensive notes for a meeting
   * POST /api/dashboard/meetings/{meeting_id}/comprehensive-notes
   */
  async createComprehensiveNotes(
    meetingId: string, 
    request: ComprehensiveNotesRequest
  ): Promise<ComprehensiveNotes> {
    return this.makeRequest<ComprehensiveNotes>(`/meetings/${meetingId}/comprehensive-notes`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get comprehensive notes for a meeting
   * GET /api/dashboard/meetings/{meeting_id}/comprehensive-notes
   */
  async getComprehensiveNotes(meetingId: string): Promise<ComprehensiveNotes | null> {
    try {
      const notesList = await this.makeRequest<ComprehensiveNotes[]>(`/meetings/${meetingId}/comprehensive-notes`);
      // Return the most recent notes (first in the list as backend orders by created_at desc)
      return notesList.length > 0 ? notesList[0] : null;
    } catch (error) {
      console.error('Error fetching comprehensive notes:', error);
      return null;
    }
  }

  /**
   * Update comprehensive notes
   * PUT /api/dashboard/comprehensive-notes/{notes_id}
   */
  async updateComprehensiveNotes(
    notesId: string, 
    updateData: ComprehensiveNotesUpdate
  ): Promise<ComprehensiveNotes> {
    return this.makeRequest<ComprehensiveNotes>(`/comprehensive-notes/${notesId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  /**
   * Search comprehensive notes
   * POST /api/dashboard/comprehensive-notes/search
   */
  async searchComprehensiveNotes(searchRequest: NotesSearchRequest): Promise<ComprehensiveNotes[]> {
    return this.makeRequest<ComprehensiveNotes[]>('/comprehensive-notes/search', {
      method: 'POST',
      body: JSON.stringify(searchRequest),
    });
  }

  /**
   * Get comprehensive notes statistics
   * GET /api/dashboard/comprehensive-notes/statistics
   */
  async getNotesStatistics(): Promise<NotesStatistics> {
    return this.makeRequest<NotesStatistics>('/comprehensive-notes/statistics');
  }

  /**
   * Delete comprehensive notes
   * DELETE /api/dashboard/comprehensive-notes/{notes_id}
   */
  async deleteComprehensiveNotes(notesId: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/comprehensive-notes/${notesId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Generate comprehensive notes with loading state
   */
  async generateComprehensiveNotes(
    meetingId: string,
    options: ComprehensiveNotesRequest,
    onProgress?: (status: string) => void
  ): Promise<ComprehensiveNotes> {
    try {
      onProgress?.('Preparing meeting data...');
      
      // Add a small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onProgress?.('Generating AI analysis...');
      
      const notes = await this.createComprehensiveNotes(meetingId, options);
      
      onProgress?.('Finalizing comprehensive notes...');
      
      return notes;
    } catch (error) {
      onProgress?.('Failed to generate notes');
      throw error;
    }
  }

  /**
   * Generate structured meeting notes using GPT-4o and save as summary
   * POST /api/dashboard/meetings/{meeting_id}/structured-notes
   * 
   * This method will first check if a summary already exists for the meeting.
   * If it exists, it returns the existing summary instead of generating a new one.
   */
  async generateStructuredNotes(
    meetingId: string,
    options?: GenerateStructuredNotesRequest,
    onProgress?: (status: string) => void
  ): Promise<any> { // Using any for now since we're returning a Summary
    try {
      onProgress?.('Проверка существующих заметок...');
      
      // First try to get existing structured notes
      try {
        const existingSummary = await this.getStructuredNotes(meetingId);
        if (existingSummary) {
          onProgress?.('Загружены существующие заметки');
          return existingSummary;
        }
      } catch (error) {
        // No existing summary found, continue to generate new one
        console.log('No existing structured notes found, generating new ones');
      }
      
      onProgress?.('Синхронизация транскриптов...');
      
      // Add a small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 300));
      
      onProgress?.('Анализ с помощью AI...');
      
      const summary = await this.makeRequest<any>(`/meetings/${meetingId}/structured-notes`, {
        method: 'POST',
        body: JSON.stringify(options || {}),
      });
      
      onProgress?.('Создание красивого резюме...');
      
      return summary;
    } catch (error) {
      onProgress?.('Не удалось создать структурированные заметки');
      throw error;
    }
  }

  /**
   * Get structured meeting notes (summary) for a specific meeting
   * GET /api/dashboard/meetings/{meeting_id}/structured-notes
   */
  async getStructuredNotes(meetingId: string): Promise<any | null> {
    try {
      return this.makeRequest(`/meetings/${meetingId}/structured-notes`);
    } catch (error) {
      console.warn('No structured notes found for meeting:', meetingId);
      return null;
    }
  }

  /**
   * Download PDF version of meeting summary
   * GET /api/dashboard/meetings/{meeting_id}/download-pdf
   */
  async downloadMeetingPDF(meetingId: string): Promise<Blob> {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(`${this.baseUrl}/meetings/${meetingId}/download-pdf`, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Download PDF version of specific summary
   * GET /api/dashboard/summaries/{summary_id}/download-pdf
   */
  async downloadSummaryPDF(summaryId: string): Promise<Blob> {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(`${this.baseUrl}/summaries/${summaryId}/download-pdf`, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Download and trigger file download in browser
   */
  async downloadFile(blob: Blob, filename: string): Promise<void> {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const dashboardApi = new DashboardApi();
export default dashboardApi; 