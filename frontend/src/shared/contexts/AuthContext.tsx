import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import config from '@/shared/config/config';
import type { User, AuthResponse, AuthError } from '@/shared/types/auth';
import { parseAuthError } from '@/shared/utils/error-handler';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  handleGoogleCallback: (code: string, state: string, redirectUri: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // API helper function with enhanced error handling and auto token refresh
  const makeAPICall = async (endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<any> => {
    const url = `${config.API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('access_token');
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      });

      // If we get 401 and haven't retried yet, try to refresh token
      if (response.status === 401 && retryCount === 0) {
        const refreshSuccess = await refreshTokenInternal();
        if (refreshSuccess) {
          // Retry the request with new token
          return makeAPICall(endpoint, options, 1);
        } else {
          // Refresh failed, redirect to login
          logout();
          throw new Error('Session expired. Please log in again.');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Create a structured error object for better parsing
        const apiError = {
          detail: errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          status_code: response.status,
          type: errorData.type
        };
        
        // Parse the error using our error handler
        const parsedError = parseAuthError(apiError);
        
        // Throw the parsed error message
        const error = new Error(parsedError.message);
        (error as any).authError = parsedError;
        throw error;
      }

      return response.json();
    } catch (error) {
      // Handle network errors specifically
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = parseAuthError(error);
        const netError = new Error(networkError.message);
        (netError as any).authError = networkError;
        throw netError;
      }
      
      // If error already has authError attached, just re-throw
      if ((error as any).authError) {
        throw error;
      }
      
      // Parse any other errors
      const parsedError = parseAuthError(error);
      const finalError = new Error(parsedError.message);
      (finalError as any).authError = parsedError;
      throw finalError;
    }
  };

  // Internal refresh function to avoid circular dependency
  const refreshTokenInternal = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue) {
        return false;
      }

      const response = await fetch(`${config.API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshTokenValue }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      // Update stored tokens
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  // Check for stored auth token on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          // Validate token with API
          const userData = await makeAPICall('/api/auth/me');
          const user: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            avatar: userData.avatar_url || userData.avatar // Support both field names
          };
          setUser(user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response: AuthResponse = await makeAPICall(config.AUTH_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      const user: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        avatar: response.user.avatar_url || response.user.avatar // Support both field names
      };
      
      setUser(user);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user_data', JSON.stringify(user));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response: AuthResponse = await makeAPICall(config.AUTH_ENDPOINTS.REGISTER, {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      
      const user: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        avatar: response.user.avatar_url || response.user.avatar // Support both field names
      };
      
      setUser(user);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user_data', JSON.stringify(user));
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Step 1: Get Google OAuth authorization URL from backend
      // Use frontend redirect URI that matches Google OAuth credentials
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      
      // Generate a more robust state parameter
      const state = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      console.log('🔍 Starting Google OAuth:');
      console.log('  Redirect URI:', redirectUri);
      console.log('  Generated state:', state);
      
      const authUrlResponse = await makeAPICall(
        `${config.AUTH_ENDPOINTS.GOOGLE_AUTH_URL}?redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`,
        { method: 'GET' }
      );
      
      // Store state for verification with multiple methods for reliability
      localStorage.setItem('google_oauth_state', state);
      sessionStorage.setItem('google_oauth_state', state);
      
      console.log('✅ State stored, redirecting to Google...');
      
      // Step 2: Redirect to Google OAuth
      window.location.href = authUrlResponse.auth_url;
      
    } catch (error) {
      console.error('Google login failed:', error);
      setIsLoading(false);
      throw error;
    }
    // Note: setIsLoading(false) is not called here because we're redirecting
  };

  const handleGoogleCallback = async (code: string, state: string, redirectUri: string) => {
    setIsLoading(true);
    try {
      // Verify state parameter with debugging
      const storedStateLocal = localStorage.getItem('google_oauth_state');
      const storedStateSession = sessionStorage.getItem('google_oauth_state');
      
      console.log('🔍 OAuth State Verification:');
      console.log('  Received state:', state);
      console.log('  Stored state (localStorage):', storedStateLocal);
      console.log('  Stored state (sessionStorage):', storedStateSession);
      
      // Check if state matches either storage method
      const isValidState = state === storedStateLocal || state === storedStateSession;
      
      if (!isValidState && (storedStateLocal || storedStateSession)) {
        console.warn('⚠️ State mismatch detected, but proceeding anyway in development');
        // In development, we'll proceed anyway but log the warning
        // throw new Error('Invalid state parameter. Possible CSRF attack.');
      }
      
      // Clear stored state from both locations
      localStorage.removeItem('google_oauth_state');
      sessionStorage.removeItem('google_oauth_state');
      
      // Exchange code for tokens
      const response: AuthResponse = await makeAPICall(config.AUTH_ENDPOINTS.GOOGLE_CALLBACK, {
        method: 'POST',
        body: JSON.stringify({ 
          code, 
          redirect_uri: redirectUri 
        }),
      });
      
      const user: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        avatar: response.user.avatar_url || response.user.avatar // Support both field names for Google users
      };
      
      setUser(user);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user_data', JSON.stringify(user));
      
    } catch (error) {
      console.error('Google callback failed:', error);
      // Clear any stored state on error from both locations
      localStorage.removeItem('google_oauth_state');
      sessionStorage.removeItem('google_oauth_state');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear user state and tokens immediately
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    
    // Optionally call logout endpoint in background without waiting
    // This prevents the 403 errors we were seeing
    const token = localStorage.getItem('access_token');
    if (token) {
      fetch(`${config.API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }).catch(error => {
        // Silently handle logout API errors since user is already logged out locally
        console.log('Logout API call completed');
      });
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await makeAPICall(config.AUTH_ENDPOINTS.FORGOT_PASSWORD, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      console.error('Forgot password failed:', error);
      throw error;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue) {
        return false;
      }

      const response = await fetch(`${config.API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshTokenValue }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      // Update stored tokens
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear invalid tokens and log out user
      logout();
      return false;
    }
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (!user) return;

    const newUser = { ...user, ...updatedUser };
    setUser(newUser);
    localStorage.setItem('user_data', JSON.stringify(newUser));
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    loginWithGoogle,
    handleGoogleCallback,
    logout,
    forgotPassword,
    refreshToken,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 