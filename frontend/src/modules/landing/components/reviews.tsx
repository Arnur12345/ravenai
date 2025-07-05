import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, Users, Calendar, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { dashboardApi } from '@/shared/api/dashboardApi';

interface Statistics {
  total_users: number;
  total_meetings: number;
  total_processed_meetings: number;
}

const Reviews: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Enhanced theme-based classes matching other landing pages
  const getThemeClasses = () => {
    return {
      // Matching Features/Hero background for smooth transition
      sectionBackground: theme === 'dark' 
        ? 'bg-gradient-to-b from-[rgb(31,34,40)] via-slate-800 to-slate-900' 
        : 'bg-gradient-to-b from-slate-50 to-white',
      
      // Subtle background elements with better visibility
      backgroundElement: theme === 'dark'
        ? 'bg-slate-600/15'
        : 'bg-gray-300/20',
        
      // Enhanced badge with better contrast
      badge: theme === 'dark'
        ? 'bg-slate-800/90 border border-slate-600/60 backdrop-blur-md'
        : 'bg-white/90 border border-gray-200/60 backdrop-blur-sm',
      badgeIcon: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      badgeText: theme === 'dark' ? 'text-slate-200' : 'text-gray-700',
      
      // Better text contrast
      titleText: theme === 'dark' ? 'text-slate-100' : 'text-gray-900',
      subtitleText: theme === 'dark' ? 'text-slate-200' : 'text-gray-600',
      
      // Enhanced card styling with better contrast
      cardBackground: theme === 'dark' 
        ? 'bg-slate-800/70 backdrop-blur-md border-slate-700/60' 
        : 'bg-white/80 backdrop-blur-sm border-gray-200/60',
      cardBorder: theme === 'dark' 
        ? 'shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-slate-900/30' 
        : 'shadow-lg shadow-gray-200/20 hover:shadow-xl hover:shadow-gray-300/30',
      cardHover: theme === 'dark' 
        ? 'hover:bg-slate-700/80 hover:border-slate-600/70' 
        : 'hover:bg-gray-50/90 hover:border-gray-300/70',
      
      // Card text with proper contrast
      cardTitle: theme === 'dark' 
        ? 'text-white group-hover:text-blue-100 transition-colors duration-300' 
        : 'text-gray-900',
      cardDescription: theme === 'dark' 
        ? 'text-gray-300 group-hover:text-gray-100 transition-colors duration-300' 
        : 'text-gray-600',
      cardQuote: theme === 'dark' 
        ? 'text-gray-100' 
        : 'text-gray-800',
      
      // Navigation buttons
      navButton: theme === 'dark'
        ? 'bg-slate-800/80 backdrop-blur-sm border-slate-700 text-white hover:bg-slate-700 hover:border-slate-600'
        : 'bg-white/80 backdrop-blur-sm border-gray-200 text-gray-800 hover:bg-gray-50 hover:border-gray-300',
      
      // Statistics
      statCard: theme === 'dark'
        ? 'bg-slate-800/50 border-slate-700/50'
        : 'bg-white/50 border-gray-200/50',
      statNumber: theme === 'dark' ? 'text-white' : 'text-gray-900',
      statLabel: theme === 'dark' ? 'text-slate-300' : 'text-gray-600',
      statIcon: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
    };
  };

  const themeClasses = getThemeClasses();

  const reviews = [
    {
      id: 1,
      name: "Alex Gubayev",
      title: "iOS Developer",
      company: "Kolesa Group",
      avatar: "https://res.cloudinary.com/dq2pbzrtu/image/upload/v1751632110/alikhan_gubayev_qjumtg.jpg",
      quote: "Raven помог мне оптимизировать мои многочисленные собрания с колегами",
      rating: 5
    },
    {
      id: 2,
      name: "Bahauddin Toleu",
      title: "Backend Developer",
      company: "Surfaice",
      avatar: "https://res.cloudinary.com/dq2pbzrtu/image/upload/v1751727668/Bahauddin_zpik1q.jpg",
      quote: "Я как разработчик на ремоуте у которого каждый день 2-3 митинга. Сталкиваюсь с тем чтобы запомнить ключевые моменты встреч и делать заметки. Но, с помощью Raven это стало автоматизировано 🦅",
      rating: 5
    },
    {
      id: 3,
      name: "Bernar Omarshayev",
      title: "DevOps Engineer",
      company: "Bereke Bank",
      avatar: "https://res.cloudinary.com/dq2pbzrtu/image/upload/v1751729144/1678534239853_row9v1.jpg",
      quote: "Как DevOps инженеру, у которого очень частые созвоны, Raven помог мне упростить процессы планирования после встреч.",
      rating: 5
    },
    {
      id: 4,
      name: "Abay Alenov",
      title: "Middle Backend Developer",
      company: "Bank CenterCredit",
      avatar: "https://res.cloudinary.com/dq2pbzrtu/image/upload/v1751729705/abay_olkju8.jpg",
      quote: "Raven полезный помощник для разработчика с плотным графиком, часто бывает что работники забывают выполнять свои таски, Raven помог с решением этой проблемы.",
      rating: 5
    },
    {
      id: 5,
      name: "Bakhredin Zurgambayev",
      title: "Middle Typescript Developer",
      company: "Bank CenterCredit",
      avatar: "https://res.cloudinary.com/dq2pbzrtu/image/upload/v1751729919/bakhredin_bvilcl.jpg",
      quote: "Raven революционизировал наш подход к проведению встреч. Теперь мы можем сосредоточиться на важных решениях, а не на ведении заметок.",
      rating: 5
    },
    {
      id: 6,
      name: "Gaziz Bolat",
      title: "Middle Frontend Developer",
      company: "Invictus Go",
      avatar: "https://res.cloudinary.com/dq2pbzrtu/image/upload/v1751729150/Gaziz_t56jur.jpg",
      quote: "Благодаря Raven наша команда стала более продуктивной. Автоматическое создание задач после встреч экономит нам часы работы каждую неделю.",
      rating: 5
    }
  ];

  // Load statistics on component mount
  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setIsLoadingStats(true);
        const stats = await dashboardApi.getGlobalStatistics();
        setStatistics(stats);
      } catch (error) {
        console.error('Failed to load statistics:', error);
        // Set fallback values
        setStatistics({
          total_users: 1000,
          total_meetings: 5000,
          total_processed_meetings: 4500
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadStatistics();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(reviews.length / 3));
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, reviews.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(reviews.length / 3));
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(reviews.length / 3)) % Math.ceil(reviews.length / 3));
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.8
      }
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  return (
    <section className={`relative ${themeClasses.sectionBackground} py-32 px-4 overflow-hidden transition-all duration-700 ease-out`}>
      {/* Enhanced subtle background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className={`absolute top-1/4 left-1/4 w-96 h-96 ${themeClasses.backgroundElement} rounded-full filter blur-3xl`}
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className={`absolute top-2/3 right-1/4 w-80 h-80 ${themeClasses.backgroundElement} rounded-full filter blur-3xl`}
          animate={{ 
            x: [0, -80, 0],
            y: [0, 40, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{ 
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ 
            type: "spring",
            stiffness: 80,
            damping: 20,
            duration: 1.2
          }}
        >
          {/* Enhanced badge */}
          <motion.div
            className={`inline-flex items-center gap-3 ${themeClasses.badge} px-6 py-3 rounded-full mb-8 transition-all duration-500 ease-out`}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              delay: 0.3, 
              duration: 0.8,
              type: "spring",
              stiffness: 150,
              damping: 15
            }}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.3, ease: "easeOut" }
            }}
          >
            <Star className={`w-4 h-4 ${themeClasses.badgeIcon} fill-current`} />
            <span className={`text-sm font-medium ${themeClasses.badgeText}`} style={{ fontFamily: 'Gilroy, sans-serif' }}>
              {t('reviews.stats.trusted_by')} {statistics ? formatNumber(statistics.total_users) : '...'} {t('reviews.stats.users')}
            </span>
          </motion.div>
          
          <motion.h2 
            className={`text-3xl md:text-4xl font-bold ${themeClasses.titleText} mb-8`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            {t('reviews.title')}
          </motion.h2>
          
          <motion.p 
            className={`text-lg ${themeClasses.subtitleText} max-w-4xl mx-auto mb-16 leading-relaxed`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {t('reviews.subtitle')}
          </motion.p>

          {/* Statistics */}
          <motion.div 
            className="flex flex-col md:flex-row justify-center items-center gap-8 mb-16"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className={`${themeClasses.statCard} backdrop-blur-sm border rounded-2xl px-6 py-4 flex items-center gap-4`}>
              <Users className={`w-8 h-8 ${themeClasses.statIcon}`} />
              <div className="text-left">
                <div className={`text-2xl font-bold ${themeClasses.statNumber}`} style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  {isLoadingStats ? '...' : statistics ? formatNumber(statistics.total_users) : '1K+'}
                </div>
                <div className={`text-sm ${themeClasses.statLabel}`} style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  {t('reviews.stats.users')}
                </div>
              </div>
            </div>
            
            <div className={`${themeClasses.statCard} backdrop-blur-sm border rounded-2xl px-6 py-4 flex items-center gap-4`}>
              <Calendar className={`w-8 h-8 ${themeClasses.statIcon}`} />
              <div className="text-left">
                <div className={`text-2xl font-bold ${themeClasses.statNumber}`} style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  {isLoadingStats ? '...' : statistics ? formatNumber(statistics.total_meetings) : '5K+'}
                </div>
                <div className={`text-sm ${themeClasses.statLabel}`} style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  {t('reviews.stats.meetings')}
                </div>
              </div>
            </div>
            
            <div className={`${themeClasses.statCard} backdrop-blur-sm border rounded-2xl px-6 py-4 flex items-center gap-4`}>
              <CheckCircle className={`w-8 h-8 ${themeClasses.statIcon}`} />
              <div className="text-left">
                <div className={`text-2xl font-bold ${themeClasses.statNumber}`} style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  {isLoadingStats ? '...' : statistics ? formatNumber(statistics.total_processed_meetings) : '4.5K+'}
                </div>
                <div className={`text-sm ${themeClasses.statLabel}`} style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  {t('reviews.stats.processed')}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Reviews Carousel */}
        <motion.div 
          className="relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({ length: Math.ceil(reviews.length / 3) }).map((_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                    {reviews.slice(slideIndex * 3, slideIndex * 3 + 3).map((review) => (
                      <motion.div
                        key={review.id}
                        className="group relative"
                        variants={cardVariants}
                      >
                        <div className={`
                          relative h-full ${themeClasses.cardBackground} backdrop-blur-xl 
                          border rounded-3xl p-8 
                          ${themeClasses.cardBorder} ${themeClasses.cardHover}
                          transition-all duration-500 group-hover:scale-[1.02]
                        `}>
                          {/* Quote Icon */}
                          <div className="absolute top-6 right-6 opacity-20">
                            <Quote className={`w-8 h-8 ${themeClasses.badgeIcon}`} />
                          </div>

                          {/* Rating */}
                          <div className="flex gap-1 mb-6">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                            ))}
                          </div>

                          {/* Quote */}
                          <blockquote className={`
                            ${themeClasses.cardQuote} leading-relaxed mb-8 text-lg
                          `} style={{ fontFamily: 'Gilroy, sans-serif' }}>
                            "{review.quote}"
                          </blockquote>

                          {/* Author */}
                          <div className="flex items-center gap-4 mt-auto">
                            <div className="relative">
                              <img
                                src={review.avatar}
                                alt={review.name}
                                className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-500/30"
                              />
                              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-transparent"></div>
                            </div>
                            <div>
                              <h4 className={`${themeClasses.cardTitle} font-semibold text-lg`} style={{ fontFamily: 'Gilroy, sans-serif' }}>{review.name}</h4>
                              <p className={`${themeClasses.cardDescription}`} style={{ fontFamily: 'Gilroy, sans-serif' }}>{review.title}</p>
                              <p className={`${themeClasses.cardDescription} text-sm opacity-75`} style={{ fontFamily: 'Gilroy, sans-serif' }}>{review.company}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 ${themeClasses.navButton} backdrop-blur-sm border rounded-full flex items-center justify-center transition-all duration-300 group`}
          >
            <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          
          <button
            onClick={nextSlide}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 ${themeClasses.navButton} backdrop-blur-sm border rounded-full flex items-center justify-center transition-all duration-300 group`}
          >
            <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-3 mt-12">
            {Array.from({ length: Math.ceil(reviews.length / 3) }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`
                  h-3 rounded-full transition-all duration-300
                  ${currentSlide === index 
                    ? `${theme === 'dark' ? 'bg-blue-500' : 'bg-gray-900'} w-8` 
                    : `${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'} w-3`
                  }
                `}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Reviews;