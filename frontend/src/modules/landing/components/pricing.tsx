import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PricingCard from '@/shared/ui/pricing-card';
import { Button } from '@/shared/ui/button';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { subscriptionApi } from '@/shared/api/subscriptionApi';

interface PricingPlan {
  name: string;
  description: string;
  monthlyPrice: number | string;
  annualPrice: number | string;
  features: string[];
  popular?: boolean;
  isEnterprise?: boolean;
  planId?: string; // Add plan ID for subscription
}

const Pricing: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // Black theme styling for consistency with hero and reviews
  const getThemeClasses = () => {
    return {
      sectionBackground: 'bg-black',
      backgroundElement1: 'bg-gradient-to-r from-blue-600/15 via-purple-600/10 to-cyan-600/15',
      backgroundElement2: 'bg-gradient-to-r from-emerald-600/10 via-teal-600/15 to-blue-600/10',
      title: 'bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent',
      subtitle: 'text-white/80',
      toggleActiveText: 'text-white',
      toggleInactiveText: 'text-white/60',
      toggleBackground: 'rgba(255, 255, 255, 0.1)',
      toggleBackgroundActive: 'rgba(255, 255, 255, 0.2)',
      discountBadge: 'bg-blue-900/50 text-blue-200 border-blue-700/50',
      noteText: 'text-white/60',
      mobileCard: 'bg-white/10 border-white/20 backdrop-blur-xl',
      mobileText: 'text-white/80',
    };
  };

  const themeClasses = getThemeClasses();

  // Handle subscription upgrade
  const handleUpgrade = async (planId: string, billingCycle: 'monthly' | 'yearly') => {
    try {
      setLoadingPlan(planId);
      
      // Check if user is logged in
      const token = localStorage.getItem('accessToken');
      if (!token) {
        // Redirect to login with return URL
        window.location.href = `/auth/login?returnUrl=${encodeURIComponent('/pricing')}`;
        return;
      }

      await subscriptionApi.redirectToCheckout(planId as 'pro' | 'enterprise', billingCycle);
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start subscription. Please try again or contact support.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans: PricingPlan[] = [
    {
      name: t('plan.lite.name'),
      description: t('plan.lite.description'),
      monthlyPrice: '$0',
      annualPrice: '$0',
      features: [
        t('feature.lite.1'),
        t('feature.lite.2'),
        t('feature.lite.3'),
        t('feature.lite.4')
      ],
      popular: false,
      planId: 'free'
    },
    {
      name: t('plan.pro.name'),
      description: t('plan.pro.description'),
      monthlyPrice: '$3',
      annualPrice: '$30',
      features: [
        t('feature.pro.1'),
        t('feature.pro.2'),
        t('feature.pro.3'),
        t('feature.pro.4'),
        t('feature.pro.5')
      ],
      popular: true,
      planId: 'pro'
    },
    {
      name: t('plan.enterprise.name'),
      description: t('plan.enterprise.description'),
      monthlyPrice: t('plan.lets_talk'),
      annualPrice: t('plan.contact'),
      features: [
        t('feature.enterprise.1'),
        t('feature.enterprise.2'),
        t('feature.enterprise.3'),
        t('feature.enterprise.4'),
        t('feature.enterprise.5')
      ],
      popular: false,
      isEnterprise: true,
      planId: 'enterprise'
    }
  ];

  return (
    <section id="pricing" className={`min-h-screen ${themeClasses.sectionBackground} py-16 sm:py-24 md:py-32 px-4 relative overflow-hidden transition-all duration-500`}>
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className={`absolute top-1/4 left-1/4 w-[400px] h-[400px] ${themeClasses.backgroundElement1} rounded-full mix-blend-multiply filter blur-[100px] opacity-20`}
          animate={{ 
            x: [0, 80, 0],
            y: [0, -40, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className={`absolute top-3/4 right-1/4 w-[350px] h-[350px] ${themeClasses.backgroundElement2} rounded-full mix-blend-multiply filter blur-[80px] opacity-15`}
          animate={{ 
            x: [0, -60, 0],
            y: [0, 30, 0],
            scale: [1.1, 1, 1.1]
          }}
          transition={{ 
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced Header */}
          <motion.div
          className="text-center mb-12 sm:mb-16 md:mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <motion.h2 
            className={`text-2xl sm:text-3xl md:text-4xl font-bold ${themeClasses.title} mb-6 sm:mb-8 px-2 sm:px-0`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            >
              {t('pricing.title')}
            </motion.h2>
            <motion.p 
            className={`text-base sm:text-lg ${themeClasses.subtitle} max-w-4xl mx-auto mb-12 sm:mb-16 leading-relaxed px-4 sm:px-0`}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            >
              {t('pricing.subtitle')}
            </motion.p>

            {/* Enhanced Pricing Toggle */}
            <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 md:space-x-8 mb-12 sm:mb-16 px-4 sm:px-0"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            >
              <span 
              className={`text-base font-semibold transition-all duration-300 ${!isAnnual ? themeClasses.toggleActiveText + ' scale-110' : themeClasses.toggleInactiveText}`}
                style={{ fontFamily: 'Gilroy, sans-serif' }}
              >
                {t('pricing.monthly')}
              </span>
            
              <motion.button
              className="relative w-24 h-12 rounded-full p-1 focus:outline-none focus:ring-4 focus:ring-blue-500/30 shadow-xl backdrop-blur-sm"
                onClick={() => setIsAnnual(!isAnnual)}
              animate={{ 
                backgroundColor: isAnnual ? themeClasses.toggleBackgroundActive : themeClasses.toggleBackground,
                boxShadow: isAnnual 
                  ? '0 10px 30px rgba(59, 130, 246, 0.3)' 
                  : '0 10px 30px rgba(0, 0, 0, 0.1)'
              }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              >
                <motion.div
                className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center"
                animate={{ x: isAnnual ? 48 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className={`w-2 h-2 rounded-full ${isAnnual ? 'bg-blue-500' : 'bg-gray-400'} transition-colors duration-300`} />
              </motion.div>
              </motion.button>
            
            <div className="flex items-center space-x-3">
              <span 
                className={`text-base font-semibold transition-all duration-300 ${isAnnual ? themeClasses.toggleActiveText + ' scale-110' : themeClasses.toggleInactiveText}`}
                style={{ fontFamily: 'Gilroy, sans-serif' }}
              >
                {t('pricing.annual')}
              </span>
                <motion.span 
                className={`text-sm px-4 py-2 rounded-full border backdrop-blur-sm ${themeClasses.discountBadge}`}
                style={{ fontFamily: 'Gilroy, sans-serif' }}
                  whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", duration: 0.2 }}
                >
                  {t('pricing.discount')}
                </motion.span>
            </div>
            </motion.div>
          </motion.div>

        {/* Enhanced Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12 max-w-6xl mx-auto px-2 sm:px-0">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.2,
                ease: "easeOut"
              }}
            >
              <PricingCard
              plan={plan}
              index={index}
              isAnnual={isAnnual}
              onUpgrade={handleUpgrade}
              loading={loadingPlan === plan.planId}
            />
            </motion.div>
          ))}
        </div>

        {/* Enhanced Footer Note */}
          <motion.div
          className="text-center mt-16 sm:mt-20 md:mt-24 px-4 sm:px-0"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.p 
            className={`${themeClasses.noteText} text-base leading-relaxed`}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              {t('pricing.note')}
            </motion.p>
          </motion.div>

        {/* Enhanced Mobile Tip */}
        <motion.div 
          className={`lg:hidden text-center mt-8 sm:mt-12 p-4 sm:p-6 mx-4 sm:mx-0 ${themeClasses.mobileCard} rounded-2xl shadow-xl border`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <p className={`${themeClasses.mobileText} text-base`} style={{ fontFamily: 'Gilroy, sans-serif' }}>
            Прокрутите карточки для просмотра всех функций / Scroll cards to view all features
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;