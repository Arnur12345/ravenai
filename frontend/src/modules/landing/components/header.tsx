import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, UserPlus } from 'lucide-react';
import ravenlogo from '@/assets/ravenwhite.png';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

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
        
        {/* Auth Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Sign In Button */}
          <motion.button 
            className="bg-transparent border border-[#616161] hover:bg-white/10 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 px-4 py-2 rounded-lg"
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
              className="hidden sm:inline text-white font-normal text-xs lg:text-sm"
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
            className="bg-white hover:bg-gray-100 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 px-4 py-2 rounded-lg shadow-sm"
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
              className="hidden sm:inline text-black font-normal text-xs lg:text-sm"
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
      </div>
    </motion.header>
  );
};

export default Header;