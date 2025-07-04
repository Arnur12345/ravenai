import type { AuthError, APIError } from '@/shared/types/auth';
import { AuthErrorType } from '@/shared/types/auth';

// Error message mappings for user-friendly display
const ERROR_MESSAGES: Record<AuthErrorType, string> = {
  [AuthErrorType.INVALID_CREDENTIALS]: 'Invalid email or password. Please check your credentials and try again.',
  [AuthErrorType.USER_ALREADY_EXISTS]: 'An account with this email already exists. Please use a different email or try logging in.',
  [AuthErrorType.USER_NOT_FOUND]: 'No account found with this email address. Please check your email or create a new account.',
  [AuthErrorType.INVALID_TOKEN]: 'Your session has expired. Please log in again.',
  [AuthErrorType.INACTIVE_USER]: 'Your account is currently inactive. Please contact support for assistance.',
  [AuthErrorType.PASSWORD_RESET_TOKEN_EXPIRED]: 'This password reset link has expired. Please request a new one.',
  [AuthErrorType.PASSWORD_RESET_TOKEN_USED]: 'This password reset link has already been used. Please request a new one if needed.',
  [AuthErrorType.VALIDATION_ERROR]: 'Please check your input and try again.',
  [AuthErrorType.NETWORK_ERROR]: 'Unable to connect to the server. Please check your internet connection and try again.',
  [AuthErrorType.SERVER_ERROR]: 'Something went wrong on our end. Please try again in a few moments.',
  [AuthErrorType.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.'
};

// Map HTTP status codes to error types
const STATUS_CODE_MAP: Record<number, AuthErrorType> = {
  400: AuthErrorType.VALIDATION_ERROR,
  401: AuthErrorType.INVALID_CREDENTIALS,
  403: AuthErrorType.INACTIVE_USER,
  404: AuthErrorType.USER_NOT_FOUND,
  409: AuthErrorType.USER_ALREADY_EXISTS,
  500: AuthErrorType.SERVER_ERROR,
  502: AuthErrorType.SERVER_ERROR,
  503: AuthErrorType.SERVER_ERROR,
  504: AuthErrorType.SERVER_ERROR
};

// Parse backend error messages to determine specific error types
export function parseBackendError(errorMessage: string, statusCode?: number): AuthErrorType {
  const message = errorMessage.toLowerCase();
  
  // Check for specific backend error messages first - prioritize actual error content
  if (message.includes('invalid email or password') || message.includes('invalid credentials')) {
    return AuthErrorType.INVALID_CREDENTIALS;
  }
  
  if (message.includes('already exists') || message.includes('user with email')) {
    return AuthErrorType.USER_ALREADY_EXISTS;
  }
  
  if (message.includes('user not found') || message.includes('not found')) {
    return AuthErrorType.USER_NOT_FOUND;
  }
  
  if (message.includes('invalid or expired token') || message.includes('token')) {
    return AuthErrorType.INVALID_TOKEN;
  }
  
  if (message.includes('inactive') || message.includes('disabled')) {
    return AuthErrorType.INACTIVE_USER;
  }
  
  if (message.includes('password reset token has expired') || message.includes('token has expired')) {
    return AuthErrorType.PASSWORD_RESET_TOKEN_EXPIRED;
  }
  
  if (message.includes('password reset token has already been used') || message.includes('already been used')) {
    return AuthErrorType.PASSWORD_RESET_TOKEN_USED;
  }
  
  if (message.includes('unable to connect') || message.includes('network') || message.includes('fetch')) {
    return AuthErrorType.NETWORK_ERROR;
  }
  
  // Google OAuth specific errors
  if (message.includes('google oauth service is not available') || message.includes('credentials file not found')) {
    return AuthErrorType.SERVER_ERROR;
  }
  
  // Fall back to status code mapping only if no specific message patterns match
  if (statusCode && STATUS_CODE_MAP[statusCode]) {
    return STATUS_CODE_MAP[statusCode];
  }
  
  return AuthErrorType.UNKNOWN_ERROR;
}

// Main error parsing function
export function parseAuthError(error: unknown): AuthError {
  // Handle network/fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: AuthErrorType.NETWORK_ERROR,
      message: ERROR_MESSAGES[AuthErrorType.NETWORK_ERROR],
      statusCode: 0
    };
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    const errorType = parseBackendError(error.message);
    
    // If we have a specific backend error message, use it directly instead of generic mapping
    if (error.message && error.message.length > 0 && !error.message.includes('HTTP ')) {
      return {
        type: errorType,
        message: error.message, // Use actual backend message
        statusCode: undefined
      };
    }
    
    return {
      type: errorType,
      message: ERROR_MESSAGES[errorType],
      statusCode: undefined
    };
  }
  
  // Handle API error objects
  if (typeof error === 'object' && error !== null) {
    const apiError = error as APIError;
    if (apiError.detail) {
      const errorType = parseBackendError(apiError.detail, apiError.status_code);
      
      // Prioritize actual backend error message over generic frontend mapping
      return {
        type: errorType,
        message: apiError.detail, // Use actual backend message
        statusCode: apiError.status_code
      };
    }
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    const errorType = parseBackendError(error);
    
    // Use actual string message instead of generic mapping when available
    return {
      type: errorType,
      message: error.length > 0 ? error : ERROR_MESSAGES[errorType],
      statusCode: undefined
    };
  }
  
  // Fallback for unknown error types
  return {
    type: AuthErrorType.UNKNOWN_ERROR,
    message: ERROR_MESSAGES[AuthErrorType.UNKNOWN_ERROR],
    statusCode: undefined
  };
}

// Get user-friendly error message
export function getErrorMessage(errorType: AuthErrorType): string {
  return ERROR_MESSAGES[errorType] || ERROR_MESSAGES[AuthErrorType.UNKNOWN_ERROR];
}

// Check if error is recoverable (user can retry)
export function isRecoverableError(errorType: AuthErrorType): boolean {
  const recoverableErrors: AuthErrorType[] = [
    AuthErrorType.NETWORK_ERROR,
    AuthErrorType.SERVER_ERROR,
    AuthErrorType.UNKNOWN_ERROR
  ];
  
  return recoverableErrors.includes(errorType);
}

// Check if error requires user action (not a system error)
export function requiresUserAction(errorType: AuthErrorType): boolean {
  const userActionErrors: AuthErrorType[] = [
    AuthErrorType.INVALID_CREDENTIALS,
    AuthErrorType.USER_ALREADY_EXISTS,
    AuthErrorType.USER_NOT_FOUND,
    AuthErrorType.VALIDATION_ERROR,
    AuthErrorType.PASSWORD_RESET_TOKEN_EXPIRED,
    AuthErrorType.PASSWORD_RESET_TOKEN_USED
  ];
  
  return userActionErrors.includes(errorType);
} 