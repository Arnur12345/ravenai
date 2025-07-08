import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, X, Sun, Moon } from 'lucide-react';
import LoginForm from './components/login-form';
import RegisterForm from './components/register-form';
import ForgotPasswordForm from './components/forgot-password-form';
import TwoFactorAuth from './components/TwoFactorAuth';
import loginBg from '@/assets/loginbg.png';
import loginBg1 from '@/assets/loginbg1.png';
import gilroyFont from '@/assets/gilroy.ttf';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useTheme } from '@/shared/contexts/ThemeContext';

type AuthMode = 'login' | 'register' | 'forgot' | '2fa';

interface TwoFactorData {
  email: string;
  purpose: 'registration' | 'login' | 'verification';
  userData?: any; // For registration, store user data temporarily
}

const Auth: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isLoaded, setIsLoaded] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [twoFactorData, setTwoFactorData] = useState<TwoFactorData | null>(null);
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

  // 2FA Flow Handlers
  const handleRequire2FA = (email: string, purpose: 'registration' | 'login' | 'verification', userData?: any) => {
    setTwoFactorData({ email, purpose, userData });
    setAuthMode('2fa');
  };

  const handle2FASuccess = async (email: string, code: string) => {
    if (!twoFactorData) return;

    try {
      if (twoFactorData.purpose === 'registration' && twoFactorData.userData) {
        // Complete registration with 2FA verification
        await completeRegistrationWith2FA(twoFactorData.userData, email, code);
      } else if (twoFactorData.purpose === 'login') {
        // Complete login with 2FA verification
        await completeLoginWith2FA(email, code);
      }
      
      // Clear 2FA data and redirect will happen via auth context
      setTwoFactorData(null);
      setAuthMode('login');
    } catch (error) {
      console.error('2FA completion error:', error);
      // Handle error - could show error message or redirect back to form
    }
  };

  const handle2FABack = () => {
    setTwoFactorData(null);
    if (twoFactorData?.purpose === 'registration') {
      setAuthMode('register');
    } else {
      setAuthMode('login');
    }
  };

  // Placeholder functions - these should call your actual auth service
  const completeRegistrationWith2FA = async (userData: any, email: string, code: string) => {
    // This would be implemented to complete registration after 2FA verification
    console.log('Complete registration with 2FA:', { userData, email, code });
  };

  const completeLoginWith2FA = async (email: string, code: string) => {
    // This would be implemented to complete login after 2FA verification
    console.log('Complete login with 2FA:', { email, code });
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5138ED]"></div>
      </div>
    );
  }

  // Show 2FA component as full-screen overlay
  if (authMode === '2fa' && twoFactorData) {
    return (
      <TwoFactorAuth
        email={twoFactorData.email}
        purpose={twoFactorData.purpose}
        onSuccess={handle2FASuccess}
        onBack={handle2FABack}
      />
    );
  }

  // Theme-based styling
  const isDark = theme === 'dark';
  const backgroundImage = isDark ? loginBg : loginBg1;
  const overlayColor = isDark ? 'bg-black/50' : 'bg-black/20';
  const modalBg = isDark ? 'bg-black/40' : 'bg-white/70';
  const modalBorder = isDark ? 'border-white/20' : 'border-white/30';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textColorSecondary = isDark ? 'text-gray-300' : 'text-gray-600';
  const buttonBg = isDark ? 'bg-white/10' : 'bg-gray-100';
  const buttonBorder = isDark ? 'border-white/20' : 'border-gray-300';
  const buttonHover = isDark ? 'hover:bg-white/20' : 'hover:bg-gray-200';

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better contrast */}
      <div className={`absolute inset-0 ${overlayColor}`} />

      {/* Back to Home Button */}
      <button
        onClick={handleBackToHome}
        className={`fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-xl ${buttonBg} backdrop-blur-xl ${textColor} ${buttonHover} transition-all duration-300 border ${buttonBorder}`}
        style={{ fontFamily: 'Gilroy, sans-serif' }}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back to Home</span>
      </button>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 z-50 p-3 rounded-xl ${buttonBg} backdrop-blur-xl ${textColor} ${buttonHover} transition-all duration-300 border ${buttonBorder}`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      {/* Main Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ 
          opacity: isLoaded ? 1 : 0, 
          scale: isLoaded ? 1 : 0.95,
          y: isLoaded ? 0 : 20
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Modal Card */}
        <div className={`${modalBg} backdrop-blur-2xl rounded-2xl border ${modalBorder} overflow-hidden shadow-2xl relative`}>
          {/* Close Button */}
          <button
            onClick={handleBackToHome}
            className={`absolute top-4 right-4 z-20 p-2 rounded-full ${buttonBg} ${buttonHover} ${textColorSecondary} hover:${textColor} transition-all duration-300`}
          >
            <X className="h-4 w-4" />
          </button>

          {/* Mode Toggle */}
          <div className="p-8 pb-6">
            <div className={`flex ${buttonBg} rounded-2xl p-1 mb-8 border ${buttonBorder}`}>
              <button
                onClick={switchToRegister}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  authMode === 'register' 
                    ? isDark 
                      ? 'bg-white text-gray-900 shadow-lg' 
                      : 'bg-gray-900 text-white shadow-lg'
                    : `${textColorSecondary} hover:${textColor} ${buttonHover}`
                }`}
                style={{ fontFamily: 'Gilroy, sans-serif' }}
              >
                Sign up
              </button>
              <button
                onClick={switchToLogin}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  authMode === 'login' 
                    ? isDark 
                      ? 'bg-white text-gray-900 shadow-lg' 
                      : 'bg-gray-900 text-white shadow-lg'
                    : `${textColorSecondary} hover:${textColor} ${buttonHover}`
                }`}
                style={{ fontFamily: 'Gilroy, sans-serif' }}
              >
                Sign in
              </button>
            </div>

            {/* OAuth Error Display */}
            {oauthError && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-400/30 text-red-300 backdrop-blur-sm">
                <p className="text-sm font-medium" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  {oauthError}
                </p>
                <button
                  onClick={() => setOauthError(null)}
                  className="mt-2 text-xs underline text-red-300 hover:text-red-200 transition-colors duration-200"
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
      </motion.div>
    </div>
  );
};

export default Auth;
