import React from 'react';
import { motion } from 'framer-motion';

interface BlurredTextRevealProps {
  text: string;
  className?: string;
}

const BlurredTextReveal: React.FC<BlurredTextRevealProps> = ({ text, className = "" }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Blurred Rectangle */}
      <motion.div
        className="absolute top-0 left-0 w-full h-1/2 bg-gray-800 blur-3xl"
        initial={{ y: '-100%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      {/* Text Content */}
      <motion.div
        className={`relative text-white text-4xl font-semibold pt-20 ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        {text}
      </motion.div>
    </div>
  );
};

export default BlurredTextReveal; 