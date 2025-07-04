import React from 'react';
import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin } from 'lucide-react';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useTheme } from '@/shared/contexts/ThemeContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  const links = [
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' },
    { name: 'Support', href: '#' },
    { name: 'Documentation', href: '#' },
  ];

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
  ];

  // Theme-based classes
  const getThemeClasses = () => {
    return {
      background: theme === 'dark' ? 'bg-gray-900' : 'bg-white',
      border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
      copyrightText: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
      linkText: theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black',
      socialIcon: theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black',
    };
  };

  const themeClasses = getThemeClasses();

  return (
    <footer className={`${themeClasses.background} border-t ${themeClasses.border} py-12 px-4 transition-all duration-300`}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Left side - Copyright */}
          <div>
            <p 
              className={`${themeClasses.copyrightText} transition-colors duration-300`}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              © 2024 Raven AI. {t('footer.rights')}
            </p>
          </div>

          {/* Right side - Links and Social */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-end space-y-4 md:space-y-0 md:space-x-8">
            {/* Links */}
            <div className="flex flex-wrap gap-6">
              {links.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.href}
                  className={`${themeClasses.linkText} transition-colors duration-200`}
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", duration: 0.2 }}
                >
                  {link.name}
                </motion.a>
              ))}
            </div>

            {/* Social Icons */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    className={`${themeClasses.socialIcon} transition-colors duration-200`}
                    aria-label={social.name}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", duration: 0.2 }}
                  >
                    <IconComponent className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer; 