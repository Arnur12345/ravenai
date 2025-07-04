import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Video, ExternalLink } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useLanguage } from '@/shared/contexts/LanguageContext';

interface CalendarAttendee {
  email: string;
  name?: string;
  status?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  meeting_url?: string;
  attendees: CalendarAttendee[];
  organizer?: CalendarAttendee;
  location?: string;
}

interface UpcomingEventsResponse {
  events: CalendarEvent[];
  total_count: number;
}

export const UpcomingEventsCard: React.FC = () => {
  const { t } = useLanguage();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch('/api/calendar/upcoming-events?limit=3', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }

      const data: UpcomingEventsResponse = await response.json();
      setEvents(data.events || []);

    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      setError('Failed to load upcoming events');
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return t('events.today');
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return t('events.tomorrow');
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getAttendeeInitials = (attendee: CalendarAttendee) => {
    if (attendee.name) {
      return attendee.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return attendee.email.split('@')[0].slice(0, 2).toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-2xl border border-gray-200 p-6 backdrop-blur-sm"
      style={{
        backgroundColor: 'var(--dashboard-black)',
        fontFamily: 'Gilroy, Inter, sans-serif'
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 
          className="text-xl font-bold"
          style={{ color: 'var(--dashboard-very-light-blue)' }}
        >
          {t('events.upcoming')}
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-sm font-medium"
          style={{ color: 'var(--dashboard-bright-blue)' }}
          onClick={fetchUpcomingEvents}
        >
          {t('events.refresh')}
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div 
              className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: 'var(--dashboard-bright-blue)' }}
            />
            <p style={{ color: 'var(--dashboard-light-blue)' }}>{t('events.loading')}</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <Calendar 
              className="h-12 w-12 mx-auto mb-4" 
              style={{ color: 'var(--dashboard-light-blue)50' }}
            />
            <p style={{ color: 'var(--dashboard-light-blue)' }}>{t('events.failed_load')}</p>
            <Button 
              onClick={fetchUpcomingEvents} 
              size="sm"
              className="mt-2"
              style={{
                backgroundColor: 'var(--dashboard-bright-blue)',
                color: 'var(--dashboard-black)'
              }}
            >
              {t('events.retry')}
            </Button>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <Calendar 
              className="h-12 w-12 mx-auto mb-4" 
              style={{ color: 'var(--dashboard-light-blue)50' }}
            />
            <p style={{ color: 'var(--dashboard-light-blue)' }}>{t('events.no_upcoming')}</p>
            <p 
              className="text-sm mt-1"
              style={{ color: 'var(--dashboard-light-blue)70' }}
            >
              {t('events.will_appear_here')}
            </p>
          </div>
        ) : (
          events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 transition-all duration-200 group cursor-pointer hover:border-gray-300"
              style={{
                backgroundColor: 'var(--dashboard-very-light-blue)10'
              }}
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div 
                  className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, var(--dashboard-bright-blue), var(--dashboard-light-blue))`
                  }}
                >
                  <Video 
                    className="h-5 w-5" 
                    style={{ color: 'var(--dashboard-black)' }}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 
                    className="font-medium group-hover:opacity-80 transition-opacity duration-200 truncate"
                    style={{ color: 'var(--dashboard-very-light-blue)' }}
                    title={event.title}
                  >
                    {event.title}
                  </h4>
                  <div className="flex items-center space-x-3 mt-1">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" style={{ color: 'var(--dashboard-light-blue)' }} />
                      <span 
                        className="text-xs"
                        style={{ color: 'var(--dashboard-light-blue)' }}
                      >
                        {formatDate(event.start_time)} • {formatTime(event.start_time)}
                      </span>
                    </div>
                    
                    {event.attendees.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" style={{ color: 'var(--dashboard-light-blue)' }} />
                        <div className="flex -space-x-1">
                          {event.attendees.slice(0, 3).map((attendee, idx) => (
                            <div
                              key={idx}
                              className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-medium border border-gray-300 cursor-pointer hover:z-10 relative"
                              style={{
                                backgroundColor: 'var(--dashboard-bright-blue)',
                                color: 'var(--dashboard-black)'
                              }}
                              title={attendee.name || attendee.email}
                            >
                              {getAttendeeInitials(attendee)}
                            </div>
                          ))}
                          {event.attendees.length > 3 && (
                            <div
                              className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-medium border border-gray-300"
                              style={{
                                backgroundColor: 'var(--dashboard-light-blue)30',
                                color: 'var(--dashboard-very-light-blue)'
                              }}
                              title={`+${event.attendees.length - 3} more`}
                            >
                              +{event.attendees.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                {event.meeting_url ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(event.meeting_url, '_blank');
                    }}
                    className="h-8 w-8 p-0"
                    style={{ color: 'var(--dashboard-bright-blue)' }}
                    title={t('events.join_meeting')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                ) : (
                  <span className="text-xs" style={{ color: 'var(--dashboard-light-blue)' }}>{t('events.no_link')}</span>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}; 