import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Twitter, Linkedin, Heart, Sparkles, Mail, Phone, X, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useTheme } from '@/shared/contexts/ThemeContext';
import BorderBeam from '@/shared/ui/border-beam';
import ClickSpark from '@/shared/ui/click-spark';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  
  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Integrations', href: '/integrations' },
        { name: 'API Docs', href: '#' },
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '#' },
        { name: 'Careers', href: '#' },
        { name: 'Blog', href: '#' },
        { name: 'Press Kit', href: '#' },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '#' },
        { name: 'Contact Us', href: '#' },
        { name: 'Status', href: '#' },
        { name: 'Community', href: '#' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy-policy' },
        { name: 'Terms of Service', href: '/terms-of-service' },
        { name: 'Cookie Policy', href: '#' },
        { name: 'GDPR', href: '#' },
      ]
    }
  ];

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:text-blue-400' },
    { name: 'LinkedIn', icon: Linkedin, href: '#', color: 'hover:text-blue-600' },
    { name: 'GitHub', icon: Github, href: '#', color: 'hover:text-gray-600' },
    { name: 'Telegram', icon: Mail, href: 'https://t.me/easyer647', color: 'hover:text-blue-500' },
  ];

  const contactInfo = [
    { icon: Mail, text: 'arnurartyqbay@gmail.com', href: 'mailto:arnurartyqbay@gmail.com' },
    { icon: Phone, text: '@easyer647', href: 'https://t.me/easyer647' },
  ];

  // Black theme matching hero and features components
  const getThemeClasses = () => {
    return {
      // Black background matching hero
      sectionBackground: 'bg-black',
      
      // Subtle background elements
      backgroundElement: 'bg-white/5',
      
      // White text on black background
      logoText: 'text-white',
      sectionTitle: 'text-white',
      linkText: 'text-white/70 hover:text-white transition-colors duration-300',
      
      // Contact info styling
      contactText: 'text-white/70',
      contactIcon: 'text-white',
      
      // Copyright text
      copyrightText: 'text-white/50',
      
      // Social icons
      socialIcon: 'text-white/70 hover:text-white transition-colors duration-300',
      
      // Card backgrounds with white borders (hero button style)
      cardBackground: 'bg-white/10 border-white/20',
      
      // Icon backgrounds
      iconBackground: 'bg-white/10',
      
      // Icon color
      iconColor: 'text-white'
    };
  };

  const themeClasses = getThemeClasses();

  return (
    <>
      <footer className={`${themeClasses.sectionBackground} py-12 sm:py-16 md:py-20 px-4 transition-all duration-500 relative overflow-hidden`}>
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-1/4 right-1/4 w-96 h-96 ${themeClasses.backgroundElement} rounded-full blur-3xl opacity-20`} />
          <div className={`absolute bottom-1/4 left-1/4 w-96 h-96 ${themeClasses.backgroundElement} rounded-full blur-3xl opacity-10`} />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Main Footer Content */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 md:gap-12 mb-12 sm:mb-14 md:mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Brand Section */}
            <div className="lg:col-span-4 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    className={`w-12 h-12 ${themeClasses.iconBackground} rounded-2xl flex items-center justify-center`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sparkles className={`w-6 h-6 ${themeClasses.iconColor}`} />
                  </motion.div>
                  <h3 
                    className={`text-2xl font-bold ${themeClasses.logoText}`}
                    style={{ fontFamily: 'Gilroy, sans-serif' }}
                  >
                    RavenAI
                  </h3>
                </div>
                
                <p 
                  className={`${themeClasses.contactText} text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 max-w-sm mx-auto lg:mx-0`}
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                >
                  AI-powered meeting assistant that transforms your conversations into actionable insights.
                </p>
                
                {/* Contact Info */}
                <div className="space-y-3 sm:space-y-4 flex flex-col items-center lg:items-start">
                  {contactInfo.map((contact, index) => {
                    const IconComponent = contact.icon;
                    return (
                      <motion.a
                        key={index}
                        href={contact.href}
                        className={`flex items-center gap-3 ${themeClasses.contactText} hover:text-blue-400 transition-colors duration-300 group`}
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className={`w-8 h-8 ${themeClasses.iconBackground} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className={`w-4 h-4 ${themeClasses.iconColor}`} />
                        </div>
                        <span style={{ fontFamily: 'Gilroy, sans-serif' }}>{contact.text}</span>
                      </motion.a>
                    );
                  })}
                </div>
              </motion.div>
            </div>
            
            {/* Footer Sections */}
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mt-8 lg:mt-0">
              {footerSections.map((section, sectionIndex) => (
                <motion.div
                  key={sectionIndex}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 * (sectionIndex + 2) }}
                >
                  <div>
                    <h4 
                      className={`${themeClasses.sectionTitle} font-bold text-base sm:text-lg mb-4 sm:mb-6`}
                      style={{ fontFamily: 'Gilroy, sans-serif' }}
                    >
                      {section.title}
                    </h4>
                    <ul className="space-y-2 sm:space-y-3">
                      {section.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          {link.href.startsWith('/') ? (
                            <Link
                              to={link.href}
                              className={`${themeClasses.linkText} block text-sm sm:text-base`}
                              style={{ fontFamily: 'Gilroy, sans-serif' }}
                            >
                              {link.name}
                            </Link>
                          ) : (
                            <a
                              href={link.href}
                              className={`${themeClasses.linkText} block text-sm sm:text-base`}
                              style={{ fontFamily: 'Gilroy, sans-serif' }}
                            >
                              {link.name}
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Still have questions button */}
          <motion.div
            className="flex justify-center mb-12 sm:mb-14 md:mb-16 px-4 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <motion.button
              onClick={() => setIsContactModalOpen(true)}
              className="bg-white/10 border border-white/20 backdrop-blur-sm text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold transition-all duration-300 hover:bg-white/20 hover:scale-105 flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
              style={{ fontFamily: 'Gilroy, sans-serif' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              Still have questions?
            </motion.button>
          </motion.div>
          
          {/* Bottom Section */}
          <motion.div
            className="border-t border-white/20 pt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Copyright */}
              <div className="flex items-center gap-2">
                <p 
                  className={`${themeClasses.copyrightText} transition-colors duration-300`}
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                >
                  © 2024 RavenAI. All rights reserved.
                </p>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Heart className="w-4 h-4 text-red-400 fill-current" />
                </motion.div>
              </div>
              
              {/* Social Links */}
              <div className="flex items-center gap-4">
                <span 
                  className={`${themeClasses.copyrightText} text-sm mr-2`}
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                >
                  Follow us:
                </span>
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <ClickSpark key={index} sparkColor="#60a5fa" sparkCount={6} sparkSize={3}>
                      <motion.a
                        href={social.href}
                        className={`${themeClasses.socialIcon} transition-all duration-300 p-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm hover:shadow-lg`}
                        aria-label={social.name}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", duration: 0.2 }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </motion.a>
                    </ClickSpark>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* BorderBeam effect */}
        <BorderBeam 
          size={800} 
          duration={20} 
          colorFrom={theme === 'dark' ? '#ffffff' : '#3b82f6'} 
          colorTo={theme === 'dark' ? '#60a5fa' : '#9ca3af'} 
          borderWidth={1}
        />
      </footer>
      
      {/* Contact Modal */}
      <AnimatePresence>
        {isContactModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsContactModalOpen(false)}
          >
            <motion.div
              className="bg-black border border-white/20 rounded-3xl p-8 max-w-md w-full relative"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors duration-300"
              >
                <X className="w-6 h-6" />
              </button>
              
              {/* Modal content */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 
                    className="text-2xl font-bold text-white"
                    style={{ fontFamily: 'Gilroy, sans-serif' }}
                  >
                    Get in Touch
                  </h3>
                </div>
                <p 
                  className="text-white/70 text-base leading-relaxed"
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                >
                  Have questions or need support? We're here to help!
                </p>
              </div>
              
              {/* Contact options */}
              <div className="space-y-4">
                {contactInfo.map((contact, index) => {
                  const IconComponent = contact.icon;
                  return (
                    <motion.a
                      key={index}
                      href={contact.href}
                      className="flex items-center gap-4 text-white/70 hover:text-white transition-colors duration-300 group p-4 rounded-2xl bg-white/5 hover:bg-white/10"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <span 
                        className="font-medium"
                        style={{ fontFamily: 'Gilroy, sans-serif' }}
                      >
                        {contact.text}
                      </span>
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Footer;