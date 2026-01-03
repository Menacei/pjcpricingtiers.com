import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  TrendingUp,
  Shield,
  Clock,
  Users,
  Bot,
  Globe,
  Code,
  BarChart3,
  Phone,
  Calendar
} from 'lucide-react';

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Benefits (outcomes, not features)
  const benefits = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "More Leads, Less Work",
      description: "AI-powered systems that capture and nurture leads automatically while you focus on your business."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Launch Fast, Iterate Faster",
      description: "Get your website live in days, not months. Quick turnaround without sacrificing quality."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Track What Matters",
      description: "Built-in analytics and conversion tracking so you know exactly what's working."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Built for Growth",
      description: "Scalable solutions that grow with your business. No rebuilding needed later."
    }
  ];

  // Trust metrics (placeholders - update with real data)
  const trustMetrics = [
    { value: "50+", label: "Projects Delivered" },
    { value: "24hr", label: "Response Time" },
    { value: "100%", label: "Satisfaction Rate" },
    { value: "5.0", label: "Average Rating" }
  ];

  // Testimonials (placeholders - update with real testimonials)
  const testimonials = [
    {
      quote: "Pat delivered exactly what we needed. Our new website generates 3x more leads than before.",
      author: "Coming Soon",
      business: "Your Business Here",
      result: "3x More Leads"
    }
  ];

  return (
    <div className="pt-16">
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <Badge className="mb-6 bg-cyan-600/20 text-cyan-400 border-cyan-500/30">
                Kansas City's AI-Powered Web Design
              </Badge>
              
              {/* Clear Headline - Outcome Focused */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                Websites That
                <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Actually Make Money
                </span>
              </h1>
              
              {/* Sub-headline - Who it's for */}
              <p className="text-lg sm:text-xl text-gray-300 mb-8">
                I help <span className="text-cyan-400 font-semibold">small business owners</span> get 
                more leads and sales with AI-powered websites that work 24/7—even while you sleep.
              </p>

              {/* Benefit Bullets */}
              <ul className="space-y-3 mb-8">
                {[
                  "Convert visitors into leads with smart AI chatbots",
                  "Automate follow-ups and save hours every week",
                  "Track everything with built-in analytics",
                  "Mobile-first design that looks great everywhere",
                  "SEO optimized to get found on Google"
                ].map((benefit, idx) => (
                  <li key={idx} className="flex items-center text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/get-quote">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-6 text-lg">
                    Get a Free Quote
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <a href="https://calendly.com/patrickjchurch04/15-minute-consultation" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 px-8 py-6 text-lg">
                    <Calendar className="mr-2 w-5 h-5" />
                    Book a Call
                  </Button>
                </a>
              </div>
            </div>

            {/* Right: Trust Section / Visual */}
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <Card className="bg-slate-800/50 border-slate-700 p-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">Why Business Owners Trust Me</h3>
                  <p className="text-gray-400">Real results, transparent pricing, no BS</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {trustMetrics.map((metric, idx) => (
                    <div key={idx} className="text-center p-4 bg-slate-900/50 rounded-lg">
                      <div className="text-2xl font-bold text-cyan-400">{metric.value}</div>
                      <div className="text-sm text-gray-400">{metric.label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center space-x-1 mb-4">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-center text-gray-400 text-sm">
                  "Pat delivered exactly what we needed. Highly recommend!"
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-600/20 text-purple-400 border-purple-500/30">
              What You Get
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Websites Built for Results
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Not just pretty designs—systems that actually grow your business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => (
              <Card key={idx} className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-cyan-400 mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-cyan-600/20 text-cyan-400 border-cyan-500/30">
              Services
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How I Can Help
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="w-8 h-8" />,
                title: "Website Design",
                description: "Conversion-focused websites that turn visitors into customers",
                price: "From $325",
                color: "from-cyan-400 to-blue-500"
              },
              {
                icon: <Bot className="w-8 h-8" />,
                title: "AI & Automation",
                description: "Chatbots, lead capture, and automated follow-ups",
                price: "Included",
                color: "from-purple-400 to-pink-500"
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Growth Systems",
                description: "SEO, analytics, and marketing automation",
                price: "Custom",
                color: "from-green-400 to-emerald-500"
              }
            ].map((service, idx) => (
              <Card key={idx} className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${service.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-gray-400 mb-4">{service.description}</p>
                  <Badge className="bg-slate-700 text-gray-300">{service.price}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/services">
              <Button variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                View All Services
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-gradient-to-r from-cyan-900/30 to-purple-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Grow Your Business?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Get a free, no-obligation quote for your project. I'll personally review your needs 
            and send you a detailed proposal within 24 hours.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/get-quote">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-6 text-lg">
                Get a Free Quote
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <a href="https://calendly.com/patrickjchurch04/15-minute-consultation" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 px-8 py-6 text-lg">
                <Phone className="mr-2 w-5 h-5" />
                Book a Call
              </Button>
            </a>
          </div>

          <p className="mt-6 text-gray-500 text-sm">
            No obligation • Response within 24 hours • 100% free consultation
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
