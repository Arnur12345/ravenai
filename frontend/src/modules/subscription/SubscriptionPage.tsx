import React, { useState, useEffect } from 'react';
import { subscriptionApi, type SubscriptionStatus, type UsageLimits, type PlansResponse } from '../../shared/api/subscriptionApi';

interface SubscriptionPageProps {
  className?: string;
}

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ className = '' }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [usageLimits, setUsageLimits] = useState<UsageLimits | null>(null);
  const [plans, setPlans] = useState<PlansResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [statusData, usageData, plansData] = await Promise.all([
        subscriptionApi.getSubscriptionStatus(),
        subscriptionApi.getUsageLimits(),
        subscriptionApi.getPlans()
      ]);
      
      setSubscriptionStatus(statusData);
      setUsageLimits(usageData);
      setPlans(plansData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planType: 'pro' | 'enterprise', billingCycle: 'monthly' | 'yearly') => {
    try {
      await subscriptionApi.redirectToCheckout(planType, billingCycle);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
    }
  };

  const handleManageSubscription = async () => {
    try {
      await subscriptionApi.openCustomerPortal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open customer portal');
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const getUsagePercentage = (used: number, limit?: number) => {
    if (!limit) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-800">{error}</p>
        <button 
          onClick={loadSubscriptionData}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto space-y-8 ${className}`}>
      {/* Current Subscription Status */}
      {subscriptionStatus && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Subscription</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700">Plan</h3>
              <p className="text-xl font-bold capitalize text-blue-600">{subscriptionStatus.tier}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700">Status</h3>
              <p className={`text-xl font-bold ${subscriptionStatus.is_active ? 'text-green-600' : 'text-red-600'}`}>
                {subscriptionStatus.is_active ? 'Active' : 'Inactive'}
              </p>
            </div>
            {subscriptionStatus.ends_at && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700">Next Billing</h3>
                <p className="text-sm text-gray-600">
                  {new Date(subscriptionStatus.ends_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          
          {subscriptionStatus.is_active && (
            <div className="mt-4">
              <button
                onClick={handleManageSubscription}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Manage Subscription
              </button>
            </div>
          )}
        </div>
      )}

      {/* Usage Limits */}
      {usageLimits && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Usage This Month</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Meetings Usage */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-700">Meetings</h3>
                <span className="text-sm text-gray-600">
                  {usageLimits.monthly_meetings_used} / {usageLimits.monthly_meetings_limit || '∞'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${getUsagePercentage(usageLimits.monthly_meetings_used, usageLimits.monthly_meetings_limit)}%`
                  }}
                ></div>
              </div>
            </div>

            {/* Transcription Minutes Usage */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-700">Transcription Minutes</h3>
                <span className="text-sm text-gray-600">
                  {usageLimits.monthly_transcription_minutes_used} / {usageLimits.monthly_transcription_minutes_limit || '∞'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${getUsagePercentage(usageLimits.monthly_transcription_minutes_used, usageLimits.monthly_transcription_minutes_limit)}%`
                  }}
                ></div>
              </div>
            </div>
          </div>

          {!usageLimits.can_create_meeting && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800">
                You've reached your monthly meeting limit. Upgrade your plan to create more meetings.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Available Plans */}
      {plans && (!subscriptionStatus?.is_active || subscriptionStatus?.tier === 'free') && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upgrade Your Plan</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plans.plans.map((plan) => (
              <div key={plan.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                {/* Pricing */}
                <div className="mb-4">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(plan.pricing.monthly.amount)}
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatPrice(plan.pricing.yearly.amount)}/year (save 2 months)
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleUpgrade(plan.id as 'pro' | 'enterprise', 'monthly')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Monthly Plan
                  </button>
                  <button
                    onClick={() => handleUpgrade(plan.id as 'pro' | 'enterprise', 'yearly')}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Start Yearly Plan (Save 20%)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;