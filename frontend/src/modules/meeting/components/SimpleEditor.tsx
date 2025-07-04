import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Loader2, FileText, Plus, Calendar, Tag, Heart, X, Bold, Italic, List, ArrowDownToLine } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import dashboardApi from '../../../shared/api/dashboardApi';
import type { Summary } from '../../../shared/types/dashboard';
import './MarkdownEditor.css';

interface SimpleEditorProps {
  meetingId: string;
  initialNotes: string;
  onNotesChange: (notes: string) => void;
  isReadOnly?: boolean;
  structuredNotes?: any;
  hasJustEnded?: boolean;
}

export const SimpleEditor: React.FC<SimpleEditorProps> = ({
  meetingId,
  initialNotes,
  onNotesChange,
  isReadOnly = false,
  hasJustEnded = false
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'summary'>('notes');
  const [notes, setNotes] = useState(initialNotes);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [currentSummary, setCurrentSummary] = useState<Summary | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Update notes when prop changes
  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  // Load summaries when needed (only when switching to summary tab)
  useEffect(() => {
    if (activeTab === 'summary' && summaries.length === 0) {
      loadSummaries();
    }
  }, [activeTab, meetingId]);

  // Generate summary when meeting ends
  useEffect(() => {
    if (hasJustEnded) {
      generateSummary();
    }
  }, [hasJustEnded]);

  const loadSummaries = async () => {
    try {
      const summariesData = await dashboardApi.getMeetingSummaries(meetingId);
      setSummaries(summariesData);
      if (summariesData.length > 0) {
        setCurrentSummary(summariesData[0]);
      }
    } catch (error) {
      console.error('Error loading summaries:', error);
    }
  };

  const generateSummary = async () => {
    setIsLoadingSummary(true);
    try {
      // Try to load existing summaries first
      await loadSummaries();
      if (summaries.length > 0) {
        // If summaries already exist, just switch to summary tab
        setActiveTab('summary');
        setShowSummaryModal(true);
        console.log('Found existing summaries, not generating new ones');
      } else {
        // Generate new summary only if none exist
        await dashboardApi.generateStructuredNotes(meetingId);
        await loadSummaries();
        setActiveTab('summary');
        setShowSummaryModal(true);
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!meetingId) return;

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

  const handleNotesChange = (content: string) => {
    setNotes(content);
    onNotesChange(content);
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const newText = before + selectedText + after;
    
    const newValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    setNotes(newValue);
    onNotesChange(newValue);
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const getSummaryContent = () => {
    if (isLoadingSummary) {
      return '# 📋 Generating Summary...\n\n⏳ Please wait while we generate your AI summary...';
    }

    if (!currentSummary && summaries.length === 0) {
      return '# 📋 Meeting Summary\n\nNo summary available yet. Generate AI summary to see structured notes here.';
    }

    if (currentSummary) {
      return currentSummary.content || 'Summary content not available.';
    }

    return '# 📋 Meeting Summary\n\nSelect a summary from the list to view its content.';
  };

  return (
    <>
      <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header with Download Button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">My Meeting Notes</h2>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            title="Download PDF"
            className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg cursor-pointer"
          >
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center px-6 py-3 text-sm font-medium transition-all duration-200 border-b-2 cursor-pointer ${
              activeTab === 'notes' 
                ? 'border-gray-900 text-gray-900 bg-white' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Notes
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center px-6 py-3 text-sm font-medium transition-all duration-200 border-b-2 cursor-pointer ${
              activeTab === 'summary' 
                ? 'border-gray-900 text-gray-900 bg-white' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Save className="h-4 w-4 mr-2" />
            Summary
            {summaries.length > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-gray-900 text-white rounded-full">
                {summaries.length}
              </span>
            )}
          </button>
          
          <div className="ml-auto flex items-center p-3">
            <button
              onClick={generateSummary}
              disabled={isLoadingSummary}
              className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg cursor-pointer"
            >
              {isLoadingSummary ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {isLoadingSummary ? 'Generating...' : 'Generate Summary'}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col">
          {activeTab === 'notes' ? (
            <div className="flex-1 flex flex-col">
              {/* Toolbar */}
              {!isReadOnly && (
                <div className="flex items-center space-x-2 p-4 border-b border-gray-100 bg-white">
                  <button
                    onClick={() => insertMarkdown('**', '**')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    title="Bold"
                  >
                    <Bold className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => insertMarkdown('*', '*')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    title="Italic"
                  >
                    <Italic className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => insertMarkdown('- ', '')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    title="List"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              {/* Text Editor */}
              <textarea
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                readOnly={isReadOnly}
                placeholder="Start typing your meeting notes here..."
                className="flex-1 p-6 border-0 outline-none resize-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                style={{
                  fontFamily: 'Gilroy, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontSize: '16px',
                  lineHeight: '1.7',
                  minHeight: '400px'
                }}
              />
            </div>
          ) : (
            /* Summary Tab - simplified without bottom section */
            <div className="flex-1 flex flex-col bg-gray-50">
              <div className="flex-1 p-6 overflow-y-auto">
                {summaries.length === 0 ? (
                  <motion.div 
                    className="flex flex-col items-center justify-center h-full text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                      <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No summaries yet</h3>
                      <p className="text-gray-500 mb-4">Generate your first AI summary to get started</p>
                      <button
                        onClick={generateSummary}
                        disabled={isLoadingSummary}
                        className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isLoadingSummary ? 'Generating...' : 'Generate Summary'}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {summaries.map((summary, index) => (
                      <motion.div
                        key={summary.id}
                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200 cursor-pointer"
                        onClick={() => {
                          setCurrentSummary(summary);
                          setShowSummaryModal(true);
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -4 }}
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              <div className={`p-2 rounded-lg mr-3 ${
                                summary.summary_type === 'ai_generated' 
                                  ? 'bg-gray-100 text-gray-700' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                <FileText className="h-4 w-4" />
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                summary.summary_type === 'ai_generated'
                                  ? 'bg-gray-900 text-white'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {summary.summary_type === 'ai_generated' ? 'AI Generated' : 'Manual'}
                              </span>
                            </div>
                            {summary.is_favorite && (
                              <Heart className="h-4 w-4 text-red-500 fill-current" />
                            )}
                          </div>
                          
                          <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            {summary.title}
                          </h4>
                          
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {summary.content.replace(/<[^>]*>/g, '').substring(0, 120)}...
                          </p>
                          
                          <div className="flex items-center text-xs text-gray-500 mb-3">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(summary.created_at).toLocaleDateString()} at{' '}
                            {new Date(summary.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          
                          {summary.tags && (
                            <div className="flex flex-wrap gap-1">
                              {summary.tags.split(',').slice(0, 3).map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md"
                                >
                                  <Tag className="h-3 w-3 inline mr-1" />
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Screen Summary Modal */}
      <AnimatePresence>
        {showSummaryModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSummaryModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                <div className="flex items-center">
                  <FileText className="h-6 w-6 mr-3" />
                  <div>
                    <h2 className="text-xl font-bold">
                      {currentSummary ? currentSummary.title : 'Meeting Summary'}
                    </h2>
                    {currentSummary && (
                      <p className="text-gray-300 text-sm">
                        Created on {new Date(currentSummary.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowSummaryModal(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {isLoadingSummary ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-16 w-16 text-gray-600 animate-spin mb-4" />
                    <h3 className="text-2xl font-medium text-gray-700 mb-2">
                      Generating AI Summary...
                    </h3>
                    <p className="text-gray-600">
                      Please wait while we analyze your meeting content
                    </p>
                  </div>
                ) : (
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {getSummaryContent()}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {currentSummary && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-4">Words: {currentSummary.word_count || 0}</span>
                    <span className="mr-4">Reading time: {currentSummary.reading_time_minutes || 0} min</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={handleDownloadPDF}
                      disabled={isDownloading}
                      title="Download PDF"
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center"
                    >
                      <ArrowDownToLine className="h-4 w-4 mr-2" />
                      {isDownloading ? 'Downloading...' : 'Download PDF'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}; 