import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import type { CreateMeetingRequest } from '@/shared/types/dashboard';

interface NewMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (meetingData: CreateMeetingRequest) => Promise<void>;
  isLoading?: boolean;
}

export const NewMeetingModal: React.FC<NewMeetingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<CreateMeetingRequest>({
    name: '',
    meeting_url: '',
    meeting_platform: 'Google Meet',
    bot_name: t('meeting.bot_name_default'),
    user_notes: '',
    meeting_date: new Date().toISOString().split('T')[0], // Auto-set to today
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate meeting URL
    if (!formData.meeting_url.trim()) {
      newErrors.meeting_url = t('meeting.url_required');
    } else if (!isValidMeetingUrl(formData.meeting_url)) {
      newErrors.meeting_url = t('meeting.url_invalid');
    }

    // Validate bot name
    if (!formData.bot_name?.trim()) {
      newErrors.bot_name = t('meeting.bot_name_required');
    } else if (formData.bot_name.length < 3) {
      newErrors.bot_name = t('meeting.bot_name_min');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidMeetingUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === 'meet.google.com' || 
             urlObj.hostname === 'zoom.us' || 
             urlObj.hostname.includes('zoom.us') ||
             urlObj.hostname === 'teams.microsoft.com' ||
             urlObj.hostname.includes('teams.microsoft.com');
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error creating meeting:', error);
      setErrors({ submit: t('meeting.create_failed') });
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      meeting_url: '',
      meeting_platform: 'Google Meet',
      bot_name: t('meeting.bot_name_default'),
      user_notes: '',
      meeting_date: new Date().toISOString().split('T')[0],
    });
    setErrors({});
    onClose();
  };

  const handleChange = (field: keyof CreateMeetingRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Simple backdrop */}
        <div
          className="fixed inset-0 bg-black/80"
          onClick={handleClose}
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-white rounded-lg shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('meeting.create_new')}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Meeting Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('meeting.name')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={t('meeting.name_placeholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Meeting URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('meeting.url')}
              </label>
              <input
                type="url"
                value={formData.meeting_url}
                onChange={(e) => handleChange('meeting_url', e.target.value)}
                placeholder={t('meeting.url_placeholder')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.meeting_url ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.meeting_url && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.meeting_url}
                </p>
              )}
            </div>

            {/* Bot Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('meeting.bot_name')}
              </label>
              <input
                type="text"
                value={formData.bot_name}
                onChange={(e) => handleChange('bot_name', e.target.value)}
                placeholder="RavenAI Bot"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.bot_name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.bot_name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.bot_name}
                </p>
              )}
            </div>

            {/* Meeting Platform */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('meeting.platform')}
              </label>
              <select
                value={formData.meeting_platform}
                onChange={(e) => handleChange('meeting_platform', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Google Meet">Google Meet</option>
                <option value="Zoom">Zoom</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('meeting.notes')}
              </label>
              <textarea
                value={formData.user_notes}
                onChange={(e) => handleChange('user_notes', e.target.value)}
                placeholder={t('meeting.notes_placeholder')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Error message */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex items-center"
              >
                {t('meeting.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center rounded-xl px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-600/50 hover:border-gray-500/50"
                style={{
                  background: 'linear-gradient(to bottom, #3B3B3B, #636363)',
                  color: 'white',
                  fontFamily: 'Gilroy, Inter, sans-serif'
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('meeting.creating')}
                  </>
                ) : (
                  t('meeting.create')
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}; 