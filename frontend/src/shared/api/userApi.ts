// Centralized API calls for User management functionality
// Uses the backend endpoints from user/api.py

import config from '@/shared/config/config';
import type {
  UserProfile,
  UserProfileUpdate,
  UserPreferences,
  UserPreferencesUpdate,
  ChangePasswordRequest,
  LinkedAccountsResponse,
  MessageResponse
} from '@/shared/types/user';

class UserApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${config.API_BASE_URL}/api/users`;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('access_token');
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const url = `${this.baseUrl}${endpoint}`;
    const requestOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    console.log('🔍 USER API REQUEST:', {
      url,
      method: requestOptions.method || 'GET',
      headers: requestOptions.headers,
    });

    const response = await fetch(url, requestOptions);

    console.log('🔍 USER API RESPONSE:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('🔍 USER API ERROR:', errorData);
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get current user's profile information
   * GET /api/users/me
   */
  async getCurrentUserProfile(): Promise<UserProfile> {
    return this.makeRequest<UserProfile>('/me');
  }

  /**
   * Update current user's profile information
   * PUT /api/users/me
   */
  async updateUserProfile(profileData: UserProfileUpdate): Promise<UserProfile> {
    return this.makeRequest<UserProfile>('/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  /**
   * Change current user's password
   * POST /api/users/me/change-password
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<MessageResponse> {
    return this.makeRequest<MessageResponse>('/me/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  /**
   * Get current user's preferences
   * GET /api/users/me/preferences
   */
  async getUserPreferences(): Promise<UserPreferences> {
    return this.makeRequest<UserPreferences>('/me/preferences');
  }

  /**
   * Update current user's preferences
   * PUT /api/users/me/preferences
   */
  async updateUserPreferences(preferencesData: UserPreferencesUpdate): Promise<UserPreferences> {
    return this.makeRequest<UserPreferences>('/me/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferencesData),
    });
  }

  /**
   * Get current user's linked third-party accounts
   * GET /api/users/me/linked-accounts
   */
  async getLinkedAccounts(): Promise<LinkedAccountsResponse> {
    return this.makeRequest<LinkedAccountsResponse>('/me/linked-accounts');
  }
}

// Export singleton instance
export const userApi = new UserApi();
export default userApi; 