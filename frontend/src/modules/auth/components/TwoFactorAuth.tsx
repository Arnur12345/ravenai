import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authApi } from "../../../shared/api/authApi";

interface TwoFactorAuthProps {
  email: string;
  purpose: 'registration' | 'login' | 'verification';
  onSuccess: (email: string, code: string) => void;
  onBack?: () => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({
  email,
  purpose,
  onSuccess,
  onBack
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  // Timer for code expiration
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setError('Verification code has expired. Please request a new one.');
      setCanResend(true);
    }
  }, [timeLeft]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Auto-submit when all fields are filled
  useEffect(() => {
    if (code.every(digit => digit !== '')) {
      handleVerify();
    }
  }, [code]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste operation
      const digits = value.slice(0, 6).split('');
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (index + i < 6 && /^\d$/.test(digit)) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);
      
      // Focus the last filled input or next empty one
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    if (/^\d$/.test(value) || value === '') {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      setError(''); // Clear error when user types

      // Move to next input if digit entered
      if (value !== '' && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (code[index] === '' && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const codeString = code.join('');
    if (codeString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.verify2FACode({
        email,
        code: codeString,
        purpose
      });

      setSuccess('Code verified successfully!');
      setTimeout(() => {
        onSuccess(email, codeString);
      }, 1000);

    } catch (err: any) {
      console.error('2FA verification error:', err);
      
      if (err.response?.status === 410) {
        setError('Verification code has expired. Please request a new one.');
        setCanResend(true);
      } else if (err.response?.status === 429) {
        setError('Too many attempts. Please request a new code.');
        setCanResend(true);
      } else {
        setError(err.response?.data?.detail || 'Invalid verification code. Please try again.');
      }
      
      // Clear the code on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resendCooldown > 0) return;

    setIsResending(true);
    setError('');
    setSuccess('');

    try {
      await authApi.send2FACode({
        email,
        purpose
      });

      setSuccess('New verification code sent!');
      setTimeLeft(600); // Reset timer
      setCanResend(false);
      setResendCooldown(60); // 1 minute cooldown
      
      // Clear current code and focus first input
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

    } catch (err: any) {
      console.error('Resend 2FA error:', err);
      setError(err.response?.data?.detail || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const getPurposeText = () => {
    switch (purpose) {
      case 'registration':
        return 'Complete your registration by verifying your email address.';
      case 'login':
        return 'Verify your identity to complete the login process.';
      default:
        return 'Enter the verification code sent to your email.';
    }
  };

  const getPurposeTitle = () => {
    switch (purpose) {
      case 'registration':
        return 'Verify Your Email';
      case 'login':
        return 'Two-Factor Authentication';
      default:
        return 'Email Verification';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Mail className="w-8 h-8 text-blue-600" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {getPurposeTitle()}
            </h1>
            
            <p className="text-gray-600 text-sm leading-relaxed">
              {getPurposeText()}
            </p>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                Code sent to: <span className="font-medium text-blue-600">{email}</span>
              </p>
            </div>
          </div>

          {/* Code Input */}
          <div className="mb-6">
            <div className="flex gap-3 justify-center mb-4">
              {code.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={e => handleInputChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  onFocus={e => e.target.select()}
                  className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg transition-all duration-200 ${
                    digit
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  } ${error ? 'border-red-300' : ''} focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20`}
                  disabled={isLoading}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="text-center">
              {timeLeft > 0 ? (
                <p className="text-sm text-gray-500">
                  Code expires in: <span className="font-medium text-gray-700">{formatTime(timeLeft)}</span>
                </p>
              ) : (
                <p className="text-sm text-red-500 font-medium">Code has expired</p>
              )}
            </div>
          </div>

          {/* Error/Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-700">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={isLoading || code.some(digit => digit === '')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 mb-4"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </div>
            ) : (
              'Verify Code'
            )}
          </button>

          {/* Resend Code */}
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">Didn't receive the code?</p>
            
            <button
              onClick={handleResend}
              disabled={isResending || !canResend || resendCooldown > 0}
              className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2 mx-auto"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : canResend ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Resend Code
                </>
              ) : (
                'Please wait to resend'
              )}
            </button>
          </div>

          {/* Back Button */}
          {onBack && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-700 transition-colors duration-200 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Having trouble? Contact{' '}
            <a href="mailto:support@ravenai.site" className="text-blue-600 hover:text-blue-700">
              support@ravenai.site
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TwoFactorAuth; 