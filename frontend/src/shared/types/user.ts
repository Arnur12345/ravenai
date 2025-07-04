// User management types for frontend
// Based on backend schemas in user/schemas.py

export interface UserProfile {
  id: string;
  name: string;
  surname?: string;
  email: string;
  avatar_url?: string;
  job_title?: string;
  company?: string;
  timezone: string;
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfileUpdate {
  name?: string;
  surname?: string;
  email?: string;
  avatar_url?: string;
  job_title?: string;
  company?: string;
}

export interface UserPreferences {
  timezone: string;
  language?: string;
  theme?: string;
  notifications_email: boolean;
  notifications_push: boolean;
  notifications_slack: boolean;
  notifications_summary: boolean;
}

export interface UserPreferencesUpdate {
  timezone?: string;
  language?: string;
  theme?: string;
  notifications_email?: boolean;
  notifications_push?: boolean;
  notifications_slack?: boolean;
  notifications_summary?: boolean;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface LinkedAccount {
  service: string;
  connected: boolean;
  connected_at?: string;
  status: string;
  details?: Record<string, any>;
}

export interface LinkedAccountsResponse {
  accounts: LinkedAccount[];
}

export interface MessageResponse {
  message: string;
  success: boolean;
} 