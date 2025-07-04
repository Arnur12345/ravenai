import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PricingCard from '@/shared/ui/pricing-card';
import { Button } from '@/shared/ui/button';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useTheme } from '@/shared/contexts/ThemeContext';

interface PricingPlan {
  name: string;
  description: string;
  monthlyPrice: number | string;
  annualPrice: number | string;
  features: string[];
  popular?: boolean;
  isEnterprise?: boolean;
}

const Pricing: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [isAnnual, setIsAnnual] = useState(false);

  // Enhanced theme-based classes
  const getThemeClasses = () => {
    return {
      sectionBackground: theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-slate-50 via-white to-blue-50/30',
      backgroundElement1: theme === 'dark'
        ? 'bg-gradient-to-r from-blue-600/15 via-purple-600/10 to-cyan-600/15'
        : 'bg-gradient-to-r from-blue-200/30 to-purple-200/25',
      backgroundElement2: theme === 'dark'
        ? 'bg-gradient-to-r from-emerald-600/10 via-teal-600/15 to-blue-600/10'
        : 'bg-gradient-to-r from-emerald-200/25 to-blue-200/30',
      title: theme === 'dark' 
        ? 'bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent'
        : 'bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent',
      subtitle: theme === 'dark' ? 'text-gray-300' : 'text-slate-600',
      toggleActiveText: theme === 'dark' ? 'text-white' : 'text-black',
      toggleInactiveText: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
      toggleBackground: theme === 'dark' ? '#374151' : '#e5e7eb',
      toggleBackgroundActive: theme === 'dark' ? '#1f2937' : '#374151',
      discountBadge: theme === 'dark' 
        ? 'bg-blue-900/50 text-blue-200 border-blue-700/50' 
        : 'bg-blue-50 text-blue-800 border-blue-200',
      noteText: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
      mobileCard: theme === 'dark' 
        ? 'bg-gray-800/80 border-gray-700/50 backdrop-blur-xl' 
        : 'bg-white/80 border-gray-200 backdrop-blur-xl',
      mobileText: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    };
  };

  const themeClasses = getThemeClasses();

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
      popular: false
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
      popular: true
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
      isEnterprise: true
    }
  ];

  return (
    <section id="pricing" className={`min-h-screen ${themeClasses.sectionBackground} py-32 px-4 relative overflow-hidden transition-all duration-500`}>
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
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <motion.h2 
            className={`text-3xl md:text-4xl font-bold ${themeClasses.title} mb-8`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            >
              {t('pricing.title')}
            </motion.h2>
            <motion.p 
            className={`text-lg ${themeClasses.subtitle} max-w-4xl mx-auto mb-16 leading-relaxed`}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            >
              {t('pricing.subtitle')}
            </motion.p>

            {/* Enhanced Pricing Toggle */}
            <motion.div 
            className="flex items-center justify-center space-x-8 mb-16"
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
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
            />
            </motion.div>
          ))}
        </div>

        {/* Enhanced Footer Note */}
          <motion.div
          className="text-center mt-24"
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
          className={`lg:hidden text-center mt-12 p-6 ${themeClasses.mobileCard} rounded-2xl shadow-xl border`}
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