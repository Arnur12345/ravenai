import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { TableOfContents } from './TableOfContents';
import '../styles/legal.css';

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
  sections: { id: string; title: string; level: number }[];
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({
  title,
  lastUpdated,
  children,
  sections
}) => {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState<string>('');
  const [isTocOpen, setIsTocOpen] = useState(false);

  // Scroll spy for table of contents
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  // Theme-based classes
  const getThemeClasses = () => {
    return {
      background: theme === 'dark' ? 'bg-gray-900' : 'bg-white',
      text: theme === 'dark' ? 'text-gray-100' : 'text-gray-900',
      subtitle: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
      border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
      cardBackground: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
    };
  };

  const themeClasses = getThemeClasses();

  return (
    <div 
      className={`min-h-screen ${themeClasses.background} transition-colors duration-300`}
      style={{ fontFamily: 'Gilroy, Inter, sans-serif', paddingTop: '80px' }}
    >
      {/* Hero Section */}
      <div className={`${themeClasses.background} border-b ${themeClasses.border} py-16 px-4`}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            className={`text-4xl md:text-5xl font-bold mb-4`}
            style={{ color: theme === 'dark' ? '#ffffff' : 'var(--dashboard-black, #000000)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {title}
          </motion.h1>
          <motion.p
            className={`text-lg ${themeClasses.subtitle} mb-6`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Last updated: {lastUpdated}
          </motion.p>
          <motion.div
            className="w-24 h-1 mx-auto rounded-full"
            style={{ backgroundColor: 'var(--dashboard-bright-blue)' }}
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>
      </div>

      {/* Content Layout */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Table of Contents - Desktop */}
          <div className="hidden lg:block lg:w-80 shrink-0">
            <div className="sticky top-24">
              <TableOfContents
                sections={sections}
                activeSection={activeSection}
                                 onSectionClick={(sectionId: string) => {
                   const element = document.getElementById(sectionId);
                   if (element) {
                     element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                   }
                 }}
              />
            </div>
          </div>

          {/* Mobile TOC Toggle */}
          <div className="lg:hidden">
            <motion.button
              onClick={() => setIsTocOpen(!isTocOpen)}
              className={`w-full p-4 rounded-lg border ${themeClasses.border} ${themeClasses.text} text-left font-medium ${themeClasses.cardBackground}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isTocOpen ? 'Hide' : 'Show'} Table of Contents
            </motion.button>
            {isTocOpen && (
              <motion.div
                className={`mt-4 p-4 rounded-lg border ${themeClasses.border} ${themeClasses.cardBackground}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <TableOfContents
                  sections={sections}
                  activeSection={activeSection}
                                     onSectionClick={(sectionId: string) => {
                     const element = document.getElementById(sectionId);
                     if (element) {
                       element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                     }
                     setIsTocOpen(false);
                   }}
                />
              </motion.div>
            )}
          </div>

          {/* Main Content */}
          <motion.div
            className={`flex-1 max-w-none ${theme === 'dark' ? 'dark' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="prose prose-lg max-w-none legal-content">
              {children}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Contact Footer */}
      <div className={`border-t ${themeClasses.border} py-12 px-4`}>
        <div className="max-w-4xl mx-auto text-center">
          <h3 
            className={`text-2xl font-bold mb-4`}
            style={{ color: theme === 'dark' ? '#ffffff' : 'var(--dashboard-black, #000000)' }}
          >
            Questions About This Policy?
          </h3>
          <p className={`${themeClasses.subtitle} mb-6`}>
            If you have any questions about this privacy policy or our terms of service, please contact us.
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <h4 className={`font-semibold mb-2`} style={{ color: theme === 'dark' ? '#ffffff' : 'var(--dashboard-black, #000000)' }}>CEO & Contact</h4>
              <p className={themeClasses.subtitle}>Arnur Artykbay</p>
              <p className={themeClasses.subtitle}>Kazakhstan, Almaty</p>
              <a 
                href="mailto:arnurartyqbay@gmail.com" 
                className="block mt-2 hover:underline"
                style={{ color: 'var(--dashboard-bright-blue, #83BAFF)' }}
              >
                arnurartyqbay@gmail.com
              </a>
              <a 
                href="tel:+77083883090" 
                className="block hover:underline"
                style={{ color: 'var(--dashboard-bright-blue, #83BAFF)' }}
              >
                +7 708 388 3090
              </a>
            </div>
            <div className="text-center">
              <h4 className={`font-semibold mb-2`} style={{ color: theme === 'dark' ? '#ffffff' : 'var(--dashboard-black, #000000)' }}>Company</h4>
              <p className={themeClasses.subtitle}>Raven AI</p>
              <p className={themeClasses.subtitle}>Meeting Intelligence Platform</p>
              <a 
                href="/"
                className="block mt-2 hover:underline"
                style={{ color: 'var(--dashboard-bright-blue, #83BAFF)' }}
              >
                https://ravenai.site
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 