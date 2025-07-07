import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import LoginForm from './components/login-form';
import RegisterForm from './components/register-form';
import ForgotPasswordForm from './components/forgot-password-form';
import ravenLogo from '@/assets/ravenwhite.png';
import gilroyFont from '@/assets/gilroy.ttf';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useTheme } from '@/shared/contexts/ThemeContext';

type AuthMode = 'login' | 'register' | 'forgot';

const Auth: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isLoaded, setIsLoaded] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const { isAuthenticated, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Load Gilroy font
    const fontFace = new FontFace('Gilroy', `url(${gilroyFont})`);
    fontFace.load().then(() => {
      document.fonts.add(fontFace);
    });

    // Check for OAuth errors in URL parameters
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    if (error) {
      let errorMessage = 'Google authentication failed.';
      switch (error) {
        case 'access_denied':
          errorMessage = 'Access was denied. Please try again.';
          break;
        case 'missing_parameters':
          errorMessage = 'Missing required parameters from Google.';
          break;
        case 'auth_failed':
          errorMessage = message ? `Authentication failed: ${message}` : 'Authentication failed.';
          break;
        case 'missing_tokens':
          errorMessage = 'Failed to receive authentication tokens.';
          break;
        case 'auth_processing_failed':
          errorMessage = 'Failed to process authentication. Please try again.';
          break;
      }
      setOauthError(errorMessage);
      
      // Clear the error from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }

    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [searchParams]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const switchToLogin = () => setAuthMode('login');
  const switchToRegister = () => setAuthMode('register');
  const switchToForgot = () => setAuthMode('forgot');

  const handleBackToHome = () => {
    navigate('/');
  };

  // Theme-based classes
  const getThemeClasses = () => {
    return {
      background: theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50',
      card: theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100',
      backButton: theme === 'dark' 
        ? 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700' 
        : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:shadow-md',
      themeButton: theme === 'dark'
        ? 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700'
        : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:shadow-md',
      footer: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    };
  };

  const themeClasses = getThemeClasses();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className={`min-h-screen ${themeClasses.background} flex items-center justify-center`}>
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${theme === 'dark' ? 'border-blue-400' : 'border-blue-600'}`}></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.background} flex items-center justify-center px-4 py-8`}>
      {/* Back Button */}
      <button
        onClick={handleBackToHome}
        className={`fixed top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-all duration-200 ${themeClasses.backButton}`}
        style={{ fontFamily: 'Gilroy, sans-serif' }}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back to Home</span>
      </button>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 z-10 flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-all duration-200 ${themeClasses.themeButton}`}
        style={{ fontFamily: 'Gilroy, sans-serif' }}
      >
        {theme === 'dark' ? (
          <>
            <Sun className="h-4 w-4" />
            <span className="text-sm font-medium">Light</span>
          </>
        ) : (
          <>
            <Moon className="h-4 w-4" />
            <span className="text-sm font-medium">Dark</span>
          </>
        )}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isLoaded ? 1 : 0, 
          y: isLoaded ? 0 : 20 
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Main Auth Container */}
        <div className={`${themeClasses.card} rounded-2xl shadow-xl border overflow-hidden`}>
          <div className="p-8">
            {/* Logo Section */}
            <div className="text-center mb-8">
              <a 
                href="/"
                className="inline-flex items-center group transition-all duration-200 hover:scale-[1.02]"
              >
                <img 
                  src={ravenLogo} 
                  alt="RavenAI Logo" 
                  className={`h-10 w-auto object-contain ${theme === 'dark' ? 'filter brightness-0 invert' : 'filter brightness-0'}`}
                />
              </a>
            </div>

            {/* OAuth Error Display */}
            {oauthError && (
              <div className={`mb-6 p-4 rounded-lg border ${theme === 'dark' ? 'bg-red-900/20 border-red-600 text-red-300' : 'bg-red-50 border-red-300 text-red-700'}`}>
                <p className="text-sm font-medium" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  {oauthError}
                </p>
                <button
                  onClick={() => setOauthError(null)}
                  className={`mt-2 text-xs underline ${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'}`}
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Form Container */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {authMode === 'login' && (
                  <LoginForm 
                    key="login"
                    onSwitchToRegister={switchToRegister}
                    onSwitchToForgot={switchToForgot}
                  />
                )}
                {authMode === 'register' && (
                  <RegisterForm 
                    key="register"
                    onSwitchToLogin={switchToLogin}
                  />
                )}
                {authMode === 'forgot' && (
                  <ForgotPasswordForm 
                    key="forgot"
                    onSwitchToLogin={switchToLogin}
                    onSwitchToRegister={switchToRegister}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p 
            className={`${themeClasses.footer} text-sm`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            © 2024 RavenAI. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
