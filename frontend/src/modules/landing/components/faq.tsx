import React from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/accordion';
import { Button } from '@/shared/ui/button';
import ClickSpark from '@/shared/ui/click-spark';
import { useLanguage } from '@/shared/contexts/LanguageContext';

const FAQ: React.FC = () => {
  const { t } = useLanguage();
  
  const faqs = [
    {
      question: "How accurate are the AI-generated summaries?",
      answer: "Our AI achieves 95%+ accuracy in capturing key points, decisions, and action items. The system is continuously learning and improving based on user feedback and real-world usage patterns."
    },
    {
      question: "Which video conferencing platforms do you support?",
      answer: "We currently support Zoom, Google Meet, Microsoft Teams, and Slack calls. We're actively working on adding support for more platforms based on user demand."
    },
    {
      question: "Is my meeting data secure and private?",
      answer: "Absolutely. We use enterprise-grade encryption for all data in transit and at rest. Your meeting recordings are processed securely and automatically deleted after summary generation unless you choose to save them."
    },
    {
      question: "Can I customize the summary format?",
      answer: "Yes! You can choose from multiple summary templates, create custom formats, and even train the AI to focus on specific types of information that matter most to your team or industry."
    },
    {
      question: "What happens if I exceed my plan's recording limits?",
      answer: "You'll receive notifications as you approach your limit. If exceeded, you can either upgrade your plan or purchase additional hours. We never interrupt ongoing meetings - overages are handled gracefully."
    }
  ];

  return (
    <section id="faq" className="bg-gradient-to-br from-white via-slate-50 to-white py-32 px-4 transition-all duration-500">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent mb-8"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            {t('faq.title')}
          </motion.h2>
          <motion.p 
            className="text-lg text-slate-600 max-w-4xl mx-auto leading-relaxed"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {t('faq.subtitle')}
          </motion.p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Accordion type="single" className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1 + 0.5 
                }}
              >
                <AccordionItem 
                value={`item-${index}`}
                  className="border border-slate-200/60 bg-white/60 hover:bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-500"
              >
                <AccordionTrigger 
                    className="text-left text-lg font-bold text-slate-900 hover:text-blue-700 py-8 transition-colors duration-300"
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent 
                    className="text-slate-600 leading-relaxed pb-8 text-base"
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                >
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Support Section */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <p 
            className="text-slate-600 mb-6 text-base"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            Still have questions?
          </p>
          <ClickSpark sparkColor="#2563eb" sparkCount={8} sparkSize={4}>
            <Button
              variant="ghost"
              className="text-blue-600 hover:text-blue-700 font-bold text-base underline underline-offset-4 hover:scale-105 transition-all duration-300"
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              Contact our support team
            </Button>
          </ClickSpark>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ; 