import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/shared/contexts/ThemeContext';

interface TableOfContentsProps {
  sections: { id: string; title: string; level: number }[];
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  sections,
  activeSection,
  onSectionClick
}) => {
  const { theme } = useTheme();

  // Theme-based classes
  const getThemeClasses = () => {
    return {
      background: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
      text: theme === 'dark' ? 'text-gray-100' : 'text-gray-900',
      subtitle: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
      border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
      hover: theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
    };
  };

  const themeClasses = getThemeClasses();

  return (
    <div 
      className={`${themeClasses.background} rounded-lg border ${themeClasses.border} p-6 shadow-sm`}
    >
      <h3 
        className={`font-bold text-lg mb-4`}
        style={{ color: theme === 'dark' ? '#ffffff' : 'var(--dashboard-black, #000000)' }}
      >
        Table of Contents
      </h3>
      
      <nav>
        <ul className="space-y-1">
          {sections.map((section, index) => {
            const isActive = activeSection === section.id;
            const paddingLeft = section.level === 1 ? 'pl-0' : section.level === 2 ? 'pl-4' : 'pl-8';
            
            return (
              <motion.li
                key={section.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <button
                  onClick={() => onSectionClick(section.id)}
                  className={`
                    w-full text-left py-2 px-3 rounded-md transition-all duration-200 text-sm
                    ${paddingLeft}
                    ${isActive 
                      ? 'font-semibold text-white' 
                      : `${themeClasses.subtitle} ${themeClasses.hover} font-medium`
                    }
                  `}
                  style={{
                    backgroundColor: isActive ? 'var(--dashboard-bright-blue, #83BAFF)' : 'transparent',
                    color: isActive ? 'white' : undefined
                  }}
                >
                  <span className="block truncate">
                    {section.title}
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      <div className={`mt-6 pt-4 border-t ${themeClasses.border}`}>
        <p className={`text-xs ${themeClasses.subtitle}`}>
          Click on any section to jump to it
        </p>
      </div>
    </div>
  );
}; 