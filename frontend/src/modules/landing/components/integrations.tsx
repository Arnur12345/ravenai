import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { Sparkles, ArrowRight } from 'lucide-react';

const Integrations: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  // Enhanced theme-based classes
  const getThemeClasses = () => {
    return {
      // Section backgrounds
      sectionBackground: theme === 'dark' 
        ? 'bg-gradient-to-b from-slate-900 via-gray-900 to-slate-900' 
        : 'bg-gradient-to-b from-gray-50 via-white to-gray-50',
      
      // Floating background elements
      backgroundElement1: theme === 'dark'
        ? 'bg-blue-600/10'
        : 'bg-blue-200/30',
      backgroundElement2: theme === 'dark'
        ? 'bg-purple-600/8'
        : 'bg-purple-200/25',
      
      // Badge styling
      badge: theme === 'dark'
        ? 'bg-slate-800/80 border border-slate-600/50 backdrop-blur-sm'
        : 'bg-white/90 border border-gray-200/60 backdrop-blur-sm',
      badgeIcon: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      badgeText: theme === 'dark' ? 'text-slate-200' : 'text-gray-700',
      
      // Text colors
      titleText: theme === 'dark' ? 'text-slate-100' : 'text-gray-900',
      subtitleText: theme === 'dark' ? 'text-slate-300' : 'text-gray-600',
      comingSoonText: theme === 'dark' ? 'text-slate-400' : 'text-gray-500',
      
      // Card styling
      cardBackground: theme === 'dark' 
        ? 'bg-slate-800/60 backdrop-blur-sm border-slate-700/50' 
        : 'bg-white/80 backdrop-blur-sm border-gray-200/60',
      cardHover: theme === 'dark' 
        ? 'hover:bg-slate-700/70 hover:border-slate-600/60 hover:shadow-2xl hover:shadow-slate-900/30' 
        : 'hover:bg-white/90 hover:border-gray-300/70 hover:shadow-xl hover:shadow-gray-200/40',
      
      // CTA styling
      ctaBackground: theme === 'dark'
        ? 'bg-slate-800/70 border-slate-600/50'
        : 'bg-gray-50/80 border-gray-200/50',
      ctaText: theme === 'dark' ? 'text-slate-200' : 'text-gray-700',
      ctaButton: theme === 'dark'
        ? 'bg-blue-600 hover:bg-blue-500 text-white'
        : 'bg-gray-900 hover:bg-gray-800 text-white',
    };
  };

  const themeClasses = getThemeClasses();
  
  const integrations = [
    {
      name: 'Slack',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_Icon.png',
      alt: 'Slack logo',
      category: 'Communication'
    },
    {
      name: 'Microsoft Teams',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg/512px-Microsoft_Office_Teams_%282018%E2%80%93present%29.svg.png',
      alt: 'Microsoft Teams logo',
      category: 'Communication'
    },

    {
      name: 'HubSpot',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/HubSpot_Logo.svg/512px-HubSpot_Logo.svg.png',
      alt: 'HubSpot logo',
      category: 'CRM'
    },
    {
      name: 'Salesforce',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/512px-Salesforce.com_logo.svg.png',
      alt: 'Salesforce logo',
      category: 'CRM'
    },
    {
      name: 'Notion',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png',
      alt: 'Notion logo',
      category: 'Productivity'
    },
    {
      name: 'Jira',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Jira_Logo.svg/2560px-Jira_Logo.svg.png',
      alt: 'Jira Logo',
      category: 'Project Management'
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6
      }
    }
  };

  return (
    <section id="integrations" className={`relative ${themeClasses.sectionBackground} py-24 px-4 overflow-hidden transition-all duration-700`}>
      {/* Beautiful floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className={`absolute top-1/4 left-1/5 w-96 h-96 ${themeClasses.backgroundElement1} rounded-full filter blur-3xl`}
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className={`absolute bottom-1/4 right-1/5 w-80 h-80 ${themeClasses.backgroundElement2} rounded-full filter blur-3xl`}
          animate={{ 
            x: [0, -80, 0],
            y: [0, 40, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{ 
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced header section */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ 
            type: "spring",
            stiffness: 80,
            damping: 20,
            duration: 1
          }}
        >
          {/* Badge */}
          <motion.div
            className={`inline-flex items-center gap-3 ${themeClasses.badge} px-6 py-3 rounded-full mb-8 transition-all duration-500`}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              delay: 0.2, 
              duration: 0.8,
              type: "spring",
              stiffness: 150,
              damping: 15
            }}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.3, ease: "easeOut" }
            }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
              <Sparkles className={`w-5 h-5 ${themeClasses.badgeIcon}`} />
            </motion.div>
            <span 
              className={`${themeClasses.badgeText} font-semibold transition-colors duration-300`}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
                              {t('landing.integrations.badge')}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2 
            className={`text-2xl md:text-3xl font-bold ${themeClasses.titleText} mb-8 transition-all duration-500`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 0.4, 
              duration: 1,
              type: "spring",
              stiffness: 100,
              damping: 20
            }}
          >
            {t('landing.integrations.title')}
          </motion.h2>
          
          {/* Subtitle */}
          <motion.p 
            className={`text-base md:text-lg ${themeClasses.subtitleText} max-w-4xl mx-auto leading-relaxed transition-colors duration-500`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 0.6, 
              duration: 0.8,
              ease: "easeOut"
            }}
          >
            {t('landing.integrations.subtitle')}
          </motion.p>
        </motion.div>

        {/* Enhanced integrations grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {integrations.map((integration, index) => (
                         <motion.div
               key={index}
              variants={cardVariants}
               whileHover={{ 
                y: -8, 
                 scale: 1.05,
                 transition: { 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20,
                  duration: 0.3
                }
              }}
              className="group"
            >
              <div className={`relative flex items-center justify-center p-6 rounded-2xl border ${themeClasses.cardBackground} ${themeClasses.cardHover} transition-all duration-500 ease-out`}>
                {/* Hover overlay effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
                
                <motion.img
                src={integration.logo}
                alt={integration.alt}
                  className="w-12 h-12 md:w-16 md:h-16 object-contain relative z-10 transition-all duration-300 group-hover:scale-110"
                loading="lazy"
                  whileHover={{ 
                    scale: 1.1,
                    transition: { duration: 0.3 }
                  }}
                />
                
                {/* Tooltip on hover */}
                <motion.div
                  className={`absolute -bottom-12 left-1/2 transform -translate-x-1/2 px-3 py-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-900'} text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap`}
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                >
                  {integration.name}
                  <div className={`absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-900'} rotate-45`} />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced CTA section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ 
            duration: 1, 
            delay: 0.8,
            type: "spring",
            stiffness: 100,
            damping: 20
          }}
        >
          <motion.div 
            className={`inline-flex flex-col md:flex-row items-center gap-6 ${themeClasses.ctaBackground} px-8 py-6 rounded-2xl shadow-lg border backdrop-blur-sm transition-all duration-500`}
            whileHover={{ 
              scale: 1.02,
              y: -2,
              transition: { duration: 0.3, ease: "easeOut" }
            }}
        >
            <div className="text-center md:text-left">
          <p 
                className={`${themeClasses.comingSoonText} text-base font-medium transition-colors duration-300 mb-2`}
                style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
                            {t('landing.integrations.coming_soon')}
          </p>
              <p 
                className={`${themeClasses.ctaText} font-semibold transition-colors duration-300`}
                style={{ fontFamily: 'Gilroy, sans-serif' }}
              >
                {t('landing.integrations.connect_instantly')}
              </p>
            </div>
            
            <motion.button
              className={`${themeClasses.ctaButton} px-6 py-3 rounded-xl font-semibold transition-all duration-500 hover:shadow-xl transform hover:scale-105 flex items-center gap-2`}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
                              {t('landing.integrations.workflow')}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Integrations; 