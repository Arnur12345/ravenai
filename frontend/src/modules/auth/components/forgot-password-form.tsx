import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import ErrorMessage from '@/shared/ui/error-message';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useTheme } from '@/shared/contexts/ThemeContext';
import type { AuthError } from '@/shared/types/auth';
import { parseAuthError } from '@/shared/utils/error-handler';

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
  onSwitchToRegister: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSwitchToLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const { forgotPassword, isLoading } = useAuth();
  const { theme } = useTheme();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  const validateEmail = (): AuthError | null => {
    if (!email.trim()) {
      return parseAuthError('Email is required');
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      return parseAuthError('Please enter a valid email');
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateEmail();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      await forgotPassword(email);
      setIsEmailSent(true);
      setError(null);
    } catch (error: any) {
      // Extract the parsed error from the error object
      const authError = error.authError || parseAuthError(error);
      setError(authError);
    }
  };

  const handleRetry = () => {
    setError(null);
    // Optionally retry the last action
  };

  const handleDismissError = () => {
    setError(null);
  };

  // Theme-based classes
  const getThemeClasses = () => {
    return {
      title: theme === 'dark' ? 'text-white' : 'text-gray-900',
      subtitle: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
      emailText: theme === 'dark' ? 'text-white' : 'text-gray-900',
      input: theme === 'dark' 
        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400 focus:border-blue-400' 
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500',
      label: theme === 'dark' ? 'text-gray-300' : 'text-gray-700',
      icon: theme === 'dark' ? 'text-gray-400' : 'text-gray-400',
      link: theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500',
      switchText: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
      backButton: theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900',
      primaryButton: theme === 'dark' 
        ? 'bg-blue-600 text-white hover:bg-blue-700' 
        : 'bg-blue-600 text-white hover:bg-blue-700',
      successIcon: theme === 'dark' ? 'bg-green-900 border-green-700' : 'bg-green-100',
      successIconColor: theme === 'dark' ? 'text-green-400' : 'text-green-600',
      infoBox: theme === 'dark' 
        ? 'bg-blue-900 border-blue-700 text-blue-200' 
        : 'bg-blue-50 border-blue-200 text-blue-800',
    };
  };

  const themeClasses = getThemeClasses();

  if (isEmailSent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full text-center space-y-6"
      >
        {/* Success Icon */}
        <div className={`mx-auto w-16 h-16 ${themeClasses.successIcon} rounded-full flex items-center justify-center border`}>
          <CheckCircle className={`w-8 h-8 ${themeClasses.successIconColor}`} />
        </div>

        {/* Header */}
        <div>
          <h2 
            className={`text-2xl font-semibold ${themeClasses.title} mb-2`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            Check your email
          </h2>
          <p 
            className={themeClasses.subtitle}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            We've sent a password reset link to
          </p>
          <p 
            className={`${themeClasses.emailText} font-medium`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            {email}
          </p>
        </div>

        {/* Instructions */}
        <div className={`${themeClasses.infoBox} border rounded-lg p-4`}>
          <p 
            className="text-sm"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            Can't find the email? Check your spam folder or try again with a different email address.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => {
              setIsEmailSent(false);
              setEmail('');
              setError(null);
            }}
            className={`w-full ${themeClasses.primaryButton} font-medium py-3 px-4 rounded-lg transition-all duration-200`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            Try again
          </Button>
          
          <button
            onClick={onSwitchToLogin}
            className={`flex items-center justify-center w-full ${themeClasses.backButton} transition-colors duration-200 py-2`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to sign in
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <h2 
          className={`text-2xl font-semibold ${themeClasses.title} mb-2`}
          style={{ fontFamily: 'Gilroy, sans-serif' }}
        >
          Reset password
        </h2>
        <p 
          className={themeClasses.subtitle}
          style={{ fontFamily: 'Gilroy, sans-serif' }}
        >
          Enter your email and we'll send you a reset link
        </p>
      </div>

      {/* Enhanced Error Message */}
      {error && (
        <ErrorMessage 
          error={error} 
          onRetry={handleRetry}
          onDismiss={handleDismissError}
        />
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label 
            className={`block text-sm font-medium ${themeClasses.label} mb-1`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            Email
          </label>
          <div className="relative">
            <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.icon} h-5 w-5`} />
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-colors ${themeClasses.input}`}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className={`w-full ${themeClasses.primaryButton} font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          style={{ fontFamily: 'Gilroy, sans-serif' }}
        >
          {isLoading ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>

      {/* Back to Login */}
      <div className="text-center">
        <button
          onClick={onSwitchToLogin}
          className={`flex items-center justify-center w-full ${themeClasses.backButton} transition-colors duration-200 py-2`}
          style={{ fontFamily: 'Gilroy, sans-serif' }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to sign in
        </button>
      </div>

      {/* Switch to Register */}
      <div className="text-center">
        <span 
          className={`text-sm ${themeClasses.switchText}`}
          style={{ fontFamily: 'Gilroy, sans-serif' }}
        >
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className={`${themeClasses.link} font-medium transition-colors`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            Sign up
          </button>
        </span>
      </div>
    </motion.div>
  );
};

export default ForgotPasswordForm; 