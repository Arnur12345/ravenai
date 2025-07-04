import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  sub: string;
  email: string;
  exp: number;
  type: string;
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    const currentTime = Date.now() / 1000;
    
    // Add a 5-minute buffer before token expires
    return decoded.exp - 300 < currentTime;
  } catch (error) {
    // If token can't be decoded, consider it expired
    return true;
  }
};

export const getTokenExpirationTime = (token: string): number | null => {
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.exp * 1000; // Convert to milliseconds
  } catch (error) {
    return null;
  }
};

export const shouldRefreshToken = (token: string): boolean => {
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    const currentTime = Date.now() / 1000;
    
    // Refresh if token expires in less than 30 minutes
    return decoded.exp - 1800 < currentTime;
  } catch (error) {
    return true;
  }
};

export const clearAuthTokens = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
};

export const isValidToken = (token: string): boolean => {
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.sub && decoded.email && decoded.exp;
  } catch (error) {
    return false;
  }
}; 