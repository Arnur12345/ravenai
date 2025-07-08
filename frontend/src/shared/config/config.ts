interface Config {
  API_BASE_URL: string;
  WS_BASE_URL?: string;
  TIMEOUT: number;
  AUTH_ENDPOINTS: {
    LOGIN: string;
    REGISTER: string;
    FORGOT_PASSWORD: string;
    RESET_PASSWORD: string;
    REFRESH_TOKEN: string;
    GOOGLE_AUTH_URL: string;
    GOOGLE_CALLBACK: string;
    SEND_2FA_CODE: string;
    VERIFY_2FA_CODE: string;
    RESEND_2FA_CODE: string;
    GET_2FA_STATUS: string;
    GET_2FA_INFO: string;
  };
  ENVIRONMENT: 'development' | 'staging' | 'production';
}

// Улучшенная логика определения окружения
const getEnvironment = (): 'development' | 'staging' | 'production' => {
  const mode = import.meta.env.MODE;
  const nodeEnv = import.meta.env.NODE_ENV;
  
  if (mode === 'production' || nodeEnv === 'production') {
    return 'production';
  }
  
  if (mode === 'staging' || nodeEnv === 'staging') {
    return 'staging';
  }
  
  return 'development';
};

// Улучшенная логика для API URL
const getApiBaseUrl = (): string => {
  // Приоритет переменной окружения
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  const environment = getEnvironment();
  
  switch (environment) {
    case 'production':
      return 'https://ravenai.site';
    case 'staging':
      return 'https://staging.ravenai.site'; // если есть staging
    case 'development':
    default:
      return 'http://localhost:8000';
  }
};

// Получение WebSocket URL
const getWsBaseUrl = (): string => {
  const apiUrl = getApiBaseUrl();
  return apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
};

const environment = getEnvironment();

const config: Config = {
  API_BASE_URL: getApiBaseUrl(),
  WS_BASE_URL: getWsBaseUrl(),
  TIMEOUT: 30000,
  ENVIRONMENT: environment,
  
  AUTH_ENDPOINTS: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    REFRESH_TOKEN: '/api/auth/refresh',
    GOOGLE_AUTH_URL: '/api/auth/google/auth-url',
    GOOGLE_CALLBACK: '/api/auth/google/callback',
    SEND_2FA_CODE: '/api/auth/send-2fa-code',
    VERIFY_2FA_CODE: '/api/auth/verify-2fa-code',
    RESEND_2FA_CODE: '/api/auth/resend-2fa-code',
    GET_2FA_STATUS: '/api/auth/2fa-code-status',
    GET_2FA_INFO: '/api/auth/2fa-info'
  }
};

// Логирование для отладки в режиме разработки
if (environment === 'development') {
  console.log('🔧 Config loaded:', {
    API_BASE_URL: config.API_BASE_URL,
    WS_BASE_URL: config.WS_BASE_URL,
    ENVIRONMENT: config.ENVIRONMENT,
    MODE: import.meta.env.MODE,
    NODE_ENV: import.meta.env.NODE_ENV
  });
}

// Валидация URL
const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Проверка корректности API URL
if (!validateUrl(config.API_BASE_URL)) {
  console.error('❌ Invalid API_BASE_URL:', config.API_BASE_URL);
  throw new Error('Invalid API_BASE_URL configuration');
}

export default config; 