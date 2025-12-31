import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { CheckCircle, ArrowRight, Shield, Clock, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LeadFormPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    business_type: '',
    biggest_problem: '',
    budget_range: ''
  });

  // Capture UTM parameters
  const utmParams = {
    utm_source: searchParams.get('utm_source') || '',
    utm_medium: searchParams.get('utm_medium') || '',
    utm_campaign: searchParams.get('utm_campaign') || '',
    referrer: document.referrer || '',
    landing_page: window.location.pathname
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Determine lead source from UTM
      let lead_source = 'organic';
      if (utmParams.utm_source) {
        if (utmParams.utm_medium === 'cpc' || utmParams.utm_medium === 'ppc') {
          lead_source = 'paid';
        } else if (utmParams.utm_source.includes('facebook') || utmParams.utm_source.includes('instagram')) {
          lead_source = 'social';
        } else if (utmParams.utm_source === 'referral') {
          lead_source = 'referral';
        }
      }

      const response = await axios.post(`${API}/leads`, {
        ...formData,
        lead_source,
        ...utmParams
      });

      if (response.data.success) {
        // Track conversion
        if (window.gtag) {
          window.gtag('event', 'generate_lead', {
            event_category: 'Lead',
            event_label: formData.budget_range
          });
        }
        if (window.fbq) {
          window.fbq('track', 'Lead');
        }
        
        navigate('/thank-you', { state: { leadId: response.data.lead_id, name: formData.full_name } });
      }
    } catch (error) {
      console.error('Lead submission error:', error);
      alert('Sorry, there was an error. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const businessTypes = [
    { value: 'local_business', label: 'Local Business' },
    { value: 'ecommerce', label: 'E-commerce / Online Store' },
    { value: 'service_provider', label: 'Service Provider' },
    { value: 'startup', label: 'Startup' },
    { value: 'agency', label: 'Agency / Consultant' },
    { value: 'nonprofit', label: 'Non-Profit' },
    { value: 'other', label: 'Other' }
  ];

  const budgetRanges = [
    { value: 'under_500', label: 'Under $500' },
    { value: '500_1000', label: '$500 - $1,000' },
    { value: '1000_2500', label: '$1,000 - $2,500' },
    { value: '2500_5000', label: '$2,500 - $5,000' },
    { value: '5000_10000', label: '$5,000 - $10,000' },
    { value: 'over_10000', label: '$10,000+' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-cyan-600/20 text-cyan-400 border-cyan-500/30">
            Free Quote Request
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Let's Build Something Amazing
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Tell me about your project and I'll send you a custom quote within 24 hours.
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div className="flex items-center text-gray-400">
            <Shield className="w-5 h-5 mr-2 text-green-400" />
            <span className="text-sm">100% Free, No Obligation</span>
          </div>
          <div className="flex items-center text-gray-400">
            <Clock className="w-5 h-5 mr-2 text-cyan-400" />
            <span className="text-sm">Response Within 24 Hours</span>
          </div>
          <div className="flex items-center text-gray-400">
            <CheckCircle className="w-5 h-5 mr-2 text-purple-400" />
            <span className="text-sm">No Spam, Ever</span>
          </div>
        </div>

        {/* Form Card */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-center">Request Your Free Quote</CardTitle>
            <CardDescription className="text-center text-gray-400">
              Fill out the form below and I'll personally review your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Name & Email */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                  <Input
                    placeholder="John Smith"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                  <Input
                    type="email"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Phone & Business Type */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Business Type *</label>
                  <Select value={formData.business_type} onValueChange={(value) => setFormData({...formData, business_type: value})} required>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select your business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Budget Range *</label>
                <Select value={formData.budget_range} onValueChange={(value) => setFormData({...formData, budget_range: value})} required>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select your budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Biggest Problem */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">What's Your Biggest Challenge? *</label>
                <Textarea
                  placeholder="Tell me about the problem you're trying to solve or the goal you want to achieve..."
                  value={formData.biggest_problem}
                  onChange={(e) => setFormData({...formData, biggest_problem: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-500 min-h-[100px]"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white py-6 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Submitting...</>
                ) : (
                  <>Get My Free Quote <ArrowRight className="ml-2 w-5 h-5" /></>
                )}
              </Button>

              <p className="text-xs text-center text-gray-500">
                By submitting, you agree to receive communications from Pat Church. 
                Your information is secure and will never be shared.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeadFormPage;
