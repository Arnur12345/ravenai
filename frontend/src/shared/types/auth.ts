export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    avatar_url?: string; // For Google OAuth users
    is_active: boolean;
    is_email_verified: boolean;
    created_at: string;
  };
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface APIError {
  detail: string;
  status_code?: number;
  type?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export const AuthErrorType = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_TOKEN: 'INVALID_TOKEN',
  INACTIVE_USER: 'INACTIVE_USER',
  PASSWORD_RESET_TOKEN_EXPIRED: 'PASSWORD_RESET_TOKEN_EXPIRED',
  PASSWORD_RESET_TOKEN_USED: 'PASSWORD_RESET_TOKEN_USED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

export type AuthErrorType = typeof AuthErrorType[keyof typeof AuthErrorType];

export interface AuthError {
  type: AuthErrorType;
  message: string;
  field?: string;
  statusCode?: number;
} 