import React, { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Button } from '@/shared/ui/button';
import ClickSpark from '@/shared/ui/click-spark';
import { useLanguage } from '@/shared/contexts/LanguageContext';

const MobileCTA: React.FC = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();

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
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg md:hidden"
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
      <div className="flex space-x-3">
        <motion.div
          className="flex-1"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", duration: 0.2 }}
        >
          <ClickSpark sparkColor="#ffffff" sparkCount={8} sparkSize={4}>
            <Button
              className="w-full py-3 text-lg font-semibold shadow-lg focus:ring-1 ring-gray-300"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {t('hero.cta')}
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
              className="px-6 py-3 text-lg font-semibold border border-gray-300 hover:bg-gray-50 shadow-lg focus:ring-1 ring-gray-300"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {t('hero.cta_demo')}
            </Button>
          </ClickSpark>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MobileCTA; 