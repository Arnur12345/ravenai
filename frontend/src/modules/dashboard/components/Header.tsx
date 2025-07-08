import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Bell, 
  ChevronDown,
  User, 
  LogOut,
  Settings as SettingsIcon,
  Clock,
  Video,
  ExternalLink,
  Calendar,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

import { useAuth } from '@/shared/contexts/AuthContext';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { userApi } from '@/shared/api/userApi';

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

export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [isLoadingCalendarStatus, setIsLoadingCalendarStatus] = useState(true);

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
    // Fetch events every 5 minutes
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

  // Default user data fallback
  const displayName = user?.name || 'User';
  const displayEmail = user?.email || 'user@example.com';
  const displayAvatar = user?.avatar;

  return (
    <header 
      className="sticky top-0 z-30 backdrop-blur-sm"
      style={{ 
        backgroundColor: '#F5F7FB',
        fontFamily: 'Gilroy, Inter, sans-serif',
        padding: '16px'
      }}
    >
      <div className="flex h-16 items-center gap-4">
        
        {/* Combined Search Bar and User Menu Block */}
        <div 
          className="flex flex-1 items-center justify-between rounded-2xl px-4 py-3"
          style={{
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.02)'
          }}
        >
          {/* Search Bar */}
          <div className="relative flex-1 max-w-lg mr-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search 
                className="h-4 w-4" 
                style={{ color: '#9CA3AF' }}
              />
            </div>
            <input
              type="text"
              placeholder={t('dashboard.header.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full border-0 pl-10 pr-3 py-2 text-sm placeholder-gray-400 transition-all duration-200 focus:outline-none bg-transparent"
              style={{
                color: '#374151',
              } as React.CSSProperties}
            />
          </div>

          {/* Right side - Notifications and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle - moved to right side */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
              className="flex items-center space-x-1 px-2 py-1.5 rounded-lg transition-all duration-200"
              style={{
                backgroundColor: 'transparent',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title={language === 'en' ? 'Switch to Russian' : 'Переключить на английский'}
            >
              <span className="text-lg">
                {language === 'en' ? '🇷🇺' : '🇬🇧'}
              </span>
              <span 
                className="text-sm font-medium"
                style={{ color: 'var(--dashboard-light-blue, #8EB6E8)' }}
              >
                {language === 'en' ? 'RU' : 'EN'}
              </span>
            </motion.button>
            
            {/* Calendar Connection Status */}
            <div className="hidden md:flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-200 border border-gray-200"
                style={{
                  backgroundColor: 'var(--dashboard-very-light-blue)10'
                }}
                title={calendarConnected ? 'Google Calendar Connected' : 'Google Calendar Not Connected'}
              >
                <Calendar 
                  className="h-4 w-4" 
                  style={{ color: 'var(--dashboard-light-blue)' }}
                />
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
                    <span 
                      className="text-sm font-medium hidden lg:inline"
                      style={{ color: '#10b981' }}
                    >
                      {t('calendar.connected')}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span 
                      className="text-sm font-medium hidden lg:inline"
                      style={{ color: '#f59e0b' }}
                    >
                      {t('calendar.disconnected')}
                    </span>
                  </div>
                )}
              </motion.div>
            </div>
            
            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300 cursor-pointer"
                style={{
                  backgroundColor: 'var(--dashboard-very-light-blue)10'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--dashboard-very-light-blue)20';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--dashboard-very-light-blue)10';
                }}
              >
                <Bell 
                  className="h-5 w-5" 
                  style={{ color: 'var(--dashboard-light-blue)' }}
                />
                {/* Notification badge */}
                {notificationCount > 0 && (
                  <div 
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-xs font-medium flex items-center justify-center"
                    style={{
                      backgroundColor: '#ef4444',
                      color: '#ffffff'
                    }}
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
                    className="absolute right-0 mt-2 w-80 rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
                    style={{
                      backgroundColor: '#ffffff',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <div className="py-2">
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <h3 
                          className="text-lg font-semibold"
                          style={{ color: 'var(--dashboard-very-light-blue)' }}
                        >
                          {t('dashboard.header.upcoming_meetings')}
                        </h3>
                      </div>
                      
                      {/* Notifications List */}
                      <div className="py-1">
                        {upcomingEvents.length === 0 ? (
                          <div className="px-4 py-6 text-center">
                            <Bell 
                              className="h-8 w-8 mx-auto mb-2" 
                              style={{ color: 'var(--dashboard-light-blue)50' }}
                            />
                            <p style={{ color: 'var(--dashboard-light-blue)' }}>
                              {t('dashboard.header.no_upcoming')}
                            </p>
                          </div>
                        ) : (
                          upcomingEvents.map((event, index) => (
                            <div
                              key={event.id}
                              className="px-4 py-3 transition-all duration-200 cursor-pointer border-b border-gray-100 last:border-b-0"
                              style={{ color: 'var(--dashboard-very-light-blue)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#C6DFFF10';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <div className="flex items-start space-x-3">
                                <div 
                                  className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                                  style={{
                                    background: `linear-gradient(135deg, var(--dashboard-bright-blue), var(--dashboard-light-blue))`
                                  }}
                                >
                                  <Video 
                                    className="h-4 w-4" 
                                    style={{ color: 'var(--dashboard-black)' }}
                                  />
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
                                    <span 
                                      className="text-xs"
                                      style={{ color: 'var(--dashboard-light-blue)' }}
                                    >
                                      {formatTime(event.start_time)}
                                    </span>
                                    {event.attendees.length > 0 && (
                                      <>
                                        <span style={{ color: 'var(--dashboard-light-blue)' }}>•</span>
                                        <span 
                                          className="text-xs"
                                          style={{ color: 'var(--dashboard-light-blue)' }}
                                        >
                                          {event.attendees.length === 1 
                                            ? t('calendar.attendee').replace('{count}', event.attendees.length.toString())
                                            : t('calendar.attendees').replace('{count}', event.attendees.length.toString())}
                                        </span>
                                      </>
                                    )}
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
                                    title={t('calendar.join_meeting')}
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
                className="flex items-center space-x-3 p-2 rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300 cursor-pointer"
                style={{
                  backgroundColor: 'var(--dashboard-very-light-blue)10'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--dashboard-very-light-blue)20';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--dashboard-very-light-blue)10';
                }}
              >
                {/* User Avatar */}
                <div 
                  className="h-8 w-8 rounded-full flex items-center justify-center overflow-hidden"
                  style={{
                    background: displayAvatar ? 'transparent' : `linear-gradient(135deg, var(--dashboard-bright-blue), var(--dashboard-light-blue))`
                  }}
                >
                  {displayAvatar ? (
                    <img 
                      src={displayAvatar} 
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User 
                      className="h-4 w-4" 
                      style={{ color: 'var(--dashboard-black)' }}
                    />
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p 
                    className="text-sm font-medium"
                    style={{ color: 'var(--dashboard-very-light-blue)' }}
                  >
                    {displayName}
                  </p>
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--dashboard-light-blue)' }}
                  >
                    {displayEmail}
                  </p>
                </div>
                <ChevronDown 
                  className="h-4 w-4 ml-1 transition-transform duration-200"
                  style={{ 
                    color: 'var(--dashboard-light-blue)',
                    transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                />
              </motion.button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl border border-gray-200 z-50"
                    style={{
                      backgroundColor: '#ffffff',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <div className="py-2">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="h-10 w-10 rounded-full flex items-center justify-center overflow-hidden"
                            style={{
                              background: displayAvatar ? 'transparent' : `linear-gradient(135deg, var(--dashboard-bright-blue), var(--dashboard-light-blue))`
                            }}
                          >
                            {displayAvatar ? (
                              <img 
                                src={displayAvatar} 
                                alt={displayName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User 
                                className="h-5 w-5" 
                                style={{ color: 'var(--dashboard-black)' }}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p 
                              className="text-sm font-medium truncate"
                              style={{ color: 'var(--dashboard-very-light-blue)' }}
                            >
                              {displayName}
                            </p>
                            <p 
                              className="text-xs truncate"
                              style={{ color: 'var(--dashboard-light-blue)' }}
                            >
                              {displayEmail}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-1">
                        <button
                          onClick={() => setShowUserMenu(false)}
                          className="flex w-full items-center px-4 py-2 text-sm transition-all duration-200 cursor-pointer"
                          style={{ color: 'var(--dashboard-very-light-blue)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#C6DFFF20';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <SettingsIcon 
                            className="mr-3 h-4 w-4" 
                            style={{ color: 'var(--dashboard-light-blue)' }}
                          />
                          {t('dashboard.header.account_settings')}
                        </button>
                        
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-2 text-sm transition-all duration-200 cursor-pointer"
                          style={{ color: 'var(--dashboard-very-light-blue)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#C6DFFF20';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <LogOut 
                            className="mr-3 h-4 w-4" 
                            style={{ color: 'var(--dashboard-light-blue)' }}
                          />
                          {t('dashboard.header.logout')}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}; 