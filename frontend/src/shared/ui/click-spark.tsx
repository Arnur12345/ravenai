import React, { useRef, useCallback } from 'react';
import { gsap } from 'gsap';

interface ClickSparkProps {
  children: React.ReactNode;
  className?: string;
  sparkColor?: string;
  sparkCount?: number;
  sparkSize?: number;
  disabled?: boolean;
}

const ClickSpark: React.FC<ClickSparkProps> = ({
  children,
  className = '',
  sparkColor = '#000000',
  sparkCount = 8,
  sparkSize = 4,
  disabled = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const createSpark = useCallback((x: number, y: number) => {
    if (!containerRef.current || disabled) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Создаем искры
    for (let i = 0; i < sparkCount; i++) {
      const spark = document.createElement('div');
      spark.style.position = 'absolute';
      spark.style.width = `${sparkSize}px`;
      spark.style.height = `${sparkSize}px`;
      spark.style.backgroundColor = sparkColor;
      spark.style.borderRadius = '50%';
      spark.style.pointerEvents = 'none';
      spark.style.zIndex = '9999';
      
      // Позиционируем искру в точке клика относительно контейнера
      spark.style.left = `${x - rect.left - sparkSize / 2}px`;
      spark.style.top = `${y - rect.top - sparkSize / 2}px`;
      
      container.appendChild(spark);

      // Случайное направление для каждой искры
      const angle = (i / sparkCount) * Math.PI * 2;
      const distance = 30 + Math.random() * 20;
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance;

      // Анимация искры
      gsap.timeline()
        .to(spark, {
          x: endX,
          y: endY,
          scale: 0,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          onComplete: () => {
            if (spark.parentNode) {
              spark.parentNode.removeChild(spark);
            }
          }
        });
    }
  }, [sparkCount, sparkSize, sparkColor, disabled]);

  const handleClick = useCallback((event: React.MouseEvent) => {
    createSpark(event.clientX, event.clientY);
  }, [createSpark]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onClick={handleClick}
      style={{ position: 'relative', overflow: 'visible' }}
    >
      {children}
    </div>
  );
};

export default ClickSpark; 