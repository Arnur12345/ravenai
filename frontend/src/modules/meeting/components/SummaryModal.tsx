import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, FileText, Sparkles, Calendar, Clock, Users, 
  CheckSquare, ArrowRight, Copy, Download, ArrowDownToLine, Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { dashboardApi } from '@/shared/api/dashboardApi';
import { formatDate, formatDuration } from '@/shared/utils';

interface MeetingSummary {
  meeting_id: string;
  summary: string | null;
  summary_generated_at: string | null;
  status: string;
  participants: string[];
  transcript_count: number;
  meeting_platform: string;
  started_at: string | null;
  ended_at: string | null;
}

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  isOpen,
  onClose,
  meetingId,
}) => {
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (isOpen && meetingId) {
      loadSummary();
    }
  }, [isOpen, meetingId]);

  const loadSummary = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const summaryData = await dashboardApi.getMeetingSummary(meetingId);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading summary:', error);
      setError('Failed to load meeting summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (summary?.summary) {
      try {
        await navigator.clipboard.writeText(summary.summary);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const handleDownloadPDF = async () => {
    if (!meetingId || !summary) return;

    try {
      setIsDownloading(true);

      // Download PDF
      const pdfBlob = await dashboardApi.downloadMeetingPDF(meetingId);
      
      // Generate filename
      const date = new Date().toISOString().split('T')[0];
      const fileName = `meeting_summary_${date}.pdf`;
      
      // Trigger download
      await dashboardApi.downloadFile(pdfBlob, fileName);

    } catch (err) {
      console.error('Error downloading PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };



  const parseSummaryContent = (summaryText: string) => {
    const sections = summaryText.split('##').map(section => section.trim()).filter(Boolean);
    const parsed: Record<string, string> = {};
    
    sections.forEach(section => {
      const lines = section.split('\n');
      const title = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();
      parsed[title] = content;
    });
    
    return parsed;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-4xl bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-t-2xl">
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-200">
                    Meeting Summary
                  </h3>
                  <p className="text-sm text-slate-400">
                    AI-powered analysis of your meeting
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {summary?.summary && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copySuccess ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownloadPDF}
                      disabled={isDownloading}
                      title="Download PDF"
                      className="text-slate-400 hover:text-slate-200"
                    >
                      <ArrowDownToLine className="h-4 w-4 mr-2" />
                      {isDownloading ? 'Downloading...' : 'Download PDF'}
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto mb-4" />
                    <p className="text-slate-400">Generating AI summary...</p>
                    <p className="text-sm text-slate-500 mt-2">This may take a few moments</p>
                  </div>
                </div>
              ) : error ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center h-64 flex items-center justify-center"
                >
                  <div className="max-w-md">
                    <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-200 mb-2">
                      Unable to Generate Summary
                    </h3>
                    <p className="text-slate-400 mb-4">{error}</p>
                    <Button
                      onClick={loadSummary}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white"
                    >
                      Try Again
                    </Button>
                  </div>
                </motion.div>
              ) : summary?.summary ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
                >
                  {/* Meeting Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                    >
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="text-xs text-slate-400 uppercase tracking-wide">Date</p>
                          <p className="text-sm font-medium text-slate-200">
                            {formatDate(summary.ended_at || summary.started_at)}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                    >
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="text-xs text-slate-400 uppercase tracking-wide">Duration</p>
                          <p className="text-sm font-medium text-slate-200">
                            {formatDuration(summary.started_at, summary.ended_at)}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                    >
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="text-xs text-slate-400 uppercase tracking-wide">Participants</p>
                          <p className="text-sm font-medium text-slate-200">
                            {summary.participants.length} people
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Summary Content */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-slate-700/30 rounded-xl p-6 border border-slate-600"
                  >
                    <div className="prose prose-slate prose-invert max-w-none">
                      <div 
                        className="text-slate-300 leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: summary.summary
                            .replace(/##\s*(.+)/g, '<h3 class="text-lg font-semibold text-slate-200 mb-3 mt-6 first:mt-0 flex items-center"><span class="mr-2">✨</span>$1</h3>')
                            .replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-200">$1</strong>')
                            .replace(/📅|⏰|👥|🎯|📋|🔄/g, '<span class="text-xl mr-1">$&</span>')
                            .replace(/- \[ \]/g, '- <span class="text-slate-500">☐</span>')
                            .replace(/- \[x\]/g, '- <span class="text-green-400">☑</span>')
                        }}
                      />
                    </div>
                  </motion.div>

                  {/* Participants List */}
                  {summary.participants.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-slate-700/30 rounded-xl p-6 border border-slate-600"
                    >
                      <h4 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
                        <Users className="h-5 w-5 mr-2 text-purple-400" />
                        Meeting Participants
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {summary.participants.map((participant, index) => (
                          <motion.span
                            key={participant}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                            className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm border border-indigo-500/30"
                          >
                            {participant}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <div className="text-center h-64 flex items-center justify-center">
                  <div className="max-w-md">
                    <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-200 mb-2">
                      No Summary Available
                    </h3>
                    <p className="text-slate-400">
                      The meeting summary will be generated automatically when the meeting ends.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {summary?.summary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-between p-6 border-t border-slate-700 bg-slate-800/50 rounded-b-2xl"
              >
                <div className="text-xs text-slate-400">
                  Generated by AI • {summary.transcript_count} transcript entries processed
                </div>
                <Button
                  onClick={onClose}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white"
                >
                  Done
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}; 