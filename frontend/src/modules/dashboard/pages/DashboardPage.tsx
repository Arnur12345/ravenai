import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { MeetingChart } from '../components/MeetingChart';
import { NewMeetingModal } from '../components/NewMeetingModal';
import { StatsCard } from '../components/StatsCard';
import { UpcomingEventsCard } from '../components/UpcomingEventsCard';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Users, 
  TrendingUp, 
  Play,
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { dashboardApi } from '@/shared/api/dashboardApi';
import { useTasks } from '@/shared/hooks/useTasks';
import type { DashboardStats, Meeting, CreateMeetingRequest } from '@/shared/types/dashboard';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
  const [chartData, setChartData] = useState<Array<{
    date: string;
    meetings: number;
    summaries: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Используем хук для загрузки тасков из summary
  const { tasks, isLoading: isTasksLoading, error: tasksError, toggleTaskCompletion, loadTasks } = useTasks();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch dashboard overview
      const overview = await dashboardApi.getDashboardOverview();
      setStats(overview.stats);
      setRecentMeetings(overview.recent_meetings);

      // Fetch chart data
      const trends = await dashboardApi.getMeetingTrends(7);
      setChartData(trends);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
      
      // Set fallback data
      setStats({
        total_meetings: 0,
        total_summaries: 0,
        total_tasks: 0,
        meetings_this_month: 0,
        summaries_this_month: 0,
        avg_meeting_duration_minutes: 0
      });
      setRecentMeetings([]);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMeeting = async (meetingData: CreateMeetingRequest) => {
    try {
      setIsCreatingMeeting(true);
      const newMeeting = await dashboardApi.createMeeting(meetingData);
      
      // Refresh dashboard data to show the new meeting
      await loadDashboardData();
      
      // Refresh tasks as well
      await loadTasks();
      
      // Navigate to the meeting workspace
      navigate(`/meetings/${newMeeting.id}`);
      
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error; // Re-throw to let the modal handle the error display
    } finally {
      setIsCreatingMeeting(false);
    }
  };

  // Create metrics from stats
  const metrics = stats ? [
    {
      title: t('dashboard.total_meetings'),
      value: stats.total_meetings.toString(),
      change: stats.meetings_this_month > 0 ? `+${stats.meetings_this_month} ${t('general.this_month')}` : `${t('general.this_month')} 0`,
      trend: {
        value: 12,
        isPositive: true,
        label: t('general.this_month')
      },
      icon: Calendar
    },
    {
      title: t('dashboard.total_summaries'),
      value: stats.total_summaries.toString(),
      change: stats.summaries_this_month > 0 ? `+${stats.summaries_this_month} ${t('general.this_month')}` : `${t('general.this_month')} 0`,
      trend: {
        value: 8,
        isPositive: true,
        label: t('general.this_month')
      },
      icon: CheckCircle
    },
    {
      title: t('dashboard.tasks_created'),
      value: stats.total_tasks.toString(),
      change: '+23%',
      trend: {
        value: 23,
        isPositive: true,
        label: t('general.last_month')
      },
      icon: TrendingUp
    }
  ] : [];

  // Tasks теперь загружаются через useTasks хук

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <p style={{ color: 'var(--dashboard-light-blue)' }} className="mb-4">{t('dashboard.failed_load')}</p>
            <Button 
              onClick={loadDashboardData} 
              style={{
                backgroundColor: 'var(--dashboard-bright-blue)',
                color: 'var(--dashboard-black)',
                fontFamily: 'Gilroy, Inter, sans-serif'
              }}
            >
              {t('dashboard.retry')}
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6" style={{ fontFamily: 'Gilroy, Inter, sans-serif' }}>
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 
              className="text-3xl font-bold"
              style={{ color: 'var(--dashboard-very-light-blue)' }}
            >
              {t('dashboard.welcome')}
            </h1>
            <p 
              className="mt-1"
              style={{ color: 'var(--dashboard-light-blue)' }}
            >
              Here's what's happening with your meetings today.
            </p>
          </div>
          <Button 
            onClick={() => setIsNewMeetingModalOpen(true)}
            className="flex items-center rounded-xl px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200"
            style={{
              background: 'linear-gradient(to bottom, #3B3B3B, #636363)',
              color: 'white',
              fontFamily: 'Gilroy, Inter, sans-serif'
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('dashboard.new_meeting')}
          </Button>
        </motion.div>

        {/* Metrics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <div 
                key={index} 
                className="rounded-2xl border border-gray-200 p-6 backdrop-blur-sm"
                style={{
                  backgroundColor: 'var(--dashboard-black)'
                }}
              >
                <div className="animate-pulse">
                  <div 
                    className="h-4 rounded mb-2"
                    style={{ backgroundColor: 'var(--dashboard-light-blue)30' }}
                  ></div>
                  <div 
                    className="h-8 rounded mb-2"
                    style={{ backgroundColor: 'var(--dashboard-light-blue)30' }}
                  ></div>
                  <div 
                    className="h-4 rounded w-1/2"
                    style={{ backgroundColor: 'var(--dashboard-light-blue)30' }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            metrics.map((metric, index) => (
              <StatsCard
                key={metric.title}
                name={metric.title}
                value={metric.value}
                icon={metric.icon}
                trend={metric.trend}
                index={index}
              />
            ))
          )}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Charts and Meetings */}
          <div className="xl:col-span-2 space-y-6">
            {/* Meeting Activity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <MeetingChart data={chartData} isLoading={isLoading} />
            </motion.div>

            {/* Recent Meetings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="rounded-2xl border border-gray-200 p-6 backdrop-blur-sm"
              style={{
                backgroundColor: 'var(--dashboard-black)'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 
                  className="text-xl font-bold"
                  style={{ color: 'var(--dashboard-very-light-blue)' }}
                >
                  {t('dashboard.recent_meetings')}
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-sm font-medium"
                  style={{ color: 'var(--dashboard-bright-blue)' }}
                >
                  View all
                </Button>
              </div>
              
              <div className="space-y-3">
                {recentMeetings.length > 0 ? recentMeetings.map((meeting, index) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-200 transition-all duration-200 group cursor-pointer hover:border-gray-300"
                    style={{
                      backgroundColor: 'var(--dashboard-very-light-blue)10'
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <div 
                        className="h-10 w-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, var(--dashboard-bright-blue), var(--dashboard-light-blue))`
                        }}
                      >
                        <Calendar 
                          className="h-5 w-5" 
                          style={{ color: 'var(--dashboard-black)' }}
                        />
                      </div>
                      <div>
                        <h4 
                          className="font-medium group-hover:opacity-80 transition-opacity duration-200"
                          style={{ color: 'var(--dashboard-very-light-blue)' }}
                        >
                          {meeting.meeting_platform} Meeting
                        </h4>
                        <p 
                          className="text-sm"
                          style={{ color: 'var(--dashboard-light-blue)' }}
                        >
                          {new Date(meeting.created_at).toLocaleDateString()} • {meeting.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {meeting.summary && (
                        <span 
                          className="text-xs px-2 py-1 rounded-full border border-gray-200"
                          style={{
                            backgroundColor: 'var(--dashboard-bright-blue)20',
                            color: 'var(--dashboard-bright-blue)'
                          }}
                        >
                          Summary ready
                        </span>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        style={{ color: 'var(--dashboard-light-blue)' }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-8">
                    <Calendar 
                      className="h-12 w-12 mx-auto mb-4" 
                      style={{ color: 'var(--dashboard-light-blue)50' }}
                    />
                    <p style={{ color: 'var(--dashboard-light-blue)' }}>No recent meetings found</p>
                    <p 
                      className="text-sm mt-1"
                      style={{ color: 'var(--dashboard-light-blue)70' }}
                    >
                      Start your first meeting to see it here
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Upcoming Events and Tasks Panel */}
          <div className="space-y-6">
            {/* Upcoming Events Card */}
            <UpcomingEventsCard />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="rounded-2xl border border-gray-200 p-6 backdrop-blur-sm"
              style={{
                backgroundColor: 'var(--dashboard-black)'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 
                  className="text-xl font-bold"
                  style={{ color: 'var(--dashboard-very-light-blue)' }}
                >
                  {t('dashboard.tasks')}
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  style={{ color: 'var(--dashboard-bright-blue)' }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {isTasksLoading ? (
                  <div className="text-center py-8">
                    <div 
                      className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                      style={{ borderColor: 'var(--dashboard-bright-blue)' }}
                    />
                    <p style={{ color: 'var(--dashboard-light-blue)' }}>Loading tasks...</p>
                  </div>
                ) : tasksError ? (
                  <div className="text-center py-8">
                    <p style={{ color: 'var(--dashboard-light-blue)' }}>{tasksError}</p>
                    <Button 
                      onClick={loadTasks} 
                      size="sm"
                      className="mt-2"
                      style={{
                        backgroundColor: 'var(--dashboard-bright-blue)',
                        color: 'var(--dashboard-black)'
                      }}
                    >
                      Retry
                    </Button>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp 
                      className="h-12 w-12 mx-auto mb-4" 
                      style={{ color: 'var(--dashboard-light-blue)50' }}
                    />
                    <p style={{ color: 'var(--dashboard-light-blue)' }}>No tasks found</p>
                    <p 
                      className="text-sm mt-1"
                      style={{ color: 'var(--dashboard-light-blue)70' }}
                    >
                      Tasks will appear here when you have meeting summaries
                    </p>
                  </div>
                ) : (
                  tasks.slice(0, 5).map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                      className={`p-4 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer group ${
                        task.completed ? 'opacity-60' : ''
                      }`}
                      style={{
                        backgroundColor: task.completed 
                          ? 'var(--dashboard-dark-brown)20' 
                          : 'var(--dashboard-very-light-blue)10'
                      }}
                      onClick={() => toggleTaskCompletion(task.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className={`h-4 w-4 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                              task.completed ? 'bg-opacity-100' : ''
                            }`}
                            style={{
                              backgroundColor: task.completed ? 'var(--dashboard-bright-blue)' : 'transparent',
                              borderColor: 'var(--dashboard-bright-blue)'
                            }}
                          >
                            {task.completed && (
                              <CheckCircle 
                                className="h-3 w-3 text-white" 
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 
                              className={`font-medium text-sm ${task.completed ? 'line-through' : ''} truncate`}
                              style={{ color: 'var(--dashboard-very-light-blue)' }}
                              title={task.task_name}
                            >
                              {task.task_name}
                            </h4>
                            <p 
                              className="text-xs mt-1"
                              style={{ color: 'var(--dashboard-light-blue)' }}
                            >
                              Due {new Date(task.deadline).toLocaleDateString()} • {task.assignee}
                            </p>
                            {task.meeting_title && (
                              <p 
                                className="text-xs mt-1 opacity-75"
                                style={{ color: 'var(--dashboard-light-blue)' }}
                              >
                                From: {task.meeting_title}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {task.source && (
                            <span 
                              className="text-xs px-2 py-1 rounded-full border border-gray-200 text-blue-400 bg-blue-500/10"
                            >
                              {task.source === 'summary' ? 'Summary' : 'Notes'}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* New Meeting Modal */}
      <NewMeetingModal
        isOpen={isNewMeetingModalOpen}
        onClose={() => setIsNewMeetingModalOpen(false)}
        onSubmit={handleCreateMeeting}
        isLoading={isCreatingMeeting}
      />
    </DashboardLayout>
  );
}; 