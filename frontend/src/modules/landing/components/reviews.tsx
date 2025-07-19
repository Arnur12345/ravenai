import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Users, Calendar, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { dashboardApi } from '@/shared/api/dashboardApi';
import { cn } from '@/shared/utils';

// Import Google Fonts
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

interface Statistics {
  total_users: number;
  total_meetings: number;
  total_processed_meetings: number;
}

const Reviews: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Hero-inspired dark theme classes
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
      statCard: 'bg-white/10 border-white/20',
      statNumber: 'text-white',
      statLabel: 'text-white/70',
      statIcon: 'text-white',
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
    },
    {
      id: 7,
      name: "Aimurat Zhetkizgenov",
      title: "AI Engineer",
      company: "Surfaice",
      avatar: "https://res.cloudinary.com/dq2pbzrtu/image/upload/v1751869082/Aimurat_qev7ss.jpg",
      quote: "Часто бываю на митингах с разными часовыми поясами. Иногда не успеваю быть на всех, а по работе очень надо. Благодаря ноуттейкеру Raven могу быть в курсе событий даже если пропустил встречу.",
      rating: 5
    }
  ];

  // Split reviews into two rows for marquee
  const firstRow = reviews.slice(0, Math.ceil(reviews.length / 2));
  const secondRow = reviews.slice(Math.ceil(reviews.length / 2));

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

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  // Review Card Component with Figma Design
  const ReviewCard = ({
    name,
    title,
    company,
    avatar,
    quote,
    rating,
  }: {
    name: string;
    title: string;
    company: string;
    avatar: string;
    quote: string;
    rating: number;
  }) => {
    return (
      <motion.figure
        className="relative h-full w-[550px] cursor-pointer overflow-hidden border p-8 flex-shrink-0"
        style={{
          background: 'linear-gradient(180deg, #212121 0%, #040404 100%)',
          borderRadius: '25px',
          borderColor: '#474747',
          borderWidth: '1px',
          height: '250px'
        }}
        whileHover={{ 
          scale: 1.02,
          transition: { 
            duration: 0.3,
            ease: "easeOut"
          }
        }}
      >
        {/* Content */}
        <div className="relative z-10 flex h-full flex-col">
          {/* Header with avatar and info */}
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="rounded-full object-cover"
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#D9D9D9',
                backgroundImage: `url(${avatar})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <div className="flex flex-col">
              <figcaption 
                className="font-medium text-white" 
                style={{ 
                  fontFamily: "'Gilroy', 'Inter', system-ui, sans-serif",
                  fontSize: '16px',
                  fontWeight: 500,
                  lineHeight: '1.3'
                }}
              >
                {name}
              </figcaption>
              <p 
                className="text-[#C1C1C1]" 
                style={{ 
                  fontFamily: "'Gilroy', 'Inter', system-ui, sans-serif",
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '1.3'
                }}
              >
                {company}
              </p>
            </div>
          </div>

          {/* Quote */}
          <blockquote 
            className="text-white leading-relaxed" 
            style={{ 
              fontFamily: "'Gilroy', 'Inter', system-ui, sans-serif",
              fontSize: '15px',
              fontWeight: 500,
              lineHeight: '1.4'
            }}
          >
            "{quote}"
          </blockquote>
        </div>
      </motion.figure>
    );
  };

  return (
    <section className={`relative ${themeClasses.sectionBackground} py-32 px-4 overflow-hidden transition-all duration-700 ease-out`}>
      {/* Static background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute top-1/4 left-1/4 w-96 h-96 ${themeClasses.backgroundElement} rounded-full filter blur-3xl`}
        />
        
        <div
          className={`absolute top-2/3 right-1/4 w-80 h-80 ${themeClasses.backgroundElement} rounded-full filter blur-3xl`}
        />
        
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/3 rounded-full filter blur-2xl"
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
            <span className={`text-sm font-medium ${themeClasses.badgeText}`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              {t('reviews.stats.trusted_by')} {statistics ? formatNumber(statistics.total_users) : '...'} {t('reviews.stats.users')}
            </span>
          </motion.div>
          
          <motion.h2 
            className={`text-3xl md:text-4xl font-bold ${themeClasses.titleText} mb-8`}
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            {t('reviews.title')}
          </motion.h2>
          
          <motion.p 
            className={`text-lg ${themeClasses.subtitleText} max-w-4xl mx-auto mb-16 leading-relaxed`}
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
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
                <div className={`text-2xl font-bold ${themeClasses.statNumber}`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {isLoadingStats ? '...' : statistics ? formatNumber(statistics.total_users) : '1K+'}
                </div>
                <div className={`text-sm ${themeClasses.statLabel}`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {t('reviews.stats.users')}
                </div>
              </div>
            </div>
            
            <div className={`${themeClasses.statCard} backdrop-blur-sm border rounded-2xl px-6 py-4 flex items-center gap-4`}>
              <Calendar className={`w-8 h-8 ${themeClasses.statIcon}`} />
              <div className="text-left">
                <div className={`text-2xl font-bold ${themeClasses.statNumber}`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {isLoadingStats ? '...' : statistics ? formatNumber(statistics.total_meetings) : '5K+'}
                </div>
                <div className={`text-sm ${themeClasses.statLabel}`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {t('reviews.stats.meetings')}
                </div>
              </div>
            </div>
            
            <div className={`${themeClasses.statCard} backdrop-blur-sm border rounded-2xl px-6 py-4 flex items-center gap-4`}>
              <CheckCircle className={`w-8 h-8 ${themeClasses.statIcon}`} />
              <div className="text-left">
                <div className={`text-2xl font-bold ${themeClasses.statNumber}`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {isLoadingStats ? '...' : statistics ? formatNumber(statistics.total_processed_meetings) : '4.5K+'}
                </div>
                <div className={`text-sm ${themeClasses.statLabel}`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {t('reviews.stats.processed')}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Infinite Carousel */}
        <motion.div 
          className="relative flex w-full flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ 
            type: "spring",
            stiffness: 60,
            damping: 20,
            duration: 1.2
          }}
        >
          {/* First row */}
          <div className="relative overflow-hidden mb-6">
            <motion.div
              className="flex gap-6"
              animate={{
                x: [0, -((550 + 24) * firstRow.length)]
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 45,
                  ease: "linear",
                },
              }}
              style={{
                width: `${(550 + 24) * firstRow.length * 2}px`
              }}
            >
              {/* First set of cards */}
              {firstRow.map((review) => (
                <ReviewCard key={`first-${review.id}`} {...review} />
              ))}
              {/* Duplicate set for seamless loop */}
              {firstRow.map((review) => (
                <ReviewCard key={`second-${review.id}`} {...review} />
              ))}
            </motion.div>
          </div>
          
          {/* Second row moving in opposite direction */}
          <div className="relative overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{
                x: [-((550 + 24) * secondRow.length), 0]
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 50,
                  ease: "linear",
                },
              }}
              style={{
                width: `${(550 + 24) * secondRow.length * 2}px`
              }}
            >
              {/* First set of cards */}
              {secondRow.map((review) => (
                <ReviewCard key={`first-${review.id}`} {...review} />
              ))}
              {/* Duplicate set for seamless loop */}
              {secondRow.map((review) => (
                <ReviewCard key={`second-${review.id}`} {...review} />
              ))}
            </motion.div>
          </div>
          
          {/* Gradient fade effects - black background to match hero */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-black to-transparent z-10"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-black to-transparent z-10"></div>
        </motion.div>
      </div>
    </section>
  );
};

export default Reviews;