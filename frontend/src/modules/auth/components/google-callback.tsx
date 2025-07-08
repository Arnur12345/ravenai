import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ErrorMessage from '../../../shared/ui/error-message';
import type { AuthError } from '../../../shared/types/auth';
import { parseAuthError } from '../../../shared/utils/error-handler';
import config from '../../../shared/config/config';

const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleGoogleCallback, isLoading } = useAuth();
  const { theme } = useTheme();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        // Check for OAuth errors
        if (error) {
          throw new Error(`Google OAuth error: ${error}`);
        }

        // Validate required parameters
        if (!code || !state) {
          throw new Error('Missing required OAuth parameters');
        }

        // Build redirect URI (same as used in the initial request)
        const redirectUri = `${window.location.origin}/auth/google/callback`;

        // Handle the callback
        await handleGoogleCallback(code, state, redirectUri);
        
        setStatus('success');
        
        // Redirect to dashboard after success
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);

      } catch (error: any) {
        console.error('Google OAuth callback failed:', error);
        const authError = error.authError || parseAuthError(error);
        setError(authError);
        setStatus('error');
      }
    };

    processCallback();
  }, [searchParams, handleGoogleCallback, navigate]);

  const handleRetry = () => {
    // Redirect back to login page
    navigate('/auth', { replace: true });
  };

  const handleDismissError = () => {
    setError(null);
  };

  // Theme-based classes
  const getThemeClasses = () => {
    return {
      container: theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50',
      card: theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
      title: theme === 'dark' ? 'text-white' : 'text-gray-900',
      text: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
      successText: theme === 'dark' ? 'text-green-400' : 'text-green-600',
      successIcon: theme === 'dark' ? 'text-green-400' : 'text-green-600',
      loadingIcon: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
    };
  };

  const themeClasses = getThemeClasses();

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="flex justify-center">
              <Loader2 className={`h-12 w-12 animate-spin ${themeClasses.loadingIcon}`} />
            </div>
            <h2 
              className={`text-2xl font-semibold ${themeClasses.title}`}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              Completing sign in...
            </h2>
            <p 
              className={themeClasses.text}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              Please wait while we verify your Google account.
            </p>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="flex justify-center">
              <CheckCircle className={`h-12 w-12 ${themeClasses.successIcon}`} />
            </div>
            <h2 
              className={`text-2xl font-semibold ${themeClasses.title}`}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              Welcome to AfterTalk!
            </h2>
            <p 
              className={themeClasses.successText}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              Successfully signed in with Google. Redirecting to your dashboard...
            </p>
          </motion.div>
        );

      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="flex justify-center">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <h2 
              className={`text-2xl font-semibold ${themeClasses.title}`}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              Sign in failed
            </h2>
            
            {error && (
              <ErrorMessage 
                error={error} 
                onRetry={handleRetry}
                onDismiss={handleDismissError}
              />
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${themeClasses.container}`}>
      <div className={`max-w-md w-full space-y-8 p-8 rounded-xl border shadow-lg ${themeClasses.card}`}>
        {renderContent()}
      </div>
    </div>
  );
};

export default GoogleCallback; 