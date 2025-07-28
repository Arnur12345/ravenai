import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useAuth } from '@/shared/contexts/AuthContext';
import { userApi } from '@/shared/api/userApi';
import {
  LayoutDashboard,
  Calendar,
  Zap,
  Settings,
  Search,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Settings as SettingsIcon,
  Clock,
  Video,
  ExternalLink,
  Calendar as CalendarIcon,
  CheckCircle,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';
import ravenBlackSmallLogo from '@/assets/ravenblacksmall.png';

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  meeting_url?: string;
  attendees: Array<{
    email: string;
    name?: string;
  }>;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const MobileNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [isLoadingCalendarStatus, setIsLoadingCalendarStatus] = useState(true);

  // Navigation items
  const navigation: NavItem[] = [
    { name: t('dashboard.nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('dashboard.nav.meetings'), href: '/meetings', icon: Calendar },
    { name: t('dashboard.nav.integrations'), href: '/integrations', icon: Zap },
    { name: t('dashboard.nav.settings'), href: '/settings', icon: Settings },
  ];

  const isCurrentPath = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  // Handle clicking outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      setShowNotifications(false);
      setShowUserMenu(false);
    };

    if (showNotifications || showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications, showUserMenu]);

  useEffect(() => {
    fetchUpcomingEvents();
    const interval = setInterval(fetchUpcomingEvents, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Load calendar connection status
  useEffect(() => {
    const loadCalendarStatus = async () => {
      try {
        const response = await userApi.getLinkedAccounts();
        const googleCalendar = response.accounts.find(account => account.service === 'google_calendar');
        setCalendarConnected(googleCalendar?.connected || false);
      } catch (error) {
        console.error('Failed to load calendar status:', error);
        setCalendarConnected(false);
      } finally {
        setIsLoadingCalendarStatus(false);
      }
    };

    loadCalendarStatus();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch('/api/calendar/upcoming-events?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUpcomingEvents(data.events || []);
        setNotificationCount(data.events?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) {
      return t('time.in_minutes').replace('{count}', diffMins.toString());
    } else if (diffHours < 24) {
      return t('time.in_hours').replace('{count}', diffHours.toString());
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return t('time.in_days').replace('{count}', diffDays.toString());
    }
  };

  const displayName = user?.name || 'User';
  const displayEmail = user?.email || 'user@example.com';
  const displayAvatar = user?.avatar;

  return (
    <>
      {/* Top Navigation Bar */}
      <header 
        className="sticky top-0 z-30 backdrop-blur-sm"
        style={{ 
          backgroundColor: '#F5F7FB',
          fontFamily: 'Gilroy, Inter, sans-serif',
          padding: '12px 16px'
        }}
      >
        <div className="flex h-14 items-center justify-between">
          {/* Left side - Logo and Menu */}
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-xl transition-all duration-200 border border-gray-200"
              style={{
                backgroundColor: 'var(--dashboard-very-light-blue)10'
              }}
            >
              {showMobileMenu ? (
                <X className="h-5 w-5" style={{ color: 'var(--dashboard-light-blue)' }} />
              ) : (
                <Menu className="h-5 w-5" style={{ color: 'var(--dashboard-light-blue)' }} />
              )}
            </motion.button>

            {/* Logo */}
            <motion.div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate('/dashboard')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div 
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, var(--dashboard-bright-blue), var(--dashboard-light-blue))`
                }}
              >
                <img 
                  src={ravenBlackSmallLogo} 
                  alt="RavenAI Logo" 
                  className="h-6 w-6 object-contain"
                />
              </div>
              <span 
                className="text-lg font-bold bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, var(--dashboard-bright-blue), var(--dashboard-light-blue))`
                }}
              >
                RavenAI
              </span>
            </motion.div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-2">
            {/* Search - Hidden on very small screens */}
            <div className="hidden sm:block relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4" style={{ color: '#9CA3AF' }} />
              </div>
              <input
                type="text"
                placeholder={t('dashboard.header.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-32 md:w-48 border-0 pl-10 pr-3 py-2 text-sm placeholder-gray-400 transition-all duration-200 focus:outline-none bg-white rounded-xl border border-gray-200"
                style={{ color: '#374151' }}
              />
            </div>

            {/* Language Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
              className="flex items-center space-x-1 px-2 py-1.5 rounded-lg transition-all duration-200 border border-gray-200"
              style={{ backgroundColor: 'var(--dashboard-very-light-blue)10' }}
            >
              <span className="text-sm">
                {language === 'en' ? '🇷🇺' : '🇬🇧'}
              </span>
            </motion.button>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl transition-all duration-200 border border-gray-200"
                style={{ backgroundColor: 'var(--dashboard-very-light-blue)10' }}
              >
                <Bell className="h-5 w-5" style={{ color: 'var(--dashboard-light-blue)' }} />
                {notificationCount > 0 && (
                  <div 
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-xs font-medium flex items-center justify-center"
                    style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </div>
                )}
              </motion.button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl shadow-xl border border-gray-200 z-50 max-h-80 sm:max-h-96 overflow-y-auto"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <h3 
                          className="text-lg font-semibold"
                          style={{ color: 'var(--dashboard-very-light-blue)' }}
                        >
                          {t('dashboard.header.upcoming_meetings')}
                        </h3>
                      </div>
                      
                      <div className="py-1">
                        {upcomingEvents.length === 0 ? (
                          <div className="px-4 py-6 text-center">
                            <Bell className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--dashboard-light-blue)50' }} />
                            <p style={{ color: 'var(--dashboard-light-blue)' }}>
                              {t('dashboard.header.no_upcoming')}
                            </p>
                          </div>
                        ) : (
                          upcomingEvents.map((event) => (
                            <div
                              key={event.id}
                              className="px-4 py-3 transition-all duration-200 cursor-pointer border-b border-gray-100 last:border-b-0"
                              style={{ color: 'var(--dashboard-very-light-blue)' }}
                            >
                              <div className="flex items-start space-x-3">
                                <div 
                                  className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                                  style={{
                                    background: `linear-gradient(135deg, var(--dashboard-bright-blue), var(--dashboard-light-blue))`
                                  }}
                                >
                                  <Video className="h-4 w-4" style={{ color: 'var(--dashboard-black)' }} />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <h4 
                                    className="font-medium text-sm truncate"
                                    style={{ color: 'var(--dashboard-very-light-blue)' }}
                                  >
                                    {event.title}
                                  </h4>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Clock className="h-3 w-3" style={{ color: 'var(--dashboard-light-blue)' }} />
                                    <span className="text-xs" style={{ color: 'var(--dashboard-light-blue)' }}>
                                      {formatTime(event.start_time)}
                                    </span>
                                  </div>
                                </div>
                                
                                {event.meeting_url && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(event.meeting_url, '_blank');
                                    }}
                                    className="p-1 rounded-lg transition-all duration-200 flex-shrink-0"
                                    style={{ 
                                      color: 'var(--dashboard-bright-blue)',
                                      backgroundColor: 'var(--dashboard-bright-blue)10'
                                    }}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-xl transition-all duration-200 border border-gray-200"
                style={{ backgroundColor: 'var(--dashboard-very-light-blue)10' }}
              >
                <div 
                  className="h-8 w-8 rounded-full flex items-center justify-center overflow-hidden"
                  style={{
                    background: displayAvatar ? 'transparent' : `linear-gradient(135deg, var(--dashboard-bright-blue), var(--dashboard-light-blue))`
                  }}
                >
                  {displayAvatar ? (
                    <img src={displayAvatar} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-4 w-4" style={{ color: 'var(--dashboard-black)' }} />
                  )}
                </div>
                <ChevronDown 
                  className="h-4 w-4 transition-transform duration-200"
                  style={{ 
                    color: 'var(--dashboard-light-blue)',
                    transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                />
              </motion.button>

              {/* User Dropdown */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl border border-gray-200 z-50"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="h-10 w-10 rounded-full flex items-center justify-center overflow-hidden"
                            style={{
                              background: displayAvatar ? 'transparent' : `linear-gradient(135deg, var(--dashboard-bright-blue), var(--dashboard-light-blue))`
                            }}
                          >
                            {displayAvatar ? (
                              <img src={displayAvatar} alt={displayName} className="h-full w-full object-cover" />
                            ) : (
                              <User className="h-5 w-5" style={{ color: 'var(--dashboard-black)' }} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--dashboard-very-light-blue)' }}>
                              {displayName}
                            </p>
                            <p className="text-xs truncate" style={{ color: 'var(--dashboard-light-blue)' }}>
                              {displayEmail}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-1">
                        <button
                          onClick={() => {
                            navigate('/settings');
                            setShowUserMenu(false);
                          }}
                          className="flex w-full items-center px-4 py-2 text-sm transition-colors duration-200"
                          style={{ color: 'var(--dashboard-very-light-blue)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--dashboard-very-light-blue)10';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <SettingsIcon className="h-4 w-4 mr-3" style={{ color: 'var(--dashboard-light-blue)' }} />
                          {t('dashboard.nav.settings')}
                        </button>
                        
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-2 text-sm transition-colors duration-200"
                          style={{ color: '#ef4444' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#fef2f2';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          {t('auth.logout')}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowMobileMenu(false)}
            />
            
            {/* Menu Content */}
            <motion.div
              className="absolute top-20 left-4 right-4 rounded-xl shadow-xl border border-gray-200"
              style={{ backgroundColor: '#ffffff' }}
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4">
                {/* Search on mobile */}
                <div className="sm:hidden mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="h-4 w-4" style={{ color: '#9CA3AF' }} />
                    </div>
                    <input
                      type="text"
                      placeholder={t('dashboard.header.search')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full border-0 pl-10 pr-3 py-2 text-sm placeholder-gray-400 transition-all duration-200 focus:outline-none bg-gray-50 rounded-xl"
                      style={{ color: '#374151' }}
                    />
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-2">
                  {navigation.map((item, index) => {
                    const isCurrent = isCurrentPath(item.href);
                    return (
                      <motion.button
                        key={item.name}
                        onClick={() => {
                          navigate(item.href);
                          setShowMobileMenu(false);
                        }}
                        className="flex w-full items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200"
                        style={{
                          backgroundColor: isCurrent ? 'var(--dashboard-bright-blue)' : 'transparent',
                          color: isCurrent ? 'var(--dashboard-black)' : 'var(--dashboard-very-light-blue)'
                        }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        onMouseEnter={(e) => {
                          if (!isCurrent) {
                            e.currentTarget.style.backgroundColor = 'var(--dashboard-very-light-blue)10';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isCurrent) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <item.icon 
                          className="h-5 w-5" 
                          style={{ color: isCurrent ? 'var(--dashboard-black)' : 'var(--dashboard-light-blue)' }}
                        />
                        <span className="font-medium">{item.name}</span>
                        {isCurrent && (
                          <div 
                            className="ml-auto h-2 w-2 rounded-full"
                            style={{ backgroundColor: 'var(--dashboard-black)' }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Calendar Status */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-5 w-5" style={{ color: 'var(--dashboard-light-blue)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--dashboard-very-light-blue)' }}>
                        {t('calendar.status')}
                      </span>
                    </div>
                    {isLoadingCalendarStatus ? (
                      <div 
                        className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ 
                          borderColor: 'var(--dashboard-light-blue)',
                          borderTopColor: 'transparent'
                        }}
                      />
                    ) : calendarConnected ? (
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs" style={{ color: '#10b981' }}>
                          {t('calendar.connected')}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="text-xs" style={{ color: '#f59e0b' }}>
                          {t('calendar.disconnected')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};