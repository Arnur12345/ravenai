import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Loader2, Check, AlertCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { slackApi, type SlackIntegration, type SlackChannel } from '@/shared/api/slackApi';

interface SlackSendButtonProps {
  meetingId: string;
  meetingSummary: string;
  isVisible?: boolean;
}

export const SlackSendButton: React.FC<SlackSendButtonProps> = ({
  meetingId,
  meetingSummary,
  isVisible = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [integrations, setIntegrations] = useState<SlackIntegration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<SlackIntegration | null>(null);
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<SlackChannel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load integrations when component mounts
  useEffect(() => {
    if (isVisible) {
      loadIntegrations();
    }
  }, [isVisible]);

  const loadIntegrations = async () => {
    try {
      setIsLoading(true);
      const response = await slackApi.getIntegrations();
      setIntegrations(response.integrations);
      
      // Auto-select first integration if only one exists
      if (response.integrations.length === 1) {
        setSelectedIntegration(response.integrations[0]);
        loadChannels(response.integrations[0].id);
      }
    } catch (error) {
      console.error('Failed to load Slack integrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChannels = async (integrationId: string) => {
    try {
      setIsLoading(true);
      const response = await slackApi.getChannels(integrationId);
      setChannels(response.channels);
      
      // Auto-select default channel if it exists
      const integration = integrations.find(i => i.id === integrationId);
      if (integration?.default_channel_id) {
        const defaultChannel = response.channels.find(
          c => c.id === integration.default_channel_id
        );
        if (defaultChannel) {
          setSelectedChannel(defaultChannel);
        }
      }
    } catch (error) {
      console.error('Failed to load channels:', error);
      setError('Не удалось загрузить каналы');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIntegrationSelect = (integration: SlackIntegration) => {
    setSelectedIntegration(integration);
    setSelectedChannel(null);
    setChannels([]);
    loadChannels(integration.id);
  };

  const handleSendToSlack = async () => {
    if (!selectedIntegration || !meetingSummary) return;

    setIsSending(true);
    setError(null);

    try {
      await slackApi.sendMeetingSummary(
        selectedIntegration.id,
        meetingId,
        selectedChannel?.id
      );
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      setError('Не удалось отправить сообщение в Slack');
    } finally {
      setIsSending(false);
    }
  };

  if (!isVisible || integrations.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Main Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl px-4 py-2 font-medium shadow-lg transition-all duration-200 flex items-center space-x-2"
        disabled={isSending || !meetingSummary}
      >
        {success ? (
          <>
            <Check className="h-4 w-4" />
            <span>Отправлено!</span>
          </>
        ) : (
          <>
            <MessageSquare className="h-4 w-4" />
            <span>Отправить в Slack</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </Button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-80 bg-slate-800 rounded-xl border border-slate-700 shadow-2xl z-50"
          >
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-purple-400" />
                <h3 className="text-white font-medium">Отправить в Slack</h3>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              {/* Workspace Selection */}
              {integrations.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Рабочее пространство
                  </label>
                  <div className="space-y-2">
                    {integrations.map((integration) => (
                      <button
                        key={integration.id}
                        onClick={() => handleIntegrationSelect(integration)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedIntegration?.id === integration.id
                            ? 'bg-purple-500/20 border border-purple-500/40'
                            : 'bg-slate-700/50 hover:bg-slate-700 border border-transparent'
                        }`}
                      >
                        <div className="font-medium text-white">{integration.workspace_name}</div>
                        {integration.default_channel_name && (
                          <div className="text-sm text-slate-400">
                            По умолчанию: #{integration.default_channel_name}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Channel Selection */}
              {selectedIntegration && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Канал {selectedIntegration.default_channel_name && '(необязательно)'}
                  </label>
                  {isLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                      <span className="ml-2 text-slate-400">Загрузка каналов...</span>
                    </div>
                  ) : (
                    <div className="max-h-32 overflow-y-auto space-y-1 border border-slate-600 rounded-lg p-2">
                      {/* Default option */}
                      {selectedIntegration.default_channel_name && (
                        <button
                          onClick={() => setSelectedChannel(null)}
                          className={`w-full text-left p-2 rounded-md transition-colors ${
                            !selectedChannel
                              ? 'bg-purple-500/20 border border-purple-500/40'
                              : 'hover:bg-slate-700/50'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-purple-400">#</span>
                            <span className="text-white font-medium">
                              {selectedIntegration.default_channel_name}
                            </span>
                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                              По умолчанию
                            </span>
                          </div>
                        </button>
                      )}
                      
                      {/* Other channels */}
                      {channels.map((channel) => (
                        <button
                          key={channel.id}
                          onClick={() => setSelectedChannel(channel)}
                          className={`w-full text-left p-2 rounded-md transition-colors ${
                            selectedChannel?.id === channel.id
                              ? 'bg-purple-500/20 border border-purple-500/40'
                              : 'hover:bg-slate-700/50'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-400">#</span>
                            <span className="text-white">{channel.name}</span>
                            {channel.is_private && (
                              <span className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded">
                                Приватный
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Send Button */}
              <div className="flex space-x-2">
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  className="flex-1 text-slate-400 hover:text-white"
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleSendToSlack}
                  disabled={!selectedIntegration || isSending || !meetingSummary}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Отправить
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 