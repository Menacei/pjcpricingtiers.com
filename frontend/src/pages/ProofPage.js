import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  ArrowRight,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  BarChart3,
  Zap
} from 'lucide-react';

const ProofPage = () => {
  // Case studies - Update with real data
  const caseStudies = [
    {
      title: "E-commerce Website Redesign",
      client: "Local Retail Business",
      challenge: "Outdated website with poor mobile experience and no lead capture",
      solution: "Complete redesign with AI chatbot, mobile-first approach, and automated follow-ups",
      results: [
        { metric: "Leads", value: "+150%", description: "Increase in qualified leads" },
        { metric: "Mobile Traffic", value: "+80%", description: "Improvement in mobile engagement" },
        { metric: "Response Time", value: "24/7", description: "AI chatbot availability" }
      ],
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d",
      tags: ["E-commerce", "AI Chatbot", "Lead Gen"]
    },
    {
      title: "Service Business Lead Funnel",
      client: "Professional Services Firm",
      challenge: "No online presence, relying solely on referrals",
      solution: "Built conversion-focused website with booking system and automated nurture sequences",
      results: [
        { metric: "Bookings", value: "+40%", description: "More consultation bookings" },
        { metric: "Time Saved", value: "10hrs/wk", description: "Through automation" },
        { metric: "ROI", value: "300%", description: "Return on investment" }
      ],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
      tags: ["Lead Funnel", "Automation", "Booking System"]
    }
  ];

  // Metrics - Update with real data
  const overallMetrics = [
    { label: "Projects Completed", value: "50+" },
    { label: "Average Lead Increase", value: "120%" },
    { label: "Client Satisfaction", value: "100%" },
    { label: "Response Time", value: "<24hrs" }
  ];

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-green-600/20 text-green-400 border-green-500/30">
            Proof & Results
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Real Results for Real Businesses
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Don't just take my word for it. Here's proof that my approach works.
          </p>
        </div>
      </section>

      {/* Overall Metrics */}
      <section className="py-12 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {overallMetrics.map((metric, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">{metric.value}</div>
                <div className="text-gray-400">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Case Studies</h2>
            <p className="text-gray-400">Detailed breakdowns of successful projects</p>
          </div>

          <div className="space-y-12">
            {caseStudies.map((study, idx) => (
              <Card key={idx} className="bg-slate-800/50 border-slate-700 overflow-hidden">
                <div className="grid md:grid-cols-2">
                  <div className="relative">
                    <img 
                      src={study.image} 
                      alt={study.title}
                      className="w-full h-64 md:h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      {study.tags.map((tag, i) => (
                        <Badge key={i} className="bg-cyan-600 text-white">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{study.title}</h3>
                    <p className="text-cyan-400 mb-4">{study.client}</p>
                    
                    <div className="space-y-4 mb-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Challenge</h4>
                        <p className="text-gray-300">{study.challenge}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Solution</h4>
                        <p className="text-gray-300">{study.solution}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {study.results.map((result, i) => (
                        <div key={i} className="text-center p-3 bg-slate-900/50 rounded-lg">
                          <div className="text-xl font-bold text-green-400">{result.value}</div>
                          <div className="text-xs text-gray-400">{result.metric}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-cyan-900/30 to-purple-900/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Become the Next Success Story?
          </h2>
          <p className="text-gray-300 mb-8">
            Let's discuss how I can help grow your business.
          </p>
          <Link to="/get-quote">
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
              Get Your Free Quote
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ProofPage;
