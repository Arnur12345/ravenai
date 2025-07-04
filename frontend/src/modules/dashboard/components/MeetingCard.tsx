import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  Trash2, 
  Eye,
  Circle,
  Users
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import type { Meeting } from '@/shared/types/dashboard';
import { 
  getStatusColor, 
  getStatusLabel
} from '@/shared/types/dashboard';
import { formatDuration, formatDate } from '@/shared/utils';

interface MeetingCardProps {
  meeting: Meeting;
  onView: (meetingId: string) => void;
  onDelete: (meetingId: string) => void;
  index?: number;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({ 
  meeting, 
  onView, 
  onDelete, 
  index = 0 
}) => {
  const navigate = useNavigate();

  const handleViewMeeting = () => {
    onView(meeting.id);
    navigate(`/meetings/${meeting.id}`);
  };

  const handleDeleteMeeting = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      onDelete(meeting.id);
    }
  };

  const handleOpenMeetingUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(meeting.meeting_url, '_blank');
  };

  const isActive = meeting.status === 'active';
  const isCompleted = meeting.status === 'ended';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -2 }}
      className="group relative bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-slate-900/50"
      onClick={handleViewMeeting}
      style={{
        backgroundColor: 'var(--dashboard-black)',
        borderColor: 'var(--dashboard-light-blue)30',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#C6DFFF40';
        e.currentTarget.style.boxShadow = `0 10px 40px #C6DFFF20`;
        e.currentTarget.style.backgroundColor = '#C6DFFF05';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--dashboard-light-blue)30';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
        e.currentTarget.style.backgroundColor = 'var(--dashboard-black)';
      }}
    >
      {/* Enhanced Status indicator */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        isActive ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 
        isCompleted ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : 
        meeting.status === 'error' ? 'bg-gradient-to-r from-red-400 to-rose-500' : 'bg-gradient-to-r from-yellow-400 to-orange-500'
      } shadow-lg`} />
      
      {/* Background effects */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundColor: '#C6DFFF05' }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(198,223,255,0.08),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="p-6 relative z-10">
          {/* Enhanced Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-3">
                <div className="relative">
                  <h3 className="text-lg font-bold text-slate-100 font-inter truncate group-hover:text-white transition-colors duration-300">
                    {meeting.bot_name}
                  </h3>
                  <div className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-indigo-400 to-purple-500 group-hover:w-full transition-all duration-300" />
                </div>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border backdrop-blur-sm ${getStatusColor(meeting.status)} shadow-lg`}>
                  <Circle className={`w-2.5 h-2.5 mr-2 animate-pulse ${
                    isActive ? 'fill-green-400 text-green-400' : 
                    isCompleted ? 'fill-blue-400 text-blue-400' : 
                    meeting.status === 'error' ? 'fill-red-400 text-red-400' : 'fill-yellow-400 text-yellow-400'
                  }`} />
                  {getStatusLabel(meeting.status)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 rounded-full bg-indigo-400" />
                  <p className="text-sm font-medium text-slate-300 font-inter">
                    {meeting.meeting_platform} Meeting
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Actions */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenMeetingUrl}
                className="text-slate-400 hover:text-indigo-400 hover:bg-slate-700/50 rounded-xl p-2 transition-all duration-200"
                title="Open meeting URL"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteMeeting}
                className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl p-2 transition-all duration-200"
                title="Delete meeting"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

                  {/* Enhanced Meeting Info */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/50 border border-slate-600/50">
                <Calendar className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-medium">Created</span>
                <span className="text-sm text-slate-300 font-semibold">{formatDate(meeting.created_at)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/50 border border-slate-600/50">
                <Clock className="h-4 w-4 text-purple-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-medium">Duration</span>
                <span className="text-sm text-slate-300 font-semibold">{formatDuration(meeting.started_at, meeting.ended_at)}</span>
              </div>
            </div>
          </div>

                  {/* Meeting Status Info */}
          <div className="mb-5">
            <div className="flex items-center space-x-4">
              {meeting.summary && (
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-blue-400" />
                  <span className="text-xs text-slate-400 font-medium">AI Summary Available</span>
                </div>
              )}
              {meeting.user_notes && (
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="text-xs text-slate-400 font-medium">Notes Taken</span>
                </div>
              )}
            </div>
          </div>

                  {/* Enhanced Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-600/50">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-700/50">
                  <Users className="h-3 w-3 text-slate-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 font-medium">ID</span>
                  <span className="text-xs text-slate-300 font-mono">{meeting.id.substring(0, 8)}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleViewMeeting();
              }}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 hover:text-white hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/30 rounded-xl px-4 py-2 transition-all duration-200"
            >
              <Eye className="h-4 w-4" />
              <span className="font-medium">View Details</span>
            </Button>
          </div>
        </div>

        {/* Enhanced Hover Effects */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" style={{ backgroundColor: '#C6DFFF03' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
    </motion.div>
  );
}; 