import config from '../config/config';

export interface Send2FACodeRequest {
  email: string;
  purpose: 'registration' | 'login' | 'verification';
}

export interface Verify2FACodeRequest {
  email: string;
  code: string;
  purpose: 'registration' | 'login' | 'verification';
}

export interface CodeStatusRequest {
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

class AuthApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = config.API_BASE_URL;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // Standard Auth Methods
  async login(data: LoginRequest) {
    const response = await fetch(`${this.baseURL}${config.AUTH_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw { response: { status: response.status, data: error } };
    }
    
    return response.json();
  }

  async register(data: RegisterRequest) {
    const response = await fetch(`${this.baseURL}${config.AUTH_ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw { response: { status: response.status, data: error } };
    }
    
    return response.json();
  }

  // 2FA Methods
  async send2FACode(data: Send2FACodeRequest) {
    const response = await fetch(`${this.baseURL}${config.AUTH_ENDPOINTS.SEND_2FA_CODE}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw { response: { status: response.status, data: error } };
    }
    
    return response.json();
  }

  async verify2FACode(data: Verify2FACodeRequest) {
    const response = await fetch(`${this.baseURL}${config.AUTH_ENDPOINTS.VERIFY_2FA_CODE}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw { response: { status: response.status, data: error } };
    }
    
    return response.json();
  }

  async resend2FACode(data: Send2FACodeRequest) {
    const response = await fetch(`${this.baseURL}${config.AUTH_ENDPOINTS.RESEND_2FA_CODE}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw { response: { status: response.status, data: error } };
    }
    
    return response.json();
  }

  async get2FACodeStatus(data: CodeStatusRequest) {
    const response = await fetch(`${this.baseURL}${config.AUTH_ENDPOINTS.GET_2FA_STATUS}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw { response: { status: response.status, data: error } };
    }
    
    return response.json();
  }

  async get2FAInfo() {
    const response = await fetch(`${this.baseURL}${config.AUTH_ENDPOINTS.GET_2FA_INFO}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw { response: { status: response.status, data: error } };
    }
    
    return response.json();
  }

  // Google OAuth Methods
  async getGoogleAuthUrl(redirectUri: string, state?: string) {
    const params = new URLSearchParams({
      redirect_uri: redirectUri,
      ...(state ? { state } : {}),
    });
    
    const response = await fetch(`${this.baseURL}${config.AUTH_ENDPOINTS.GOOGLE_AUTH_URL}?${params}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw { response: { status: response.status, data: error } };
    }
    
    return response.json();
  }

  async handleGoogleCallback(code: string, redirectUri: string) {
    const response = await fetch(`${this.baseURL}${config.AUTH_ENDPOINTS.GOOGLE_CALLBACK}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ code, redirect_uri: redirectUri }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw { response: { status: response.status, data: error } };
    }
    
    return response.json();
  }

  // Token Methods
  async refreshToken(refreshToken: string) {
    const response = await fetch(`${this.baseURL}${config.AUTH_ENDPOINTS.REFRESH_TOKEN}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw { response: { status: response.status, data: error } };
    }
    
    return response.json();
  }

  async getCurrentUser() {
    const response = await fetch(`${this.baseURL}/api/auth/me`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw { response: { status: response.status, data: error } };
    }
    
    return response.json();
  }
}

export const authApi = new AuthApiService(); 