import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useTheme } from '../../shared/contexts/ThemeContext';
import Header from './components/header';
import Hero from './components/hero';
import Features from './components/features';
import Integrations from './components/integrations';
import Reviews from './components/reviews';
import Pricing from './components/pricing';
import FAQ from './components/faq';
import Footer from './components/footer';
import MobileCTA from './components/mobile-cta';

const Landing: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Theme-based classes
  const getThemeClasses = () => {
    return {
      background: theme === 'dark' ? 'bg-gray-900' : 'bg-white',
      loadingSpinner: theme === 'dark' ? 'border-white' : 'border-black',
    };
  };

  const themeClasses = getThemeClasses();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className={`min-h-screen ${themeClasses.background} flex items-center justify-center`}>
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${themeClasses.loadingSpinner}`}></div>
      </div>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={themeClasses.background}
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <Header />
      <Hero />
      <Features />
      <Integrations />
      <Reviews />
      <Pricing />
      <FAQ />
      <Footer />
      <MobileCTA />
    </motion.main>
  );
};

export default Landing; 