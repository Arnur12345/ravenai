import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { NewMeetingModal } from '../components/NewMeetingModal';
import { 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  Clock,
  Users,
  MoreHorizontal,
  Play,
  Eye,
  CirclePlay,
  CircleStop,
  CircleCheck,
  Loader2
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { dashboardApi } from '@/shared/api/dashboardApi';
import type { CreateMeetingRequest, Meeting, MeetingListResponse } from '@/shared/types/dashboard';
import { useLanguage } from '@/shared/contexts/LanguageContext';

// Helper functions
const extractMeetingTitle = (meetingUrl: string): string => {
  // Extract meeting ID and create a more readable title
  const urlParts = meetingUrl.split('/');
  const meetingId = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
  
  if (meetingId && meetingId.length > 3) {
    return `Meeting ${meetingId.substring(0, 8)}`;
  }
  return 'Meeting Session';
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
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
    return `${diffMinutes}m`;
  } else {
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'created':
      return <CirclePlay className="h-4 w-4" />;
    case 'active':
      return <CircleStop className="h-4 w-4" />;
    case 'ended':
      return <CircleCheck className="h-4 w-4" />;
    case 'error':
      return <MoreHorizontal className="h-4 w-4" />;
    default:
      return <MoreHorizontal className="h-4 w-4" />;
  }
};

const getMeetingTypeIcon = (platform: string) => {
  switch (platform) {
    case 'google_meet':
      return '📹';
    case 'zoom':
      return '💻';
    case 'teams':
      return '👥';
    default:
      return '💼';
  }
};

export const MeetingsPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load meetings on component mount
  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await dashboardApi.getMeetings(1, 50); // Get first 50 meetings
      setMeetings(response.meetings);
    } catch (err) {
      console.error('Error loading meetings:', err);
      setError('Failed to load meetings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMeeting = async (meetingData: CreateMeetingRequest) => {
    try {
      setIsCreatingMeeting(true);
      const newMeeting = await dashboardApi.createMeeting(meetingData);
      
      // Add new meeting to the list
      setMeetings(prev => [newMeeting, ...prev]);
      
      // Navigate to the meeting workspace
      navigate(`/meetings/${newMeeting.id}`);
      
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error; // Re-throw to let the modal handle the error display
    } finally {
      setIsCreatingMeeting(false);
    }
  };

  const handleMeetingClick = (meeting: Meeting) => {
    // Always navigate to meeting workspace
    navigate(`/meetings/${meeting.id}`);
  };

  const filteredMeetings = meetings.filter((meeting: Meeting) => {
    const meetingTitle = extractMeetingTitle(meeting.meeting_url);
    const matchesSearch = meetingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (meeting.user_notes && meeting.user_notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || meeting.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6" style={{ fontFamily: 'Gilroy, Inter, sans-serif' }}>
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
        >
          <div>
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ color: 'var(--dashboard-very-light-blue)' }}
            >
              {t('meetings.title')}
            </h1>
            <p style={{ color: 'var(--dashboard-light-blue)' }}>
              {t('meetings.manage_sessions')}
            </p>
          </div>
          <Button 
            onClick={() => setIsNewMeetingModalOpen(true)}
            className="flex items-center rounded-xl px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-600/50 hover:border-gray-500/50"
            style={{
              background: 'linear-gradient(to bottom, #3B3B3B, #636363)',
              color: 'white',
              fontFamily: 'Gilroy, Inter, sans-serif'
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('meetings.create')}
          </Button>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          {/* Search Bar */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-4 w-4" style={{ color: 'var(--dashboard-light-blue)' }} />
            </div>
            <input
              type="text"
              placeholder={t('meetings.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 backdrop-blur-sm transition-all duration-200 focus:ring-2 hover:border-gray-300"
              style={{
                backgroundColor: 'var(--dashboard-black)',
                color: 'var(--dashboard-very-light-blue)'
              }}
            />
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" style={{ color: 'var(--dashboard-light-blue)' }} />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 backdrop-blur-sm transition-all duration-200 focus:ring-2 hover:border-gray-300"
              style={{
                backgroundColor: 'var(--dashboard-black)',
                color: 'var(--dashboard-very-light-blue)'
              }}
            >
              <option value="all">{t('meetings.all_status')}</option>
              <option value="created">{t('meetings.created_status')}</option>
              <option value="active">{t('meetings.active_status')}</option>
              <option value="ended">{t('meetings.ended_status')}</option>
              <option value="error">{t('meetings.failed_status')}</option>
            </select>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--dashboard-light-blue)' }} />
            <span className="ml-3" style={{ color: 'var(--dashboard-light-blue)' }}>{t('meetings.loading')}</span>
          </motion.div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="mb-4" style={{ color: 'red' }}>⚠️ {t('meetings.failed_load')}</div>
            <Button 
              onClick={loadMeetings} 
              variant="outline"
              className="border-gray-200 hover:border-gray-300"
              style={{
                color: 'var(--dashboard-light-blue)'
              }}
            >
              {t('meetings.retry')}
            </Button>
          </motion.div>
        )}

        {/* Meetings Grid */}
        {!isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredMeetings.map((meeting: Meeting, index: number) => {
              const meetingTitle = extractMeetingTitle(meeting.meeting_url);
              const createdDate = formatDate(meeting.created_at);
              const createdTime = formatTime(meeting.created_at);
              const duration = calculateDuration(meeting.started_at, meeting.ended_at);
              
              return (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  onClick={() => handleMeetingClick(meeting)}
                  className="relative overflow-hidden rounded-2xl border border-gray-200 hover:border-gray-300 p-6 backdrop-blur-sm transition-all duration-300 group cursor-pointer"
                  style={{
                    backgroundColor: 'var(--dashboard-black)'
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getMeetingTypeIcon(meeting.meeting_platform)}</div>
                      <div>
                        <h3 
                          className="font-semibold text-lg group-hover:opacity-80 transition-opacity duration-200"
                          style={{ color: 'var(--dashboard-very-light-blue)' }}
                        >
                          {meeting.name || extractMeetingTitle(meeting.meeting_url)}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span 
                            className="text-xs px-2 py-1 rounded-full border border-gray-200 flex items-center space-x-1"
                            style={{
                              backgroundColor: 
                                meeting.status === 'created' ? 'var(--dashboard-bright-blue)20' :
                                meeting.status === 'active' ? 'var(--dashboard-bright-blue)20' :
                                meeting.status === 'ended' ? 'var(--dashboard-light-blue)20' :
                                'var(--dashboard-light-blue)20',
                              color:
                                meeting.status === 'created' ? 'var(--dashboard-bright-blue)' :
                                meeting.status === 'active' ? 'var(--dashboard-bright-blue)' :
                                meeting.status === 'ended' ? 'var(--dashboard-light-blue)' :
                                'var(--dashboard-light-blue)'
                            }}
                          >
                            {getStatusIcon(meeting.status)}
                            <span className="capitalize">{t(`meetings.${meeting.status}_status`)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      style={{ color: 'var(--dashboard-light-blue)' }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div 
                      className="flex items-center text-sm"
                      style={{ color: 'var(--dashboard-light-blue)' }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {createdDate} {t('meetings.at')} {createdTime}
                    </div>
                    <div 
                      className="flex items-center text-sm"
                      style={{ color: 'var(--dashboard-light-blue)' }}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {duration}
                    </div>
                    {meeting.bot_name && (
                      <div 
                        className="flex items-center text-sm"
                        style={{ color: 'var(--dashboard-light-blue)' }}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        {t('meetings.bot')}: {meeting.bot_name}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {meeting.status === 'created' ? (
                      <Button 
                        className="flex-1 flex items-center justify-center rounded-xl py-2 font-medium shadow-lg transition-all duration-200"
                        style={{
                          background: `linear-gradient(135deg, var(--dashboard-bright-blue), var(--dashboard-light-blue))`,
                          color: 'var(--dashboard-black)',
                          boxShadow: `0 4px 20px var(--dashboard-bright-blue)25`
                        }}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {t('meetings.start')}
                      </Button>
                    ) : meeting.status === 'active' ? (
                      <Button 
                        className="flex-1 flex items-center justify-center rounded-xl py-2 font-medium shadow-lg transition-all duration-200"
                        style={{
                          background: `linear-gradient(135deg, var(--dashboard-bright-blue), var(--dashboard-light-blue))`,
                          color: 'var(--dashboard-black)',
                          boxShadow: `0 4px 20px var(--dashboard-bright-blue)25`
                        }}
                      >
                        <CircleStop className="h-4 w-4 mr-2" />
                        {t('meetings.join_live')}
                      </Button>
                    ) : (
                      <Button 
                        className="flex-1 flex items-center justify-center rounded-xl py-2 border border-gray-200 transition-all duration-200"
                        style={{
                          backgroundColor: 'var(--dashboard-very-light-blue)10',
                          color: 'var(--dashboard-very-light-blue)'
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t('meetings.view_meeting')}
                      </Button>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredMeetings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center py-12"
          >
            <Calendar 
              className="h-16 w-16 mx-auto mb-4" 
              style={{ color: 'var(--dashboard-light-blue)50' }}
            />
            <h3 
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--dashboard-very-light-blue)' }}
            >
              {t('meetings.no_found')}
            </h3>
            <p 
              className="mb-6"
              style={{ color: 'var(--dashboard-light-blue)' }}
            >
              {searchTerm || selectedFilter !== 'all' 
                ? t('meetings.adjust_search')
                : t('meetings.create_first')
              }
            </p>
            {!searchTerm && selectedFilter === 'all' && (
              <Button 
                onClick={() => setIsNewMeetingModalOpen(true)}
                className="flex items-center rounded-xl px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-600/50 hover:border-gray-500/50"
                style={{
                  background: 'linear-gradient(to bottom, #3B3B3B, #636363)',
                  color: 'white',
                  fontFamily: 'Gilroy, Inter, sans-serif'
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('meetings.create')}
              </Button>
            )}
          </motion.div>
        )}
      </div>

      {/* New Meeting Modal */}
      <NewMeetingModal
        isOpen={isNewMeetingModalOpen}
        onClose={() => setIsNewMeetingModalOpen(false)}
        onSubmit={handleCreateMeeting}
        isLoading={isCreatingMeeting}
      />
    </DashboardLayout>
  );
}; 