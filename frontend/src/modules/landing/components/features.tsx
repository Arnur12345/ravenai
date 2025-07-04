import React from 'react';
import { motion } from 'framer-motion';
import { Brain, PenLine, Share2, Search, Sparkles, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useTheme } from '@/shared/contexts/ThemeContext';

const Features: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  // Enhanced monotonic theme with better contrast and smoother colors
  const getThemeClasses = () => {
    return {
      // Enhanced backgrounds with subtle blue-gray tints
      sectionBackground: theme === 'dark' 
        ? 'bg-gradient-to-b from-[rgb(31,34,40)] via-slate-800 to-slate-900' 
        : 'bg-gradient-to-b from-slate-50 to-white',
      
      // Subtle background elements with better visibility
      backgroundElement: theme === 'dark'
        ? 'bg-slate-600/15'
        : 'bg-gray-300/20',
      
      // Enhanced badge with better contrast
      badge: theme === 'dark'
        ? 'bg-slate-800/90 border border-slate-600/60 backdrop-blur-md'
        : 'bg-white/90 border border-gray-200/60 backdrop-blur-sm',
      badgeIcon: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      badgeText: theme === 'dark' ? 'text-slate-200' : 'text-gray-700',
      
      // Better text contrast - fix wash-out issue
      titleText: theme === 'dark' ? 'text-slate-100' : 'text-gray-900',
      subtitleText: theme === 'dark' ? 'text-slate-200' : 'text-gray-600',
      
      // Enhanced card styling with better contrast
      cardBackground: theme === 'dark' 
        ? 'bg-slate-800/70 backdrop-blur-md border-slate-700/60' 
        : 'bg-white/80 backdrop-blur-sm border-gray-200/60',
      cardBorder: theme === 'dark' 
        ? 'shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-slate-900/30' 
        : 'shadow-lg shadow-gray-200/20 hover:shadow-xl hover:shadow-gray-300/30',
      cardHover: theme === 'dark' 
        ? 'hover:bg-slate-700/80 hover:border-slate-600/70' 
        : 'hover:bg-gray-50/90 hover:border-gray-300/70',
      
      // Card text with proper contrast for both themes
      cardTitle: theme === 'dark' 
        ? 'text-white group-hover:text-blue-100 transition-colors duration-300' 
        : 'text-gray-900',
      cardDescription: theme === 'dark' 
        ? 'text-gray-300 group-hover:text-gray-100 transition-colors duration-300' 
        : 'text-gray-600',
      
      // Icon background with proper contrast for both themes
      iconBackground: theme === 'dark'
        ? 'bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 group-hover:bg-blue-600 transition-all duration-300'
        : 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-600',
      
      // Icon color with proper visibility
      iconColor: theme === 'dark'
        ? 'text-white group-hover:text-white transition-colors duration-300'
        : 'text-white',
      
      // Enhanced CTA styling
      ctaContainer: theme === 'dark'
        ? 'bg-slate-800/80 border-slate-600/50 backdrop-blur-md'
        : 'bg-white/70 border-gray-200/50 backdrop-blur-sm',
      ctaIcon: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      ctaText: theme === 'dark' ? 'text-slate-200' : 'text-gray-700',
      ctaButton: theme === 'dark'
        ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/25'
        : 'bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-900/25',
    };
  };

  const themeClasses = getThemeClasses();
  
  // Features with enhanced structure
  const features = [
    {
      icon: Brain,
      title: t('features.ai.title'),
      description: t('features.ai.description'),
    },
    {
      icon: PenLine,
      title: t('features.formatting.title'),
      description: t('features.formatting.description'),
    },
    {
      icon: Share2,
      title: t('features.sharing.title'),
      description: t('features.sharing.description'),
    },
    {
      icon: Search,
      title: t('features.search.title'),
      description: t('features.search.description'),
    }
  ];

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
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
        duration: 0.8
      }
    }
  };

  return (
    <section className={`relative ${themeClasses.sectionBackground} py-32 px-4 overflow-hidden transition-all duration-700 ease-out`}>
      {/* Enhanced subtle background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className={`absolute top-1/4 left-1/4 w-96 h-96 ${themeClasses.backgroundElement} rounded-full filter blur-3xl`}
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className={`absolute top-2/3 right-1/4 w-80 h-80 ${themeClasses.backgroundElement} rounded-full filter blur-3xl`}
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

      {/* Content with enhanced animations */}
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ 
            type: "spring",
            stiffness: 80,
            damping: 20,
            duration: 1.2
          }}
        >
          {/* Enhanced badge */}
          <motion.div
            className={`inline-flex items-center gap-3 ${themeClasses.badge} px-6 py-3 rounded-full mb-8 transition-all duration-500 ease-out`}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              delay: 0.3, 
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
              Powered by AI
            </span>
          </motion.div>
          
          {/* Enhanced title with better contrast */}
          <motion.h2 
            className={`text-3xl md:text-4xl font-bold ${themeClasses.titleText} mb-8 transition-all duration-500`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 0.5, 
              duration: 1,
              type: "spring",
              stiffness: 100,
              damping: 20
            }}
          >
            {t('features.title')}
          </motion.h2>
          
          {/* Enhanced subtitle with better contrast */}
          <motion.p 
            className={`text-lg md:text-xl ${themeClasses.subtitleText} max-w-4xl mx-auto leading-relaxed transition-colors duration-500`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 0.7, 
              duration: 0.8,
              ease: "easeOut"
            }}
          >
            {t('features.subtitle')}
          </motion.p>
        </motion.div>

        {/* Enhanced features grid with smooth animations */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ 
                  y: -15, 
                  scale: 1.03,
                  transition: { 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20,
                    duration: 0.4
                  }
                }}
                className="group"
              >
                <Card className={`h-full relative overflow-hidden border ${themeClasses.cardBorder} transition-all duration-700 ease-out ${themeClasses.cardBackground} ${themeClasses.cardHover}`}>
                  <CardHeader className="text-center pb-4">
                    {/* Enhanced icon container with smooth animations */}
                    <motion.div 
                      className={`w-16 h-16 mx-auto mb-6 ${themeClasses.iconBackground} rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ease-out`}
                      whileHover={{ 
                        scale: 1.15,
                        rotate: [0, -12, 12, 0],
                        transition: { 
                          duration: 0.6, 
                          ease: "easeInOut",
                          type: "spring",
                          stiffness: 200,
                          damping: 15
                        }
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <IconComponent className={`w-8 h-8 ${themeClasses.iconColor} drop-shadow-sm`} />
                      </motion.div>
                    </motion.div>
                    
                    <CardTitle 
                      className={`text-lg font-bold ${themeClasses.cardTitle} transition-all duration-500 group-hover:scale-105`}
                      style={{ fontFamily: 'Gilroy, sans-serif' }}
                    >
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="px-6 pb-8">
                    <CardDescription 
                      className={`${themeClasses.cardDescription} text-center leading-relaxed transition-all duration-500 group-hover:text-opacity-90`}
                      style={{ fontFamily: 'Gilroy, sans-serif' }}
                    >
                      {feature.description}
                    </CardDescription>
                  </CardContent>

                  {/* Subtle hover effect overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Enhanced CTA section */}
        <motion.div
          className="text-center mt-24"
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
            className={`inline-flex items-center gap-4 ${themeClasses.ctaContainer} px-8 py-4 rounded-xl shadow-lg border transition-all duration-500`}
            whileHover={{ 
              scale: 1.02,
              y: -2,
              transition: { duration: 0.3, ease: "easeOut" }
            }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Zap className={`w-6 h-6 ${themeClasses.ctaIcon}`} />
            </motion.div>
            <span 
              className={`${themeClasses.ctaText} font-semibold text-base transition-colors duration-300`}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              {t('features.cta')}
            </span>
            <Button
              className={`ml-4 ${themeClasses.ctaButton} text-white px-6 py-2 rounded-lg font-semibold transition-all duration-500 hover:shadow-xl transform hover:scale-105`}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              {t('features.cta_button')}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;