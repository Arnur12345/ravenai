import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionProps {
  children: React.ReactNode;
  type?: 'single' | 'multiple';
  className?: string;
}

interface AccordionItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

interface AccordionTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const AccordionContext = React.createContext<{
  openItems: string[];
  toggleItem: (value: string) => void;
  type: 'single' | 'multiple';
}>({
  openItems: [],
  toggleItem: () => {},
  type: 'single'
});

const AccordionItemContext = React.createContext<{
  value: string;
  isOpen: boolean;
}>({
  value: '',
  isOpen: false
});

export const Accordion: React.FC<AccordionProps> = ({ 
  children, 
  type = 'single', 
  className = '' 
}) => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (value: string) => {
    if (type === 'single') {
      setOpenItems(openItems.includes(value) ? [] : [value]);
    } else {
      setOpenItems(prev => 
        prev.includes(value) 
          ? prev.filter(item => item !== value)
          : [...prev, value]
      );
    }
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
      <div className={className}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

export const AccordionItem: React.FC<AccordionItemProps> = ({ 
  children, 
  value, 
  className = '' 
}) => {
  const { openItems } = React.useContext(AccordionContext);
  const isOpen = openItems.includes(value);

  return (
    <AccordionItemContext.Provider value={{ value, isOpen }}>
      <div className={`border-b border-gray-200 ${className}`}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
};

export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({ 
  children, 
  className = '',
  ...props
}) => {
  const { toggleItem } = React.useContext(AccordionContext);
  const { value, isOpen } = React.useContext(AccordionItemContext);

  return (
    <button
      className={`flex w-full items-center justify-between py-4 text-left font-medium hover:underline ${className}`}
      onClick={() => toggleItem(value)}
      {...props}
    >
      {children}
      <ChevronDown 
        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} 
      />
    </button>
  );
};

export const AccordionContent: React.FC<AccordionContentProps> = ({ 
  children, 
  className = '',
  ...props
}) => {
  const { isOpen } = React.useContext(AccordionItemContext);

  return (
    <div
      className={`overflow-hidden transition-all duration-200 ${
        isOpen ? 'max-h-96 pb-4' : 'max-h-0'
      }`}
    >
      <div className={`text-gray-600 ${className}`} {...props}>
        {children}
      </div>
    </div>
  );
}; 