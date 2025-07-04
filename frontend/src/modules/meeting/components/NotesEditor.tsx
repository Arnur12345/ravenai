import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

interface NotesEditorProps {
  meetingId: string;
  initialNotes: string;
  onNotesChange: (notes: string) => void;
  isReadOnly?: boolean;
  onFormatText?: (format: string) => void;
}

export const NotesEditor: React.FC<NotesEditorProps> = ({
  meetingId,
  initialNotes,
  onNotesChange,
  isReadOnly = false,
  onFormatText,
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Expose textarea ref for parent formatting functions
  useEffect(() => {
    if (onFormatText && textareaRef.current) {
      // Store reference for parent component access
      (window as any).currentNotesTextarea = textareaRef.current;
    }
  }, [onFormatText]);



  // Initialize notes
  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [notes]);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setHasUnsavedChanges(true);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      handleSave(value);
    }, 2000); // Auto-save after 2 seconds of inactivity
  };

  const handleSave = async (notesToSave?: string) => {
    const currentNotes = notesToSave || notes;
    
    try {
      await onNotesChange(currentNotes);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="h-full">
      {notes.trim() === '' && isReadOnly ? (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-600 mb-2">
            No notes yet
          </h4>
          <p className="text-gray-500 max-w-sm">
            Notes will appear here once they are added during or after the meeting.
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <textarea
            ref={textareaRef}
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}

            placeholder={isReadOnly ? "No notes available..." : "Start typing your notes here... Use / for commands (e.g., /action, /decision, /highlight)"}
            readOnly={isReadOnly}
            dir="ltr"
            lang="en"
            className={`w-full h-full resize-none border-0 bg-transparent placeholder:text-gray-400 focus:outline-none focus:ring-0 font-sans leading-relaxed ${
              isReadOnly ? 'cursor-default' : 'cursor-text'
            }`}
            style={{
              minHeight: '300px',
              fontSize: '14px',
              lineHeight: '1.6',
              color: 'var(--text-secondary)',
              fontFamily: 'Inter, sans-serif',
              direction: 'ltr',
              textAlign: 'left',
              unicodeBidi: 'embed',
              writingMode: 'horizontal-tb'
            }}
          />
        </motion.div>
      )}
    </div>
  );
}; 