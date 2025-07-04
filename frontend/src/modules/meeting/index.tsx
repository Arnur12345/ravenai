import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Square, Loader2, FileText, Edit, Lightbulb, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { LiveTranscript } from './components/LiveTranscript';
import { MarkdownEditor } from './components/MarkdownEditor';
import { SummaryDisplay } from './components/SummaryDisplay';
import { ComprehensiveNotesModal } from './components/ComprehensiveNotesModal';
import { SlackSendButton } from './components/SlackSendButton';

import { dashboardApi } from '@/shared/api/dashboardApi';
import type { MeetingWithTranscripts } from '@/shared/types/dashboard';

// CSS Variables
const cssVars = `
  :root {
    --primary-color: #4A90E2;
    --secondary-color: #50E3C2;
    --text-primary: #333333;
    --text-secondary: #555555;
    --bg-light: #F7F9FC;
    --bg-white: #FFFFFF;
    --border-color: #E0E0E0;
  }
  
  @import url('https://fonts.googleapis.com/css2?family=Gilroy:wght@300;400;500;600;700;800;900&display=swap');
`;

const MeetingWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<MeetingWithTranscripts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEndingMeeting, setIsEndingMeeting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [meetingTime, setMeetingTime] = useState(0);
  const [structuredNotes, setStructuredNotes] = useState<any>(null);
  const [hasJustEnded, setHasJustEnded] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/dashboard');
      return;
    }

    loadMeetingDetails();
  }, [id, navigate]);

  // Auto-switch to summary tab when meeting ends
  useEffect(() => {
    if (meeting?.status === 'ended') {
      setHasJustEnded(true); // This will trigger auto-switch to Summary tab in MarkdownEditor
    }
  }, [meeting?.status]);

  // Meeting timer effect
  useEffect(() => {
    if (meeting?.status === 'active') {
      const interval = setInterval(() => {
        setMeetingTime(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [meeting?.status]);

  const loadMeetingDetails = async () => {
    if (!id) return;

    try {
      setError(null);
      const meetingData = await dashboardApi.getMeetingDetails(id);
      setMeeting(meetingData);
    } catch (error) {
      console.error('Error loading meeting details:', error);
      setError('Failed to load meeting details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndMeeting = async () => {
    if (!id || !meeting) return;

    setIsEndingMeeting(true);
    try {
      const updatedMeeting = await dashboardApi.endMeeting(id, {
        user_notes: meeting.user_notes || undefined,
      });
      setMeeting({ ...meeting, ...updatedMeeting });
      setHasJustEnded(true); // This will trigger auto-switch to Summary tab and start generating summary
    } catch (error) {
      console.error('Error ending meeting:', error);
      setError('Failed to end meeting. Please try again.');
    } finally {
      setIsEndingMeeting(false);
    }
  };

  const handleNotesUpdate = async (notes: string) => {
    if (!id) return;

    try {
      // Auto-save notes using the debounced method
      await dashboardApi.autoSaveNotes(id, notes);
      
      // Update local state
      if (meeting) {
        setMeeting({ ...meeting, user_notes: notes });
      }
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };



  const handleBackToDashboard = () => {
    navigate('/meetings');
  };

  const formatMeetingTime = () => {
    const minutes = Math.floor(meetingTime / 60);
    const seconds = meetingTime % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-light)' }}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading meeting workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-light)' }}>
        <div className="text-center max-w-md">
          <div className="text-gray-400 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Meeting Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            {error || 'The meeting you\'re looking for doesn\'t exist or has been deleted.'}
          </p>
          <Button
            onClick={handleBackToDashboard}
            className="bg-black text-white hover:bg-gray-800"
          >
            Back to Meetings
          </Button>
        </div>
      </div>
    );
  }

  const isActive = meeting.status === 'active';
  const isEnded = meeting.status === 'ended';

  return (
    <>
      <style>{cssVars}</style>
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--bg-light)', color: 'var(--text-primary)', fontFamily: 'Gilroy, Inter, sans-serif' }}>
        {/* Header */}
        <header className="shadow-sm sticky top-0 z-50" style={{ backgroundColor: 'var(--bg-white)' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button 
                  onClick={handleBackToDashboard}
                  className="flex items-center transition-colors duration-150 focus:outline-none"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="ml-2 text-sm font-medium">All Meetings</span>
                </button>
                <div className="ml-6">
                  <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {meeting.bot_name}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {meeting.meeting_platform} Meeting
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span 
                    className={`w-3 h-3 rounded-full mr-2 ${isActive ? 'bg-green-500 animate-pulse' : isEnded ? 'bg-gray-400' : 'bg-yellow-500'}`}
                  />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {isActive ? `In Progress (${formatMeetingTime()})` : isEnded ? 'Ended' : 'Starting'}
                  </span>
                </div>
                <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Live Transcript Section */}
            <div className="lg:col-span-2 rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-white)' }}>
              <div className="p-5" style={{ borderBottom: `1px solid var(--border-color)` }}>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Live Transcript
                  </h2>
                  <div className="flex items-center text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span className="h-3 w-3 rounded-full bg-green-500 mr-1 text-base" />
                    <span>Recording</span>
                                         <button 
                       className="ml-3 text-gray-400 hover:text-blue-500 transition-colors"
                       onClick={() => window.location.reload()}
                     >
                       <RefreshCw className="h-4 w-4" />
                     </button>
                  </div>
                </div>
                <input 
                  className="w-full px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  style={{ border: `1px solid var(--border-color)` }}
                  placeholder="Search transcript..." 
                  type="search"
                />
              </div>
              <div className="p-5 space-y-5 h-[calc(100vh-280px)] overflow-y-auto">
                <LiveTranscript 
                  meetingId={id!} 
                  transcripts={meeting.transcripts || []}
                  isActive={isActive}
                />
              </div>
            </div>

            {/* Notes Section */}
            <div className="lg:col-span-3 rounded-lg shadow-lg flex flex-col" style={{ backgroundColor: 'var(--bg-white)' }}>
              <div className="p-5" style={{ borderBottom: `1px solid var(--border-color)` }}>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    My Meeting Notes
                  </h2>
                  <div className="flex space-x-2">
                    {isActive && (
                      <button
                        onClick={handleEndMeeting}
                        disabled={isEndingMeeting}
                        className="flex items-center text-sm text-white px-3 py-1.5 rounded-md focus:outline-none transition-colors"
                        style={{
                          background: 'linear-gradient(to bottom, #3B3B3B, #636363)',
                          fontFamily: 'Gilroy, Inter, sans-serif'
                        }}
                      >
                        <Square className="h-4 w-4 mr-1.5" />
                        {isEndingMeeting ? 'Generating Notes...' : 'End & Generate Notes'}
                      </button>
                    )}
                    {isEnded && meeting.summary && (
                      <SlackSendButton
                        meetingId={id!}
                        meetingSummary={meeting.summary}
                        isVisible={true}
                      />
                    )}
                  </div>
                </div>
              </div>



              {/* Notes Editor */}
              <div className="flex-grow min-h-[300px] focus-within:ring-2 focus-within:ring-blue-500 rounded-b-lg">
                <MarkdownEditor
                  initialNotes={meeting.user_notes || ''}
                  onNotesChange={handleNotesUpdate}
                  meetingId={id!}
                  structuredNotes={structuredNotes}
                  hasJustEnded={hasJustEnded}
                />
              </div>

              {/* Footer */}
              <div className="p-3 bg-gray-50 text-xs text-gray-500 flex justify-between items-center rounded-b-lg" style={{ borderTop: `1px solid var(--border-color)` }}>
                <span>Last saved: Just now</span>
                <span>Word count: {meeting.user_notes?.split(/\s+/).filter(word => word.length > 0).length || 0}</span>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 text-center" style={{ backgroundColor: 'var(--bg-white)', borderTop: `1px solid var(--border-color)` }}>
          <p className="text-xs text-gray-500">© 2024 Meeting Notes App. All rights reserved.</p>
        </footer>

        {/* Modals */}
        <ComprehensiveNotesModal
          isOpen={isNotesModalOpen}
          onClose={() => setIsNotesModalOpen(false)}
          meeting={meeting}
        />
      </div>
    </>
  );
};

export default MeetingWorkspace; 