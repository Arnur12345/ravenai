/**
 * Subscription API service for Polar integration
 */
import config from '../config/config';

export interface CheckoutRequest {
  plan_type: 'pro' | 'enterprise';
  billing_cycle: 'monthly' | 'yearly';
}

export interface CheckoutResponse {
  checkout_id: string;
  checkout_url: string;
  status: string;
}

export interface SubscriptionStatus {
  is_active: boolean;
  tier: string;
  subscription_id?: string;
  ends_at?: string;
  monthly_meetings_used: number;
  monthly_transcription_minutes_used: number;
  can_create_meeting: boolean;
  subscription_details?: any;
}

export interface UsageLimits {
  tier: string;
  monthly_meetings_limit?: number;
  monthly_transcription_minutes_limit?: number;
  monthly_meetings_used: number;
  monthly_transcription_minutes_used: number;
  can_create_meeting: boolean;
  usage_reset_date?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  features: string[];
  pricing: {
    monthly: { amount: number; currency: string };
    yearly: { amount: number; currency: string };
  };
}

export interface PlansResponse {
  plans: SubscriptionPlan[];
}

class SubscriptionApi {
  private baseUrl = `${config.API_BASE_URL}/api/subscription`;

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a checkout session for subscription
   */
  async createCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
    return this.makeRequest<CheckoutResponse>('/create-checkout', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get current subscription status
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    return this.makeRequest<SubscriptionStatus>('/status');
  }

  /**
   * Get usage limits and current usage
   */
  async getUsageLimits(): Promise<UsageLimits> {
    return this.makeRequest<UsageLimits>('/usage');
  }

  /**
   * Create customer portal session for subscription management
   */
  async createCustomerPortal(): Promise<{ portal_url: string }> {
    return this.makeRequest<{ portal_url: string }>('/customer-portal', {
      method: 'POST',
    });
  }

  /**
   * Cancel current subscription
   */
  async cancelSubscription(): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/cancel', {
      method: 'POST',
    });
  }

  /**
   * Get available subscription plans
   */
  async getPlans(): Promise<PlansResponse> {
    return this.makeRequest<PlansResponse>('/plans');
  }

  /**
   * Get tier information
   */
  async getTierInfo(tier: string): Promise<{
    tier: string;
    limits: {
      monthly_meetings?: number;
      monthly_transcription_minutes?: number;
    };
    features: string[];
  }> {
    return this.makeRequest(`/tier-info/${tier}`);
  }

  /**
   * Redirect to checkout page
   */
  async redirectToCheckout(planType: 'pro' | 'enterprise', billingCycle: 'monthly' | 'yearly' = 'monthly'): Promise<void> {
    try {
      const checkout = await this.createCheckout({
        plan_type: planType,
        billing_cycle: billingCycle,
      });

      // Redirect to Polar checkout
      window.location.href = checkout.checkout_url;
    } catch (error) {
      console.error('Failed to create checkout:', error);
      throw error;
    }
  }

  /**
   * Open customer portal in new tab
   */
  async openCustomerPortal(): Promise<void> {
    try {
      const portal = await this.createCustomerPortal();
      window.open(portal.portal_url, '_blank');
    } catch (error) {
      console.error('Failed to create customer portal:', error);
      throw error;
    }
  }
}

export const subscriptionApi = new SubscriptionApi();
export default subscriptionApi;