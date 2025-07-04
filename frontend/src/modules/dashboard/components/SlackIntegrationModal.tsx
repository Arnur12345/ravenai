import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, AlertCircle, MessageSquare, Users } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { slackApi, type SlackIntegration, type SlackChannel } from '@/shared/api/slackApi';
import slackIcon from '@/assets/slackicon.png';

interface SlackIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (integration: SlackIntegration) => void;
}

export const SlackIntegrationModal: React.FC<SlackIntegrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<'connect' | 'channels' | 'success'>('connect');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [integration, setIntegration] = useState<SlackIntegration | null>(null);
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<SlackChannel | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('connect');
      setError(null);
      setIntegration(null);
      setChannels([]);
      setSelectedChannel(null);
    }
  }, [isOpen]);

  const handleSlackConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const redirectUri = `${window.location.origin}/integrations/slack/callback`;
      const { oauth_url } = await slackApi.getOAuthUrl(redirectUri);
      
      // Redirect to Slack OAuth
      window.location.href = oauth_url;

    } catch (error) {
      setError('Не удалось инициировать авторизацию Slack');
      setIsLoading(false);
    }
  };

  const handleChannelSelect = async () => {
    if (!selectedChannel || !integration) return;

    setIsLoading(true);
    setError(null);

    try {
      const updatedIntegration = await slackApi.setDefaultChannel(
        integration.id,
        selectedChannel.id,
        selectedChannel.name
      );

      setIntegration(updatedIntegration);
      setStep('success');
      onSuccess?.(updatedIntegration);
    } catch (error) {
      setError('Не удалось установить канал по умолчанию');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipChannel = () => {
    setStep('success');
    if (integration) {
      onSuccess?.(integration);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-lg z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative rounded-2xl p-8 w-full max-w-md shadow-2xl"
          style={{
            backgroundColor: '#ffffff',
            fontFamily: 'Gilroy, Inter, sans-serif',
            border: '1px solid rgba(198, 223, 255, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <motion.div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  background: `linear-gradient(135deg, var(--dashboard-bright-blue, #83BAFF), var(--dashboard-light-blue, #8EB6E8))`,
                  boxShadow: `0 4px 20px rgba(131, 186, 255, 0.3)`
                }}
              >
                <img src={slackIcon} alt="Slack" className="w-6 h-6" />
              </motion.div>
              <div>
                <h3 
                  className="text-xl font-bold"
                  style={{ color: 'var(--dashboard-black, #000000)' }}
                >
                  Интеграция Slack
                </h3>
                <p 
                  className="text-sm mt-1"
                  style={{ color: 'var(--dashboard-light-blue, #8EB6E8)' }}
                >
                  {step === 'connect' && 'Подключение к рабочему пространству'}
                  {step === 'channels' && 'Выберите канал для уведомлений'}
                  {step === 'success' && 'Интеграция настроена!'}
                </p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
              style={{ 
                color: 'var(--dashboard-light-blue, #8EB6E8)',
                backgroundColor: 'rgba(202, 240, 248, 0.3)'
              }}
              whileHover={{ 
                backgroundColor: 'rgba(202, 240, 248, 0.5)'
              }}
            >
              <X className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl flex items-center space-x-3"
              style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca'
              }}
            >
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm font-medium">{error}</span>
            </motion.div>
          )}

          {/* Step: Connect */}
          {step === 'connect' && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <motion.div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, var(--dashboard-bright-blue, #83BAFF), var(--dashboard-light-blue, #8EB6E8))`,
                    boxShadow: `0 8px 32px rgba(131, 186, 255, 0.4)`
                  }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <img src={slackIcon} alt="Slack" className="w-10 h-10" />
                </motion.div>
                <h4 
                  className="text-xl font-bold mb-3"
                  style={{ color: 'var(--dashboard-black, #000000)' }}
                >
                  Подключить Slack
                </h4>
                <p 
                  className="text-sm leading-relaxed mb-8 max-w-sm mx-auto"
                  style={{ color: 'var(--dashboard-light-blue, #8EB6E8)' }}
                >
                  Авторизуйте Raven для отправки итогов встреч в ваше рабочее пространство Slack
                </p>
                <motion.button
                  onClick={handleSlackConnect}
                  disabled={isLoading}
                  className="px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(135deg, var(--dashboard-bright-blue, #83BAFF), var(--dashboard-light-blue, #8EB6E8))`,
                    boxShadow: `0 4px 20px rgba(131, 186, 255, 0.4)`,
                    border: 'none'
                  }}
                  whileHover={isLoading ? {} : { 
                    scale: 1.02,
                    boxShadow: `0 6px 25px rgba(131, 186, 255, 0.5)`
                  }}
                  whileTap={isLoading ? {} : { scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Подключение...
                    </>
                  ) : (
                    'Подключить к Slack'
                  )}
                </motion.button>
              </div>
            </div>
          )}

          {/* Step: Channels */}
          {step === 'channels' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <motion.div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    backgroundColor: '#dcfce7',
                    border: '1px solid #bbf7d0'
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  <Check className="h-8 w-8 text-emerald-600" />
                </motion.div>
                <h4 
                  className="text-lg font-bold mb-2"
                  style={{ color: 'var(--dashboard-black)' }}
                >
                  Workspace подключен!
                </h4>
                <p 
                  className="text-sm font-medium"
                  style={{ color: 'var(--dashboard-light-blue)' }}
                >
                  {integration?.workspace_name}
                </p>
              </div>

              <div>
                <label 
                  className="block text-sm font-semibold mb-3"
                  style={{ color: 'var(--dashboard-black)' }}
                >
                  Выберите канал по умолчанию (необязательно)
                </label>
                <div 
                  className="max-h-48 overflow-y-auto space-y-2 rounded-xl p-3"
                  style={{
                    backgroundColor: 'var(--dashboard-very-light-blue)20',
                    border: '1px solid var(--dashboard-very-light-blue)50'
                  }}
                >
                  {channels.map((channel) => (
                    <motion.button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-200 border`}
                      style={{
                        backgroundColor: selectedChannel?.id === channel.id 
                          ? 'var(--dashboard-bright-blue)20' 
                          : '#ffffff',
                        borderColor: selectedChannel?.id === channel.id 
                          ? 'var(--dashboard-bright-blue)' 
                          : 'var(--dashboard-very-light-blue)50',
                        color: 'var(--dashboard-black)'
                      }}
                      whileHover={{ 
                        backgroundColor: selectedChannel?.id === channel.id 
                          ? 'var(--dashboard-bright-blue)30' 
                          : 'var(--dashboard-very-light-blue)30' 
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <span style={{ color: 'var(--dashboard-light-blue)' }}>#</span>
                        <span className="font-medium">{channel.name}</span>
                        {channel.is_private && (
                          <span 
                            className="text-xs px-2 py-1 rounded-lg"
                            style={{
                              backgroundColor: 'var(--dashboard-very-light-blue)50',
                              color: 'var(--dashboard-light-blue)'
                            }}
                          >
                            Приватный
                          </span>
                        )}
                      </div>
                      {channel.num_members && (
                        <div className="flex items-center space-x-2 mt-2">
                          <Users className="h-4 w-4" style={{ color: 'var(--dashboard-light-blue)' }} />
                          <span 
                            className="text-xs"
                            style={{ color: 'var(--dashboard-light-blue)' }}
                          >
                            {channel.num_members} участников
                          </span>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleSkipChannel}
                  className="flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:opacity-80"
                  style={{
                    backgroundColor: 'rgba(202, 240, 248, 0.3)',
                    color: 'var(--dashboard-light-blue, #8EB6E8)',
                    border: '1px solid rgba(202, 240, 248, 0.5)'
                  }}
                >
                  Пропустить
                </Button>
                <motion.button
                  onClick={handleChannelSelect}
                  disabled={!selectedChannel || isLoading}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(135deg, var(--dashboard-bright-blue, #83BAFF), var(--dashboard-light-blue, #8EB6E8))`,
                    boxShadow: `0 4px 20px rgba(131, 186, 255, 0.3)`,
                    border: 'none'
                  }}
                  whileHover={!selectedChannel || isLoading ? {} : { 
                    scale: 1.02,
                    boxShadow: `0 6px 25px rgba(131, 186, 255, 0.4)`
                  }}
                  whileTap={!selectedChannel || isLoading ? {} : { scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    'Сохранить'
                  )}
                </motion.button>
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <motion.div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{
                  backgroundColor: '#dcfce7',
                  border: '1px solid #bbf7d0'
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                <Check className="h-10 w-10 text-emerald-600" />
              </motion.div>
              <h4 
                className="text-xl font-bold mb-3"
                style={{ color: 'var(--dashboard-black)' }}
              >
                Slack успешно подключен!
              </h4>
              <p 
                className="text-sm leading-relaxed mb-8 max-w-sm mx-auto"
                style={{ color: 'var(--dashboard-light-blue)' }}
              >
                Теперь вы можете отправлять итоги встреч в 
                {integration?.default_channel_name 
                  ? ` канал #${integration.default_channel_name}`
                  : ' выбранные каналы'
                }
              </p>
                             <motion.button
                 onClick={onClose}
                 className="px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg"
                 style={{
                   background: 'linear-gradient(135deg, #10b981, #059669)',
                   boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
                   border: 'none'
                 }}
                 whileHover={{ 
                   scale: 1.02,
                   boxShadow: '0 6px 25px rgba(16, 185, 129, 0.5)'
                 }}
                 whileTap={{ scale: 0.98 }}
               >
                 Готово
               </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 