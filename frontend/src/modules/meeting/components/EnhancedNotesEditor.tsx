import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { 
  Eye, 
  Edit2, 
  FileText, 
  CheckSquare, 
  Square,
  MessageSquare,
  Lightbulb,
  Target,
  Hash
} from 'lucide-react';

// Import highlight.js CSS for syntax highlighting
import 'highlight.js/styles/github-dark.css';

interface EnhancedNotesEditorProps {
  meetingId: string;
  initialNotes: string;
  onNotesChange: (notes: string) => void;
  isReadOnly?: boolean;
  structuredNotes?: StructuredNotesData | null;
  onFormatText?: (format: string) => void;
}

interface StructuredNotesData {
  action_items: Array<{
    task_name: string;
    assignee: string;
    deadline: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
  }>;
  key_updates: Array<{
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    category: string;
  }>;
  ideas_insights: Array<{
    title: string;
    description: string;
    potential_value: 'high' | 'medium' | 'low';
    category: string;
  }>;
}

export const EnhancedNotesEditor: React.FC<EnhancedNotesEditorProps> = ({
  meetingId,
  initialNotes,
  onNotesChange,
  isReadOnly = false,
  structuredNotes,
  onFormatText,
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showStructuredNotes, setShowStructuredNotes] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize notes
  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  // Auto-save functionality
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (notes !== initialNotes) {
      setHasUnsavedChanges(true);
      saveTimeoutRef.current = setTimeout(() => {
        onNotesChange(notes);
        setHasUnsavedChanges(false);
      }, 1000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [notes, initialNotes, onNotesChange]);

  // Expose textarea ref for parent formatting functions
  useEffect(() => {
    if (onFormatText && textareaRef.current) {
      (window as any).currentNotesTextarea = textareaRef.current;
    }
  }, [onFormatText]);



  const handleNotesChange = (value: string) => {
    setNotes(value);
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(400, textarea.scrollHeight)}px`;
    }
  }, [notes]);

  // Combine user notes with structured notes
  const getCombinedContent = () => {
    let content = notes;
    
    if (structuredNotes && showStructuredNotes) {
      content += '\n\n---\n\n# 📋 AI-Generated Meeting Summary\n\n';
      
      // Action Items
      if (structuredNotes.action_items.length > 0) {
        content += '## 🎯 Action Items\n\n';
        structuredNotes.action_items.forEach((item, index) => {
          const priorityEmoji = item.priority === 'high' ? '🔴' : item.priority === 'medium' ? '🟡' : '🟢';
          content += `### ${index + 1}. ${item.task_name} ${priorityEmoji}\n\n`;
          content += `**Assignee:** ${item.assignee}\n\n`;
          content += `**Deadline:** ${item.deadline}\n\n`;
          content += `**Description:** ${item.description}\n\n`;
          content += '---\n\n';
        });
      }
      
      // Key Updates
      if (structuredNotes.key_updates.length > 0) {
        content += '## 📢 Key Updates\n\n';
        structuredNotes.key_updates.forEach((update, index) => {
          const impactEmoji = update.impact === 'high' ? '🔥' : update.impact === 'medium' ? '⚡' : '💡';
          content += `### ${index + 1}. ${update.title} ${impactEmoji}\n\n`;
          content += `**Category:** ${update.category}\n\n`;
          content += `**Description:** ${update.description}\n\n`;
          content += '---\n\n';
        });
      }
      
      // Ideas & Insights
      if (structuredNotes.ideas_insights.length > 0) {
        content += '## 💡 Ideas & Insights\n\n';
        structuredNotes.ideas_insights.forEach((idea, index) => {
          const valueEmoji = idea.potential_value === 'high' ? '🚀' : idea.potential_value === 'medium' ? '⭐' : '💎';
          content += `### ${index + 1}. ${idea.title} ${valueEmoji}\n\n`;
          content += `**Category:** ${idea.category}\n\n`;
          content += `**Description:** ${idea.description}\n\n`;
          content += '---\n\n';
        });
      }
    }
    
    return content;
  };

  // Animation variants for the container
  const containerVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.98
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.98,
      transition: {
        duration: 0.4
      }
    }
  };

  // Animation variants for text content
  const textVariants = {
    hidden: { 
      opacity: 0, 
      filter: 'blur(10px)',
      y: 10
    },
    visible: { 
      opacity: 1, 
      filter: 'blur(0px)',
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  // Animation variants for structured notes
  const structuredNotesVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      y: -20
    },
    visible: { 
      opacity: 1, 
      height: 'auto',
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
        opacity: { delay: 0.2 }
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      y: -20,
      transition: {
        duration: 0.5
      }
    }
  };

  // Custom markdown components
  const markdownComponents = {
    h1: ({ children }: any) => (
      <motion.h1 
        className="text-3xl font-bold mb-6 text-gray-800 border-b-2 border-blue-200 pb-2"
        style={{ fontFamily: 'Gilroy, sans-serif' }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.h1>
    ),
    h2: ({ children }: any) => (
      <motion.h2 
        className="text-2xl font-semibold mb-4 text-gray-700 mt-8"
        style={{ fontFamily: 'Gilroy, sans-serif' }}
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {children}
      </motion.h2>
    ),
    h3: ({ children }: any) => (
      <motion.h3 
        className="text-xl font-medium mb-3 text-gray-600 mt-6"
        style={{ fontFamily: 'Gilroy, sans-serif' }}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {children}
      </motion.h3>
    ),
    p: ({ children }: any) => (
      <motion.p 
        className="mb-4 leading-relaxed text-gray-600"
        style={{ fontFamily: 'Gilroy, sans-serif' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {children}
      </motion.p>
    ),
    ul: ({ children }: any) => (
      <motion.ul 
        className="mb-4 pl-6 space-y-2"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {children}
      </motion.ul>
    ),
    li: ({ children }: any) => (
      <motion.li 
        className="text-gray-600 leading-relaxed list-disc"
        style={{ fontFamily: 'Gilroy, sans-serif' }}
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.li>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-gray-800" style={{ fontFamily: 'Gilroy, sans-serif' }}>
        {children}
      </strong>
    ),
    em: ({ children }: any) => (
      <em className="italic text-gray-700" style={{ fontFamily: 'Gilroy, sans-serif' }}>
        {children}
      </em>
    ),
    blockquote: ({ children }: any) => (
      <motion.blockquote 
        className="border-l-4 border-blue-300 pl-4 my-4 italic text-gray-600 bg-blue-50 py-3 rounded-r-lg"
        style={{ fontFamily: 'Gilroy, sans-serif' }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        {children}
      </motion.blockquote>
    ),
    code: ({ children }: any) => (
      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
        {children}
      </code>
    ),
    pre: ({ children }: any) => (
      <motion.pre 
        className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.pre>
    ),
    hr: () => (
      <motion.hr 
        className="my-8 border-t-2 border-gray-200"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8 }}
      />
    ),
  };

  return (
    <motion.div 
      ref={containerRef}
      className="flex flex-col h-full"
      style={{ 
        fontFamily: 'Gilroy, sans-serif',
        maxWidth: 'calc(100vw - 30px)',
        margin: '0 15px'
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Mode Toggle Buttons */}
      <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPreviewMode(false)}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              !isPreviewMode 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </button>
          <button
            onClick={() => setIsPreviewMode(true)}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              isPreviewMode 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </button>
        </div>

        {structuredNotes && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowStructuredNotes(!showStructuredNotes)}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                showStructuredNotes 
                  ? 'bg-green-500 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-200 border border-gray-300'
              }`}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {showStructuredNotes ? 'Hide AI Summary' : 'Show AI Summary'}
            </button>
          </div>
        )}

        {hasUnsavedChanges && (
          <motion.div 
            className="flex items-center text-sm text-orange-600"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            <div className="h-2 w-2 bg-orange-500 rounded-full mr-2 animate-pulse" />
            Saving...
          </motion.div>
        )}
      </div>

      {/* Main Content Area */}
      <motion.div 
        className="flex-1 min-h-0"
        variants={textVariants}
      >
        <AnimatePresence mode="wait">
          {isPreviewMode ? (
            // Preview Mode
            <motion.div
              key="preview"
              className="h-full overflow-y-auto bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
              style={{ 
                minHeight: '400px',
                maxWidth: 'calc(100% - 10px)',
                fontFamily: 'Gilroy, sans-serif'
              }}
              initial={{ opacity: 0, filter: 'blur(5px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(5px)' }}
              transition={{ duration: 0.5 }}
            >
              {getCombinedContent().trim() ? (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                  components={markdownComponents}
                >
                  {getCombinedContent()}
                </ReactMarkdown>
              ) : (
                <motion.div 
                  className="flex flex-col items-center justify-center h-full text-center py-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <FileText className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-500 mb-2" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    No content to preview
                  </h3>
                  <p className="text-gray-400" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    Start writing in edit mode to see your markdown rendered here
                  </p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            // Edit Mode
            <motion.div
              key="edit"
              className="h-full"
              initial={{ opacity: 0, filter: 'blur(5px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(5px)' }}
              transition={{ duration: 0.5 }}
            >
              <textarea
                ref={textareaRef}
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}

                placeholder={isReadOnly ? "No notes available..." : "# Meeting Notes\n\nStart typing your notes here...\n\n## Action Items\n- [ ] Task 1\n- [ ] Task 2\n\n## Key Points\n- Important point 1\n- Important point 2\n\n## Ideas\n> Great idea from the discussion\n\n**Bold text** and _italic text_ are supported!"}
                readOnly={isReadOnly}
                dir="ltr"
                lang="en"
                className={`w-full h-full resize-none border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg p-6 shadow-sm transition-all duration-200 ${
                  isReadOnly ? 'cursor-default' : 'cursor-text'
                }`}
                style={{
                  minHeight: '400px',
                  maxWidth: 'calc(100% - 10px)',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: '#374151',
                  fontFamily: 'Gilroy, sans-serif',
                  direction: 'ltr',
                  textAlign: 'left',
                  unicodeBidi: 'embed',
                  writingMode: 'horizontal-tb'
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Structured Notes Animation Section */}
      <AnimatePresence>
        {structuredNotes && showStructuredNotes && isPreviewMode && (
          <motion.div
            variants={structuredNotesVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mt-6 overflow-hidden"
          >
            <motion.div 
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 shadow-sm"
              style={{ fontFamily: 'Gilroy, sans-serif' }}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center mb-4">
                <MessageSquare className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-blue-800">
                  AI-Generated Summary
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Action Items Preview */}
                <motion.div 
                  className="bg-white p-4 rounded-lg border border-red-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center mb-2">
                    <Target className="h-5 w-5 text-red-500 mr-2" />
                    <h4 className="font-medium text-red-700">Action Items</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {structuredNotes.action_items.length} tasks identified
                  </p>
                </motion.div>

                {/* Key Updates Preview */}
                <motion.div 
                  className="bg-white p-4 rounded-lg border border-orange-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center mb-2">
                    <Hash className="h-5 w-5 text-orange-500 mr-2" />
                    <h4 className="font-medium text-orange-700">Key Updates</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {structuredNotes.key_updates.length} important updates
                  </p>
                </motion.div>

                {/* Ideas & Insights Preview */}
                <motion.div 
                  className="bg-white p-4 rounded-lg border border-green-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center mb-2">
                    <Lightbulb className="h-5 w-5 text-green-500 mr-2" />
                    <h4 className="font-medium text-green-700">Ideas & Insights</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {structuredNotes.ideas_insights.length} insights captured
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Status */}
      <motion.div 
        className="mt-4 flex justify-between items-center text-sm text-gray-500 px-2"
        style={{ fontFamily: 'Gilroy, sans-serif' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span>
          {isPreviewMode ? 'Preview Mode' : 'Edit Mode'} | 
          Words: {notes.split(/\s+/).filter(word => word.length > 0).length}
        </span>
        <span>
          {hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
        </span>
      </motion.div>
    </motion.div>
  );
}; 