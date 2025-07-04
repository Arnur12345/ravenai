import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import ErrorMessage from '@/shared/ui/error-message';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useTheme } from '@/shared/contexts/ThemeContext';
import type { AuthError } from '@/shared/types/auth';
import { parseAuthError } from '@/shared/utils/error-handler';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToForgot: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onSwitchToForgot }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const { login, loginWithGoogle, isLoading } = useAuth();
  const { theme } = useTheme();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError(parseAuthError('Please fill in all fields'));
      return;
    }
    
    try {
      await login(formData.email, formData.password);
    } catch (error: any) {
      // Extract the parsed error from the error object
      const authError = error.authError || parseAuthError(error);
      setError(authError);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error: any) {
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
      input: theme === 'dark' 
        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400 focus:border-blue-400' 
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500',
      label: theme === 'dark' ? 'text-gray-300' : 'text-gray-700',
      icon: theme === 'dark' ? 'text-gray-400' : 'text-gray-400',
      checkbox: theme === 'dark' 
        ? 'text-blue-400 focus:ring-blue-400 border-gray-600 bg-gray-700' 
        : 'text-blue-600 focus:ring-blue-500 border-gray-300 bg-white',
      checkboxLabel: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
      link: theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500',
      switchText: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
      primaryButton: theme === 'dark' 
        ? 'bg-blue-600 text-white hover:bg-blue-700' 
        : 'bg-blue-600 text-white hover:bg-blue-700',
      googleButton: theme === 'dark' 
        ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' 
        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
      dividerLine: theme === 'dark' ? 'border-gray-600' : 'border-gray-300',
      dividerText: theme === 'dark' ? 'text-gray-400 bg-gray-800' : 'text-gray-500 bg-white',
    };
  };

  const themeClasses = getThemeClasses();

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
          Welcome back
        </h2>
        <p 
          className={themeClasses.subtitle}
          style={{ fontFamily: 'Gilroy, sans-serif' }}
        >
          Sign in to your account
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

      {/* Google Login Button */}
      <Button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className={`w-full ${themeClasses.googleButton} font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border`}
        style={{ fontFamily: 'Gilroy, sans-serif' }}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {isLoading ? 'Signing in...' : 'Continue with Google'}
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className={`w-full border-t ${themeClasses.dividerLine}`} />
        </div>
        <div className="relative flex justify-center text-sm">
          <span 
            className={`px-2 ${themeClasses.dividerText}`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            Or continue with email
          </span>
        </div>
      </div>

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
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-colors ${themeClasses.input}`}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label 
            className={`block text-sm font-medium ${themeClasses.label} mb-1`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            Password
          </label>
          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.icon} h-5 w-5`} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-12 py-3 border rounded-lg transition-colors ${themeClasses.input}`}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.icon} hover:text-gray-600 transition-colors`}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              className={`h-4 w-4 rounded border focus:ring-2 focus:ring-offset-2 ${themeClasses.checkbox}`}
            />
            <label 
              htmlFor="remember-me" 
              className={`ml-2 block text-sm ${themeClasses.checkboxLabel}`}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              Remember me
            </label>
          </div>

          <button
            type="button"
            onClick={onSwitchToForgot}
            className={`text-sm ${themeClasses.link} transition-colors`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className={`w-full ${themeClasses.primaryButton} font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          style={{ fontFamily: 'Gilroy, sans-serif' }}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

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

export default LoginForm; 