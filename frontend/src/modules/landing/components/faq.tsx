import React from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/accordion';
import { Button } from '@/shared/ui/button';
import ClickSpark from '@/shared/ui/click-spark';
import BorderBeam from '@/shared/ui/border-beam';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { HelpCircle, MessageCircle, Sparkles } from 'lucide-react';

const FAQ: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  const faqs = [
    {
      question: "How accurate are the AI-generated summaries?",
      answer: "Our AI achieves 95%+ accuracy in capturing key points, decisions, and action items. The system is continuously learning and improving based on user feedback and real-world usage patterns.",
      icon: Sparkles
    },
    {
      question: "Which video conferencing platforms do you support?",
      answer: "We currently support Zoom, Google Meet, Microsoft Teams, and Slack calls. We're actively working on adding support for more platforms based on user demand.",
      icon: MessageCircle
    },
    {
      question: "Is my meeting data secure and private?",
      answer: "Absolutely. We use enterprise-grade encryption for all data in transit and at rest. Your meeting recordings are processed securely and automatically deleted after summary generation unless you choose to save them.",
      icon: HelpCircle
    },
    {
      question: "Can I customize the summary format?",
      answer: "Yes! You can choose from multiple summary templates, create custom formats, and even train the AI to focus on specific types of information that matter most to your team or industry.",
      icon: Sparkles
    },
    {
      question: "What happens if I exceed my plan's recording limits?",
      answer: "You'll receive notifications as you approach your limit. If exceeded, you can either upgrade your plan or purchase additional hours. We never interrupt ongoing meetings - overages are handled gracefully.",
      icon: HelpCircle
    }
  ];

  // Black theme matching hero and features components
  const getThemeClasses = () => {
    return {
      // Black background matching hero
      sectionBackground: 'bg-black',
      
      // Subtle background elements with white/gray
      backgroundElement: 'bg-white/5',
        
      // White badge with black text (hero style)
      badge: 'bg-white/90 border border-white/20 backdrop-blur-md',
      badgeIcon: 'text-black',
      badgeText: 'text-black',
      
      // White text on black background
      titleText: 'text-white',
      subtitleText: 'text-white/80',
      
      // Dark cards with white borders (hero button style)
      cardBackground: 'bg-white/10 border-white/20',
      cardBorder: 'hover:bg-white/15 hover:border-white/30',
      
      // White text for cards
      questionText: 'text-white hover:text-white/90',
      answerText: 'text-white/70',
      
      // Icon background with white styling
      iconBackground: 'bg-white/10',
      
      // White icon color
      iconColor: 'text-white',
      
      // Support section styling matching the black theme
      supportContainer: 'bg-white/10 border-white/20 backdrop-blur-md',
      supportText: 'text-white/80',
      supportButton: 'bg-white hover:bg-white/90 text-black'
    };
  };

  const themeClasses = getThemeClasses();

  return (
    <section id="faq" className={`${themeClasses.sectionBackground} py-32 px-4 transition-all duration-500 relative overflow-hidden`}>
      {/* Minimal background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${themeClasses.backgroundElement} rounded-full blur-3xl opacity-30`} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${themeClasses.backgroundElement} rounded-full blur-3xl opacity-20`} />
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Enhanced Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          {/* Badge */}
          <motion.div
            className={`inline-flex items-center gap-3 ${themeClasses.badge} px-6 py-3 rounded-full mb-8 transition-all duration-500`}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, type: "spring", stiffness: 150, damping: 15 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
          >
            <HelpCircle className={`w-5 h-5 ${themeClasses.badgeIcon}`} />
            <span className={`${themeClasses.badgeText} font-semibold`} style={{ fontFamily: 'Gilroy, sans-serif' }}>
              Frequently Asked Questions
            </span>
          </motion.div>
          
          <motion.h2 
            className={`text-4xl md:text-5xl font-bold ${themeClasses.titleText} mb-8`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            {t('faq.title')}
          </motion.h2>
          <motion.p 
            className={`text-xl ${themeClasses.subtitleText} max-w-4xl mx-auto leading-relaxed`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {t('faq.subtitle')}
          </motion.p>
        </motion.div>

        {/* Enhanced FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Accordion type="single" className="space-y-8">
            {faqs.map((faq, index) => {
              const IconComponent = faq.icon;
              return (
                <motion.div
                  key={index} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1 + 0.5 
                  }}
                  className="group"
                >
                  <AccordionItem 
                    value={`item-${index}`}
                    className={`relative border ${themeClasses.cardBorder} ${themeClasses.cardBackground} backdrop-blur-sm rounded-2xl px-8 py-2 transition-all duration-500 overflow-hidden`}
                  >
                    {/* BorderBeam for first item */}
                    {index === 0 && (
                      <BorderBeam 
                        size={400} 
                        duration={15} 
                        colorFrom={theme === 'dark' ? '#ffffff' : '#3b82f6'} 
                        colorTo={theme === 'dark' ? '#60a5fa' : '#9ca3af'} 
                        borderWidth={1.5}
                      />
                    )}
                    
                    <AccordionTrigger 
                      className={`text-left text-lg font-bold ${themeClasses.questionText} py-8 transition-all duration-300 group-hover:scale-[1.02] flex items-center gap-4`}
                      style={{ fontFamily: 'Gilroy, sans-serif' }}
                    >
                      <motion.div
                        className={`w-10 h-10 ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-xl flex items-center justify-center flex-shrink-0`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <IconComponent className={`w-5 h-5 ${themeClasses.iconColor}`} />
                      </motion.div>
                      <span className="flex-1">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent 
                      className={`${themeClasses.answerText} leading-relaxed pb-8 text-base ml-14 transition-colors duration-300`}
                      style={{ fontFamily: 'Gilroy, sans-serif' }}
                    >
                      {faq.answer}
                    </AccordionContent>
                    
                    {/* Subtle hover gradient overlay */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${theme === 'dark' ? 'from-blue-500/5 to-purple-500/5' : 'from-blue-50/50 to-indigo-50/50'} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none`}
                      initial={{ opacity: 0 }}
                    />
                  </AccordionItem>
                </motion.div>
              );
            })}
          </Accordion>
        </motion.div>

        
      </div>
    </section>
  );
};

export default FAQ;