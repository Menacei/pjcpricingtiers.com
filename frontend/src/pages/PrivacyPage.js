import React from 'react';
import { Badge } from '../components/ui/badge';

const PrivacyPage = () => {
  return (
    <div className="pt-16">
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge className="mb-4 bg-slate-600/20 text-slate-400 border-slate-500/30">
            Legal
          </Badge>
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
            <p className="text-lg">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <h2 className="text-2xl font-bold text-white mt-8">1. Information We Collect</h2>
            <p>
              When you use our services or submit forms on our website, we may collect the following information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name and contact information (email, phone number)</li>
              <li>Business information you provide</li>
              <li>Information about your project requirements</li>
              <li>Usage data and analytics</li>
              <li>Cookies and tracking technologies</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-8">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Respond to your inquiries and provide quotes</li>
              <li>Deliver our services to you</li>
              <li>Send relevant updates about your project</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-8">3. Information Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties. 
              We may share information with trusted service providers who assist us in operating our website 
              and conducting our business, as long as they agree to keep this information confidential.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8">4. Cookies and Tracking</h2>
            <p>
              Our website may use cookies and similar tracking technologies to enhance your experience. 
              These may include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Google Analytics for website usage analysis</li>
              <li>Conversion tracking for advertising purposes</li>
              <li>Session cookies for website functionality</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-8">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-8">6. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. 
              However, no method of transmission over the Internet is 100% secure, and we cannot 
              guarantee absolute security.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8">7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-cyan-400">
              Email: Patrickjchurch04@gmail.com
            </p>

            <h2 className="text-2xl font-bold text-white mt-8">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPage;
