import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { CheckCircle, Calendar, Mail, Phone, ArrowRight, Clock } from 'lucide-react';

const ThankYouPage = () => {
  const location = useLocation();
  const { name } = location.state || { name: '' };

  useEffect(() => {
    // Track conversion on page load
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL' // Replace with actual
      });
    }
    if (window.fbq) {
      window.fbq('track', 'CompleteRegistration');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900/20 to-slate-900 pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          
          <Badge className="mb-4 bg-green-600/20 text-green-400 border-green-500/30">
            Request Received!
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Thank You{name ? `, ${name.split(' ')[0]}` : ''}!
          </h1>
          
          <p className="text-lg text-gray-300 max-w-xl mx-auto">
            Your quote request has been received. I'll personally review your project and 
            send you a detailed proposal within <span className="text-green-400 font-semibold">24 hours</span>.
          </p>
        </div>

        {/* What's Next */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardContent className="p-8">
            <h2 className="text-xl font-bold text-white mb-6 text-center">What Happens Next?</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-cyan-400 font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Check Your Email</h3>
                  <p className="text-gray-400">You'll receive a confirmation email shortly with more details.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400 font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">I Review Your Project</h3>
                  <p className="text-gray-400">I'll analyze your requirements and prepare a custom proposal.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-400 font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Receive Your Quote</h3>
                  <p className="text-gray-400">Within 24 hours, you'll get a detailed quote with pricing and timeline.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Book a Call CTA */}
        <Card className="bg-gradient-to-r from-cyan-900/50 to-purple-900/50 border-cyan-500/30 mb-8">
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">Want to Talk Sooner?</h2>
            <p className="text-gray-300 mb-6">
              Skip the wait and book a free 15-minute discovery call with me.
            </p>
            <a href="https://calendly.com/patrickjchurch" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
                <Calendar className="mr-2 w-5 h-5" />
                Book a Free Call
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="text-center">
          <p className="text-gray-400 mb-4">Need immediate assistance?</p>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="mailto:Patrickjchurch04@gmail.com" className="flex items-center text-cyan-400 hover:text-cyan-300">
              <Mail className="w-5 h-5 mr-2" />
              Patrickjchurch04@gmail.com
            </a>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link to="/">
            <Button variant="outline" className="border-slate-600 text-gray-400 hover:text-white">
              Back to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
