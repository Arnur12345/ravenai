# Polar Payment Integration Guide for AfterTalk/RavenAI

## Overview

This guide provides step-by-step instructions for integrating Polar payments into your AfterTalk/RavenAI meeting transcription service. The integration includes subscription management, usage tracking, and automatic billing.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install polar-sdk
```

### 2. Run Database Migration

```bash
cd backend
python migrate_subscription.py
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and configure your Polar credentials:

```bash
cp .env.example .env
```

### 4. Set Up Polar Account

1. **Sign up**: Visit [polar.sh/signup](https://polar.sh/signup)
2. **Create Organization**: Set up your organization for products and customers
3. **Get Credentials**: Copy your access token and webhook secret from the dashboard

## 📋 Detailed Setup Instructions

### Phase 1: Polar Account Configuration

#### 1.1 Create Products in Polar Dashboard

Navigate to your Polar dashboard and create the following products:

**Pro Plan Product:**
- Name: "RavenAI Pro"
- Description: "Professional meeting transcription with AI summaries"
- Type: "Recurring"
- Create monthly and yearly pricing options

**Enterprise Plan Product:**
- Name: "RavenAI Enterprise" 
- Description: "Unlimited transcription for teams and organizations"
- Type: "Recurring"
- Create monthly and yearly pricing options

#### 1.2 Configure Webhook Endpoint

In your Polar organization settings:
1. Add webhook endpoint: `https://yourdomain.com/api/subscription/webhooks/polar`
2. Subscribe to events:
   - `checkout.created`
   - `order.created`
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`
3. Copy the webhook secret for your environment variables

#### 1.3 Environment Configuration

Update your `.env` file with Polar credentials:

```env
# Polar Configuration
POLAR_ACCESS_TOKEN=your_polar_access_token_here
POLAR_WEBHOOK_SECRET=your_webhook_secret_here
POLAR_ENVIRONMENT=sandbox  # Change to 'production' for live
POLAR_ORGANIZATION_ID=your_organization_id

# Product Price IDs (get these from Polar dashboard)
POLAR_PRO_MONTHLY_PRICE_ID=price_xxx
POLAR_PRO_YEARLY_PRICE_ID=price_yyy
POLAR_ENTERPRISE_MONTHLY_PRICE_ID=price_zzz
POLAR_ENTERPRISE_YEARLY_PRICE_ID=price_aaa

# Application URLs
APP_BASE_URL=https://yourdomain.com
FRONTEND_SUCCESS_URL=https://yourdomain.com/subscription/success
FRONTEND_CANCEL_URL=https://yourdomain.com/subscription/cancel
```

### Phase 2: Backend Integration

The backend integration is already implemented with the following features:

#### 2.1 New API Endpoints

All subscription endpoints are available at `/api/subscription/`:

- `POST /create-checkout` - Create checkout session
- `GET /status` - Get subscription status
- `GET /usage` - Get usage limits and current usage
- `POST /customer-portal` - Create customer portal session
- `POST /cancel` - Cancel subscription
- `GET /plans` - Get available plans
- `POST /webhooks/polar` - Webhook handler (for Polar)

#### 2.2 Usage Tracking Integration

The system automatically:
- Tracks meeting creation and enforces limits
- Monitors transcription minutes usage
- Resets usage counters monthly
- Blocks feature access based on subscription tier

#### 2.3 Database Schema

New tables added:
- `subscriptions` - Polar subscription details
- `webhook_events` - Webhook event tracking
- Extended `users` table with subscription fields

### Phase 3: Frontend Integration

#### 3.1 Subscription API Service

A new `subscriptionApi` service provides:
- Checkout session creation
- Subscription status queries
- Usage monitoring
- Customer portal access

#### 3.2 React Components

The `SubscriptionPage` component provides:
- Current subscription display
- Usage meters with visual indicators
- Plan upgrade options with pricing
- Customer portal access

#### 3.3 Usage Integration

Frontend components can check subscription status:

```typescript
import { subscriptionApi } from '../shared/api/subscriptionApi';

// Check if user can create meetings
const usage = await subscriptionApi.getUsageLimits();
if (!usage.can_create_meeting) {
  // Show upgrade prompt
}
```

## 🔧 Subscription Tiers & Features

### Free Tier
- **Meetings**: 5 per month
- **Transcription**: 60 minutes per month
- **Features**: Basic transcription, basic summaries

### Pro Tier ($29/month)
- **Meetings**: 100 per month
- **Transcription**: 1200 minutes per month (20 hours)
- **Features**: 
  - Advanced transcription
  - AI summaries
  - Slack integration
  - Google Calendar integration
  - Export options

### Enterprise Tier ($99/month)
- **Meetings**: Unlimited
- **Transcription**: Unlimited
- **Features**:
  - All Pro features
  - Advanced AI features
  - Custom integrations
  - Priority support
  - Custom branding
  - Team management

## 🔄 User Flow

### 1. New User Registration
1. User signs up with free account
2. Gets 5 meetings/60 minutes per month
3. Usage tracking begins automatically

### 2. Subscription Upgrade
1. User clicks "Upgrade" in dashboard
2. Redirected to Polar checkout
3. After payment, webhook updates subscription
4. User gets immediate access to new limits

### 3. Usage Monitoring
1. Each meeting creation checks limits
2. Transcription minutes tracked in real-time
3. Usage resets monthly
4. Users get warnings when approaching limits

### 4. Subscription Management
1. Users can access customer portal
2. View billing history and invoices
3. Update payment methods
4. Cancel or modify subscriptions

## 🚨 Error Handling

### Common Integration Issues

#### 1. Webhook Signature Verification Failed
- **Cause**: Incorrect webhook secret
- **Solution**: Verify `POLAR_WEBHOOK_SECRET` matches Polar dashboard

#### 2. Product Price ID Not Found
- **Cause**: Price IDs not configured
- **Solution**: Update `POLAR_*_PRICE_ID` environment variables

#### 3. Customer Portal Creation Failed
- **Cause**: User has no `polar_customer_id`
- **Solution**: Ensure webhook processes subscription creation correctly

#### 4. Usage Limit Enforcement Not Working
- **Cause**: Usage tracking not integrated in meeting creation
- **Solution**: Verify `track_meeting_created()` is called after successful meeting creation

## 🧪 Testing

### 1. Sandbox Testing
1. Use `POLAR_ENVIRONMENT=sandbox`
2. Use test credit cards from Polar documentation
3. Test complete checkout flow
4. Verify webhook delivery

### 2. Webhook Testing
1. Use ngrok for local development:
   ```bash
   ngrok http 8000
   # Use ngrok URL in Polar webhook settings
   ```
2. Test all webhook events
3. Monitor webhook event processing in database

### 3. Usage Limits Testing
1. Create test user with different tiers
2. Verify meeting creation limits
3. Test usage reset functionality
4. Confirm feature access restrictions

## 🔐 Security Considerations

### 1. Webhook Security
- Always verify webhook signatures
- Store webhook events for audit trail
- Implement idempotency for webhook processing

### 2. Environment Variables
- Never commit secrets to version control
- Use different keys for sandbox/production
- Rotate keys regularly

### 3. User Data Protection
- Subscription data is linked to user accounts
- Respect user privacy in usage tracking
- Provide data export/deletion capabilities

## 📊 Monitoring & Analytics

### 1. Subscription Metrics
- Track subscription conversion rates
- Monitor churn and retention
- Analyze usage patterns by tier

### 2. Usage Analytics
- Meeting creation trends
- Transcription minute consumption
- Feature adoption rates

### 3. Revenue Tracking
- Monthly recurring revenue (MRR)
- Customer lifetime value (CLV)
- Plan upgrade/downgrade patterns

## 🚀 Deployment

### 1. Environment Setup
```bash
# Production environment variables
POLAR_ENVIRONMENT=production
POLAR_ACCESS_TOKEN=your_production_token
APP_BASE_URL=https://yourdomain.com
```

### 2. Database Migration
```bash
python migrate_subscription.py
```

### 3. Service Restart
```bash
docker-compose down
docker-compose up -d
```

### 4. Verify Integration
1. Test checkout flow in production
2. Verify webhook delivery
3. Check subscription status endpoints
4. Confirm usage tracking

## 📞 Support & Troubleshooting

### Health Check Endpoint
Monitor integration health:
```
GET /api/subscription/health
```

Returns:
```json
{
  "status": "healthy",
  "polar_configured": true,
  "features": ["subscription_management", "polar_integration", "webhook_processing"]
}
```

### Common Commands

```bash
# Check subscription API health
curl http://localhost:8000/api/subscription/health

# Get available plans
curl http://localhost:8000/api/subscription/plans

# Test webhook endpoint (development)
curl -X POST http://localhost:8000/api/subscription/webhooks/polar \
  -H "polar-signature: test" \
  -d '{"type": "test", "data": {}}'
```

## 🎯 Next Steps

1. **Complete Polar Setup**: Create products and configure webhooks
2. **Test Integration**: Use sandbox mode for thorough testing
3. **Update Frontend**: Add subscription pages to your React app
4. **Deploy**: Update production environment and deploy
5. **Monitor**: Track subscription metrics and user behavior

## 💡 Tips for Success

1. **Start with Sandbox**: Always test in sandbox environment first
2. **Monitor Webhooks**: Set up logging for webhook events
3. **User Communication**: Clearly communicate subscription benefits
4. **Gradual Rollout**: Consider feature flags for gradual deployment
5. **Customer Support**: Prepare support team for subscription questions

---

**Need Help?** 
- Check Polar documentation: [docs.polar.sh](https://docs.polar.sh)
- Review webhook logs in your database
- Test API endpoints using the health check
- Monitor application logs for integration errors