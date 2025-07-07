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
  };
  ENVIRONMENT: 'development' | 'staging' | 'production';
}

const config: Config = {
  API_BASE_URL: 'https://ravenai.site',
  WS_BASE_URL: 'wss://ravenai.site',
  TIMEOUT: 30000,
  ENVIRONMENT: 'production',
  
  AUTH_ENDPOINTS: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    REFRESH_TOKEN: '/api/auth/refresh',
    GOOGLE_AUTH_URL: '/api/auth/google/auth-url',
    GOOGLE_CALLBACK: '/api/auth/google/callback'
  }
};

<<<<<<< HEAD
export default config; 
=======
export default config;
>>>>>>> c80c8bef1db86d0a461deeeb26437bf315161327
