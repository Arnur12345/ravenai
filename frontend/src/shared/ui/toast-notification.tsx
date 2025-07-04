import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, Wifi, X, RefreshCw } from 'lucide-react';
import { useTheme } from '@/shared/contexts/ThemeContext';
import type { AuthError } from '@/shared/types/auth';
import { AuthErrorType } from '@/shared/types/auth';
import { isRecoverableError } from '@/shared/utils/error-handler';

export type ToastType = 'error' | 'success' | 'warning' | 'info';

interface ToastNotificationProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  error?: AuthError;
  duration?: number;
  onClose: (id: string) => void;
  onRetry?: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  id,
  type,
  title,
  message,
  error,
  duration = 5000,
  onClose,
  onRetry
}) => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0 && type !== 'error') {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, type]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  const getIcon = () => {
    if (error?.type === AuthErrorType.NETWORK_ERROR) {
      return <Wifi className="h-5 w-5" />;
    }
    
    switch (type) {
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5" />;
      case 'info':
        return <Info className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getThemeClasses = () => {
    const baseClasses = 'backdrop-blur-md border-2 shadow-2xl';
    
    if (theme === 'dark') {
      switch (type) {
        case 'error':
          return {
            container: `${baseClasses} bg-gradient-to-br from-red-900/95 to-rose-900/95 border-red-500/50 text-red-100 shadow-red-900/30`,
            icon: 'text-red-300',
            title: 'text-red-100',
            message: 'text-red-200',
            closeButton: 'text-red-300 hover:text-red-100 hover:bg-red-800/30',
            retryButton: 'bg-red-700/50 hover:bg-red-600/60 text-red-100 border-red-500/30'
          };
        case 'success':
          return {
            container: `${baseClasses} bg-gradient-to-br from-green-900/95 to-emerald-900/95 border-green-500/50 text-green-100 shadow-green-900/30`,
            icon: 'text-green-300',
            title: 'text-green-100',
            message: 'text-green-200',
            closeButton: 'text-green-300 hover:text-green-100 hover:bg-green-800/30',
            retryButton: 'bg-green-700/50 hover:bg-green-600/60 text-green-100 border-green-500/30'
          };
        case 'warning':
          return {
            container: `${baseClasses} bg-gradient-to-br from-yellow-900/95 to-orange-900/95 border-yellow-500/50 text-yellow-100 shadow-yellow-900/30`,
            icon: 'text-yellow-300',
            title: 'text-yellow-100',
            message: 'text-yellow-200',
            closeButton: 'text-yellow-300 hover:text-yellow-100 hover:bg-yellow-800/30',
            retryButton: 'bg-yellow-700/50 hover:bg-yellow-600/60 text-yellow-100 border-yellow-500/30'
          };
        default:
          return {
            container: `${baseClasses} bg-gradient-to-br from-blue-900/95 to-indigo-900/95 border-blue-500/50 text-blue-100 shadow-blue-900/30`,
            icon: 'text-blue-300',
            title: 'text-blue-100',
            message: 'text-blue-200',
            closeButton: 'text-blue-300 hover:text-blue-100 hover:bg-blue-800/30',
            retryButton: 'bg-blue-700/50 hover:bg-blue-600/60 text-blue-100 border-blue-500/30'
          };
      }
    } else {
      switch (type) {
        case 'error':
          return {
            container: `${baseClasses} bg-gradient-to-br from-red-50 to-rose-50 border-red-400 text-red-900 shadow-red-200/50`,
            icon: 'text-red-600',
            title: 'text-red-900',
            message: 'text-red-700',
            closeButton: 'text-red-500 hover:text-red-700 hover:bg-red-200/30',
            retryButton: 'bg-red-100 hover:bg-red-200 text-red-800 border-red-300'
          };
        case 'success':
          return {
            container: `${baseClasses} bg-gradient-to-br from-green-50 to-emerald-50 border-green-400 text-green-900 shadow-green-200/50`,
            icon: 'text-green-600',
            title: 'text-green-900',
            message: 'text-green-700',
            closeButton: 'text-green-500 hover:text-green-700 hover:bg-green-200/30',
            retryButton: 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300'
          };
        case 'warning':
          return {
            container: `${baseClasses} bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-400 text-yellow-900 shadow-yellow-200/50`,
            icon: 'text-yellow-600',
            title: 'text-yellow-900',
            message: 'text-yellow-700',
            closeButton: 'text-yellow-500 hover:text-yellow-700 hover:bg-yellow-200/30',
            retryButton: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300'
          };
        default:
          return {
            container: `${baseClasses} bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-400 text-blue-900 shadow-blue-200/50`,
            icon: 'text-blue-600',
            title: 'text-blue-900',
            message: 'text-blue-700',
            closeButton: 'text-blue-500 hover:text-blue-700 hover:bg-blue-200/30',
            retryButton: 'bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300'
          };
      }
    }
  };

  const themeClasses = getThemeClasses();
  const showRetry = onRetry && error && isRecoverableError(error.type);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`relative max-w-md w-full p-4 rounded-2xl ${themeClasses.container}`}
      role="alert"
      aria-live="assertive"
    >
      {/* Progress bar for auto-dismiss */}
      {duration > 0 && type !== 'error' && (
        <motion.div
          className="absolute top-0 left-0 h-1 bg-white/30 rounded-t-2xl"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <motion.div
          className={`flex-shrink-0 ${themeClasses.icon}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
        >
          {getIcon()}
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <motion.h4
            className={`font-bold text-sm ${themeClasses.title}`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {title}
          </motion.h4>
          
          {(message || error?.message) && (
            <motion.p
              className={`mt-1 text-xs leading-relaxed ${themeClasses.message}`}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {message || error?.message}
            </motion.p>
          )}

          {/* Action buttons */}
          {showRetry && (
            <motion.button
              onClick={onRetry}
              className={`mt-3 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 border ${themeClasses.retryButton}`}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="h-3 w-3 inline mr-1" />
              Try Again
            </motion.button>
          )}
        </div>

        {/* Close button */}
        <motion.button
          onClick={handleClose}
          className={`flex-shrink-0 p-1 rounded-lg transition-all duration-200 ${themeClasses.closeButton}`}
          aria-label="Close notification"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  children: React.ReactNode;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ children }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      <AnimatePresence mode="popLayout">
        {children}
      </AnimatePresence>
    </div>
  );
};

export default ToastNotification; 