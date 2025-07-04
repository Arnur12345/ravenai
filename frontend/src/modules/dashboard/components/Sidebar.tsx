import React, { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { 
  LayoutDashboard, 
  Calendar, 
  Zap,
  Settings, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import ravenBlackLogo from '@/assets/ravenblack.png';
import ravenBlackSmallLogo from '@/assets/ravenblacksmall.png';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

// Navigation items will be created inside the component with translations

interface SidebarContextType {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleCollapse }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isCollapsed, toggleCollapse } = useSidebar();
  const { t } = useLanguage();

  // Navigation items with translations
  const navigation: NavItem[] = [
    { name: t('dashboard.nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('dashboard.nav.meetings'), href: '/meetings', icon: Calendar },
    { name: t('dashboard.nav.integrations'), href: '/integrations', icon: Zap },
  ];

  const bottomNavigation: NavItem[] = [
    { name: t('dashboard.nav.settings'), href: '/settings', icon: Settings },
  ];

  const isCurrentPath = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <motion.div 
      className="hidden lg:fixed lg:inset-y-0 lg:z-20 lg:flex lg:flex-col relative"
      animate={{ width: isCollapsed ? 120 : 384 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ padding: '16px' }}
    >
      {/* Enhanced Collapse Toggle Button - выносим наружу */}
      <motion.button
        onClick={toggleCollapse}
        className="absolute top-6 -right-3 z-40 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group shadow-lg"
        style={{
          background: `linear-gradient(135deg, var(--dashboard-bright-blue), var(--dashboard-light-blue))`,
          boxShadow: `0 4px 15px var(--dashboard-bright-blue)40, 0 0 0 1px rgba(255, 255, 255, 0.3)`,
          border: '2px solid rgba(255, 255, 255, 0.4)'
        }}
        whileHover={{ 
          scale: 1.15,
          boxShadow: '0 6px 20px rgba(198, 223, 255, 0.6)'
        }}
        whileTap={{ scale: 0.9 }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 6px 25px rgba(198, 223, 255, 0.8)';
          e.currentTarget.style.transform = 'scale(1.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(198, 223, 255, 0.4)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-white drop-shadow-sm" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-white drop-shadow-sm" />
          )}
        </motion.div>
        
        {/* Glow effect */}
        <div 
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.3), transparent)',
          }}
        />
      </motion.button>

      <div 
        className="flex grow flex-col gap-y-5 overflow-y-auto px-6 py-6 rounded-2xl"
        style={{ 
          backgroundColor: '#ffffff',
          fontFamily: 'Gilroy, Inter, sans-serif',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.02)'
        }}
      >
        {/* RavenAI Logo */}
        <motion.div 
          className={`flex h-16 shrink-0 items-center ${isCollapsed ? 'justify-center' : ''}`}
          animate={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-3 group cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <motion.div 
              className="relative flex items-center justify-center rounded-xl shadow-lg group-hover:shadow-lg transition-all duration-300 group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, var(--dashboard-bright-blue), var(--dashboard-light-blue))`,
                boxShadow: `0 4px 20px var(--dashboard-bright-blue)30`
              }}
              animate={{
                height: isCollapsed ? 64 : 160,
                width: isCollapsed ? 64 : 160
              }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.img 
                src={isCollapsed ? ravenBlackSmallLogo : ravenBlackLogo} 
                alt="RavenBlack Logo" 
                className="object-contain"
                style={{ objectFit: 'contain' }}
                animate={{
                  height: isCollapsed ? 40 : 192,
                  width: isCollapsed ? 40 : 192
                }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
              <div 
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)'
                }}
              />
            </motion.div>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div 
                  className="flex flex-col"
                  initial={{ opacity: 0, x: -20, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 'auto' }}
                  exit={{ opacity: 0, x: -20, width: 0 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <span 
                    className="text-2xl font-bold bg-clip-text text-transparent whitespace-nowrap"
                    style={{
                      backgroundImage: `linear-gradient(135deg, var(--dashboard-bright-blue), var(--dashboard-light-blue))`
                    }}
                  >
                    RavenAI
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Main Navigation */}
        <nav className="flex flex-1 flex-col">
          <div className="space-y-1">
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div 
                  className="text-xs font-semibold uppercase tracking-wider mb-3 px-3"
                  style={{ color: 'var(--dashboard-light-blue)' }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {t('dashboard.nav.menu')}
                </motion.div>
              )}
            </AnimatePresence>
            {navigation.map((item, index) => {
              const isCurrent = isCurrentPath(item.href);
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.05,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                >
                  <motion.button
                    onClick={() => navigate(item.href)}
                    className={`
                      group flex w-full items-center gap-x-3 rounded-xl px-3 py-2.5 text-sm font-medium
                      transition-all duration-300 ease-out relative
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                    style={{
                      backgroundColor: isCurrent ? 'var(--dashboard-bright-blue)' : 'transparent',
                      color: isCurrent ? 'var(--dashboard-black)' : 'var(--dashboard-very-light-blue)',
                      border: `1px solid ${isCurrent ? 'var(--dashboard-bright-blue)' : 'transparent'}`,
                      ...(isCurrent && {
                        boxShadow: `0 4px 20px var(--dashboard-bright-blue)30`
                      })
                    }}
                    animate={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    whileHover={{ 
                      scale: 1.02,
                      backgroundColor: isCurrent ? 'var(--dashboard-bright-blue)' : 'var(--dashboard-very-light-blue)20'
                    }}
                    whileTap={{ scale: 0.98 }}
                    onMouseEnter={(e) => {
                      if (!isCurrent) {
                        e.currentTarget.style.backgroundColor = 'var(--dashboard-very-light-blue)20';
                        e.currentTarget.style.borderColor = 'var(--dashboard-light-blue)50';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrent) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                      }
                    }}
                  >
                    <motion.div
                      className={`h-5 w-5 shrink-0 transition-all duration-300`}
                      style={{
                        color: isCurrent ? 'var(--dashboard-black)' : 'var(--dashboard-light-blue)'
                      }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <item.icon className="h-full w-full" />
                    </motion.div>
                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.span 
                          className="truncate whitespace-nowrap"
                          initial={{ opacity: 0, x: -10, width: 0 }}
                          animate={{ opacity: 1, x: 0, width: 'auto' }}
                          exit={{ opacity: 0, x: -10, width: 0 }}
                          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {isCurrent && !isCollapsed && (
                      <motion.div 
                        className="absolute right-2 h-2 w-2 rounded-full"
                        style={{ backgroundColor: 'var(--dashboard-black)' }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.button>
                </motion.div>
              );
            })}
          </div>

          {/* Separator */}
          <motion.div 
            className="my-6 border-t"
            style={{ borderColor: 'var(--dashboard-light-blue)50' }}
            animate={{ 
              marginLeft: isCollapsed ? '12px' : '0px',
              marginRight: isCollapsed ? '12px' : '0px'
            }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          />

          {/* General Section */}
          <div className="space-y-1">
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div 
                  className="text-xs font-semibold uppercase tracking-wider mb-3 px-3"
                  style={{ color: 'var(--dashboard-light-blue)' }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {t('dashboard.nav.general')}
                </motion.div>
              )}
            </AnimatePresence>
            {bottomNavigation.map((item, index) => {
              const isCurrent = isCurrentPath(item.href);
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: (navigation.length + index) * 0.05,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                >
                  <motion.button
                    onClick={() => navigate(item.href)}
                    className={`
                      group flex w-full items-center gap-x-3 rounded-xl px-3 py-2.5 text-sm font-medium
                      transition-all duration-300 ease-out relative
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                    style={{
                      backgroundColor: isCurrent ? 'var(--dashboard-bright-blue)' : 'transparent',
                      color: isCurrent ? 'var(--dashboard-black)' : 'var(--dashboard-very-light-blue)',
                      border: `1px solid ${isCurrent ? 'var(--dashboard-bright-blue)' : 'transparent'}`,
                      ...(isCurrent && {
                        boxShadow: `0 4px 20px var(--dashboard-bright-blue)30`
                      })
                    }}
                    animate={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    whileHover={{ 
                      scale: 1.02,
                      backgroundColor: isCurrent ? 'var(--dashboard-bright-blue)' : 'var(--dashboard-very-light-blue)20'
                    }}
                    whileTap={{ scale: 0.98 }}
                    onMouseEnter={(e) => {
                      if (!isCurrent) {
                        e.currentTarget.style.backgroundColor = 'var(--dashboard-very-light-blue)20';
                        e.currentTarget.style.borderColor = 'var(--dashboard-light-blue)50';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrent) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                      }
                    }}
                  >
                    <motion.div
                      className={`h-5 w-5 shrink-0 transition-all duration-300`}
                      style={{
                        color: isCurrent ? 'var(--dashboard-black)' : 'var(--dashboard-light-blue)'
                      }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <item.icon className="h-full w-full" />
                    </motion.div>
                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.span 
                          className="truncate whitespace-nowrap"
                          initial={{ opacity: 0, x: -10, width: 0 }}
                          animate={{ opacity: 1, x: 0, width: 'auto' }}
                          exit={{ opacity: 0, x: -10, width: 0 }}
                          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {isCurrent && !isCollapsed && (
                      <motion.div 
                        className="absolute right-2 h-2 w-2 rounded-full"
                        style={{ backgroundColor: 'var(--dashboard-black)' }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        </nav>
      </div>
    </motion.div>
  );
}; 