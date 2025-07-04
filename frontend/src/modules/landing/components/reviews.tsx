import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useTheme } from '@/shared/contexts/ThemeContext';

const Reviews: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  const reviews = [
    {
      id: 1,
      name: "Artyqbay Arnur",
      title: "Producer",
      company: "NFactorial Incubator",
      avatar: "https://res-console.cloudinary.com/dq2pbzrtu/thumbnails/v1/image/upload/v1749808168/YXJudXJfdHNrYnVy/drilldown",
      quote: "RavenAI has revolutionized how we conduct our meetings. The real-time transcription and AI summaries save us hours every week, allowing us to focus on what matters most.",
      companyLogo: "https://nfactorial.school/static/media/logo.png",
      featured: true,
      bgColor: "bg-white",
      textColor: "text-gray-950"
    },
    {
      id: 2,
      name: "Dimash Yntyqbay",
      title: "Mentor",
      company: "NFactorial Incubator",
      avatar: "https://res-console.cloudinary.com/dq2pbzrtu/thumbnails/v1/image/upload/v1749808016/cGhvdG9fMjAyNS0wNi0wMV8xMS01OS00OF93bmJ1ZG8=/drilldown",
      quote: "The meeting intelligence platform helps us track action items and follow-ups seamlessly. It's a game changer for productivity.",
      featured: false,
      bgColor: "bg-gray-50",
      textColor: "text-gray-950"
    },
    {
      id: 3,
      name: "Yerdaulet Damir",
      title: "Frontend Engineer",
      company: "Zimran",
      avatar: "https://res-console.cloudinary.com/dq2pbzrtu/thumbnails/v1/image/upload/v1749808016/cGhvdG9fMjAyMy0xMi0xM18xOS01OC00MV92ZW0zd3I=/drilldown",
      quote: "RavenAI helps us save time while staying on top of the latest trends in our meetings. The search functionality is incredible.",
      featured: false,
      bgColor: "bg-gray-50",
      textColor: "text-gray-950"
    },
    {
      id: 4,
      name: "Raihan Karim",
      title: "Co-Founder",
      company: "Karim Solutions",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
      quote: "I spend several hours a day in meetings, but it was hard to find the right insights. Now I get content perfectly tailored to our business needs.",
      featured: true,
      bgColor: "bg-blue-600",
      textColor: "text-white",
      companyBrand: "Karim Solutions"
    },
    {
      id: 5,
      name: "Rafiul Islam",
      title: "Software Engineer",
      company: "Apex Technologies",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face",
      quote: "I think this platform will impact the future of AI industry and the future of meeting productivity.",
      featured: false,
      bgColor: "bg-gray-50",
      textColor: "text-gray-950"
    },
    {
      id: 6,
      name: "Alibek Seitov",
      title: "Product Manager",
      company: "TechCorp",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
      quote: "This was an inspiring experience that made me get up from my chair and start implementing better meeting practices.",
      featured: false,
      bgColor: "bg-gray-50",
      textColor: "text-gray-950"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section id="reviews" className={`relative ${theme.sectionBackground} py-32 px-4 overflow-hidden transition-all duration-700`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                    style={{ fontFamily: 'Gilroy, sans-serif' }}
                  >
            What our users say
          </h2>
          <p 
            className="text-xl text-gray-600 max-w-2xl mx-auto"
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                >
            Trusted by teams worldwide to transform their meeting experience
          </p>
              </motion.div>
              
        {/* Reviews Grid */}
              <motion.div 
          className="isolate grid w-full grid-cols-1 gap-6 md:grid-cols-2"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
          {reviews.map((review, index) => {
            const isSecondFeatured = review.featured && index === 3;
            
            // Build className string
            let cardClassName = "flex rounded-xl shadow-xl ring-1";
            
            if (review.featured) {
              cardClassName += " z-10 row-span-2";
            }
            
            if (isSecondFeatured) {
              cardClassName += " md:col-start-2 md:row-start-3";
            }
            
            if (review.bgColor === 'bg-blue-600') {
              cardClassName += " ring-blue-700 bg-blue-600";
            } else if (review.bgColor === 'bg-white') {
              cardClassName += " ring-gray-950/5 bg-white shadow-2xl";
            } else {
              cardClassName += " ring-gray-950/5 bg-gray-50 shadow";
            }
            
            return (
              <motion.div
                key={review.id}
                variants={cardVariants}
                className={cardClassName}
              >
                <div className="flex w-full flex-col items-start p-8">
                  {/* Company Logo/Brand for featured cards */}
                  {review.featured && (
                    <div className="mb-10">
                      {review.companyLogo ? (
                        <img 
                          src={review.companyLogo} 
                          alt={review.company}
                          className="h-10 w-auto"
                        />
                      ) : (
                        <span className={`text-lg font-bold ${review.textColor}`}>
                          {review.companyBrand || review.company}
                      </span>
                      )}
                    </div>
                  )}

                    {/* Quote */}
                  <div className={`${review.featured ? 'mt-auto' : 'mb-auto'} ${review.featured ? 'text-xl' : 'text-base/6'} ${review.textColor}`}>
                    <p className="relative font-book">
                        "{review.quote}"
                      </p>
                    </div>

                    {/* Author Info */}
                  <div className="mt-6 flex w-full items-center justify-between">
                    <div className="flex flex-wrap text-sm">
                      <span className={`w-full flex-none font-medium ${review.textColor}`}>
                        {review.name}
                      </span>
                      <span className={`mt-0.5 ${review.textColor === 'text-white' ? 'text-white/80' : 'text-gray-600'}`}>
                        {review.title}
                      </span>
                      <span className={`mt-0.5 flex items-center ${review.textColor === 'text-white' ? 'text-white/80' : 'text-gray-600'}`}>
                        <svg viewBox="0 0 10 10" fill="currentColor" className="mx-1 h-2.5 w-2.5 flex-none stroke-current">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m6.25 1.75-2.5 6.5"></path>
                        </svg>
                        {review.company}
                      </span>
                    </div>
                    
                    {/* Avatar */}
                    <div className="bg-black/2.5 relative flex-none overflow-hidden rounded-lg">
                        <img
                          src={review.avatar}
                        alt={review.name}
                        className="size-12 object-cover"
                          loading="lazy"
                        />
                      <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/10"></div>
                        </div>
                      </div>
                    </div>
              </motion.div>
            );
          })}
          </motion.div>
      </div>
    </section>
  );
};

export default Reviews;