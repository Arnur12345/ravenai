import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type Language = 'ru' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  ru: {
    // Header
    'nav.integrations': 'Интеграции',
    'nav.reviews': 'Отзывы',
    'nav.pricing': 'Стоимость',
    'nav.faq': 'FAQ',
    'nav.try_out': 'Попробовать',
    'language.current': '🇷🇺 Русская версия',
    'language.switch': '🇬🇧 English version',
    
    // Hero
    'hero.title': 'Больше никогда не печатайте заметки встреч',
    'hero.subtitle': 'ИИ-ноттейкер для звонков',
    'hero.platforms': 'в',
    'hero.description': 'Получите готовую к отправке сводку за секунды с помощью ИИ-транскрипции и умного форматирования.',
    'hero.tagline': 'Без ручных записей. Без потерь.',
    'hero.try': 'Попробуйте за',
    'hero.minutes': '5 минут',
    'hero.cta': 'Начать',
    'hero.cta_demo': 'Смотреть демо',
    
    // Features
    'features.title': 'Все что нужно для лучших встреч',
    'features.subtitle': 'Трансформируйте рабочий процесс встреч с помощью интеллектуальной автоматизации и бесшовной интеграции.',
    'features.ai.title': 'ИИ-анализ',
    'features.ai.description': 'Продвинутое машинное обучение извлекает ключевые инсайты и задачи из ваших разговоров автоматически.',
    'features.formatting.title': 'Умное форматирование',
    'features.formatting.description': 'Профессиональные сводки с правильной структурой, маркированными списками и выделенными решениями готовы к отправке.',
    'features.sharing.title': 'Мгновенная отправка',
    'features.sharing.description': 'Распространение в один клик участникам команды, заинтересованным лицам или в ваши любимые инструменты продуктивности.',
    'features.search.title': 'Архив с поиском',
    'features.search.description': 'Найдите любое обсуждение, решение или деталь из прошлых встреч с мощными возможностями поиска.',
    'features.cta': 'Готовы трансформировать ваши встречи?',
    'features.cta_button': 'Начать →',
    
    // Landing Page Integrations
    'landing.integrations.title': 'Интегрируется с вашими любимыми инструментами',
    'landing.integrations.subtitle': 'Бесшовная интеграция с платформами и сервисами, которые ваша команда уже использует каждый день для максимальной продуктивности.',
    'landing.integrations.coming_soon': 'И многие другие интеграции уже в разработке',
    'landing.integrations.badge': 'Интеграции',
    'landing.integrations.connect_instantly': 'Подключайтесь мгновенно',
    'landing.integrations.workflow': 'Оптимизируйте рабочий процесс',
    
    // Pricing
    'pricing.title': '💼 Тарифы',
    'pricing.subtitle': 'Выберите план, который подходит вашей команде. Изменяйте тариф в любое время.',
    'pricing.monthly': 'Месячно',
    'pricing.annual': 'Годовой',
    'pricing.discount': 'экономия 17%',
    'pricing.note': 'Все тарифы включают 14-дневный бесплатный период. Кредитная карта не требуется.',
    'pricing.mobile_tip': '💡 3D эффект наклона лучше всего работает на десктопе',
    
    // Pricing Plans
    'plan.lite.name': 'Lite',
    'plan.lite.description': 'Для личных встреч',
    'plan.pro.name': 'Pro',
    'plan.pro.description': 'Для небольших команд',
    'plan.enterprise.name': 'Enterprise',
    'plan.enterprise.description': 'Для крупных команд и организаций',
    
    // Pricing Features
    'feature.lite.1': 'До 3 часов записи в месяц',
    'feature.lite.2': 'Автоматическая транскрибация',
    'feature.lite.3': 'Экспорт заметок в PDF',
    'feature.lite.4': 'Интеграция с Google Meet',
    
    'feature.pro.1': 'До 30 часов записи в месяц',
    'feature.pro.2': 'Транскрибация и краткие итоги',
    'feature.pro.3': 'Интеграции: Slack, Zoom, Google Meet',
    'feature.pro.4': 'Экспорт в Word и PDF',
    'feature.pro.5': 'Приоритетная обработка',
    
    'feature.enterprise.1': 'Неограниченные часы записи',
    'feature.enterprise.2': 'Совместная работа в командах',
    'feature.enterprise.3': 'Все интеграции: Slack, Zoom, Meet, Notion и др.',
    'feature.enterprise.4': 'Персонализированные отчеты',
    'feature.enterprise.5': 'Персональный менеджер и SLA 99.9%',
    
    // Plan specific
    'plan.popular': 'Самый популярный',
    'plan.from': 'от',
    'plan.currency': '$',
    'plan.per_month': 'в месяц',
    'plan.per_month_annual': 'в месяц при годовой оплате',
    'plan.get_started': 'Начать работу',
    'plan.features': 'Включено',
    'plan.free': 'БЕСПЛАТНО',
    'plan.save': 'экономия 17%',
    'plan.contact': 'Свяжитесь с нами',
    'plan.lets_talk': 'Обсуждается',
    
    // Reviews
    'reviews.title': 'Что говорят наши пользователи',
    'reviews.subtitle': 'Присоединяйтесь к тысячам команд, которые уже трансформировали свои встречи',
    'reviews.stats.trusted_by': 'Нам доверяют',
    'reviews.stats.users': 'пользователей',
    'reviews.stats.meetings': 'встреч проведено',
    'reviews.stats.processed': 'встреч обработано',
    
    // FAQ
    'faq.title': 'Часто задаваемые вопросы',
    'faq.subtitle': 'Ответы на самые популярные вопросы о нашем сервисе',
    
    // Footer
    'footer.product': 'Продукт',
    'footer.company': 'Компания',
    'footer.support': 'Поддержка',
    'footer.legal': 'Правовая информация',
    'footer.rights': 'Все права защищены.',
    
    // Mobile CTA
    'mobile_cta.title': 'Готовы начать?',
    'mobile_cta.subtitle': 'Присоединяйтесь к тысячам команд, которые уже используют наш ИИ-ноттейкер',
    'mobile_cta.button': 'Попробовать бесплатно',

    // Dashboard Navigation
    'dashboard.nav.dashboard': 'Дашборд',
    'dashboard.nav.meetings': 'Встречи',
    'dashboard.nav.integrations': 'Интеграции',
    'dashboard.nav.settings': 'Настройки',
    'dashboard.nav.menu': 'МЕНЮ',
    'dashboard.nav.general': 'ОБЩЕЕ',

    // Dashboard Header
    'dashboard.header.search': 'Поиск встреч, заметок или участников...',
    'dashboard.header.upcoming_meetings': 'Предстоящие встречи',
    'dashboard.header.no_upcoming': 'Нет предстоящих встреч',
    'dashboard.header.account_settings': 'Настройки аккаунта',
    'dashboard.header.logout': 'Выйти',

    // Dashboard Page
    'dashboard.welcome': 'Добро пожаловать! 👋',
    'dashboard.new_meeting': 'Новая встреча',
    'dashboard.total_meetings': 'Всего встреч',
    'dashboard.total_summaries': 'Всего итогов',
    'dashboard.tasks_created': 'Задач создано',
    'dashboard.meeting_activity': 'Активность встреч',
    'dashboard.upcoming_events': 'Предстоящие события',
    'dashboard.failed_load': 'Не удалось загрузить данные',
    'dashboard.retry': 'Повторить',
    'dashboard.loading': 'Загрузка...',

    // Meetings Page
    'meetings.title': 'Встречи',
    'meetings.search': 'Поиск встреч...',
    'meetings.all_status': 'Все статусы',
    'meetings.loading': 'Загружаем встречи...',
    'meetings.no_found': 'Встречи не найдены',
    'meetings.adjust_search': 'Попробуйте изменить поисковые критерии или фильтры',
    'meetings.create_first': 'Создайте свою первую встречу, чтобы начать',
    'meetings.join': 'Присоединиться',
    'meetings.view_summary': 'Посмотреть итоги',
    'meetings.created_status': 'создано',
    'meetings.active_status': 'активно',
    'meetings.ended_status': 'завершено',
    'meetings.failed_status': 'ошибка',
    'meetings.manage_sessions': 'Управляйте и просматривайте все ваши встречи',
    'meetings.failed_load': 'Не удалось загрузить встречи. Попробуйте еще раз.',
    'meetings.at': 'в',
    'meetings.bot': 'Бот',
    'meetings.start': 'Начать',
    'meetings.join_live': 'Присоединиться',
    'meetings.view_meeting': 'Просмотреть',

    // Integrations Page
    'integrations.title': 'Интеграции',
    'integrations.connect': 'Подключить',
    'integrations.details': 'Подробнее',

    // New Meeting Modal
    'meeting.create_new': 'Создать новую встречу',
    'meeting.name': 'Название встречи (необязательно)',
    'meeting.name_placeholder': 'например, Еженедельное совещание команды, Обзор продукта',
    'meeting.url': 'URL встречи *',
    'meeting.url_placeholder': 'https://meet.google.com/xxx-xxxx-xxx',
    'meeting.bot_name': 'Имя бота *',
    'meeting.bot_name_default': 'RavenAI Бот',
    'meeting.platform': 'Платформа',
    'meeting.notes': 'Заметки (необязательно)',
    'meeting.notes_placeholder': 'Добавьте заметки об этой встрече...',
    'meeting.cancel': 'Отменить',
    'meetings.create': 'Создать встречу',
    'meeting.creating': 'Создание...',
    'meeting.url_required': 'URL встречи обязателен',
    'meeting.url_invalid': 'Пожалуйста, введите действительный URL встречи (Google Meet, Zoom или Teams)',
    'meeting.bot_name_required': 'Имя бота обязательно',
    'meeting.bot_name_min': 'Имя бота должно содержать не менее 3 символов',
    'meeting.create_failed': 'Не удалось создать встречу. Попробуйте еще раз.',

    // Upcoming Events Card
    'events.upcoming': 'Предстоящие события',
    'events.refresh': 'Обновить',
    'events.failed_load': 'Не удалось загрузить предстоящие события',
    'events.no_upcoming': 'Предстоящих встреч не найдено',
    'events.join_meeting': 'Присоединиться к встрече',
    'events.participants': 'участников',
    'events.today': 'Сегодня',
    'events.tomorrow': 'Завтра',
    'events.loading': 'Загрузка событий...',
    'events.retry': 'Повторить',
    'events.no_link': 'Нет ссылки на встречу',
    'events.will_appear_here': 'События со ссылками на встречи появятся здесь',

    // Stats and General
    'general.this_month': 'в этом месяце',
    'general.last_month': 'в прошлом месяце',
    'general.home': 'Главная',
    'general.breadcrumb_separator': '>',
    
    // Meeting Chart
    'chart.meeting_activity': 'Активность встреч',
    'chart.meetings': 'Встречи',
    'chart.summaries': 'Итоги',
    
    // Stats Cards
    'stats.total': 'Всего',
    'stats.change_positive': '+{value} в этом месяце',
    'stats.change_negative': '-{value} в этом месяце',
    'stats.no_change': 'Без изменений',
    
    // Calendar Connection
    'calendar.connected': 'Подключено',
    'calendar.disconnected': 'Отключено',
    'calendar.join_meeting': 'Присоединиться к встрече',
    'calendar.attendees': '{count} участников',
    'calendar.attendee': '{count} участник',
    
    // Meeting Status
    'meeting.status.created': 'создано',
    'meeting.status.active': 'активно',
    'meeting.status.ended': 'завершено',
    'meeting.status.failed': 'ошибка',
    
    // Time
    'time.minutes_ago': '{count} минут назад',
    'time.hours_ago': '{count} часов назад',
    'time.days_ago': '{count} дней назад',
    'time.in_minutes': 'через {count} мин',
    'time.in_hours': 'через {count} ч',
    'time.in_days': 'через {count} д',

    // Add missing translation keys for dashboard, meetings, integrations, settings, and general UI
    'dashboard.recent_meetings': 'Недавние встречи',
    'dashboard.tasks': 'Задачи',
    'settings.title': 'Настройки',
    'settings.subtitle': 'Настройки вашего аккаунта',
    'settings.loading': 'Загрузка...',
    'settings.account': 'Аккаунт',
    'settings.general': 'Общее',
    'settings.profile': 'Профиль',
    'settings.profile_subtitle': 'Настройки вашего профиля',
    'settings.name': 'Имя',
    'settings.surname': 'Фамилия',
    'settings.edit_photo': 'Изменить фото',
    'settings.email': 'Электронная почта',
    'settings.timezone_preferences': 'Часовой пояс и предпочтения',
    'settings.timezone_preferences_subtitle': 'Укажите ваш часовой пояс и формат времени',
    'settings.city': 'Город',
    'settings.timezone': 'Часовой пояс',
    'settings.date_time_format': 'Формат даты и времени',
    'settings.motivation_performance_setup': 'Мотивация и производительность',
    'settings.motivation_performance_setup_subtitle': 'Настройте желаемый уровень активности',
    'settings.desired_daily_time_utilization': 'Желаемое ежедневное использование времени',
    'settings.desired_daily_time_utilization_description': 'Найдите идеальное распределение времени для максимальной продуктивности.',
    'settings.desired_daily_core_work_range': 'Желаемый диапазон основной работы',
    'settings.desired_daily_core_work_range_description': 'Определите оптимальное время для самых важных задач.',
    'settings.your_work': 'Ваша работа',
    'settings.your_work_subtitle': 'Добавьте информацию о вашей должности',
    'settings.function': 'Функция',
    'settings.job_title': 'Должность',
    'settings.notifications': 'Уведомления',
    'settings.sharing': 'Совместный доступ',
    'settings.update_schedule': 'Расписание обновлений',
    'settings.billing': 'Оплата',
    'settings.questions': 'Вопросы',
    'settings.responsibilities': 'Обязанности',
    'settings.saving': 'Сохранение',
    'settings.save_changes': 'Сохранить изменения',
    'settings.coming_soon': 'Настройки для этого раздела скоро будут доступны.',
    'settings.new_settings_field': 'Новое поле настроек',
    'settings.new_section': 'Новая секция',
    'settings.save': 'Сохранить',
    'settings.cancel': 'Отменить',
    'settings.apply': 'Применить',
    'settings.reset': 'Сбросить',
    'settings.search': 'Поиск',
    'settings.filter': 'Фильтр',
    'settings.sort': 'Сортировка',
    'settings.order': 'Порядок',
    'settings.display': 'Отображение',
    'settings.hide': 'Скрыть',
    'settings.show': 'Показать',
    'settings.edit': 'Редактировать',
    'settings.delete': 'Удалить',
    'settings.add': 'Добавить',
    'settings.import': 'Импортировать',
    'settings.export': 'Экспортировать',
    'settings.import_file': 'Импортировать файл',
    'settings.export_file': 'Экспортировать файл',
    'settings.import_success': 'Данные успешно импортированы',
    'settings.export_success': 'Данные успешно экспортированы',
    'settings.import_error': 'Не удалось импортировать данные',
    'settings.export_error': 'Не удалось экспортировать данные',
    'settings.import_file_format': 'Формат импортируемого файла',
    'settings.export_file_format': 'Формат экспортируемого файла',
    'settings.import_file_size': 'Размер импортируемого файла',
    'settings.export_file_size': 'Размер экспортируемого файла',
    'settings.import_file_type': 'Тип импортируемого файла',
    'settings.export_file_type': 'Тип экспортируемого файла',
    'settings.import_file_path': 'Путь к импортируемому файлу',
    'settings.export_file_path': 'Путь к экспортируемому файлу',
    'settings.import_file_name': 'Имя импортируемого файла',
    'settings.export_file_name': 'Имя экспортируемого файла',
    'settings.import_file_date': 'Дата импортируемого файла',
    'settings.export_file_date': 'Дата экспортируемого файла',
    'settings.import_file_time': 'Время импортируемого файла',
    'settings.export_file_time': 'Время экспортируемого файла',
    'settings.import_file_format_error': 'Неверный формат импортируемого файла',
    'settings.export_file_format_error': 'Неверный формат экспортируемого файла',
    'settings.import_file_size_error': 'Неверный размер импортируемого файла',
    'settings.export_file_size_error': 'Неверный размер экспортируемого файла',
    'settings.import_file_type_error': 'Неверный тип импортируемого файла',
    'settings.export_file_type_error': 'Неверный тип экспортируемого файла',
    'settings.import_file_path_error': 'Неверный путь импортируемого файла',
    'settings.export_file_path_error': 'Неверный путь экспортируемого файла',
    'settings.import_file_name_error': 'Неверное имя импортируемого файла',
    'settings.export_file_name_error': 'Неверное имя экспортируемого файла',
    'settings.import_file_date_error': 'Неверная дата импортируемого файла',
    'settings.export_file_date_error': 'Неверная дата экспортируемого файла',
    'settings.import_file_time_error': 'Неверное время импортируемого файла',
    'settings.export_file_time_error': 'Неверное время экспортируемого файла',
    'settings.import_file_format_error_message': 'Пожалуйста, выберите файл с правильным форматом',
    'settings.export_file_format_error_message': 'Пожалуйста, выберите файл с правильным форматом',
    'settings.import_file_size_error_message': 'Пожалуйста, выберите файл с правильным размером',
    'settings.export_file_size_error_message': 'Пожалуйста, выберите файл с правильным размером',
    'settings.import_file_type_error_message': 'Пожалуйста, выберите файл с правильным типом',
    'settings.export_file_type_error_message': 'Пожалуйста, выберите файл с правильным типом',
    'settings.import_file_path_error_message': 'Пожалуйста, выберите файл с правильным путем',
    'settings.export_file_path_error_message': 'Пожалуйста, выберите файл с правильным путем',
    'settings.import_file_name_error_message': 'Пожалуйста, выберите файл с правильным именем',
    'settings.export_file_name_error_message': 'Пожалуйста, выберите файл с правильным именем',
    'settings.import_file_date_error_message': 'Пожалуйста, выберите файл с правильной датой',
    'settings.export_file_date_error_message': 'Пожалуйста, выберите файл с правильной датой',
    'settings.import_file_time_error_message': 'Пожалуйста, выберите файл с правильным временем',
    'settings.export_file_time_error_message': 'Пожалуйста, выберите файл с правильным временем'
  },
  en: {
    // Header
    'nav.integrations': 'Integrations',
    'nav.reviews': 'Reviews',
    'nav.pricing': 'Pricing',
    'nav.faq': 'FAQ',
    'nav.try_out': 'Try it out',
    'language.current': '🇬🇧 English version',
    'language.switch': '🇷🇺 Русская версия',
    
    // Hero
    'hero.title': 'Never type meeting notes again',
    'hero.subtitle': 'AI notetaker for calls',
    'hero.platforms': 'in',
    'hero.description': 'Get ready-to-send summaries in seconds with AI transcription and smart formatting.',
    'hero.tagline': 'No manual notes. Nothing missed.',
    'hero.try': 'Try it in',
    'hero.minutes': '5 minutes',
    'hero.cta': 'Get Started',
    'hero.cta_demo': 'Watch Demo',
    
    // Features
    'features.title': 'Everything you need for better meetings',
    'features.subtitle': 'Transform your meeting workflow with intelligent automation and seamless integration.',
    'features.ai.title': 'AI-Powered Analysis',
    'features.ai.description': 'Advanced machine learning extracts key insights and action items from your conversations automatically.',
    'features.formatting.title': 'Smart Formatting',
    'features.formatting.description': 'Professional summaries with proper structure, bullet points, and highlighted decisions ready to share.',
    'features.sharing.title': 'Instant Sharing',
    'features.sharing.description': 'One-click distribution to team members, stakeholders, or your favorite productivity tools.',
    'features.search.title': 'Searchable Archive',
    'features.search.description': 'Find any discussion, decision, or detail from past meetings with powerful search capabilities.',
    'features.cta': 'Ready to transform your meetings?',
    'features.cta_button': 'Get Started →',
    
    // Landing Page Integrations
    'landing.integrations.title': 'Integrates with your favorite tools',
    'landing.integrations.subtitle': 'Seamlessly connect with the platforms and services your team already uses every day for maximum productivity.',
    'landing.integrations.coming_soon': 'And many more integrations already in development',
    'landing.integrations.badge': 'Integrations',
    'landing.integrations.connect_instantly': 'Connect instantly',
    'landing.integrations.workflow': 'Streamline your workflow',
    
    // Pricing
    'pricing.title': '💼 Pricing',
    'pricing.subtitle': 'Choose the plan that fits your team. Change anytime.',
    'pricing.monthly': 'Monthly',
    'pricing.annual': 'Annual',
    'pricing.discount': 'Save 17%',
    'pricing.note': 'All plans include a 14-day free trial. No credit card required.',
    'pricing.mobile_tip': '💡 3D tilt effect works best on desktop',
    
    // Pricing Plans
    'plan.lite.name': 'Lite',
    'plan.lite.description': 'For personal meetings',
    'plan.pro.name': 'Pro',
    'plan.pro.description': 'For small teams',
    'plan.enterprise.name': 'Enterprise',
    'plan.enterprise.description': 'For large teams and organizations',
    
    // Pricing Features
    'feature.lite.1': 'Up to 3 hours of recording per month',
    'feature.lite.2': 'Auto transcription',
    'feature.lite.3': 'Export notes to PDF',
    'feature.lite.4': 'Google Meet integration',
    
    'feature.pro.1': 'Up to 30 hours/month',
    'feature.pro.2': 'Transcripts + summaries',
    'feature.pro.3': 'Slack, Zoom, Google Meet',
    'feature.pro.4': 'Export to Word & PDF',
    'feature.pro.5': 'Priority processing',
    
    'feature.enterprise.1': 'Unlimited recording hours',
    'feature.enterprise.2': 'Team collaboration',
    'feature.enterprise.3': 'All integrations: Slack, Zoom, Meet, Notion etc.',
    'feature.enterprise.4': 'Custom reports',
    'feature.enterprise.5': 'Dedicated manager + SLA 99.9%',
    
    // Plan specific
    'plan.popular': 'Most Popular',
    'plan.from': 'from',
    'plan.currency': '$',
    'plan.per_month': 'per month',
    'plan.per_month_annual': 'per month, billed annually',
    'plan.get_started': 'Get Started',
    'plan.features': 'Includes',
    'plan.free': 'FREE',
    'plan.save': 'Save 17%',
    'plan.contact': 'Contact us',
    'plan.lets_talk': "Let's talk",
    
    // Reviews
    'reviews.title': 'What our users say',
    'reviews.subtitle': 'Join thousands of teams who have already transformed their meetings',
    'reviews.stats.trusted_by': 'Trusted by',
    'reviews.stats.users': 'users',
    'reviews.stats.meetings': 'meetings held',
    'reviews.stats.processed': 'meetings processed',
    
    // FAQ
    'faq.title': 'Frequently Asked Questions',
    'faq.subtitle': 'Answers to the most popular questions about our service',
    
    // Footer
    'footer.product': 'Product',
    'footer.company': 'Company',
    'footer.support': 'Support',
    'footer.legal': 'Legal',
    'footer.rights': 'All rights reserved.',
    
    // Mobile CTA
    'mobile_cta.title': 'Ready to get started?',
    'mobile_cta.subtitle': 'Join thousands of teams already using our AI notetaker',
    'mobile_cta.button': 'Try for free',

    // Dashboard Navigation
    'dashboard.nav.dashboard': 'Dashboard',
    'dashboard.nav.meetings': 'Meetings',
    'dashboard.nav.integrations': 'Integrations',
    'dashboard.nav.settings': 'Settings',
    'dashboard.nav.menu': 'MENU',
    'dashboard.nav.general': 'GENERAL',

    // Dashboard Header
    'dashboard.header.search': 'Search meetings, notes, or participants...',
    'dashboard.header.upcoming_meetings': 'Upcoming Meetings',
    'dashboard.header.no_upcoming': 'No upcoming meetings',
    'dashboard.header.account_settings': 'Account Settings',
    'dashboard.header.logout': 'Logout',

    // Dashboard Page
    'dashboard.welcome': 'Welcome back! 👋',
    'dashboard.new_meeting': 'New Meeting',
    'dashboard.total_meetings': 'Total Meetings',
    'dashboard.total_summaries': 'Total Summaries',
    'dashboard.tasks_created': 'Tasks Created',
    'dashboard.meeting_activity': 'Meeting Activity',
    'dashboard.upcoming_events': 'Upcoming events',
    'dashboard.failed_load': 'Failed to load data',
    'dashboard.retry': 'Retry',
    'dashboard.loading': 'Loading...',

    // Meetings Page
    'meetings.title': 'Meetings',
    'meetings.search': 'Search meetings...',
    'meetings.all_status': 'All Status',
    'meetings.loading': 'Loading meetings...',
    'meetings.no_found': 'No meetings found',
    'meetings.adjust_search': 'Try adjusting your search or filter criteria',
    'meetings.create_first': 'Create your first meeting to get started',
    'meetings.join': 'Join',
    'meetings.view_summary': 'View Summary',
    'meetings.created_status': 'created',
    'meetings.active_status': 'active',
    'meetings.ended_status': 'ended',
    'meetings.failed_status': 'failed',
    'meetings.manage_sessions': 'Manage and view all your meeting sessions',
    'meetings.failed_load': 'Failed to load meetings. Please try again.',
    'meetings.at': 'at',
    'meetings.bot': 'Bot',
    'meetings.start': 'Start',
    'meetings.join_live': 'Join Live',
    'meetings.view_meeting': 'View Meeting',
    'meetings.create': 'Create Meeting',

    // Integrations Page
    'integrations.title': 'Integrations',
    'integrations.connect': 'Connect',
    'integrations.details': 'Details',

    // New Meeting Modal
    'meeting.create_new': 'Create New Meeting',
    'meeting.name': 'Meeting Name (Optional)',
    'meeting.name_placeholder': 'e.g., Weekly Team Standup, Product Review Meeting',
    'meeting.url': 'Meeting URL *',
    'meeting.url_placeholder': 'https://meet.google.com/xxx-xxxx-xxx',
    'meeting.bot_name': 'Bot Name *',
    'meeting.bot_name_default': 'RavenAI Bot',
    'meeting.platform': 'Platform',
    'meeting.notes': 'Notes (Optional)',
    'meeting.notes_placeholder': 'Add any notes about this meeting...',
    'meeting.cancel': 'Cancel',
    'meeting.create': 'Create Meeting',
    'meeting.creating': 'Creating...',
    'meeting.url_required': 'Meeting URL is required',
    'meeting.url_invalid': 'Please enter a valid meeting URL (Google Meet, Zoom, or Teams)',
    'meeting.bot_name_required': 'Bot name is required',
    'meeting.bot_name_min': 'Bot name must be at least 3 characters',
    'meeting.create_failed': 'Failed to create meeting. Please try again.',

    // Upcoming Events Card
    'events.upcoming': 'Upcoming events',
    'events.refresh': 'Refresh',
    'events.failed_load': 'Failed to load upcoming events',
    'events.no_upcoming': 'No upcoming meetings found',
    'events.join_meeting': 'Join meeting',
    'events.participants': 'participants',
    'events.today': 'Today',
    'events.tomorrow': 'Tomorrow',
    'events.loading': 'Loading events...',
    'events.retry': 'Retry',
    'events.no_link': 'No meeting link',
    'events.will_appear_here': 'Events with meeting links will appear here',

    // Stats and General
    'general.this_month': 'this month',
    'general.last_month': 'last month',
    'general.home': 'Home',
    'general.breadcrumb_separator': '>',
    
    // Meeting Chart
    'chart.meeting_activity': 'Meeting Activity',
    'chart.meetings': 'Meetings',
    'chart.summaries': 'Summaries',
    
    // Stats Cards
    'stats.total': 'Total',
    'stats.change_positive': '+{value} this month',
    'stats.change_negative': '-{value} this month',
    'stats.no_change': 'No change',
    
    // Calendar Connection
    'calendar.connected': 'Connected',
    'calendar.disconnected': 'Disconnected',
    'calendar.join_meeting': 'Join meeting',
    'calendar.attendees': '{count} attendees',
    'calendar.attendee': '{count} attendee',
    
    // Meeting Status
    'meeting.status.created': 'created',
    'meeting.status.active': 'active',
    'meeting.status.ended': 'ended',
    'meeting.status.failed': 'failed',
    
    // Time
    'time.minutes_ago': '{count} minutes ago',
    'time.hours_ago': '{count} hours ago',
    'time.days_ago': '{count} days ago',
    'time.in_minutes': 'in {count}m',
    'time.in_hours': 'in {count}h',
    'time.in_days': 'in {count}d',

    // Add missing translation keys for dashboard, meetings, integrations, settings, and general UI
    'dashboard.recent_meetings': 'Recent meetings',
    'dashboard.tasks': 'Tasks',
    'settings.title': 'Settings',
    'settings.subtitle': 'Settings for your account',
    'settings.loading': 'Loading...',
    'settings.account': 'Account',
    'settings.general': 'General',
    'settings.profile': 'Profile',
    'settings.profile_subtitle': 'Profile settings',
    'settings.name': 'Name',
    'settings.surname': 'Surname',
    'settings.edit_photo': 'Edit photo',
    'settings.email': 'Email',
    'settings.timezone_preferences': 'Timezone & preferences',
    'settings.timezone_preferences_subtitle': 'Let us know your timezone and format',
    'settings.city': 'City',
    'settings.timezone': 'Timezone',
    'settings.date_time_format': 'Date & Time format',
    'settings.motivation_performance_setup': 'Motivation & Performance setup',
    'settings.motivation_performance_setup_subtitle': 'Calibrate your desired activity levels',
    'settings.desired_daily_time_utilization': 'Desired daily time utilization',
    'settings.desired_daily_time_utilization_description': 'Find the perfect allocation that suits your workflow and maximizes your potential.',
    'settings.desired_daily_core_work_range': 'Desired daily core work range',
    'settings.desired_daily_core_work_range_description': 'Define the optimal timeframe dedicated to your most important tasks.',
    'settings.your_work': 'Your work',
    'settings.your_work_subtitle': 'Add info about your position',
    'settings.function': 'Function',
    'settings.notifications': 'Notifications',
    'settings.sharing': 'Sharing',
    'settings.update_schedule': 'Update schedule',
    'settings.billing': 'Billing',
    'settings.questions': 'Questions',
    'settings.job_title': 'Job Title',
    'settings.responsibilities': 'Responsibilities',
    'settings.saving': 'Saving',
    'settings.save_changes': 'Save Changes',
    'settings.coming_soon': 'Settings for this section will be available soon.',
    'settings.new_settings_field': 'New settings field',
    'settings.new_section': 'New section',
    'settings.save': 'Save',
    'settings.cancel': 'Cancel',
    'settings.apply': 'Apply',
    'settings.reset': 'Reset',
    'settings.search': 'Search',
    'settings.filter': 'Filter',
    'settings.sort': 'Sort',
    'settings.order': 'Order',
    'settings.display': 'Display',
    'settings.hide': 'Hide',
    'settings.show': 'Show',
    'settings.edit': 'Edit',
    'settings.delete': 'Delete',
    'settings.add': 'Add',
    'settings.import': 'Import',
    'settings.export': 'Export',
    'settings.import_file': 'Import file',
    'settings.export_file': 'Export file',
    'settings.import_success': 'Data imported successfully',
    'settings.export_success': 'Data exported successfully',
    'settings.import_error': 'Failed to import data',
    'settings.export_error': 'Failed to export data',
    'settings.import_file_format': 'Import file format',
    'settings.export_file_format': 'Export file format',
    'settings.import_file_size': 'Import file size',
    'settings.export_file_size': 'Export file size',
    'settings.import_file_type': 'Import file type',
    'settings.export_file_type': 'Export file type',
    'settings.import_file_path': 'Import file path',
    'settings.export_file_path': 'Export file path',
    'settings.import_file_name': 'Import file name',
    'settings.export_file_name': 'Export file name',
    'settings.import_file_date': 'Import file date',
    'settings.export_file_date': 'Export file date',
    'settings.import_file_time': 'Import file time',
    'settings.export_file_time': 'Export file time',
    'settings.import_file_format_error': 'Invalid import file format',
    'settings.export_file_format_error': 'Invalid export file format',
    'settings.import_file_size_error': 'Invalid import file size',
    'settings.export_file_size_error': 'Invalid export file size',
    'settings.import_file_type_error': 'Invalid import file type',
    'settings.export_file_type_error': 'Invalid export file type',
    'settings.import_file_path_error': 'Invalid import file path',
    'settings.export_file_path_error': 'Invalid export file path',
    'settings.import_file_name_error': 'Invalid import file name',
    'settings.export_file_name_error': 'Invalid export file name',
    'settings.import_file_date_error': 'Invalid import file date',
    'settings.export_file_date_error': 'Invalid export file date',
    'settings.import_file_time_error': 'Invalid import file time',
    'settings.export_file_time_error': 'Invalid export file time',
    'settings.import_file_format_error_message': 'Please select a file with the correct format',
    'settings.export_file_format_error_message': 'Please select a file with the correct format',
    'settings.import_file_size_error_message': 'Please select a file with the correct size',
    'settings.export_file_size_error_message': 'Please select a file with the correct size',
    'settings.import_file_type_error_message': 'Please select a file with the correct type',
    'settings.export_file_type_error_message': 'Please select a file with the correct type',
    'settings.import_file_path_error_message': 'Please select a file with the correct path',
    'settings.export_file_path_error_message': 'Please select a file with the correct path',
    'settings.import_file_name_error_message': 'Please select a file with the correct name',
    'settings.export_file_name_error_message': 'Please select a file with the correct name',
    'settings.import_file_date_error_message': 'Please select a file with the correct date',
    'settings.export_file_date_error_message': 'Please select a file with the correct date',
    'settings.import_file_time_error_message': 'Please select a file with the correct time',
    'settings.export_file_time_error_message': 'Please select a file with the correct time'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ru');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['ru']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 