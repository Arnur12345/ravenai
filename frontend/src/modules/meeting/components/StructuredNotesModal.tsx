import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckSquare, Users, Lightbulb, Calendar, User, Clock, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { dashboardApi } from '@/shared/api/dashboardApi';
import type { Meeting, StructuredMeetingNotesResponse, TaskItem, KeyUpdate, BrainstormingIdea } from '@/shared/types/dashboard';

interface StructuredNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting;
}

export const StructuredNotesModal: React.FC<StructuredNotesModalProps> = ({
  isOpen,
  onClose,
  meeting,
}) => {
  const [structuredNotes, setStructuredNotes] = useState<StructuredMeetingNotesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<string>('');

  useEffect(() => {
    if (isOpen && !structuredNotes) {
      generateStructuredNotes();
    }
  }, [isOpen]);

  const generateStructuredNotes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLoadingStatus('Preparing...');

      const notes = await dashboardApi.generateStructuredNotes(
        meeting.id,
        { include_user_notes: true },
        (status) => setLoadingStatus(status)
      );

      console.log('✅ Structured notes received:', notes);
      setStructuredNotes(notes);
      setLoadingStatus('');
    } catch (error) {
      console.error('❌ Error generating structured notes:', error);
      setError('Failed to generate structured notes. Please try again.');
      setLoadingStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });
    } catch {
      return dateString;
    }
  };

  const getUrgencyColor = (deadline: string) => {
    try {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'border-red-200 bg-red-50';
      if (diffDays <= 3) return 'border-orange-200 bg-orange-50';
      if (diffDays <= 7) return 'border-yellow-200 bg-yellow-50';
      return 'border-green-200 bg-green-50';
    } catch {
      return 'border-gray-200 bg-gray-50';
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-white border-b border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Meeting Summary</h2>
                <p className="text-gray-500 text-sm">
                  AI-generated insights • {meeting.meeting_platform}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={generateStructuredNotes}
                  disabled={isLoading}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-100px)] bg-gray-50">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm mb-6">
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
                <p className="text-gray-800 text-xl font-semibold mb-2">Analyzing Meeting Content</p>
                <p className="text-gray-600 text-base">{loadingStatus}</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-6">
                  <div className="text-red-500 text-2xl">⚠️</div>
                </div>
                <div className="text-red-600 text-xl font-semibold mb-2">Analysis Failed</div>
                <p className="text-gray-600 text-base mb-6 max-w-md text-center">{error}</p>
                <Button onClick={generateStructuredNotes} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
                  Try Again
                </Button>
              </div>
            ) : structuredNotes ? (
              <>
                {/* Debug logging */}
                {(() => {
                  console.log('🔍 Debug - structuredNotes:', structuredNotes);
                  console.log('🔍 Debug - to_do items:', structuredNotes.notes?.to_do);
                  console.log('🔍 Debug - key_updates:', structuredNotes.notes?.key_updates);
                  console.log('🔍 Debug - brainstorming_ideas:', structuredNotes.notes?.brainstorming_ideas);
                  return null;
                })()}
                
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  {/* To-Do Section */}
                  {structuredNotes.notes?.to_do && structuredNotes.notes.to_do.length > 0 && (
                  <motion.div variants={cardVariants} custom={0}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-gray-100 p-3 rounded-xl">
                        <CheckSquare className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">Action Items</h3>
                        <p className="text-gray-500">{structuredNotes.notes.to_do.length} tasks identified</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {structuredNotes.notes.to_do.map((task: TaskItem, index: number) => (
                        <motion.div
                          key={index}
                          variants={cardVariants}
                          custom={index + 1}
                          className={`p-5 rounded-xl border ${getUrgencyColor(task.deadline)} hover:shadow-md transition-all duration-200 bg-white`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-gray-800 text-sm">{task.task_name}</h4>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {formatDate(task.deadline)}
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-3 leading-relaxed">{task.task_description}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <User className="w-3 h-3" />
                            <span>{task.assignee}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Key Updates Section */}
                {structuredNotes.notes?.key_updates && structuredNotes.notes.key_updates.length > 0 && (
                  <motion.div variants={cardVariants} custom={1}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-gray-100 p-3 rounded-xl">
                        <Users className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">Key Points</h3>
                        <p className="text-gray-500">{structuredNotes.notes.key_updates.length} important highlights</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {structuredNotes.notes.key_updates.map((update: KeyUpdate, index: number) => (
                        <motion.div
                          key={index}
                          variants={cardVariants}
                          custom={index + 5}
                          className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="bg-gray-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              {update.update_number}
                            </div>
                            <p className="text-gray-700 leading-relaxed">{update.update_description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Brainstorming Ideas Section */}
                {structuredNotes.notes?.brainstorming_ideas && structuredNotes.notes.brainstorming_ideas.length > 0 && (
                  <motion.div variants={cardVariants} custom={2}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-gray-100 p-3 rounded-xl">
                        <Lightbulb className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">Ideas & Insights</h3>
                        <p className="text-gray-500">{structuredNotes.notes.brainstorming_ideas.length} creative concepts</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {structuredNotes.notes.brainstorming_ideas.map((idea: BrainstormingIdea, index: number) => (
                        <motion.div
                          key={index}
                          variants={cardVariants}
                          custom={index + 10}
                          className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="bg-gray-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                              {idea.idea_number}
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed group-hover:text-gray-800 transition-colors">
                              {idea.idea_description}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Show message if no content */}
                {(!structuredNotes.notes?.to_do || structuredNotes.notes.to_do.length === 0) &&
                 (!structuredNotes.notes?.key_updates || structuredNotes.notes.key_updates.length === 0) &&
                 (!structuredNotes.notes?.brainstorming_ideas || structuredNotes.notes.brainstorming_ideas.length === 0) && (
                  <motion.div 
                    variants={cardVariants} 
                    custom={0}
                    className="text-center py-16"
                  >
                    <div className="text-gray-500 text-lg mb-2">
                      📝 No structured content found
                    </div>
                    <p className="text-gray-400 text-sm">
                      The meeting transcript may be too short or doesn't contain actionable content.
                    </p>
                  </motion.div>
                )}

                {/* Footer Info */}
                <motion.div 
                  variants={cardVariants} 
                  custom={15}
                  className="text-center py-8 border-t border-gray-200 bg-white rounded-b-xl"
                >
                  <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(structuredNotes.generated_at).toLocaleDateString()}
                    </div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <div>
                      {structuredNotes.transcript_length} chars analyzed
                    </div>
                  </div>
                </motion.div>
              </motion.div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-6">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Analyze Meeting</h3>
                <p className="text-gray-600 text-base text-center max-w-md mb-6">
                  Generate comprehensive insights including action items, key points, and creative ideas from your meeting discussion.
                </p>
                <Button onClick={generateStructuredNotes} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Analysis
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
