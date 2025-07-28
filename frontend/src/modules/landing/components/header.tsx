import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, UserPlus, Menu, X } from 'lucide-react';
import ravenlogo from '@/assets/ravenwhite.png';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Consistent transition settings
  const smoothTransition = {
    duration: 0.6,
    ease: [0.25, 0.46, 0.45, 0.94],
  };

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <motion.header
      className={`fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isScrolled ? 'w-[95%] sm:w-[90%] max-w-4xl' : 'w-[98%] sm:w-[95%] max-w-7xl'
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      
      transition={smoothTransition}
      style={{
        background: 'rgba(15, 15, 15, 0.4)',
        border: '0.2px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        height: '56px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <motion.div 
          className="flex items-center"
          transition={smoothTransition}
        >
          <img 
            src={ravenlogo} 
            alt="Raven Logo"
            className="h-6 sm:h-8 w-auto object-contain"
          />
        </motion.div>
        
        {/* Navigation Links - Hidden on mobile, visible on desktop */}
        <motion.nav 
          className={`hidden md:flex items-center space-x-4 lg:space-x-8 ${
            isScrolled ? 'space-x-3 lg:space-x-6' : 'space-x-4 lg:space-x-8'
          }`}
          transition={smoothTransition}
        >
          {['Features', 'Integrations', 'Reviews', 'Pricing', 'FAQ'].map((item, index) => (
            <motion.button 
              key={item}
              onClick={() => scrollToSection(item.toLowerCase())}
              className="text-[#AAAAAA] font-normal hover:text-white transition-colors duration-200 cursor-pointer text-xs md:text-sm lg:text-base" 
              style={{ 
                fontFamily: 'Poppins, sans-serif',
                fontWeight: '400',
                lineHeight: '1.5em'
              }}
              whileHover={{ 
                scale: 1.05, 
                color: '#FFFFFF',
                transition: { duration: 0.2 }
              }}
              whileTap={{ 
                scale: 0.95,
                transition: { duration: 0.1 }
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                ...smoothTransition, 
                delay: index * 0.1 
              }}
            >
              {item}
            </motion.button>
          ))}
        </motion.nav>
        
        {/* Auth Buttons & Mobile Menu */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Desktop Auth Buttons - Hidden on mobile */}
          <div className="hidden sm:flex items-center space-x-2 sm:space-x-3">
            {/* Sign In Button */}
            <motion.button 
              onClick={() => navigate('/login')}
              className="bg-transparent border border-[#616161] hover:bg-white/10 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg"
              whileHover={{ 
                scale: 1.03,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: '#888888',
                transition: { duration: 0.2 }
              }}
              whileTap={{ 
                scale: 0.97,
                transition: { duration: 0.1 }
              }}
            >
              <User size={14} className="text-white" />
              <span 
                className="text-white font-normal text-xs lg:text-sm"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '400',
                  lineHeight: '1.5em'
                }}
              >
                Sign in
              </span>
            </motion.button>
            
            {/* Register Button */}
            <motion.button 
              onClick={() => navigate('/auth?mode=register')}
              className="bg-white hover:bg-gray-100 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg shadow-sm"
              whileHover={{ 
                scale: 1.03,
                backgroundColor: '#f0f0f0',
                transition: { duration: 0.2 }
              }}
              whileTap={{ 
                scale: 0.97,
                transition: { duration: 0.1 }
              }}
            >
              <UserPlus size={14} className="text-black" />
              <span 
                className="text-black font-normal text-xs lg:text-sm"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '400',
                  lineHeight: '1.5em'
                }}
              >
                Register
              </span>
            </motion.button>
          </div>

          {/* Mobile Hamburger Menu Button - Group 30 equivalent */}
          <motion.button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden bg-[#D9D9D9] hover:bg-[#CCCCCC] transition-all duration-200 cursor-pointer flex items-center justify-center p-2 rounded-[13px]"
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            whileTap={{ 
              scale: 0.95,
              transition: { duration: 0.1 }
            }}
          >
            <div className="flex space-x-1">
              <div className="w-[14px] h-[14px] bg-[#666666] rounded-[6px]"></div>
              <div className="w-[14px] h-[14px] bg-[#666666] rounded-[6px]"></div>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu Popup */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 sm:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu Content */}
            <motion.div
              className="absolute top-20 left-4 right-4 bg-[#0F0F0F] border border-white/20 rounded-[20px] p-6 shadow-2xl"
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                background: 'rgba(15, 15, 15, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              {/* Navigation Links */}
              <div className="space-y-4 mb-6">
                {['Features', 'Integrations', 'Reviews', 'Pricing', 'FAQ'].map((item, index) => (
                  <motion.button 
                    key={item}
                    onClick={() => {
                      scrollToSection(item.toLowerCase());
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left text-[#AAAAAA] hover:text-white transition-colors duration-200 py-2 text-lg"
                    style={{ 
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: '400',
                      lineHeight: '1.5em'
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 4 }}
                  >
                    {item}
                  </motion.button>
                ))}
              </div>
              
              {/* Auth Buttons */}
              <div className="space-y-3">
                {/* Sign In Button */}
                <motion.button 
                  onClick={() => {
                    navigate('/login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-transparent border border-[#616161] hover:bg-white/10 transition-all duration-200 flex items-center justify-center gap-3 py-3 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <User size={16} className="text-white" />
                  <span 
                    className="text-white font-normal text-base"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: '400',
                      lineHeight: '1.5em'
                    }}
                  >
                    Sign in
                  </span>
                </motion.button>
                
                {/* Register Button */}
                <motion.button 
                  onClick={() => {
                    navigate('/auth?mode=register');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-white hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-3 py-3 rounded-lg shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <UserPlus size={16} className="text-black" />
                  <span 
                    className="text-black font-normal text-base"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: '400',
                      lineHeight: '1.5em'
                    }}
                  >
                    Register
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;