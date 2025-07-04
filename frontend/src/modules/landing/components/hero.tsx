import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/button';
import ClickSpark from '@/shared/ui/click-spark';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useTheme } from '@/shared/contexts/ThemeContext';

const Hero: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  // Theme-based classes
  const getThemeClasses = () => {
    return {
      // Matching Features background for smooth transition
      sectionBackground: theme === 'dark' 
        ? 'bg-gradient-to-b from-[rgb(31,34,40)] via-slate-800 to-slate-900' 
        : 'bg-gradient-to-b from-slate-50 to-white',
      
      // Subtle background elements with better visibility (matching Features)
      backgroundElement: theme === 'dark'
        ? 'bg-slate-600/15'
        : 'bg-gray-300/20',
        
      titleText: theme === 'dark' ? 'text-white' : 'text-black',
      descriptionText: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
      primaryButton: theme === 'dark' 
        ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500/50' 
        : 'bg-black hover:bg-gray-800 text-white focus:ring-gray-300',
      secondaryButton: theme === 'dark'
        ? 'border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white focus:ring-gray-600/50'
        : 'border-gray-300 text-gray-800 hover:bg-gray-50 focus:ring-gray-300',
      sparkColor: theme === 'dark' ? '#60a5fa' : '#000000',
    };
  };

  const themeClasses = getThemeClasses();

  const BlurText = ({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) => {
    const words = text.split(' ');
    
    return (
      <div className={className} style={style}>
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ filter: "blur(10px)", opacity: 0 }}
            animate={{ filter: "blur(0px)", opacity: 1 }}
            transition={{
              duration: 0.8,
              delay: i * 0.1,
              ease: "easeOut"
            }}
            className="inline-block mr-2"
          >
            {word}
          </motion.span>
        ))}
      </div>
    );
  };

  return (
    <section 
      className={`min-h-screen flex items-center justify-center px-4 py-20 transition-all duration-300 ${themeClasses.sectionBackground}`}
    >
      <motion.div
        className="w-full max-w-3xl mx-auto flex flex-col items-center text-center space-y-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
          <BlurText
            text={t('hero.title')}
            className={`text-4xl md:text-5xl lg:text-6xl font-bold ${themeClasses.titleText} leading-tight transition-colors duration-300`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          />

          <motion.p
            className={`text-xl md:text-2xl ${themeClasses.descriptionText} leading-relaxed max-w-2xl mx-auto transition-colors duration-300`}
            variants={itemVariants}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            {t('hero.description')}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", duration: 0.2 }}
            >
                <Button
                  size="lg"
                  className={`px-8 py-4 text-lg font-semibold shadow-lg transition-all duration-300 ${themeClasses.primaryButton} focus:ring-1`}
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                  onClick={() => window.location.href = '/register'}
                >
                  {t('hero.cta')}
                </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", duration: 0.2 }}
            >
              <ClickSpark sparkColor={themeClasses.sparkColor} sparkCount={10} sparkSize={5}>
                <Button
                  variant="ghost"
                  size="lg"
                  className={`px-8 py-4 text-lg font-semibold border shadow-lg transition-all duration-300 ${themeClasses.secondaryButton} focus:ring-1`}
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                >
                  {t('hero.cta_demo')}
                </Button>
              </ClickSpark>
            </motion.div>
          </motion.div>

      </motion.div>
    </section>
  );
};

export default Hero; 