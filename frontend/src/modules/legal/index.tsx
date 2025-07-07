import React from 'react';
import { useLocation } from 'react-router-dom';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';

const Legal: React.FC = () => {
  const location = useLocation();
  
  // Route to the appropriate page based on the current path
  if (location.pathname === '/privacy-policy') {
    return <PrivacyPolicyPage />;
  } else if (location.pathname === '/terms-of-service') {
    return <TermsOfServicePage />;
  }
  
  // Default fallback (shouldn't happen with proper routing)
  return <PrivacyPolicyPage />;
};

export default Legal; 