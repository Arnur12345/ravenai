import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { MeetingWithTranscripts } from '@/shared/types/dashboard';

interface SummaryDisplayProps {
  meeting: MeetingWithTranscripts;
}

const BlurredTextReveal: React.FC<{ text: string }> = ({ text }) => {
  const [revealed, setRevealed] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!revealed) {
    return (
      <div className="relative overflow-hidden min-h-[200px]">
        {/* Blurred Rectangle */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-gray-200 blur-3xl"
          initial={{ y: '-100%' }}
          animate={{ y: '0%' }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        {/* Loading text */}
        <motion.div
          className="relative text-gray-400 text-lg font-medium pt-20 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Generating summary...
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-gray-700 leading-relaxed whitespace-pre-wrap"
    >
      {text}
    </motion.div>
  );
};

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ meeting }) => {
  if (!meeting.summary) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No summary available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BlurredTextReveal text={meeting.summary} />
    </div>
  );
}; 