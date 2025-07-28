import React, { useEffect, useState } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { User } from '@/shared/types/auth';

const GoogleSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [status, setStatus] = useState<'loading'>('loading');

  useEffect(() => {
    const processSuccess = async () => {
      try {
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const userId = searchParams.get('user_id');

        if (!accessToken || !refreshToken || !userId) {
          // Missing tokens, redirect to auth with error
          navigate('/auth?error=missing_tokens', { replace: true });
          return;
        }

        // Store tokens in localStorage
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);

        // Fetch user data using the access token
        const userResponse = await fetch('http://localhost:8000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();
        const user: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar
        };

        // Store user data
        localStorage.setItem('user_data', JSON.stringify(user));
        

        
        // Redirect immediately to dashboard
        navigate('/dashboard', { replace: true });

      } catch (error: any) {
        console.error('Google OAuth success processing failed:', error);
        // Redirect to auth with error
        navigate('/auth?error=auth_processing_failed', { replace: true });
      }
    };

    processSuccess();
  }, [searchParams, navigate]);

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
              Finalizing sign in...
            </h2>
            <p 
              className={themeClasses.text}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              Please wait while we set up your account.
            </p>
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

export default GoogleSuccess;