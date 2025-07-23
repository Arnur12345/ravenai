import React from 'react';
import { LegalLayout } from '../components/LegalLayout';

const sections = [
  { id: 'acceptance', title: 'Acceptance of Terms', level: 1 },
  { id: 'service-description', title: 'Service Description', level: 1 },
  { id: 'platform-overview', title: 'Platform Overview', level: 2 },
  { id: 'ai-features', title: 'AI-Powered Features', level: 2 },
  { id: 'integrations', title: 'Third-Party Integrations', level: 2 },
  { id: 'user-accounts', title: 'User Accounts', level: 1 },
  { id: 'registration', title: 'Account Registration', level: 2 },
  { id: 'account-security', title: 'Account Security', level: 2 },
  { id: 'account-termination', title: 'Account Termination', level: 2 },
  { id: 'acceptable-use', title: 'Acceptable Use Policy', level: 1 },
  { id: 'permitted-activities', title: 'Permitted Activities', level: 2 },
  { id: 'prohibited-content', title: 'Prohibited Content', level: 2 },
  { id: 'meeting-consent', title: 'Meeting Consent Requirements', level: 2 },
  { id: 'intellectual-property', title: 'Intellectual Property', level: 1 },
  { id: 'our-rights', title: 'Our Intellectual Property Rights', level: 2 },
  { id: 'user-content', title: 'User Content Ownership', level: 2 },
  { id: 'license-grants', title: 'License Grants', level: 2 },
  { id: 'payment-terms', title: 'Payment Terms', level: 1 },
  { id: 'subscription-models', title: 'Subscription Models', level: 2 },
  { id: 'billing-cycles', title: 'Billing and Payment', level: 2 },
  { id: 'refund-policy', title: 'Refund Policy', level: 2 },
  { id: 'service-availability', title: 'Service Availability', level: 1 },
  { id: 'uptime-commitments', title: 'Uptime and Performance', level: 2 },
  { id: 'maintenance', title: 'Maintenance and Updates', level: 2 },
  { id: 'liability-disclaimers', title: 'Liability and Disclaimers', level: 1 },
  { id: 'limitation-liability', title: 'Limitation of Liability', level: 2 },
  { id: 'disclaimers', title: 'Service Disclaimers', level: 2 },
  { id: 'indemnification', title: 'Indemnification', level: 2 },
  { id: 'governing-law', title: 'Governing Law and Disputes', level: 1 },
  { id: 'jurisdiction', title: 'Jurisdiction', level: 2 },
  { id: 'dispute-resolution', title: 'Dispute Resolution', level: 2 },
  { id: 'modifications', title: 'Modifications to Terms', level: 1 },
  { id: 'general-provisions', title: 'General Provisions', level: 1 }
];

export const TermsOfServicePage: React.FC = () => {
  return (
    <LegalLayout
      title="Terms of Service"
      lastUpdated="January 15, 2025"
      sections={sections}
    >
      {/* Content */}
      <div className="legal-content">
        <section id="acceptance">
          <h2>1. Acceptance of Terms</h2>
          <p>
            Welcome to Raven AI ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of 
            our meeting intelligence platform, website, and related services (collectively, the "Service").
          </p>
          <p>
            By accessing or using our Service, you agree to be bound by these Terms. If you disagree with 
            any part of these Terms, you may not access or use our Service.
          </p>
          <p>
            These Terms constitute a legally binding agreement between you and Raven AI. Your use of the 
            Service confirms your acceptance of these Terms and any updates or modifications.
          </p>
        </section>

        <section id="service-description">
          <h2>2. Service Description</h2>
          
          <div id="platform-overview">
            <h3>2.1 Platform Overview</h3>
            <p>Raven AI provides a comprehensive meeting intelligence platform that includes:</p>
            <ul>
              <li>Real-time meeting recording and transcription</li>
              <li>AI-powered meeting summaries and insights</li>
              <li>Action item extraction and tracking</li>
              <li>Meeting analytics and productivity metrics</li>
              <li>Integration with popular business tools</li>
              <li>Searchable meeting archive and knowledge base</li>
            </ul>
          </div>

          <div id="ai-features">
            <h3>2.2 AI-Powered Features</h3>
            <p>Our AI technology provides:</p>
            <ul>
              <li><strong>Intelligent Transcription:</strong> Speech-to-text conversion with speaker identification</li>
              <li><strong>Smart Summaries:</strong> Automated generation of key points and decisions</li>
              <li><strong>Action Item Detection:</strong> Automatic identification of tasks and assignments</li>
              <li><strong>Sentiment Analysis:</strong> Meeting tone and engagement insights</li>
              <li><strong>Topic Extraction:</strong> Automatic categorization and tagging</li>
              <li><strong>Follow-up Recommendations:</strong> Suggested next steps and improvements</li>
            </ul>
          </div>

          <div id="integrations">
            <h3>2.3 Third-Party Integrations</h3>
            <p>Our Service integrates with various third-party applications to enhance functionality. By using these integrations, you grant us permission to access your data from those services as required for the integration to function. Your use of third-party services is subject to their respective terms and privacy policies.</p>
            <p>Key integrations include:</p>
            <ul>
              <li><strong>Google Calendar:</strong> To schedule and manage meeting recordings, we access your calendar data with your explicit consent. You are responsible for the data you authorize us to access from your Google Calendar. Our use of this data is governed by our Privacy Policy and is in compliance with the Google API Services User Data Policy.</li>
              <li>Slack for team communication</li>
              <li>Popular video conferencing platforms</li>
              <li>Project management tools</li>
              <li>CRM and business applications</li>
            </ul>
          </div>
        </section>

        <section id="user-accounts">
          <h2>3. User Accounts</h2>
          
          <div id="registration">
            <h3>3.1 Account Registration</h3>
            <ul>
              <li>You must provide accurate, current, and complete information during registration</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You must be at least 16 years old to create an account</li>
              <li>One person may not maintain multiple accounts for the same organization</li>
              <li>You must promptly update your account information if it changes</li>
            </ul>
          </div>

          <div id="account-security">
            <h3>3.2 Account Security</h3>
            <ul>
              <li>You are responsible for all activities that occur under your account</li>
              <li>You must immediately notify us of any unauthorized use of your account</li>
              <li>You should use strong passwords and enable two-factor authentication when available</li>
              <li>We are not liable for any loss or damage from your failure to secure your account</li>
            </ul>
          </div>

          <div id="account-termination">
            <h3>3.3 Account Termination</h3>
            <ul>
              <li>You may terminate your account at any time through your account settings</li>
              <li>We may suspend or terminate accounts that violate these Terms</li>
              <li>Upon termination, your access to the Service will cease immediately</li>
              <li>Account data may be retained for a limited time for legal and business purposes</li>
            </ul>
          </div>
        </section>

        <section id="acceptable-use">
          <h2>4. Acceptable Use Policy</h2>
          
          <div id="permitted-activities">
            <h3>4.1 Permitted Activities</h3>
            <p>You may use our Service to:</p>
            <ul>
              <li>Record and transcribe business meetings with proper consent</li>
              <li>Generate summaries and insights for legitimate business purposes</li>
              <li>Collaborate with team members on meeting content</li>
              <li>Integrate with approved third-party business tools</li>
              <li>Export your own meeting data and content</li>
            </ul>
          </div>

          <div id="prohibited-content">
            <h3>4.2 Prohibited Content and Activities</h3>
            <p>You may not use our Service to:</p>
            <ul>
              <li>Record meetings without proper consent from all participants</li>
              <li>Upload or process illegal, harmful, or offensive content</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Attempt to reverse engineer or hack our systems</li>
              <li>Share account credentials with unauthorized users</li>
              <li>Use the Service for competitive intelligence against us</li>
              <li>Transmit spam, malware, or other malicious content</li>
            </ul>
          </div>

          <div id="meeting-consent">
            <h3>4.3 Meeting Consent Requirements</h3>
            <p><strong>Critical Requirement:</strong> You must obtain proper consent before recording any meeting:</p>
            <ul>
              <li>All participants must be informed that recording is taking place</li>
              <li>You must comply with local laws regarding recording consent</li>
              <li>In one-party consent jurisdictions, the meeting organizer's consent is sufficient</li>
              <li>In two-party consent jurisdictions, all participants must explicitly agree</li>
              <li>International meetings require compliance with the most restrictive applicable law</li>
              <li>You are solely responsible for obtaining and maintaining proper consent</li>
            </ul>
          </div>
        </section>

        <section id="intellectual-property">
          <h2>5. Intellectual Property</h2>
          
          <div id="our-rights">
            <h3>5.1 Our Intellectual Property Rights</h3>
            <ul>
              <li>The Service, including software, algorithms, and AI models, is our proprietary property</li>
              <li>Our trademarks, logos, and brand elements are protected intellectual property</li>
              <li>You may not copy, modify, or create derivative works of our technology</li>
              <li>All improvements and enhancements to our Service remain our property</li>
            </ul>
          </div>

          <div id="user-content">
            <h3>5.2 User Content Ownership</h3>
            <ul>
              <li>You retain ownership of your original meeting recordings and content</li>
              <li>You own the transcripts and summaries generated from your meetings</li>
              <li>You are responsible for ensuring you have rights to all uploaded content</li>
              <li>AI-generated insights are derived from your content but may not be copyrightable</li>
            </ul>
          </div>

          <div id="license-grants">
            <h3 style={{ color: 'var(--dashboard-black, #000000)' }}>5.3 License Grants</h3>
            <p><strong>Your License to Us:</strong> You grant us a limited, non-exclusive license to:</p>
            <ul>
              <li>Process your content to provide the Service</li>
              <li>Generate transcripts, summaries, and insights</li>
              <li>Store and backup your data securely</li>
              <li>Improve our AI models using aggregated, anonymized data</li>
            </ul>
            <p><strong>Our License to You:</strong> We grant you a limited, non-exclusive license to:</p>
            <ul>
              <li>Use the Service according to these Terms</li>
              <li>Access and download your own content</li>
              <li>Use our API within published rate limits</li>
              <li>Integrate with approved third-party services</li>
            </ul>
          </div>
        </section>

        <section id="payment-terms">
          <h2 style={{ color: 'var(--dashboard-black, #000000)' }}>6. Payment Terms</h2>
          
          <div id="subscription-models">
            <h3 style={{ color: 'var(--dashboard-black, #000000)' }}>6.1 Subscription Models</h3>
            <ul>
              <li><strong>Free Tier:</strong> Limited features with usage restrictions</li>
              <li><strong>Professional:</strong> Full features for individual users</li>
              <li><strong>Team:</strong> Collaboration features for small teams</li>
              <li><strong>Enterprise:</strong> Advanced features with custom pricing</li>
            </ul>
          </div>

          <div id="billing-cycles">
            <h3 style={{ color: 'var(--dashboard-black, #000000)' }}>6.2 Billing and Payment</h3>
            <ul>
              <li>Subscription fees are billed in advance on a monthly or annual basis</li>
              <li>All payments are processed securely through encrypted payment gateways</li>
              <li>You authorize automatic renewal unless cancelled before the next billing cycle</li>
              <li>Failed payments may result in service suspension or account termination</li>
              <li>Price changes will be communicated with at least 30 days notice</li>
            </ul>
          </div>

          <div id="refund-policy">
            <h3 style={{ color: 'var(--dashboard-black, #000000)' }}>6.3 Refund Policy</h3>
            <ul>
              <li><strong>30-Day Guarantee:</strong> Full refund available within 30 days of initial purchase</li>
              <li><strong>Pro-rated Refunds:</strong> Available for annual subscriptions cancelled mid-term</li>
              <li><strong>Service Issues:</strong> Refunds may be provided for significant service disruptions</li>
              <li><strong>Violation Termination:</strong> No refunds for accounts terminated due to Terms violations</li>
              <li>Refund requests must be submitted through our support channels</li>
            </ul>
          </div>
        </section>

        <section id="service-availability">
          <h2 style={{ color: 'var(--dashboard-black, #000000)' }}>7. Service Availability</h2>
          
          <div id="uptime-commitments">
            <h3 style={{ color: 'var(--dashboard-black, #000000)' }}>7.1 Uptime and Performance</h3>
            <ul>
              <li>We strive for 99.9% uptime but do not guarantee continuous availability</li>
              <li>Planned maintenance will be announced in advance when possible</li>
              <li>Emergency maintenance may occur without prior notice</li>
              <li>Performance may vary based on internet connectivity and usage patterns</li>
            </ul>
          </div>

          <div id="maintenance">
            <h3 style={{ color: 'var(--dashboard-black, #000000)' }}>7.2 Maintenance and Updates</h3>
            <ul>
              <li>We regularly update our Service to improve functionality and security</li>
              <li>Updates may temporarily affect service availability</li>
              <li>New features may be added or removed at our discretion</li>
              <li>Critical security updates may be deployed immediately</li>
            </ul>
          </div>
        </section>

        <section id="liability-disclaimers">
          <h2 style={{ color: 'var(--dashboard-black, #000000)' }}>8. Liability and Disclaimers</h2>
          
          <div id="limitation-liability">
            <h3 style={{ color: 'var(--dashboard-black, #000000)' }}>8.1 Limitation of Liability</h3>
            <p>To the maximum extent permitted by law:</p>
            <ul>
              <li>Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim</li>
              <li>We are not liable for indirect, incidental, or consequential damages</li>
              <li>We are not responsible for data loss due to user error or system failures</li>
              <li>Business decisions based on our AI insights are made at your own risk</li>
            </ul>
          </div>

          <div id="disclaimers">
            <h3 style={{ color: 'var(--dashboard-black, #000000)' }}>8.2 Service Disclaimers</h3>
            <ul>
              <li>The Service is provided "as is" without warranties of any kind</li>
              <li>AI-generated content may contain errors or inaccuracies</li>
              <li>Transcription accuracy may vary based on audio quality and accents</li>
              <li>We do not guarantee the accuracy of integrations with third-party services</li>
              <li>Legal compliance regarding recording laws is your responsibility</li>
            </ul>
          </div>

          <div id="indemnification">
            <h3 style={{ color: 'var(--dashboard-black, #000000)' }}>8.3 Indemnification</h3>
            <p>You agree to indemnify and hold us harmless from claims arising from:</p>
            <ul>
              <li>Your violation of these Terms or applicable laws</li>
              <li>Your use of the Service in an unauthorized manner</li>
              <li>Content you upload or process through our Service</li>
              <li>Violation of third-party rights, including recording without consent</li>
            </ul>
          </div>
        </section>

        <section id="governing-law">
          <h2 style={{ color: 'var(--dashboard-black, #000000)' }}>9. Governing Law and Disputes</h2>
          
          <div id="jurisdiction">
            <h3 style={{ color: 'var(--dashboard-black, #000000)' }}>9.1 Jurisdiction</h3>
            <ul>
              <li>These Terms are governed by the laws of the Republic of Kazakhstan</li>
              <li>Any disputes will be subject to the jurisdiction of courts in Almaty, Kazakhstan</li>
              <li>International users consent to jurisdiction in Kazakhstan for dispute resolution</li>
              <li>Local consumer protection laws may still apply in your jurisdiction</li>
            </ul>
          </div>

          <div id="dispute-resolution">
            <h3 style={{ color: 'var(--dashboard-black, #000000)' }}>9.2 Dispute Resolution</h3>
            <ul>
              <li><strong>Informal Resolution:</strong> Contact us directly to resolve disputes amicably</li>
              <li><strong>Mediation:</strong> Disputes may be resolved through mediation if both parties agree</li>
              <li><strong>Arbitration:</strong> Complex disputes may be subject to binding arbitration</li>
              <li><strong>Class Action Waiver:</strong> You waive the right to participate in class action lawsuits</li>
            </ul>
          </div>
        </section>

        <section id="modifications">
          <h2 style={{ color: 'var(--dashboard-black, #000000)' }}>10. Modifications to Terms</h2>
          <p>We may update these Terms from time to time. When we do:</p>
          <ul>
            <li>We will post the updated Terms on our website</li>
            <li>We will notify registered users via email</li>
            <li>We will provide at least 30 days notice for material changes</li>
            <li>Continued use of the Service constitutes acceptance of updated Terms</li>
            <li>If you disagree with changes, you may terminate your account</li>
          </ul>
        </section>

        <section id="general-provisions">
          <h2 style={{ color: 'var(--dashboard-black, #000000)' }}>11. General Provisions</h2>
          <ul>
            <li><strong>Entire Agreement:</strong> These Terms constitute the complete agreement between you and us</li>
            <li><strong>Severability:</strong> If any provision is found invalid, the remainder shall remain in effect</li>
            <li><strong>Force Majeure:</strong> We are not liable for delays due to circumstances beyond our control</li>
            <li><strong>Assignment:</strong> We may assign these Terms; you may not assign without our consent</li>
            <li><strong>Waiver:</strong> Our failure to enforce any provision does not waive our right to do so later</li>
            <li><strong>Survival:</strong> Provisions that should survive termination will remain in effect</li>
          </ul>
          
          <div className="contact-info">
            <h4 style={{ marginBottom: '1rem' }}>Contact Information</h4>
            <p><strong>Raven AI</strong></p>
            <p><strong>CEO:</strong> Arnur Artykbay</p>
            <p><strong>Address:</strong> Almaty, Kazakhstan</p>
            <p><strong>Email:</strong> <a href="mailto:arnurartyqbay@gmail.com" style={{ color: 'var(--dashboard-bright-blue, #83BAFF)' }}>arnurartyqbay@gmail.com</a></p>
            <p><strong>Phone:</strong> <a href="tel:+77083883090" style={{ color: 'var(--dashboard-bright-blue, #83BAFF)' }}>+7 708 388 3090</a></p>
            <p><strong>Website:</strong> <a href="https://ravenai.site" style={{ color: 'var(--dashboard-bright-blue, #83BAFF)' }}>https://ravenai.site</a></p>
          </div>
          
          <p>
            <strong>Effective Date:</strong> These Terms are effective as of January 15, 2025.
          </p>
          <p>
            For questions about these Terms, please include "Terms of Service" in the subject line of your email.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
};