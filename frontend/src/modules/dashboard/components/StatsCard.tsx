import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  name: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };

  index?: number;
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  name, 
  value, 
  icon: Icon, 
  trend, 
  index = 0, 
  onClick 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        y: -5, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={`
        group relative backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200 hover:border-gray-300
        p-4 sm:p-6 overflow-hidden cursor-pointer transition-all duration-300
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
      `}
      style={{
        backgroundColor: 'var(--dashboard-black)',
        fontFamily: 'Gilroy, Inter, sans-serif'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 10px 40px #C6DFFF20`;
        e.currentTarget.style.backgroundColor = '#C6DFFF05';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.backgroundColor = 'var(--dashboard-black)';
      }}
    >
      {/* Subtle background gradient */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: `linear-gradient(135deg, var(--dashboard-bright-blue), var(--dashboard-light-blue))`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
              className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 border border-gray-200"
              style={{
                backgroundColor: 'var(--dashboard-bright-blue)20'
              }}
            >
              <div
                style={{ color: 'var(--dashboard-bright-blue)' }}
              >
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.3, duration: 0.3 }}
              className="text-xs sm:text-sm font-medium mb-1 group-hover:opacity-80 transition-opacity duration-300"
              style={{ color: 'var(--dashboard-light-blue)' }}
            >
              {name}
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.4, duration: 0.3 }}
              className="text-2xl sm:text-3xl font-bold mb-2 group-hover:opacity-90 transition-opacity duration-300"
              style={{ color: 'var(--dashboard-very-light-blue)' }}
            >
              {value}
            </motion.p>
          </div>
        </div>
        
        {/* Trend indicator */}
        {trend && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.5, duration: 0.3 }}
            className="flex items-center space-x-2 mt-2"
          >
            <div 
              className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border border-gray-200`}
              style={{
                backgroundColor: trend.isPositive 
                  ? 'var(--dashboard-bright-blue)20' 
                  : 'var(--dashboard-light-blue)20',
                color: trend.isPositive 
                  ? 'var(--dashboard-bright-blue)' 
                  : 'var(--dashboard-light-blue)'
              }}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span className="text-xs">{Math.abs(trend.value)}%</span>
            </div>
            <span 
              className="text-xs hidden sm:inline"
              style={{ color: 'var(--dashboard-light-blue)' }}
            >
              {trend.label}
            </span>
          </motion.div>
        )}
      </div>
      
      {/* Bottom accent line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1 opacity-50 group-hover:opacity-80 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, var(--dashboard-bright-blue), var(--dashboard-light-blue))`
        }}
      />
      
      {/* Hover glow effect */}
      <div 
        className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, var(--dashboard-bright-blue), var(--dashboard-light-blue))`
        }}
      />
    </motion.div>
  );
};