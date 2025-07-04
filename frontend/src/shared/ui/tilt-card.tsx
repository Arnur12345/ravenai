import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  tiltIntensity?: number;
  scaleOnHover?: number;
  glareEffect?: boolean;
  perspective?: number;
  style?: React.CSSProperties;
}

const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  tiltIntensity = 6,
  scaleOnHover = 1.02,
  glareEffect = true,
  perspective = 1000,
  style = {}
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), { damping: 40, stiffness: 80, mass: 1 });
  const rotateY = useSpring(useMotionValue(0), { damping: 40, stiffness: 80, mass: 1 });
  const scale = useSpring(1, { damping: 40, stiffness: 80, mass: 1 });
  const glareOpacity = useSpring(0);

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -tiltIntensity;
    const rotationY = (offsetX / (rect.width / 2)) * tiltIntensity;

    rotateX.set(rotationX);
    rotateY.set(rotationY);

    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  const handleMouseEnter = () => {
    scale.set(scaleOnHover);
    if (glareEffect) {
      glareOpacity.set(0.15);
    }
  };

  const handleMouseLeave = () => {
    glareOpacity.set(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ 
        perspective: `${perspective}px`, 
        fontFamily: 'url(assets/gilroy.ttf)',
        ...style 
      }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: 'preserve-3d'
        }}
        className="relative"
      >
        {children}
        
        {/* Glare Effect */}
        {glareEffect && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 50%, rgba(255,255,255,0.2) 100%)',
              opacity: glareOpacity,
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default TiltCard; 