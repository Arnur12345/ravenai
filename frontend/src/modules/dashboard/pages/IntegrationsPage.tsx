import React from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../components/DashboardLayout';
import { 
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { SlackIntegrationModal } from '../components/SlackIntegrationModal';
import { useLanguage } from '@/shared/contexts/LanguageContext';

// Import icons
import slackIcon from '@/assets/slackicon.png';
import telegramIcon from '@/assets/telegramicon.png';
import jiraIcon from '@/assets/jiraicon.png';
import hubspotIcon from '@/assets/hubspoticon.png';


// Integration card component
interface IntegrationCardProps {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isEnabled: boolean;
  isComingSoon?: boolean;
  onToggle: (id: string) => void;
  onDetailsClick: (id: string) => void;
  onConnect?: () => void;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  id,
  name,
  description,
  icon,
  isEnabled,
  isComingSoon = false,
  onToggle,
  onDetailsClick,
  onConnect
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 ${
        isComingSoon ? 'relative overflow-hidden' : ''
      }`}
    >
      {/* Coming Soon Badge */}
      {isComingSoon && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Coming Soon
          </span>
        </div>
      )}

      {/* Header with icon and toggle */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center ${
            isComingSoon ? 'opacity-60' : ''
          }`}>
            {icon}
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold text-lg ${
              isComingSoon ? 'text-gray-500' : 'text-gray-900'
            }`}>
              {name}
            </h3>
          </div>
        </div>
        
        {/* Toggle Switch - disabled for coming soon */}
        {!isComingSoon && (
          <div className="flex items-center">
            <button
              onClick={() => onToggle(id)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                isEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      <p className={`text-sm mb-6 leading-relaxed ${
        isComingSoon ? 'text-gray-500' : 'text-gray-600'
      }`}>
        {description}
      </p>

      {/* Footer with buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDetailsClick(id)}
          disabled={isComingSoon}
          className={`${
            isComingSoon 
              ? 'text-gray-400 border-gray-200 cursor-not-allowed' 
              : 'text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          Details
        </Button>
        
        <div className="flex items-center space-x-2">
          {onConnect && !isEnabled && !isComingSoon && (
            <Button
              variant="default"
              size="sm"
              onClick={onConnect}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Connect
            </Button>
          )}
          <button 
            className={`p-1 rounded-md transition-colors ${
              isComingSoon 
                ? 'cursor-not-allowed' 
                : 'hover:bg-gray-100'
            }`}
            onClick={() => !isComingSoon && console.log('More options for', name)}
            disabled={isComingSoon}
          >
            <MoreHorizontal className={`w-4 h-4 ${
              isComingSoon ? 'text-gray-400' : 'text-gray-500'
            }`} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const integrations = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send meeting summaries and action items to Slack channels.',
    icon: <img src={slackIcon} alt="Slack" className="w-8 h-8" />,
    status: 'available',
    isComingSoon: false
  },

  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Send notifications and summaries to your Telegram channels.',
    icon: <img src={telegramIcon} alt="Telegram" className="w-8 h-8 grayscale opacity-60" />,
    status: 'coming-soon',
    isComingSoon: true
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Create issues and tasks automatically from meeting action items.',
    icon: <img src={jiraIcon} alt="Jira" className="w-8 h-8 grayscale opacity-60" />,
    status: 'coming-soon',
    isComingSoon: true
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Integrate HubSpot to manage your CRM and marketing automation.',
    icon: <img src={hubspotIcon} alt="HubSpot" className="w-8 h-8 grayscale opacity-60" />,
    status: 'coming-soon',
    isComingSoon: true
  }
];

export const IntegrationsPage: React.FC = () => {
  const { t } = useLanguage();
  const [isSlackModalOpen, setIsSlackModalOpen] = React.useState(false);
  const [enabledIntegrations, setEnabledIntegrations] = React.useState<Record<string, boolean>>({
    // Only Slack can be enabled for now, others are coming soon
  });

  const handleToggle = (id: string) => {
    // Only allow toggling for non-coming-soon integrations
    const integration = integrations.find(int => int.id === id);
    if (!integration?.isComingSoon) {
      setEnabledIntegrations(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    }
  };

  const handleDetailsClick = (id: string) => {
    const integration = integrations.find(int => int.id === id);
    if (!integration?.isComingSoon) {
      console.log('Details clicked for:', id);
    }
  };

  const handleConnect = (id: string) => {
    if (id === 'slack') {
      setIsSlackModalOpen(true);
    } else {
      console.log('Connect clicked for:', id);
    }
  };

  const handleSlackSuccess = (integration: any) => {
    console.log('Slack integration successful:', integration);
    setEnabledIntegrations(prev => ({
      ...prev,
      'slack': true
    }));
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <DashboardLayout>
        <div 
          className="min-h-screen p-6" 
          style={{ 
            backgroundColor: '#f9fafb',
            marginLeft: '-2rem',
            marginRight: '-2rem',
            marginTop: '-2.5rem',
            marginBottom: '-2.5rem',
            paddingLeft: '2rem',
            paddingRight: '2rem',
            paddingTop: '2.5rem',
            paddingBottom: '2.5rem'
          }}
        >
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <span>{t('general.home')}</span>
            <span>&gt;</span>
            <span className="text-gray-900">{t('integrations.title')}</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('integrations.title')}
          </h1>
        </motion.div>

        {/* Integrations Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {integrations.map((integration, index) => (
            <IntegrationCard
              key={integration.id}
              id={integration.id}
              name={integration.name}
              description={integration.description}
              icon={integration.icon}
              isEnabled={!!enabledIntegrations[integration.id]}
              isComingSoon={integration.isComingSoon}
              onToggle={handleToggle}
              onDetailsClick={handleDetailsClick}
              onConnect={integration.id === 'slack' && !integration.isComingSoon ? () => handleConnect(integration.id) : undefined}
            />
          ))}
        </motion.div>
        
        {/* Slack Integration Modal */}
        <SlackIntegrationModal
          isOpen={isSlackModalOpen}
          onClose={() => setIsSlackModalOpen(false)}
          onSuccess={handleSlackSuccess}
        />
      </div>
    </DashboardLayout>
    </div>
  );
}; 