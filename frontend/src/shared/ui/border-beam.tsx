import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils';

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  style?: React.CSSProperties;
  reverse?: boolean;
  initialOffset?: number;
  borderWidth?: number;
}

export const BorderBeam: React.FC<BorderBeamProps> = ({
  className,
  size = 50,
  duration = 6,
  delay = 0,
  colorFrom = '#ffffff',
  colorTo = '#9ca3af',
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1,
}) => {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent]',
        className
      )}
      style={{
        '--border-width': borderWidth,
        '--size': size,
        '--duration': duration + 's',
        '--delay': delay + 's',
        '--color-from': colorFrom,
        '--color-to': colorTo,
        '--initial-offset': initialOffset + '%',
        ...style,
      } as React.CSSProperties}
    >
      <motion.div
        className="absolute inset-0 rounded-[inherit] [background:linear-gradient(90deg,transparent,transparent,var(--color-from),var(--color-to),transparent,transparent)] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:xor]"
        initial={{
          transform: reverse
            ? `translateX(-${100 - initialOffset}%) translateY(-${100 - initialOffset}%)`
            : `translateX(-${initialOffset}%) translateY(-${initialOffset}%)`,
        }}
        animate={{
          transform: reverse
            ? `translateX(-${initialOffset}%) translateY(-${initialOffset}%)`
            : `translateX(-${100 - initialOffset}%) translateY(-${100 - initialOffset}%)`,
        }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          background: `linear-gradient(90deg, transparent, transparent, ${colorFrom}, ${colorTo}, transparent, transparent)`,
          maskImage: `
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0)
          `,
          maskComposite: 'xor',
          WebkitMaskImage: `
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0)
          `,
          WebkitMaskComposite: 'xor',
        }}
      />
    </div>
  );
};

export default BorderBeam;