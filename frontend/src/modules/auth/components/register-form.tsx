import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useTheme } from '../../../shared/contexts/ThemeContext';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await register(`${firstName} ${lastName}`, email, password);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      // Redirect to Google OAuth
      window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
    } catch (error) {
      console.error('Google login error:', error);
      setError('Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Theme-based styling
  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textColorSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const placeholderColor = isDark ? 'placeholder-gray-500' : 'placeholder-gray-400';
  const inputBg = isDark ? 'bg-black/20' : 'bg-white/60';
  const inputBorder = isDark ? 'border-white/30' : 'border-white/40';
  const inputFocusBorder = isDark ? 'focus:border-white/60' : 'focus:border-white/60';
  const buttonPrimary = isDark ? 'bg-white text-gray-900' : 'bg-gray-900 text-white';
  const buttonSecondary = isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-white/50 border-white/40 text-gray-700';
  const buttonSecondaryHover = isDark ? 'hover:bg-white/20' : 'hover:bg-white/70';
  const iconColor = isDark ? 'text-gray-400' : 'text-gray-500';
  const linkColor = isDark ? 'text-white' : 'text-gray-900';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      <div className="mb-8">
        <h1 
          className={`text-2xl font-bold ${textColor} mb-2`}
          style={{ fontFamily: 'Gilroy, sans-serif' }}
        >
          Create account
        </h1>
        <p 
          className={`${textColorSecondary} text-sm`}
          style={{ fontFamily: 'Gilroy, sans-serif' }}
        >
          Join us today and start your journey
        </p>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-400/30 text-red-300"
        >
          <p className="text-sm font-medium" style={{ fontFamily: 'Gilroy, sans-serif' }}>
            {error}
          </p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          {/* First Name */}
          <div className="relative">
            <label className={`block text-sm font-medium ${textColorSecondary} mb-2`} style={{ fontFamily: 'Gilroy, sans-serif' }}>
              First name
            </label>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${iconColor}`} />
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className={`w-full pl-10 pr-4 py-3 ${inputBg} border ${inputBorder} rounded-xl ${textColor} ${placeholderColor} focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500/50 ${inputFocusBorder} transition-all duration-300`}
                style={{ fontFamily: 'Gilroy, sans-serif' }}
                required
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="relative">
            <label className={`block text-sm font-medium ${textColorSecondary} mb-2`} style={{ fontFamily: 'Gilroy, sans-serif' }}>
              Last name
            </label>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${iconColor}`} />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className={`w-full pl-10 pr-4 py-3 ${inputBg} border ${inputBorder} rounded-xl ${textColor} ${placeholderColor} focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500/50 ${inputFocusBorder} transition-all duration-300`}
                style={{ fontFamily: 'Gilroy, sans-serif' }}
                required
              />
            </div>
          </div>
        </div>

        {/* Email Input */}
        <div className="relative">
          <label className={`block text-sm font-medium ${textColorSecondary} mb-2`} style={{ fontFamily: 'Gilroy, sans-serif' }}>
            Email address
          </label>
          <div className="relative">
            <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${iconColor}`} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={`w-full pl-10 pr-4 py-3 ${inputBg} border ${inputBorder} rounded-xl ${textColor} ${placeholderColor} focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500/50 ${inputFocusBorder} transition-all duration-300`}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="relative">
          <label className={`block text-sm font-medium ${textColorSecondary} mb-2`} style={{ fontFamily: 'Gilroy, sans-serif' }}>
            Password
          </label>
          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${iconColor}`} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className={`w-full pl-10 pr-12 py-3 ${inputBg} border ${inputBorder} rounded-xl ${textColor} ${placeholderColor} focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500/50 ${inputFocusBorder} transition-all duration-300`}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${iconColor} hover:${textColor} transition-colors duration-300`}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password Input */}
        <div className="relative">
          <label className={`block text-sm font-medium ${textColorSecondary} mb-2`} style={{ fontFamily: 'Gilroy, sans-serif' }}>
            Confirm password
          </label>
          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${iconColor}`} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className={`w-full pl-10 pr-12 py-3 ${inputBg} border ${inputBorder} rounded-xl ${textColor} ${placeholderColor} focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500/50 ${inputFocusBorder} transition-all duration-300`}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${iconColor} hover:${textColor} transition-colors duration-300`}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Terms & Service */}
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="sr-only"
          />
          <div 
            className={`w-5 h-5 rounded border-2 transition-all duration-300 flex items-center justify-center cursor-pointer mt-0.5 ${
              acceptTerms 
                ? isDark 
                  ? 'bg-white border-white' 
                  : 'bg-gray-900 border-gray-900'
                : `border-gray-400 bg-transparent`
            }`}
            onClick={() => setAcceptTerms(!acceptTerms)}
          >
            {acceptTerms && (
              <svg className={`w-3 h-3 ${isDark ? 'text-gray-900' : 'text-white'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <label 
            htmlFor="acceptTerms" 
            className={`${textColorSecondary} text-sm cursor-pointer leading-relaxed`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            I agree to the{' '}
            <a href="/legal/terms" className={`${linkColor} hover:opacity-80 transition-opacity duration-300`}>
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="/legal/privacy" className={`${linkColor} hover:opacity-80 transition-opacity duration-300`}>
              Privacy Policy
            </a>
          </label>
        </div>

        {/* Create Account Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 ${buttonPrimary} rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
          style={{ fontFamily: 'Gilroy, sans-serif' }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${isDark ? 'border-gray-900' : 'border-white'} mr-2`}></div>
              Creating account...
            </div>
          ) : (
            'Create account'
          )}
        </motion.button>

        {/* Divider */}
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${isDark ? 'border-white/20' : 'border-white/40'}`}></div>
          </div>
          <div className="relative flex justify-center">
            <span className={`px-4 ${isDark ? 'bg-black/40' : 'bg-white/60'} ${textColorSecondary} text-sm font-medium`} style={{ fontFamily: 'Gilroy, sans-serif' }}>
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Login Button */}
        <motion.button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center justify-center py-3 px-4 rounded-xl ${buttonSecondary} border ${buttonSecondaryHover} transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
          style={{ fontFamily: 'Gilroy, sans-serif' }}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="font-medium">Continue with Google</span>
        </motion.button>

        {/* Sign In Link */}
        <div className="text-center pt-4">
          <p className={`${textColorSecondary} text-sm`} style={{ fontFamily: 'Gilroy, sans-serif' }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className={`${linkColor} font-semibold hover:opacity-80 transition-opacity duration-300`}
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    </motion.div>
  );
};

export default RegisterForm; 