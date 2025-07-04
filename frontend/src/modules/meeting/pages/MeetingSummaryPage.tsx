import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  FileText,
  CheckCircle,
  Target,
  Lightbulb,
  Download,
  ArrowDownToLine,
  Settings,
  Play,
  Loader2,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { dashboardApi } from '@/shared/api/dashboardApi';
import type { Meeting, StructuredMeetingNotesResponse } from '@/shared/types/dashboard';

interface MeetingSummaryData {
  meeting: Meeting;
  structuredNotes?: StructuredMeetingNotesResponse;
  summary?: string;
}

export const MeetingSummaryPage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<MeetingSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitleValue, setEditingTitleValue] = useState('');
  const [isUpdatingTitle, setIsUpdatingTitle] = useState(false);

  useEffect(() => {
    if (meetingId) {
      loadMeetingData();
    }
  }, [meetingId]);

  const loadMeetingData = async () => {
    if (!meetingId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Load meeting details
      const meetingDetails = await dashboardApi.getMeetingDetails(meetingId);
      
      let structuredNotes: StructuredMeetingNotesResponse | undefined;
      let summary: string | undefined;

      try {
        // Try to get structured notes
        structuredNotes = await dashboardApi.generateStructuredNotes(meetingId);
      } catch (notesError) {
        console.warn('Could not load structured notes:', notesError);
      }

      try {
        // Try to get AI summary
        const summaryData = await dashboardApi.getMeetingSummary(meetingId);
        summary = summaryData.summary || undefined;
      } catch (summaryError) {
        console.warn('Could not load summary:', summaryError);
      }

      setData({
        meeting: meetingDetails,
        structuredNotes,
        summary
      });

    } catch (err) {
      console.error('Error loading meeting data:', err);
      setError('Failed to load meeting data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateStructuredNotes = async () => {
    if (!meetingId) return;

    try {
      setIsGeneratingNotes(true);
      const notes = await dashboardApi.generateStructuredNotes(meetingId);
      
      setData(prev => prev ? { ...prev, structuredNotes: notes } : null);
    } catch (err) {
      console.error('Error generating structured notes:', err);
      setError('Failed to generate structured notes.');
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!meetingId || !data?.meeting) return;

    try {
      setIsDownloading(true);

      // Download PDF
      const pdfBlob = await dashboardApi.downloadMeetingPDF(meetingId);
      
      // Generate filename
      const date = new Date(data.meeting.created_at).toISOString().split('T')[0];
      const fileName = `meeting_summary_${date}.pdf`;
      
      // Trigger download
      await dashboardApi.downloadFile(pdfBlob, fileName);

    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEditTitle = () => {
    const currentTitle = data?.meeting.name || 'Meeting Session';
    setEditingTitleValue(currentTitle);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    if (!meetingId || !data?.meeting) return;

    try {
      setIsUpdatingTitle(true);
      
      // Update meeting name via API
      await dashboardApi.updateMeeting(meetingId, { 
        name: editingTitleValue.trim() || undefined 
      });
      
      // Update local state
      setData(prev => prev ? {
        ...prev,
        meeting: { ...prev.meeting, name: editingTitleValue.trim() || undefined }
      } : null);
      
      setIsEditingTitle(false);
    } catch (err) {
      console.error('Error updating meeting title:', err);
      setError('Failed to update meeting title.');
    } finally {
      setIsUpdatingTitle(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingTitle(false);
    setEditingTitleValue('');
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const calculateDuration = (startedAt?: string, endedAt?: string): string => {
    if (!startedAt || !endedAt) return 'N/A';
    
    const start = new Date(startedAt);
    const end = new Date(endedAt);
    const diffMs = end.getTime() - start.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <span className="text-slate-400 text-lg">Loading meeting summary...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">⚠️ {error || 'Meeting not found'}</div>
          <Button onClick={() => navigate('/dashboard/meetings')} variant="outline">
            Back to Meetings
          </Button>
        </div>
      </div>
    );
  }

  const { meeting, structuredNotes, summary } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard/meetings')}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Meetings
            </Button>
            <div className="h-6 border-l border-slate-600" />
            <h1 className="text-3xl font-bold text-white">Meeting Summary</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              title="Download PDF"
              className="relative group"
            >
              <ArrowDownToLine className="h-4 w-4 mr-2" />
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Meeting Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 border border-slate-600/30 rounded-2xl p-6 mb-8 backdrop-blur-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-3xl">
                  {meeting.meeting_platform === 'google_meet' ? '📹' : 
                   meeting.meeting_platform === 'zoom' ? '💻' : '👥'}
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    {isEditingTitle ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editingTitleValue}
                          onChange={(e) => setEditingTitleValue(e.target.value)}
                          className="text-2xl font-bold bg-slate-700/50 text-white border border-slate-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0 flex-1"
                          autoFocus
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSaveTitle();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={handleSaveTitle}
                          disabled={isUpdatingTitle}
                          className="p-1 h-8 w-8"
                        >
                          {isUpdatingTitle ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          disabled={isUpdatingTitle}
                          className="p-1 h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 group">
                        <h2 className="text-2xl font-bold text-white">
                          {meeting.name || 'Meeting Session'}
                  </h2>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleEditTitle}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8"
                          title="Edit meeting name"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-slate-400">
                    <span className={`px-3 py-1 rounded-full text-xs border ${
                      meeting.status === 'ended' ? 'bg-slate-500/20 text-slate-400 border-slate-500/30' :
                      meeting.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }`}>
                      {meeting.status.toUpperCase()}
                    </span>
                    <span>{meeting.meeting_platform.replace('_', ' ').toUpperCase()}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-slate-400" />
                  <div>
                    <div className="text-white font-medium">
                      {formatDate(meeting.created_at)}
                    </div>
                    <div className="text-slate-400 text-sm">
                      Started at {formatTime(meeting.started_at || meeting.created_at)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-slate-400" />
                  <div>
                    <div className="text-white font-medium">
                      {calculateDuration(meeting.started_at, meeting.ended_at)}
                    </div>
                    <div className="text-slate-400 text-sm">Duration</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-slate-400" />
                  <div>
                    <div className="text-white font-medium">
                      {meeting.bot_name}
                    </div>
                    <div className="text-slate-400 text-sm">AI Assistant</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Action Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 border border-slate-600/30 rounded-2xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <CheckCircle className="h-6 w-6 mr-3 text-emerald-400" />
                Action Items
              </h3>
              <span className="text-slate-400 text-sm">
                {structuredNotes?.notes?.to_do?.length || 0} items
              </span>
            </div>
            
            {structuredNotes?.notes?.to_do && structuredNotes.notes.to_do.length > 0 ? (
              <div className="space-y-4">
                {structuredNotes.notes.to_do.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-emerald-400 text-xs font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">{item.task_name}</h4>
                      <p className="text-slate-300 text-sm mb-2">{item.task_description}</p>
                      <div className="flex items-center space-x-4 text-xs">
                        <span className="text-slate-400">
                          <strong>Assignee:</strong> {item.assignee}
                        </span>
                        <span className="text-slate-400">
                          <strong>Due:</strong> {item.deadline}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">No action items found</p>
                {!structuredNotes && (
                  <Button 
                    onClick={generateStructuredNotes}
                    disabled={isGeneratingNotes}
                    className="mt-4"
                    size="sm"
                  >
                    {isGeneratingNotes ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Generate Action Items
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </motion.div>

          {/* Key Updates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 border border-slate-600/30 rounded-2xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Target className="h-6 w-6 mr-3 text-blue-400" />
                Key Points
              </h3>
              <span className="text-slate-400 text-sm">
                {structuredNotes?.notes?.key_updates?.length || 0} points
              </span>
            </div>
            
            {structuredNotes?.notes?.key_updates && structuredNotes.notes.key_updates.length > 0 ? (
              <div className="space-y-4">
                {structuredNotes.notes.key_updates.map((update, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-400 text-xs font-bold">{update.update_number}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-300">{update.update_description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">No key points found</p>
              </div>
            )}
          </motion.div>

          {/* Ideas & Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 border border-slate-600/30 rounded-2xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Lightbulb className="h-6 w-6 mr-3 text-yellow-400" />
                Ideas & Insights
              </h3>
              <span className="text-slate-400 text-sm">
                {structuredNotes?.notes?.brainstorming_ideas?.length || 0} ideas
              </span>
            </div>
            
            {structuredNotes?.notes?.brainstorming_ideas && structuredNotes.notes.brainstorming_ideas.length > 0 ? (
              <div className="space-y-4">
                {structuredNotes.notes.brainstorming_ideas.map((idea, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <Lightbulb className="h-3 w-3 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-300">{idea.idea_description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">No ideas captured</p>
              </div>
            )}
          </motion.div>

          {/* Meeting Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 border border-slate-600/30 rounded-2xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <FileText className="h-6 w-6 mr-3 text-purple-400" />
                Meeting Notes
              </h3>
            </div>
            
            {meeting.user_notes ? (
              <div className="prose prose-invert max-w-none">
                <div className="text-slate-300 whitespace-pre-wrap p-4 bg-slate-700/30 rounded-lg">
                  {meeting.user_notes}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">No manual notes taken</p>
              </div>
            )}
            
            {summary && (
              <div className="mt-6">
                <h4 className="text-white font-medium mb-3">AI Summary</h4>
                <div className="prose prose-invert max-w-none">
                  <div className="text-slate-300 p-4 bg-slate-700/30 rounded-lg">
                    {summary}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}; 