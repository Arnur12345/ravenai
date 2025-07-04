import React from 'react';

export interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

interface ChartContainerProps {
  config: ChartConfig;
  children: React.ReactNode;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ 
  config, 
  children, 
  className = '' 
}) => {
  // Set CSS variables for chart colors
  const style: Record<string, string> = {};
  Object.entries(config).forEach(([key, { color }], index) => {
    style[`--color-${key}`] = color;
    style[`--chart-${index + 1}`] = color;
  });

  return (
    <div 
      className={`chart-container ${className}`}
      style={style as React.CSSProperties}
    >
      {children}
    </div>
  );
};

interface ChartTooltipProps {
  cursor?: boolean;
  content?: React.ComponentType<any>;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = () => {
  // This is a wrapper component for recharts Tooltip
  // The actual implementation will be handled by recharts
  return null;
};

interface ChartTooltipContentProps {
  className?: string;
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const ChartTooltipContent: React.FC<ChartTooltipContentProps> = ({ 
  className = '',
  active,
  payload,
  label 
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className={`rounded-lg border border-gray-200 bg-background p-2 shadow-md ${className}`}>
      <div className="grid gap-2">
        <div className="font-medium">{label}</div>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="h-2 w-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium">{entry.name}:</span>
            <span>{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}; 