import React from 'react';
import { motion } from 'framer-motion';
import { Sidebar, SidebarProvider, useSidebar } from './Sidebar';
import { Header } from './Header';

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
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <motion.div 
        className="relative z-10 flex flex-col min-h-screen"
        animate={{ 
          paddingLeft: isCollapsed ? 120 : 384 
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ paddingLeft: isCollapsed ? 120 : 384 }}
      >
        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <main className="px-4 py-4 flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            className="h-full rounded-2xl p-6"
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