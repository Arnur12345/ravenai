import React from 'react';
import { motion } from 'framer-motion';
import { Sidebar, SidebarProvider, useSidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardContent: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isCollapsed } = useSidebar();

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ 
        backgroundColor: '#F5F7FB',
        color: 'var(--dashboard-very-light-blue)',
        fontFamily: 'Gilroy, Inter, sans-serif'
      }}
    >
      {/* Subtle background pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 20%, var(--dashboard-light-blue), transparent 50%),
                           radial-gradient(circle at 70% 80%, var(--dashboard-bright-blue), transparent 50%)`
        }}
      />
      
      {/* Mobile Navigation - shown on mobile and tablet */}
      <div className="lg:hidden">
        <MobileNavigation />
      </div>
      
      {/* Desktop Sidebar - hidden on mobile and tablet */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <motion.div 
        className="relative flex flex-col min-h-screen"
        animate={{ 
          paddingLeft: window.innerWidth >= 1024 ? (isCollapsed ? 120 : 384) : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ 
          paddingLeft: window.innerWidth >= 1024 ? (isCollapsed ? 120 : 384) : 0,
          paddingTop: window.innerWidth < 1024 ? '70px' : '0px'
        }}
      >
        {/* Desktop Header - hidden on mobile */}
        <div className="hidden lg:block">
          <Header />
        </div>
        
        {/* Page Content */}
        <main className="px-2 sm:px-4 py-1 sm:py-2 flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            className="h-full rounded-xl sm:rounded-2xl p-3 sm:p-6"
            style={{
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.02)'
            }}
          >
            {children}
          </motion.div>
        </main>
      </motion.div>
    </div>
  );
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
};