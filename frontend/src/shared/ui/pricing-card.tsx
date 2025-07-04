import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import TiltCard from './tilt-card';
import ClickSpark from './click-spark';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useTheme } from '@/shared/contexts/ThemeContext';

interface PricingPlan {
  name: string;
  description: string;
  monthlyPrice: number | string;
  annualPrice: number | string;
  features: string[];
  popular?: boolean;
  isEnterprise?: boolean;
}

interface PricingCardProps {
  plan: PricingPlan;
  index: number;
  isAnnual: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, index, isAnnual }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  // Theme-based styling
  const getCardStyles = () => {
    if (plan.popular) {
      return {
        background: theme === 'dark' ? '#1f2937' : '#ffffff',
        borderColor: theme === 'dark' ? '#374151' : '#111827',
        textColor: theme === 'dark' ? '#ffffff' : '#111827',
        textColorSecondary: theme === 'dark' ? '#d1d5db' : '#6b7280',
      };
    } else {
      // Non-popular cards - ensure dark text in light theme
      return {
        background: theme === 'dark' ? '#374151' : '#ffffff',
        borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
        textColor: theme === 'dark' ? '#ffffff' : '#1f2937', // Darker color for better contrast in light theme
        textColorSecondary: theme === 'dark' ? '#d1d5db' : '#4b5563', // Darker secondary color for light theme
      };
    }
  };

  const cardStyles = getCardStyles();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.15,
        ease: "easeOut"
      }}
      className={`relative ${plan.popular ? 'lg:scale-105 lg:-mt-4' : ''}`}
    >
      <TiltCard
        tiltIntensity={4}
        scaleOnHover={1.01}
        glareEffect={true}
        className="h-full"
      >
        <Card 
          className={`h-full relative border-2 transition-all duration-300 rounded-2xl overflow-hidden ${
            plan.popular 
              ? 'shadow-2xl' 
              : 'shadow-lg hover:shadow-xl'
          }`}
          style={{
            backgroundColor: cardStyles.background,
            borderColor: cardStyles.borderColor,
          }}
        >
          {/* Simple Popular Badge */}
          {plan.popular && (
            <div 
              className="absolute top-0 left-0 right-0 text-white text-center py-3 z-10"
              style={{
                backgroundColor: theme === 'dark' ? '#2563eb' : '#111827'
              }}
            >
              <span 
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ fontFamily: 'Gilroy, sans-serif' }}
              >
                {t('plan.popular')}
              </span>
            </div>
          )}
          
          <CardHeader className={`text-center relative z-10 ${plan.popular ? 'pt-16 pb-8' : 'pt-8 pb-8'}`}>
            <CardTitle 
              className="text-2xl font-bold mb-2"
              style={{ 
                fontFamily: 'Gilroy, sans-serif',
                color: cardStyles.textColor
              }}
            >
              {plan.name}
            </CardTitle>
            <CardDescription 
              className="text-base"
              style={{ 
                fontFamily: 'Gilroy, sans-serif',
                color: cardStyles.textColorSecondary
              }}
            >
              {plan.description}
            </CardDescription>
            
            <div className="mt-8">
              <div className="flex items-baseline justify-center">
                <motion.span 
                   className="text-5xl font-bold"
                   style={{ 
                     fontFamily: 'Gilroy, sans-serif',
                     color: cardStyles.textColor
                   }}
                   whileHover={{ scale: 1.05 }}
                   transition={{ type: "spring", duration: 0.2 }}
                 >
                  {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                </motion.span>
                {(typeof (isAnnual ? plan.annualPrice : plan.monthlyPrice) === 'number' || 
                 (typeof (isAnnual ? plan.annualPrice : plan.monthlyPrice) === 'string' && 
                  typeof (isAnnual ? plan.annualPrice : plan.monthlyPrice) === 'string' &&
                  (isAnnual ? plan.annualPrice : plan.monthlyPrice).toString().startsWith('$'))) ? (
                  <span 
                    className="text-xl ml-1"
                    style={{ 
                      fontFamily: 'Gilroy, sans-serif',
                      color: cardStyles.textColorSecondary
                    }}
                  >
                    / мес
                  </span>
                ) : null}
              </div>
              {isAnnual && plan.name !== 'Enterprise' && (
                <motion.p 
                  className="text-sm mt-2"
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {plan.name === 'Lite' ? (
                    <span className="text-blue-600 font-medium">{t('plan.free')}</span>
                  ) : (
                    <span className="text-blue-600 font-medium">{t('plan.save')}</span>
                  )}
                </motion.p>
              )}
              {!isAnnual && (
                <p 
                  className="text-sm mt-2"
                  style={{ 
                    fontFamily: 'Gilroy, sans-serif',
                    color: cardStyles.textColorSecondary
                  }}
                >
                  {t('plan.per_month')}
                </p>
              )}
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8 relative z-10">
            <div className="mb-8">
              <motion.div
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: "spring", duration: 0.2 }}
              >
                <ClickSpark 
                  sparkColor={plan.popular ? "#ffffff" : "#000000"} 
                  sparkCount={plan.popular ? 12 : 8} 
                  sparkSize={plan.popular ? 6 : 4}
                >
                  <Button
                    className={`w-full py-4 text-lg font-semibold rounded-xl transition-all duration-300 transform-gpu ${
                      plan.popular 
                        ? theme === 'dark'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-2xl'
                          : 'bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 shadow-lg hover:shadow-2xl'
                        : theme === 'dark'
                          ? 'bg-gray-600 border-2 border-gray-500 hover:bg-gray-500 hover:border-gray-400'
                          : 'bg-white border-2 border-gray-900 hover:bg-gray-300 hover:border-gray-900'
                    }`}
                    style={{ 
                      fontFamily: 'Gilroy, sans-serif',
                      boxShadow: plan.popular ? '0 10px 25px rgba(0, 0, 0, 0.15)' : undefined,
                      color: plan.popular 
                        ? '#ffffff' 
                        : theme === 'dark' 
                          ? '#ffffff' 
                          : '#1f2937',
                      '--hover-color': !plan.popular && theme !== 'dark' ? '#ffffff' : undefined
                    } as React.CSSProperties}
                  >
                    {t('plan.get_started')}
                  </Button>
                </ClickSpark>
              </motion.div>
            </div>

            <div className="space-y-1 mb-6">
              <p 
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ 
                  fontFamily: 'Gilroy, sans-serif',
                  color: cardStyles.textColor
                }}
              >
                {t('plan.features')}
              </p>
            </div>

            <ul className="space-y-4">
              {plan.features.map((feature, featureIndex) => (
                <motion.li 
                  key={featureIndex} 
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: featureIndex * 0.1 }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 180 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check 
                        className="w-5 h-5" 
                        style={{ color: theme === 'dark' ? '#3b82f6' : '#374151' }}
                      />
                    </motion.div>
                  </div>
                  <span 
                    className="text-sm leading-relaxed"
                    style={{ 
                      fontFamily: 'Gilroy, sans-serif',
                      color: cardStyles.textColorSecondary
                    }}
                  >
                    {feature}
                  </span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </TiltCard>
    </motion.div>
  );
};

export default PricingCard; 