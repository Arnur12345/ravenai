import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, FileText, Sparkles, Settings, Loader2, AlertCircle
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { dashboardApi } from '@/shared/api/dashboardApi';
import type { 
  ComprehensiveNotes, 
  ComprehensiveNotesRequest, 
  MeetingWithTranscripts
} from '@/shared/types/dashboard';

interface ComprehensiveNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: MeetingWithTranscripts;
}

type TabType = 'overview' | 'settings';

const TEMPLATE_OPTIONS = [
  { value: 'general', label: 'General Meeting', description: 'Comprehensive overview for any meeting type' },
  { value: 'executive', label: 'Executive Summary', description: 'High-level summary for leadership' },
  { value: 'technical', label: 'Technical Review', description: 'Focus on technical decisions and implementation' },
  { value: 'client', label: 'Client Meeting', description: 'Customer-focused with relationship notes' },
];

export const ComprehensiveNotesModal: React.FC<ComprehensiveNotesModalProps> = ({
  isOpen,
  onClose,
  meeting,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [comprehensiveNotes, setComprehensiveNotes] = useState<ComprehensiveNotes | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [hasExistingNotes, setHasExistingNotes] = useState(false);

  const [generationSettings, setGenerationSettings] = useState<ComprehensiveNotesRequest>({
    template_type: 'general',
    include_ai_summary: true,
    include_user_notes: true,
    include_transcript_highlights: true,
    tags: '',
  });

  useEffect(() => {
    if (isOpen && meeting.id) {
      loadExistingNotes();
    }
  }, [isOpen, meeting.id]);

  const loadExistingNotes = async () => {
    try {
      setIsLoading(true);
      const notes = await dashboardApi.getComprehensiveNotes(meeting.id);
      setComprehensiveNotes(notes);
      setHasExistingNotes(true);
    } catch (error) {
      setHasExistingNotes(false);
    } finally {
      setIsLoading(false);
    }
  };

  const generateComprehensiveNotes = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const notes = await dashboardApi.generateComprehensiveNotes(
        meeting.id,
        generationSettings,
        setGenerationProgress
      );
      
      setComprehensiveNotes(notes);
      setHasExistingNotes(true);
      setActiveTab('overview');
      
    } catch (error) {
      console.error('Error generating comprehensive notes:', error);
      setError('Failed to generate comprehensive notes. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  const handleClose = () => {
    setActiveTab('overview');
    setError(null);
    onClose();
  };

  const formatSectionContent = (content: string) => {
    const lines = content.split('\n');
    const sections: { title: string; content: string[] }[] = [];
    let currentSection: { title: string; content: string[] } | null = null;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.match(/^##\s+(.+)$/)) {
        if (currentSection) sections.push(currentSection);
        currentSection = {
          title: trimmedLine.replace(/^##\s+/, ''),
          content: []
        };
      } else if (currentSection && trimmedLine) {
        currentSection.content.push(trimmedLine);
      }
    });

    if (currentSection) sections.push(currentSection);
    return sections;
  };

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto mb-4" />
            <p className="text-slate-400">Loading notes...</p>
          </div>
        </div>
      );
    }

    if (!hasExistingNotes) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <FileText className="h-12 w-12 text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">
            No Comprehensive Notes Yet
          </h3>
          <p className="text-slate-500 mb-6 max-w-md">
            Generate comprehensive notes that combine AI analysis, your personal notes, and key transcript moments.
          </p>
          <Button
            onClick={generateComprehensiveNotes}
            disabled={isGenerating}
            className="bg-indigo-500 hover:bg-indigo-600 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {generationProgress || 'Generating...'}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Comprehensive Notes
              </>
            )}
          </Button>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {comprehensiveNotes?.comprehensive_notes && (
              <div className="space-y-4">
                {formatSectionContent(comprehensiveNotes.comprehensive_notes).map((section, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-700 rounded-lg p-4"
                  >
                    <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center">
                      <Sparkles className="h-5 w-5 text-indigo-400 mr-2" />
                      {section.title}
                    </h3>
                    <div className="space-y-2">
                      {section.content.map((item, itemIndex) => (
                        <p key={itemIndex} className="text-slate-300 leading-relaxed">
                          {item}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center">
              <Settings className="h-5 w-5 text-gray-400 mr-2" />
              Notes Settings
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-3">
                Template Type
              </label>
              <div className="grid grid-cols-1 gap-3">
                {TEMPLATE_OPTIONS.map((template) => (
                  <label
                    key={template.value}
                    className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                      generationSettings.template_type === template.value
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="template"
                      value={template.value}
                      checked={generationSettings.template_type === template.value}
                      onChange={(e) => setGenerationSettings(prev => ({
                        ...prev,
                        template_type: e.target.value
                      }))}
                      className="sr-only"
                    />
                    <div className="flex items-start">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-200">
                          {template.label}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {template.description}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Button
              onClick={generateComprehensiveNotes}
              disabled={isGenerating}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {generationProgress || 'Generating...'}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {hasExistingNotes ? 'Regenerate Notes' : 'Generate Notes'}
                </>
              )}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl bg-slate-800 rounded-xl border border-slate-700 shadow-xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-200">
                    Comprehensive Notes
                  </h3>
                  <p className="text-sm text-slate-400">
                    {meeting.meeting_platform} • {meeting.transcripts.length} transcript entries
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="border-b border-slate-700">
              <nav className="flex space-x-8 px-6">
                {[
                  { key: 'overview', label: 'Overview', icon: FileText },
                  { key: 'settings', label: 'Settings', icon: Settings },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as TabType)}
                    className={`flex items-center space-x-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? 'border-indigo-500 text-indigo-400'
                        : 'border-transparent text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 rounded-lg bg-red-900/20 border border-red-500/30 p-3"
                >
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <span className="text-sm text-red-400">{error}</span>
                  </div>
                </motion.div>
              )}
              
              {renderTabContent()}
            </div>

            {hasExistingNotes && (
              <div className="flex items-center justify-between p-6 border-t border-slate-700 bg-slate-800/50">
                <div className="flex items-center space-x-4 text-xs text-slate-400">
                  <span>Template: {comprehensiveNotes?.template_type}</span>
                  <span>Version: {comprehensiveNotes?.notes_version}</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
