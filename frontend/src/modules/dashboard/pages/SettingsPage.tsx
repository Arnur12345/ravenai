import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../components/DashboardLayout';
import { 
  Camera,
  ChevronDown,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { userApi } from '@/shared/api/userApi';
import { useAuth } from '@/shared/contexts/AuthContext';
import type { 
  UserProfile, 
  UserProfileUpdate, 
  UserPreferences, 
  UserPreferencesUpdate,
  ChangePasswordRequest,
  LinkedAccount 
} from '@/shared/types/user';
import { useLanguage } from '@/shared/contexts/LanguageContext';

export const SettingsPage: React.FC = () => {
  const { t } = useLanguage();
  // Auth context
  const { updateUser } = useAuth();
  
  // State management
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [activeTab, setActiveTab] = useState('Account');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [profileForm, setProfileForm] = useState<UserProfileUpdate>({});
  const [preferencesForm, setPreferencesForm] = useState<UserPreferencesUpdate>({});
  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Performance tracking state
  const [dailyTimeUtilization, setDailyTimeUtilization] = useState(7);
  const [coreWorkRange, setCoreWorkRange] = useState([3, 6]);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [profile, preferences, accounts] = await Promise.all([
        userApi.getCurrentUserProfile(),
        userApi.getUserPreferences(),
        userApi.getLinkedAccounts()
      ]);

      setUserProfile(profile);
      setUserPreferences(preferences);
      setLinkedAccounts(accounts.accounts);
      
      // Initialize forms with current data
      setProfileForm({
        name: profile.name,
        surname: profile.surname || '',
        email: profile.email,
        job_title: profile.job_title || '',
        company: profile.company || '',
        avatar_url: profile.avatar_url || ''
      });
      
      setPreferencesForm({
        timezone: preferences.timezone,
        notifications_email: preferences.notifications_email,
        notifications_push: preferences.notifications_push,
        notifications_slack: preferences.notifications_slack,
        notifications_summary: preferences.notifications_summary
      });

    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load user settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (message: string, isError = false) => {
    if (isError) {
      setError(message);
      setSuccessMessage(null);
    } else {
      setSuccessMessage(message);
      setError(null);
    }
    
    setTimeout(() => {
      setError(null);
      setSuccessMessage(null);
    }, 5000);
  };

  const handleProfileSave = async () => {
    try {
      setIsSaving(true);
      const updatedProfile = await userApi.updateUserProfile(profileForm);
      setUserProfile(updatedProfile);
      
      // Update the AuthContext with the new user data so Header updates immediately
      updateUser({
        name: updatedProfile.name,
        email: updatedProfile.email,
        avatar: updatedProfile.avatar_url
      });
      
      showMessage('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      showMessage('Failed to update profile. Please try again.', true);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferencesSave = async () => {
    try {
      setIsSaving(true);
      const updatedPreferences = await userApi.updateUserPreferences(preferencesForm);
      setUserPreferences(updatedPreferences);
      showMessage('Preferences updated successfully!');
    } catch (err) {
      console.error('Error updating preferences:', err);
      showMessage('Failed to update preferences. Please try again.', true);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    t('settings.account'),
    t('settings.notifications'),
    t('settings.sharing'),
    t('settings.update_schedule'),
    t('settings.billing'),
    t('settings.questions')
  ];

  const timezones = [
    { value: 'America/New_York', label: 'UTC/GMT -4 hours' },
    { value: 'America/Chicago', label: 'UTC/GMT -5 hours' },
    { value: 'America/Denver', label: 'UTC/GMT -6 hours' },
    { value: 'America/Los_Angeles', label: 'UTC/GMT -7 hours' },
    { value: 'Europe/London', label: 'UTC/GMT +1 hour' },
    { value: 'Europe/Paris', label: 'UTC/GMT +2 hours' },
    { value: 'Asia/Tokyo', label: 'UTC/GMT +9 hours' },
    { value: 'UTC', label: 'UTC/GMT +0 hours' }
  ];

  const dateFormats = [
    { value: 'dd/mm/yyyy', label: 'dd/mm/yyyy 00:00' },
    { value: 'mm/dd/yyyy', label: 'mm/dd/yyyy 00:00' },
    { value: 'yyyy-mm-dd', label: 'yyyy-mm-dd 00:00' }
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="text-gray-500 text-lg">{t('settings.loading')}</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">{t('settings.title')}</h1>
            <p className="text-gray-600">{t('settings.subtitle')}</p>
          </div>

          {/* Notifications */}
          {error && (
        <motion.div
              initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"
        >
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
        </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3"
            >
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <p className="text-green-700">{successMessage}</p>
            </motion.div>
          )}

          {/* Tabs */}
          <div className="mb-8 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Account Tab Content */}
          {activeTab === 'Account' && (
            <div className="space-y-8">
              {/* Profile Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-1">{t('settings.profile')}</h2>
                  <p className="text-sm text-gray-600">{t('settings.profile_subtitle')}</p>
                </div>

                <div className="flex items-start space-x-6 mb-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-semibold">
                      {userProfile?.name.charAt(0).toUpperCase()}
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <Camera className="w-3 h-3 text-gray-600" />
                    </button>
              </div>
              
                  {/* Name and Edit Photo */}
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.name')}</label>
                  <input
                    type="text"
                          value={profileForm.name || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Bartosz"
                  />
                </div>
                <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.surname')}</label>
                        <input
                          type="text"
                          value={profileForm.surname || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, surname: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Mcdaniel"
                        />
                      </div>
                    </div>
                    <button className="text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center">
                      <Camera className="w-4 h-4 mr-1" />
                      {t('settings.edit_photo')}
                    </button>
                  </div>
                </div>

                {/* Email */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.email')}</label>
                  <input
                    type="email"
                    value={profileForm.email || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="bartmcdaniel@niceguys.com"
                  />
                </div>
              </div>

              {/* Timezone & Preferences */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-1">{t('settings.timezone_preferences')}</h2>
                  <p className="text-sm text-gray-600">{t('settings.timezone_preferences_subtitle')}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.city')}</label>
                  <input
                    type="text"
                      defaultValue="New York"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.timezone')}</label>
                    <div className="relative">
                      <select
                        value={preferencesForm.timezone || 'America/New_York'}
                        onChange={(e) => setPreferencesForm({ ...preferencesForm, timezone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none pr-8"
                      >
                        {timezones.map((tz) => (
                          <option key={tz.value} value={tz.value}>
                            {tz.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.date_time_format')}</label>
                    <div className="relative">
                      <select
                        defaultValue="dd/mm/yyyy"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none pr-8"
                      >
                        {dateFormats.map((format) => (
                          <option key={format.value} value={format.value}>
                            {format.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Motivation & Performance Setup */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-1">{t('settings.motivation_performance_setup')}</h2>
                  <p className="text-sm text-gray-600">{t('settings.motivation_performance_setup_subtitle')}</p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  {/* Daily Time Utilization */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-sm font-medium text-gray-700">{t('settings.desired_daily_time_utilization')}</label>
                      <span className="text-sm font-medium text-gray-900">{dailyTimeUtilization} hrs</span>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="4"
                        max="12"
                        value={dailyTimeUtilization}
                        onChange={(e) => setDailyTimeUtilization(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>4h</span>
                        <span>12h</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {t('settings.desired_daily_time_utilization_description')}
                    </p>
              </div>
              
                  {/* Core Work Range */}
                    <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-sm font-medium text-gray-700">{t('settings.desired_daily_core_work_range')}</label>
                      <span className="text-sm font-medium text-gray-900">{coreWorkRange[0]}-{coreWorkRange[1]} hrs</span>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="2"
                        max="8"
                        value={coreWorkRange[1]}
                        onChange={(e) => setCoreWorkRange([coreWorkRange[0], parseInt(e.target.value)])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>2h</span>
                        <span>8h</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {t('settings.desired_daily_core_work_range_description')}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Your Work */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-1">{t('settings.your_work')}</h2>
                  <p className="text-sm text-gray-600">{t('settings.your_work_subtitle')}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.function')}</label>
                    <input
                      type="text"
                      value={profileForm.company || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Design"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.job_title')}</label>
                    <input
                      type="text"
                      value={profileForm.job_title || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, job_title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Team Lead designer"
                    />
                  </div>
                </div>

                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.responsibilities')}</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Describe your key responsibilities..."
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleProfileSave}
                  disabled={isSaving}
                  className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('settings.saving')}...
                    </>
                  ) : (
                    <>
                <Save className="h-4 w-4 mr-2" />
                {t('settings.save_changes')}
                    </>
                  )}
              </Button>
              </div>
            </div>
          )}

          {/* Other Tab Placeholders */}
          {activeTab !== 'Account' && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-2">{activeTab}</h2>
              <p className="text-gray-600">{t('settings.coming_soon')}</p>
          </div>
          )}
        </div>

                 {/* Custom Slider Styles */}
         <style>{`
           .slider::-webkit-slider-thumb {
             appearance: none;
             width: 20px;
             height: 20px;
             border-radius: 50%;
             background: #1f2937;
             cursor: pointer;
             border: 2px solid white;
             box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
           }
           
           .slider::-moz-range-thumb {
             width: 20px;
             height: 20px;
             border-radius: 50%;
             background: #1f2937;
             cursor: pointer;
             border: 2px solid white;
             box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
           }
         `}</style>
      </div>
    </DashboardLayout>
  );
}; 