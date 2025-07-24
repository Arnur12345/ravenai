import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Settings } from 'lucide-react';
import { subscriptionApi } from '../../shared/api/subscriptionApi';

export const SubscriptionSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        // Wait a moment for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const status = await subscriptionApi.getSubscriptionStatus();
        setSubscriptionStatus(status);
      } catch (error) {
        console.error('Failed to fetch subscription status:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to RavenAI Pro! 🎉
        </h1>

        <p className="text-gray-600 mb-6">
          Your subscription has been successfully activated. You now have access to all Pro features.
        </p>

        {subscriptionStatus && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Subscription Details</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Plan:</span> {subscriptionStatus.tier}</p>
              <p><span className="font-medium">Status:</span> {subscriptionStatus.is_active ? 'Active' : 'Inactive'}</p>
              {subscriptionStatus.ends_at && (
                <p><span className="font-medium">Next billing:</span> {new Date(subscriptionStatus.ends_at).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            onClick={() => window.location.href = '/dashboard'}
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
            onClick={async () => {
              try {
                await subscriptionApi.openCustomerPortal();
              } catch (error) {
                alert('Failed to open customer portal');
              }
            }}
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage Subscription
          </motion.button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Having issues? Contact our support team at{' '}
          <a href="mailto:support@ravenai.site" className="text-blue-600 hover:underline">
            support@ravenai.site
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default SubscriptionSuccess;