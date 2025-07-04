import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Loader2, FileText, Plus, Calendar, Tag, Heart, X, Bold, Italic, List, Quote, Type, Eye, Edit2, ArrowDownToLine } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import dashboardApi from '../../../shared/api/dashboardApi';
import type { Summary } from '../../../shared/types/dashboard';
import './MarkdownEditor.css';

interface MarkdownEditorProps {
  meetingId: string;
  initialNotes: string;
  onNotesChange: (notes: string) => void;
  isReadOnly?: boolean;
  structuredNotes?: any;
  hasJustEnded?: boolean;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
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
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Update notes when prop changes
  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  // Load summaries ONLY when switching to summary tab (not on mount)
  useEffect(() => {
    if (activeTab === 'summary' && summaries.length === 0) {
      loadSummaries();
    }
  }, [activeTab]);

  // Generate summary only when meeting ends (removed auto-generation)
  useEffect(() => {
    if (hasJustEnded) {
      generateSummary();
    }
  }, [hasJustEnded]);

  // Initialize LTR direction
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.direction = 'ltr';
      editorRef.current.setAttribute('dir', 'ltr');
    }
  }, []);

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

  // Convert markdown to visual HTML for WYSIWYG display
  const convertToDisplayHtml = (markdown: string): string => {
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium text-gray-700 mb-2 mt-4" dir="ltr" style="direction: ltr; text-align: left;">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-gray-800 mb-3 mt-6" dir="ltr" style="direction: ltr; text-align: left;">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-gray-900 mb-4 mt-8" dir="ltr" style="direction: ltr; text-align: left;">$1</h1>')
      // Bold and Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900" dir="ltr" style="direction: ltr;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic" dir="ltr" style="direction: ltr;">$1</em>')
      // Lists
      .replace(/^- (.*$)/gm, '<li class="mb-1 ml-4" dir="ltr" style="direction: ltr; text-align: left;">• $1</li>')
      .replace(/^\* (.*$)/gm, '<li class="mb-1 ml-4" dir="ltr" style="direction: ltr; text-align: left;">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="mb-1 ml-4 list-decimal" dir="ltr" style="direction: ltr; text-align: left;">$1</li>')
      // Quotes
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-blue-300 pl-4 italic text-gray-600 my-3 bg-blue-50 py-2" dir="ltr" style="direction: ltr; text-align: left;">$1</blockquote>')
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mb-3" dir="ltr" style="direction: ltr; text-align: left;">')
      .replace(/\n/g, '<br>');

    // Wrap in paragraph if not already wrapped
    if (!html.startsWith('<')) {
      html = `<p class="mb-3" dir="ltr" style="direction: ltr; text-align: left;">${html}</p>`;
    }

    return html;
  };

  // Convert HTML back to markdown for storage
  const convertToMarkdown = (html: string): string => {
    let markdown = html
      // Headers
      .replace(/<h1[^>]*>(.*?)<\/h1>/g, '# $1')
      .replace(/<h2[^>]*>(.*?)<\/h2>/g, '## $1')
      .replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1')
      // Bold and Italic
      .replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/g, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/g, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/g, '*$1*')
      // Lists
      .replace(/<li[^>]*>• (.*?)<\/li>/g, '- $1')
      .replace(/<li[^>]*>(.*?)<\/li>/g, '- $1')
      // Quotes
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/g, '> $1')
      // Paragraphs and breaks
      .replace(/<\/p><p[^>]*>/g, '\n\n')
      .replace(/<p[^>]*>/g, '')
      .replace(/<\/p>/g, '')
      .replace(/<br\s*\/?>/g, '\n')
      // Remove remaining HTML tags
      .replace(/<\/?[^>]+(>|$)/g, '');

    return markdown.trim();
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNotes(value);
    onNotesChange(value);
  };

  const applyFormatting = (command: string, value?: string) => {
    if (editorRef.current) {
      const textarea = editorRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      const beforeText = textarea.value.substring(0, start);
      const afterText = textarea.value.substring(end);
      
      let formattedText = '';
      let newCursorPos = start;
      
      switch (command) {
        case 'bold':
          if (selectedText) {
            formattedText = `**${selectedText}**`;
            newCursorPos = start + formattedText.length;
          } else {
            formattedText = '****';
            newCursorPos = start + 2; // Position cursor between **|**
          }
          break;
                 case 'italic':
           if (selectedText) {
             formattedText = `*${selectedText}*`;
             newCursorPos = start + formattedText.length;
           } else {
             formattedText = '**';
             newCursorPos = start + 1; // Position cursor between *|*
           }
           break;
         case 'heading':
           if (selectedText) {
             formattedText = `## ${selectedText}`;
             newCursorPos = start + formattedText.length;
           } else {
             formattedText = '## ';
             newCursorPos = start + 3; // Position cursor after "## "
           }
           break;
         case 'list':
           if (selectedText) {
             const lines = selectedText.split('\n');
             formattedText = lines.map(line => line.trim() ? `- ${line}` : line).join('\n');
             newCursorPos = start + formattedText.length;
           } else {
             formattedText = '- ';
             newCursorPos = start + 2; // Position cursor after "- "
           }
           break;
         default:
           formattedText = selectedText;
           newCursorPos = end;
      }
      
      const newValue = beforeText + formattedText + afterText;
      setNotes(newValue);
      onNotesChange(newValue);
      
      // Set cursor position after state update
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.setSelectionRange(newCursorPos, newCursorPos);
          editorRef.current.focus();
        }
      }, 10);
    }
  };

  const insertQuote = () => {
    if (editorRef.current) {
      const textarea = editorRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      const beforeText = textarea.value.substring(0, start);
      const afterText = textarea.value.substring(end);
      
      const quoteText = selectedText || 'Quote text here';
      const formattedQuote = `> ${quoteText}`;
      const newValue = beforeText + formattedQuote + afterText;
      
      setNotes(newValue);
      onNotesChange(newValue);
      
      // Position cursor after quote
      setTimeout(() => {
        if (editorRef.current) {
          const newCursorPos = start + formattedQuote.length;
          editorRef.current.setSelectionRange(newCursorPos, newCursorPos);
          editorRef.current.focus();
        }
      }, 10);
    }
  };

  const getSummaryContent = () => {
    if (isLoadingSummary) {
      return '# 📋 Generating Summary...\n\n⏳ Please wait while we generate your AI summary...';
    }

    if (!currentSummary && summaries.length === 0) {
      return '# 📋 Meeting Summary\n\nNo summary available yet. Click "Generate Summary" to create an AI summary of your meeting.';
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
              {/* Mode Toggle Buttons */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsPreviewMode(false)}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                      !isPreviewMode 
                        ? 'bg-gray-900 text-white shadow-md' 
                        : 'text-gray-600 hover:bg-gray-200 bg-white border border-gray-200'
                    }`}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => setIsPreviewMode(true)}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isPreviewMode 
                        ? 'bg-gray-900 text-white shadow-md' 
                        : 'text-gray-600 hover:bg-gray-200 bg-white border border-gray-200'
                    }`}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </button>
                </div>
              </div>

              {/* WYSIWYG Toolbar */}
              {!isReadOnly && !isPreviewMode && (
                <div className="flex items-center space-x-2 p-4 border-b border-gray-100 bg-white">
                  <button
                    onClick={() => applyFormatting('bold')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    title="Bold (Ctrl+B)"
                  >
                    <Bold className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => applyFormatting('italic')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    title="Italic (Ctrl+I)"
                  >
                    <Italic className="h-4 w-4" />
                  </button>
                  <div className="h-6 w-px bg-gray-300 mx-2" />
                  <button
                    onClick={() => applyFormatting('heading')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    title="Heading 2"
                  >
                    <Type className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => applyFormatting('list')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    title="Bullet List"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={insertQuote}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    title="Quote"
                  >
                    <Quote className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              {/* Content Area - Edit or Preview Mode */}
              {isPreviewMode ? (
                <div className="flex-1 p-6 overflow-y-auto bg-white prose prose-lg max-w-none">
                  {notes.trim() ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {notes}
                    </ReactMarkdown>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <FileText className="h-16 w-16 text-gray-300 mb-4" />
                      <h3 className="text-xl font-medium text-gray-500 mb-2">No content to preview</h3>
                      <p className="text-gray-400">Start writing in edit mode to see your markdown rendered here</p>
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  ref={editorRef}
                  value={notes}
                  onChange={handleContentChange}
                  readOnly={isReadOnly}
                  dir="ltr"
                  lang="en"
                  placeholder="Start typing your meeting notes here..."
                  className="flex-1 p-6 border-0 outline-none resize-none overflow-y-auto focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                  style={{
                    fontFamily: 'Gilroy, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontSize: '16px',
                    lineHeight: '1.7',
                    color: '#374151',
                    minHeight: '400px',
                    direction: 'ltr',
                    textAlign: 'left',
                    unicodeBidi: 'embed',
                    writingMode: 'horizontal-tb'
                  }}
                />
              )}
              
              {/* Footer */}
              <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-sm text-gray-500">
                <div className="flex justify-between items-center">
                  <span>
                    Words: {notes.split(/\s+/).filter(word => word.length > 0).length}
                  </span>
                  <span>{isPreviewMode ? 'Preview Mode' : 'Edit Mode'} • Auto-save enabled</span>
                </div>
              </div>
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
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No summary yet</h3>
                      <p className="text-gray-500 mb-4">Click "Generate Summary" to create an AI summary when you're ready</p>
                      <button
                        onClick={generateSummary}
                        disabled={isLoadingSummary}
                        className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        {isLoadingSummary ? 'Generating...' : 'Generate Summary'}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* Show only the current summary content */
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-lg mr-3">
                          <FileText className="h-5 w-5 text-gray-700" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{currentSummary?.title}</h3>
                          <p className="text-sm text-gray-500">
                            {currentSummary && new Date(currentSummary.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {currentSummary?.is_favorite && (
                        <Heart className="h-5 w-5 text-red-500 fill-current" />
                      )}
                    </div>
                    
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {getSummaryContent()}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Screen Summary Modal */}
      <AnimatePresence>
        {showSummaryModal && currentSummary && (
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
                    <h2 className="text-xl font-bold">{currentSummary.title}</h2>
                    <p className="text-gray-300 text-sm">
                      Created on {new Date(currentSummary.created_at).toLocaleDateString()}
                    </p>
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
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {currentSummary.content}
                  </ReactMarkdown>
                </div>
              </div>

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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}; 