# 🚀 Complete Polar Integration Implementation Guide

## ✅ What You've Got So Far

The integration is **90% complete**! Here's what's already implemented:

- ✅ Backend subscription API with all endpoints
- ✅ Database models and migration script
- ✅ Frontend subscription API service
- ✅ Updated pricing.tsx with subscription functionality
- ✅ Success and cancel pages
- ✅ Usage tracking and limits enforcement
- ✅ Webhook handling for subscription events

## 🔧 Next Steps to Complete Integration

### **Step 1: Set Up Your Polar Account (15 minutes)**

1. **Sign up at [polar.sh/signup](https://polar.sh/signup)**
   - Use your business email
   - Create your organization

2. **Create Products in Polar Dashboard:**

   **Pro Plan Product:**
   - Go to Products → Create Product
   - Name: "RavenAI Pro"
   - Description: "Professional meeting transcription with AI summaries"
   - Type: "Subscription"
   - Monthly Price: $3.00 USD
   - Yearly Price: $30.00 USD (save $6)

   **Enterprise Plan Product:**
   - Name: "RavenAI Enterprise"
   - Description: "Unlimited transcription for teams"
   - Type: "Subscription"
   - Monthly Price: $99.00 USD
   - Yearly Price: $990.00 USD (save $198)

3. **Copy Your Credentials:**
   - Go to Settings → API Keys
   - Copy your Access Token
   - Copy your Organization ID

4. **Set Up Webhook:**
   - Go to Settings → Webhooks
   - Add endpoint: `https://ravenai.site/api/subscription/webhooks/polar`
   - Subscribe to events:
     - `subscription.created`
     - `subscription.updated`
     - `subscription.canceled`
   - Copy the webhook secret

### **Step 2: Update Your Environment Variables**

Update your `.env` file with real Polar credentials:

```env
# Replace these with your actual Polar credentials
POLAR_ACCESS_TOKEN=polar_at_xxxxxxxxxxxxxxxxxx
POLAR_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxx
POLAR_ENVIRONMENT=sandbox
POLAR_ORGANIZATION_ID=org_xxxxxxxxxxxxxxxxxx

# Get these from your Polar product prices
POLAR_PRO_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxxxxxxx
POLAR_PRO_YEARLY_PRICE_ID=price_xxxxxxxxxxxxxxxxxx
POLAR_ENTERPRISE_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxxxxxxx
POLAR_ENTERPRISE_YEARLY_PRICE_ID=price_xxxxxxxxxxxxxxxxxx
```

### **Step 3: Run Database Migration**

```bash
cd backend
python3 migrate_subscription.py
```

If you get dependency errors, install using Docker:

```bash
# Option 1: Using Docker
docker-compose exec backend python migrate_subscription.py

# Option 2: Create virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python migrate_subscription.py
```

### **Step 4: Test the Backend API**

Start your backend and test the subscription endpoints:

```bash
# Start backend
docker-compose up backend

# Test subscription health
curl http://localhost:8000/api/subscription/health

# Test available plans
curl http://localhost:8000/api/subscription/plans
```

Expected response:
```json
{
  "status": "healthy",
  "polar_configured": true,
  "features": ["subscription_management", "polar_integration", "webhook_processing"]
}
```

### **Step 5: Add Routes to Your React App**

Add these routes to your main router (typically in `App.tsx` or router file):

```typescript
import SubscriptionPage from './modules/subscription/SubscriptionPage';
import SubscriptionSuccess from './modules/subscription/SubscriptionSuccess';
import SubscriptionCancel from './modules/subscription/SubscriptionCancel';

// Add these routes
{
  path: '/subscription',
  element: <SubscriptionPage />
},
{
  path: '/subscription/success',
  element: <SubscriptionSuccess />
},
{
  path: '/subscription/cancel',
  element: <SubscriptionCancel />
}
```

### **Step 6: Test the Complete Flow**

1. **Start your application:**
   ```bash
   docker-compose up
   ```

2. **Test subscription flow:**
   - Go to `/pricing`
   - Click "Upgrade Now" on Pro plan
   - Should redirect to Polar checkout
   - Use test card: `4242 4242 4242 4242`
   - Complete checkout
   - Should redirect to success page

3. **Verify webhook processing:**
   - Check your database for new subscription record
   - Check webhook_events table for processed events

### **Step 7: Add Subscription Status to Dashboard**

Add subscription info to your existing dashboard:

```typescript
// In your dashboard component
import { subscriptionApi } from '../shared/api/subscriptionApi';

const Dashboard = () => {
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    const loadUsage = async () => {
      try {
        const usageData = await subscriptionApi.getUsageLimits();
        setUsage(usageData);
      } catch (error) {
        console.error('Failed to load usage:', error);
      }
    };
    loadUsage();
  }, []);

  return (
    <div>
      {/* Your existing dashboard content */}
      
      {/* Add subscription status */}
      {usage && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Subscription Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Current Plan</p>
              <p className="font-semibold capitalize">{usage.tier}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Meetings Used</p>
              <p className="font-semibold">
                {usage.monthly_meetings_used} / {usage.monthly_meetings_limit || '∞'}
              </p>
            </div>
          </div>
          
          {!usage.can_create_meeting && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
              <p className="text-amber-800 text-sm">
                You've reached your monthly limit. 
                <a href="/pricing" className="font-medium underline ml-1">
                  Upgrade your plan
                </a>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

## 🧪 Testing Guide

### **Test Cases to Verify**

1. **Free User Flow:**
   - New user signs up
   - Gets free tier limits (5 meetings, 60 minutes)
   - Can create meetings until limit reached
   - Gets upgrade prompt when limit hit

2. **Subscription Flow:**
   - User clicks upgrade from pricing page
   - Redirects to Polar checkout
   - Completes payment with test card
   - Webhook processes subscription
   - User gets Pro tier access

3. **Usage Tracking:**
   - Create meetings and verify usage increases
   - Check that limits are enforced
   - Verify monthly reset works

4. **Customer Portal:**
   - Pro user can access customer portal
   - Can view billing history
   - Can cancel subscription

### **Test Credit Cards (Sandbox)**

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Insufficient Funds: 4000 0000 0000 9995
```

## 🚨 Common Issues & Solutions

### **1. Migration Failed - Dependencies Missing**

**Problem:** `ModuleNotFoundError: No module named 'sqlalchemy'`

**Solution:**
```bash
# Use Docker instead
docker-compose exec backend python migrate_subscription.py

# Or create virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### **2. Polar API Not Configured**

**Problem:** `polar_configured: false` in health check

**Solution:**
- Check your `POLAR_ACCESS_TOKEN` in `.env`
- Verify it starts with `polar_at_`
- Make sure you're using the correct environment (sandbox/production)

### **3. Webhook Signature Verification Failed**

**Problem:** Webhook events not processing

**Solution:**
- Verify `POLAR_WEBHOOK_SECRET` matches Polar dashboard
- Check webhook URL is accessible: `https://yourdomain.com/api/subscription/webhooks/polar`
- Use ngrok for local testing: `ngrok http 8000`

### **4. Price IDs Not Found**

**Problem:** `Invalid plan: pro_monthly`

**Solution:**
- Get correct price IDs from Polar dashboard
- Update environment variables with actual price IDs
- Format: `price_xxxxxxxxxxxxxxxxxxxxxxxx`

### **5. User Not Redirected After Payment**

**Problem:** Success page not loading

**Solution:**
- Check success URL in Polar dashboard settings
- Verify URL format: `https://yourdomain.com/subscription/success?session_id={CHECKOUT_SESSION_ID}`
- Make sure route exists in your React router

## 📋 Pre-Production Checklist

- [ ] ✅ Polar account created and verified
- [ ] ✅ Products and prices configured in Polar
- [ ] ✅ Environment variables updated with real credentials
- [ ] ✅ Database migration completed
- [ ] ✅ Webhook endpoint accessible from internet
- [ ] ✅ Test subscription flow end-to-end
- [ ] ✅ Verify webhook processing in database
- [ ] ✅ Test usage limits enforcement
- [ ] ✅ Customer portal access working
- [ ] ✅ Success/cancel pages loading correctly

## 🎯 Production Deployment

### **1. Update Environment for Production**

```env
POLAR_ENVIRONMENT=production
POLAR_ACCESS_TOKEN=polar_at_prod_xxxxxxxxxxxxxxxx
APP_BASE_URL=https://ravenai.site
FRONTEND_SUCCESS_URL=https://ravenai.site/subscription/success
FRONTEND_CANCEL_URL=https://ravenai.site/subscription/cancel
```

### **2. Update Webhook URL in Polar**

Change webhook endpoint to production URL:
`https://ravenai.site/api/subscription/webhooks/polar`

### **3. Deploy and Test**

```bash
# Deploy your application
docker-compose up -d

# Test health endpoint
curl https://ravenai.site/api/subscription/health

# Test a real subscription with small amount
```

## 🎉 You're Done!

Your Polar integration is now complete! Users can:

- ✅ View pricing plans on your pricing page
- ✅ Subscribe to Pro/Enterprise plans
- ✅ Get redirected to Polar checkout
- ✅ Have their subscription automatically activated
- ✅ Access Pro features immediately
- ✅ Manage their subscription through customer portal
- ✅ Have usage tracked and limits enforced

## 📊 Monitoring & Analytics

Track these metrics in your dashboard:

1. **Subscription Metrics:**
   - Conversion rate from pricing page
   - Monthly recurring revenue (MRR)
   - Churn rate

2. **Usage Metrics:**
   - Average meetings per user by tier
   - Feature adoption rates
   - Upgrade triggers (hitting limits)

3. **Support Metrics:**
   - Payment-related support tickets
   - Subscription cancellation reasons

## 🔗 Useful Links

- [Polar Dashboard](https://polar.sh/dashboard)
- [Polar Documentation](https://docs.polar.sh)
- [Webhook Testing Tool](https://webhook.site)
- [Test Credit Cards](https://docs.polar.sh/developers/webhooks/testing)

## 💡 Next Features to Consider

1. **Team Plans:** Multi-user subscriptions
2. **Usage Alerts:** Email when approaching limits
3. **Annual Discount Campaigns:** Special pricing periods
4. **Referral Program:** Credit for successful referrals
5. **Usage Analytics:** Detailed usage insights for customers

---

**🚀 Ready to launch your subscription business!** If you encounter any issues, check the troubleshooting section or reach out for support.