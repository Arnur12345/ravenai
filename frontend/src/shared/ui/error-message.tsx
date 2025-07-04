import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Wifi, RefreshCw, X } from 'lucide-react';
import { useTheme } from '@/shared/contexts/ThemeContext';
import type { AuthError } from '@/shared/types/auth';
import { AuthErrorType } from '@/shared/types/auth';
import { isRecoverableError } from '@/shared/utils/error-handler';

interface ErrorMessageProps {
  error: AuthError | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onRetry, onDismiss, className = '' }) => {
  const { theme } = useTheme();
  
  // Handle both AuthError objects and string errors
  const errorData = typeof error === 'string' 
    ? { type: AuthErrorType.UNKNOWN_ERROR, message: error, statusCode: undefined }
    : error;

  const getErrorIcon = () => {
    switch (errorData.type) {
      case AuthErrorType.NETWORK_ERROR:
        return <Wifi className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getThemeClasses = () => {
    const isNetworkError = errorData.type === AuthErrorType.NETWORK_ERROR;
    const isServerError = errorData.type === AuthErrorType.SERVER_ERROR;
    
    if (theme === 'dark') {
      if (isNetworkError || isServerError) {
        return {
          container: 'bg-gradient-to-r from-yellow-900/90 to-orange-900/90 border-yellow-600/50 text-yellow-100 shadow-lg shadow-yellow-900/20',
          icon: 'text-yellow-300',
          retryButton: 'text-yellow-200 hover:text-yellow-50 hover:bg-yellow-800/50 border-yellow-600/30',
          dismissButton: 'text-yellow-300 hover:text-yellow-100 hover:bg-yellow-800/30'
        };
      }
      return {
        container: 'bg-gradient-to-r from-red-900/90 to-rose-900/90 border-red-600/50 text-red-100 shadow-lg shadow-red-900/30',
        icon: 'text-red-300',
        retryButton: 'text-red-200 hover:text-red-50 hover:bg-red-800/50 border-red-600/30',
        dismissButton: 'text-red-300 hover:text-red-100 hover:bg-red-800/30'
      };
    } else {
      if (isNetworkError || isServerError) {
        return {
          container: 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 text-yellow-900 shadow-lg shadow-yellow-200/30',
          icon: 'text-yellow-700',
          retryButton: 'text-yellow-800 hover:text-yellow-900 hover:bg-yellow-200/50 border-yellow-300',
          dismissButton: 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-200/30'
        };
      }
      return {
        container: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 text-red-900 shadow-lg shadow-red-200/30',
        icon: 'text-red-600',
        retryButton: 'text-red-700 hover:text-red-900 hover:bg-red-200/50 border-red-300',
        dismissButton: 'text-red-500 hover:text-red-700 hover:bg-red-200/30'
      };
    }
  };

  const themeClasses = getThemeClasses();
  const showRetry = onRetry && isRecoverableError(errorData.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        x: [0, -5, 5, -5, 5, 0] // Shake animation
      }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        duration: 0.4,
        x: { duration: 0.6, delay: 0.1 } // Shake after appearance
      }}
      className={`relative flex items-start gap-4 p-4 border-2 rounded-xl text-sm backdrop-blur-sm ${themeClasses.container} ${className}`}
      role="alert"
      aria-live="assertive"
    >
      {/* Error Icon */}
      <div className={`flex-shrink-0 ${themeClasses.icon}`}>
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {getErrorIcon()}
        </motion.div>
      </div>
      
      {/* Error Content */}
      <div className="flex-1 min-w-0">
        <motion.p 
          className="font-semibold text-base leading-relaxed"
          style={{ fontFamily: 'Gilroy, sans-serif' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {errorData.message}
        </motion.p>
        
        {/* Additional context for specific error types */}
        {errorData.type === AuthErrorType.NETWORK_ERROR && (
          <motion.p 
            className="mt-2 text-xs opacity-80 font-medium"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.8, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            💡 Make sure the backend server is running on http://localhost:8000
          </motion.p>
        )}
        
        {errorData.type === AuthErrorType.USER_ALREADY_EXISTS && (
          <motion.p 
            className="mt-2 text-xs opacity-80 font-medium"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.8, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            💡 Try logging in instead, or use a different email address.
          </motion.p>
        )}

        {errorData.type === AuthErrorType.INVALID_CREDENTIALS && (
          <motion.p 
            className="mt-2 text-xs opacity-80 font-medium"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.8, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            🔐 Double-check your email and password combination.
          </motion.p>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Retry button for recoverable errors */}
        {showRetry && (
          <motion.button
            onClick={onRetry}
            className={`flex-shrink-0 p-2 rounded-lg transition-all duration-200 border ${themeClasses.retryButton}`}
            aria-label="Retry"
            title="Try again"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className="h-4 w-4" />
          </motion.button>
        )}

        {/* Dismiss button */}
        {onDismiss && (
          <motion.button
            onClick={onDismiss}
            className={`flex-shrink-0 p-1.5 rounded-lg transition-all duration-200 ${themeClasses.dismissButton}`}
            aria-label="Dismiss"
            title="Dismiss"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="h-4 w-4" />
          </motion.button>
        )}
      </div>

      {/* Animated border pulse for critical errors */}
      {(errorData.type === AuthErrorType.INVALID_CREDENTIALS || 
        errorData.type === AuthErrorType.USER_NOT_FOUND) && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-red-400/50"
          animate={{ 
            opacity: [0, 0.5, 0],
            scale: [1, 1.02, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1
          }}
        />
      )}
    </motion.div>
  );
};

export default ErrorMessage; 