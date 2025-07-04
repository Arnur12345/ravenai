import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { dashboardApi } from '@/shared/api/dashboardApi';
import type { Transcript } from '@/shared/types/dashboard';

interface LiveTranscriptProps {
  meetingId: string;
  transcripts: Transcript[];
  isActive: boolean;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({
  meetingId,
  transcripts: initialTranscripts,
  isActive,
}) => {
  const [transcripts, setTranscripts] = useState<Transcript[]>(initialTranscripts);
  const [isPolling, setIsPolling] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollCleanupRef = useRef<(() => void) | null>(null);

  // Auto-scroll to bottom when new transcripts arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  // Start polling when meeting is active, update transcripts when not active
  useEffect(() => {
    setTranscripts(initialTranscripts);
    
    if (isActive && !isPolling) {
      startPolling();
    } else if (!isActive && pollCleanupRef.current) {
      // Stop polling for inactive meetings
      pollCleanupRef.current();
      pollCleanupRef.current = null;
      setIsPolling(false);
    }

    return () => {
      if (pollCleanupRef.current) {
        pollCleanupRef.current();
      }
    };
  }, [isActive, meetingId, initialTranscripts]);

  const startPolling = async () => {
    if (isPolling) return;

    setIsPolling(true);
    try {
      const cleanup = await dashboardApi.pollTranscripts(
        meetingId,
        (newTranscripts) => {
          setTranscripts(newTranscripts);
          setLastUpdate(new Date());
        },
        8000 // Poll every 8 seconds
      );
      pollCleanupRef.current = cleanup;
    } catch (error) {
      console.error('Error starting transcript polling:', error);
      setIsPolling(false);
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const generateAvatar = (name: string) => {
    // Generate a consistent color based on name
    const colors = [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAFxjLcNhuF0m4MTWVVXLqpw9mEDpZLYaPi_nbw0MWS51XLOCpLTL18xCZL-MXN2sZKQQL4h2kGhdbAo6g6h043rz0tqRy4d9zkvc252NLtQDX2vrSDUgqXacnZXltj88Sfhx_hYvdi9gw0xKGAT3gfKxG3i4oe8po54I7HGuMdaxLyVgLg5gq4ENggjQQ5mgIgJtQqeR15UTJ0n4ENYKowxiGUxnkoniXuE-YgoEdvmXS8uTsZiH6oAZmNaTXOaH5GYJWJABT7eQ',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA72uPm9d8-J32SS4AzSCst0HToONBbruErjbSn4P180teVmBFtFn51c8DY9F-PKq9fCo5MzADf8H5rpL2yxrGSpQKoFAR8xN-5fKbFC1hC_zAfFZUa6J1HKevbWCJmn6_iTcXPcKKNtPX7zNkHtsEmhU5aZs7DE4XTaZkejz_0F-YyD5kDbihJ87NgiesJj-gJ94UfeLdx8mZdveQ0nbMRZhKut6xvkT-TQ5DPQntBk0EdqJAj2uhzPvtod3l75EVVuj5xAjctytc',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCwbdylmS0t1ALPbJpvkSMA-7m3A7BZ1rDOo6-ZbIi9VBNVi0RRLxHHCM4VfnX0QhuCbwTcMokCWjy36HT_baGECvup8fOcSGxhVJbtEoGZkmZ9Q860JoUVMNfF95kj-mIHxzYfsCPkX8TdHoV5RZXJgZGuMobZYw-0-8gUphEr5fuda8V12X00dP9xrrEz5CH58COjgKI6oS7NJO72p1qynSwlWoVh4o2TEvG4054uAkRnOACJ5xEE5YHBuz1v8XNm1sK631ChbC4',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA2hxtp1hmVo-w9dmsrwcb5xeokkn3N2daSorEUPazMJhDDtlO-uZsgxc5LaesfZ9Vtc-h8ESo4Aq5uursesw55Th-yiWpGvh6nrO95_IAJKcZ1efbKMEpwl9DmXacz1nqVm-5irnxQ-yczyJaWbyVHiwVyXkTC8wJvh8VKuDCZx-nnyLicer_dn4ukNVrkYsTgFkhXbwNPESOmI6fqrT8gGWqqBGQCAF8CBtbs6U7Lxru3S2Iag-NvQu84fw_Pdh8ZIVcfepH_XQc'
    ];
    
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div 
      ref={scrollRef}
      className="h-full overflow-y-auto space-y-5"
    >
      {transcripts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
          <h4 className="text-lg font-medium text-gray-600 mb-2">
            {isActive ? 'Waiting for transcripts...' : 'No transcripts yet'}
          </h4>
          <p className="text-gray-500 max-w-sm">
            {isActive
              ? 'The AI bot is listening to your meeting. Transcripts will appear here in real-time.'
              : 'Transcripts will appear here once the meeting starts and participants begin speaking.'}
          </p>
        </div>
      ) : (
        <AnimatePresence>
          {transcripts.map((transcript, index) => {
            const isHighlighted = index === transcripts.length - 1 && isActive;
            
            return (
              <motion.div
                key={transcript.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${isHighlighted ? 'transcript-speaker-highlight' : ''}`}
                style={isHighlighted ? {
                  backgroundColor: '#EBF5FF',
                  borderLeft: '3px solid var(--primary-color)',
                  paddingLeft: '0.75rem'
                } : {}}
              >
                {/* Speaker Avatar */}
                <img 
                  alt="Speaker Avatar" 
                  className="w-8 h-8 rounded-full mr-3 flex-shrink-0" 
                  src={generateAvatar(transcript.speaker || 'Unknown')}
                />

                {/* Content */}
                <div>
                  <div className="flex items-baseline">
                    <span 
                      className="font-medium text-sm"
                      style={{ 
                        color: isHighlighted ? 'var(--primary-color)' : 'var(--text-primary)' 
                      }}
                    >
                      {transcript.speaker || 'Unknown Speaker'}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">
                      {formatTimestamp(transcript.timestamp)}
                    </span>
                  </div>
                  <p 
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {transcript.text}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </div>
  );
}; 