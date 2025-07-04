import React from 'react';
import { motion } from 'framer-motion';
import { MeetingCard } from './MeetingCard';
import type { Meeting } from '@/shared/types/dashboard';

interface MeetingListProps {
  meetings: Meeting[];
  isLoading: boolean;
  onViewMeeting: (meetingId: string) => void;
  onDeleteMeeting: (meetingId: string) => void;
}

const MeetingSkeleton: React.FC = () => (
  <div 
    className="rounded-2xl border p-6 animate-pulse"
    style={{
      backgroundColor: 'var(--dashboard-black)',
      borderColor: 'var(--dashboard-light-blue)30',
      fontFamily: 'Gilroy, Inter, sans-serif'
    }}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <div 
            className="h-5 rounded w-32"
            style={{ backgroundColor: 'var(--dashboard-light-blue)30' }}
          ></div>
          <div 
            className="h-5 rounded w-16"
            style={{ backgroundColor: 'var(--dashboard-light-blue)30' }}
          ></div>
        </div>
        <div 
          className="h-4 rounded w-24"
          style={{ backgroundColor: 'var(--dashboard-light-blue)20' }}
        ></div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div 
        className="h-4 rounded"
        style={{ backgroundColor: 'var(--dashboard-light-blue)20' }}
      ></div>
      <div 
        className="h-4 rounded"
        style={{ backgroundColor: 'var(--dashboard-light-blue)20' }}
      ></div>
    </div>
    <div 
      className="h-12 rounded mb-4"
      style={{ backgroundColor: 'var(--dashboard-light-blue)15' }}
    ></div>
    <div 
      className="flex items-center justify-between pt-4 border-t"
      style={{ borderColor: 'var(--dashboard-light-blue)20' }}
    >
      <div 
        className="h-4 rounded w-20"
        style={{ backgroundColor: 'var(--dashboard-light-blue)20' }}
      ></div>
      <div 
        className="h-8 rounded w-16"
        style={{ backgroundColor: 'var(--dashboard-light-blue)30' }}
      ></div>
    </div>
  </div>
);

const EmptyState: React.FC<{ onCreateMeeting: () => void }> = ({ onCreateMeeting }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="text-center py-16"
    style={{ fontFamily: 'Gilroy, Inter, sans-serif' }}
  >
    <div 
      className="mx-auto h-24 w-24 mb-6 opacity-40"
      style={{ color: 'var(--dashboard-light-blue)' }}
    >
      <svg
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        className="h-24 w-24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2m-8 0V7"
        />
      </svg>
    </div>
    <h3 
      className="text-xl font-bold mb-3"
      style={{ color: 'var(--dashboard-very-light-blue)' }}
    >
      No meetings yet
    </h3>
    <p 
      className="mb-8 max-w-sm mx-auto leading-relaxed"
      style={{ color: 'var(--dashboard-light-blue)' }}
    >
      Start your first meeting to begin capturing AI-powered summaries and insights.
    </p>
    <button
      onClick={onCreateMeeting}
      className="inline-flex items-center px-6 py-3 font-medium rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl border border-gray-600/50 hover:border-gray-500/50"
      style={{
        background: 'linear-gradient(to bottom, #3B3B3B, #636363)',
        color: 'white',
        fontFamily: 'Gilroy, Inter, sans-serif'
      }}
    >
      <svg 
        className="w-5 h-5 mr-2" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Create Your First Meeting
    </button>
  </motion.div>
);

export const MeetingList: React.FC<MeetingListProps> = ({
  meetings,
  isLoading,
  onViewMeeting,
  onDeleteMeeting,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <MeetingSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <EmptyState 
        onCreateMeeting={() => {
          // This will be handled by the parent component
          const event = new CustomEvent('create-meeting');
          window.dispatchEvent(event);
        }} 
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {meetings.map((meeting, index) => (
        <MeetingCard
          key={meeting.id}
          meeting={meeting}
          onView={onViewMeeting}
          onDelete={onDeleteMeeting}
          index={index}
        />
      ))}
    </div>
  );
}; 