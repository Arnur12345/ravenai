import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { slackApi } from '@/shared/api/slackApi';

export const SlackCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [integration, setIntegration] = useState<any>(null);

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setError('Авторизация была отменена или произошла ошибка');
      return;
    }

    if (!code || !state) {
      setStatus('error');
      setError('Недостаточно данных для завершения авторизации');
      return;
    }

    try {
      const redirectUri = `${window.location.origin}/integrations/slack/callback`;
      const newIntegration = await slackApi.handleOAuthCallback(code, state, redirectUri);
      
      setIntegration(newIntegration);
      setStatus('success');
      
      // Redirect to integrations page after 3 seconds
      setTimeout(() => {
        navigate('/integrations');
      }, 3000);
    } catch (error) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setError('Не удалось завершить интеграцию с Slack');
    }
  };

  const handleManualRedirect = () => {
    navigate('/integrations');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-2xl p-8 w-full max-w-md border border-slate-700 shadow-2xl"
      >
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-3">
                Завершение интеграции...
              </h2>
              <p className="text-slate-400">
                Настраиваем подключение к вашему Slack workspace
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <Check className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-3">
                Slack успешно подключен!
              </h2>
              <p className="text-slate-400 mb-6">
                Workspace "{integration?.workspace_name}" готов к использованию
              </p>
              <div className="space-y-3">
                <div className="text-sm text-slate-300">
                  Автоматическое перенаправление через 3 секунды...
                </div>
                <Button
                  onClick={handleManualRedirect}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-medium"
                >
                  Перейти к интеграциям
                </Button>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-3">
                Ошибка интеграции
              </h2>
              <p className="text-red-400 mb-6">
                {error || 'Произошла неизвестная ошибка'}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={handleManualRedirect}
                  className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-xl font-medium"
                >
                  Вернуться к интеграциям
                </Button>
                <button
                  onClick={() => window.location.reload()}
                  className="text-slate-400 hover:text-white text-sm underline"
                >
                  Попробовать снова
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}; 