import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, MessageCircle } from 'lucide-react';

export const SubscriptionCancel: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
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
          <XCircle className="w-16 h-16 text-orange-500 mx-auto" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Subscription Cancelled
        </h1>

        <p className="text-gray-600 mb-6">
          No worries! Your subscription wasn't processed. You can try again anytime or continue using RavenAI with our free plan.
        </p>

        <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-sm text-blue-700">
            If you experienced any issues during checkout or have questions about our plans, our support team is here to help.
          </p>
        </div>

        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            onClick={() => window.location.href = '/pricing'}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pricing
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
            onClick={() => window.location.href = '/dashboard'}
          >
            Continue with Free Plan
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-green-100 text-green-700 py-3 px-6 rounded-lg font-medium hover:bg-green-200 transition-colors flex items-center justify-center"
            onClick={() => window.location.href = 'mailto:support@ravenai.site?subject=Subscription Help'}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact Support
          </motion.button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Your free plan includes 5 meetings and 60 minutes of transcription per month.
        </p>
      </motion.div>
    </div>
  );
};

export default SubscriptionCancel;