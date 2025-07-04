interface Config {
  API_BASE_URL: string;
  AUTH_ENDPOINTS: {
    LOGIN: string;
    REGISTER: string;
    FORGOT_PASSWORD: string;
    RESET_PASSWORD: string;
    REFRESH_TOKEN: string;
    GOOGLE_AUTH_URL: string;
    GOOGLE_CALLBACK: string;
  };
}

const isDevelopment = import.meta.env.MODE === 'development' || 
  import.meta.env.MODE === undefined ||
  !import.meta.env.MODE;

// Get API base URL from environment variable or default to localhost
const getApiBaseUrl = (): string => {
  // Check for Vite environment variable first
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Fallback based on development mode
  return isDevelopment 
    ? 'http://localhost:8000' 
    : window.location.origin; // Use same origin in production
};

const config: Config = {
  API_BASE_URL: getApiBaseUrl(),
  
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

export default config; 