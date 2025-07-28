import React, { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import ClickSpark from '@/shared/ui/click-spark';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useTheme } from '@/shared/contexts/ThemeContext';

const MobileCTA: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();

  const themeClasses = {
    background: theme === 'dark' ? 'bg-gray-900/95' : 'bg-white/95',
    border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    primaryButton: theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white',
    secondaryButton: theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
  };

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      // Show CTA after scrolling past hero section (approximately 100vh)
      const heroHeight = window.innerHeight;
      setIsVisible(latest > heroHeight);
    });

    return () => unsubscribe();
  }, [scrollY]);

  return (
    <motion.div
      className={`fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 ${themeClasses.background} border-t ${themeClasses.border} shadow-lg backdrop-blur-md lg:hidden`}
      initial={{ y: 100, opacity: 0 }}
      animate={{ 
        y: isVisible ? 0 : 100, 
        opacity: isVisible ? 1 : 0 
      }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        duration: 0.3
      }}
    >
      <div className="flex space-x-2 sm:space-x-3 max-w-sm mx-auto">
        <motion.div
          className="flex-1"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", duration: 0.2 }}
        >
          <ClickSpark sparkColor="#ffffff" sparkCount={8} sparkSize={4}>
            <Button
              onClick={() => navigate('/auth')}
              className={`w-full py-2.5 sm:py-3 text-sm sm:text-base font-semibold shadow-lg focus:ring-1 ring-gray-300 ${themeClasses.primaryButton}`}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Get Started
            </Button>
          </ClickSpark>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", duration: 0.2 }}
        >
          <ClickSpark sparkColor="#000000" sparkCount={6} sparkSize={3}>
            <Button
              variant="ghost"
              className={`px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold border shadow-lg focus:ring-1 ring-gray-300 ${themeClasses.secondaryButton}`}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              View Demo
            </Button>
          </ClickSpark>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MobileCTA;