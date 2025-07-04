import React from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardPage } from '../pages/DashboardPage';
import { IntegrationsPage } from '../pages/IntegrationsPage';
import { MeetingsPage } from '../pages/MeetingsPage';
import { SettingsPage } from '../pages/SettingsPage';

export const DashboardRouter: React.FC = () => {
  const location = useLocation();

  const renderPage = () => {
    switch (location.pathname) {
      case '/integrations':
        return <IntegrationsPage />;
      case '/meetings':
        return <MeetingsPage />;
      case '/settings':
        return <SettingsPage />;
      case '/dashboard':
      default:
        return <DashboardPage />;
    }
  };

  return <>{renderPage()}</>;
}; 