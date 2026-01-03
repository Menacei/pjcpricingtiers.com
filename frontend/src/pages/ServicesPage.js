import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Rocket,
  TrendingUp,
  Target,
  CheckCircle,
  ArrowRight,
  X,
  CreditCard,
  Loader2,
  Palette,
  Globe,
  ShoppingCart,
  Building2,
  Utensils,
  Dumbbell,
  Scissors,
  Wrench,
  Briefcase,
  Heart,
  GraduationCap,
  Car
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ServicesPage = () => {
  const [paymentLoading, setPaymentLoading] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [activeTab, setActiveTab] = useState('web');

  // Web Design Packages
  const webDesignPackages = [
    {
      id: "starter",
      name: "Launch Pad",
      price: "$325",
      priceNote: "One-time payment",
      description: "Perfect for solopreneurs and small startups",
      features: [
        "3-page professional website",
        "Mobile-responsive design",
        "Basic AI chatbot integration",
        "Contact form setup",
        "Basic SEO optimization",
        "Social media links",
        "Google Analytics setup",
        "30 days of support"
      ],
      idealFor: ["Freelancers", "Consultants", "Personal Brands", "Side Hustles"],
      icon: <Rocket className="w-8 h-8" />,
      color: "from-emerald-400 to-teal-500"
    },
    {
      id: "growth",
      name: "Growth Engine",
      price: "$812",
      priceNote: "One-time payment",
      description: "Most popular - for growing businesses",
      features: [
        "Up to 8 custom pages",
        "Advanced AI chatbot with training",
        "Lead capture & CRM integration",
        "Blog with CMS",
        "Advanced SEO optimization",
        "Email marketing integration",
        "Analytics dashboard",
        "Speed optimization",
        "60 days of support",
        "Monthly strategy call"
      ],
      idealFor: ["Small Businesses", "Agencies", "Service Providers", "Coaches"],
      icon: <TrendingUp className="w-8 h-8" />,
      color: "from-cyan-400 to-blue-500",
      popular: true
    },
    {
      id: "scale",
      name: "Scale & Dominate",
      price: "$1,625",
      priceNote: "One-time payment",
      description: "Full solution for established businesses",
      features: [
        "Up to 15 custom pages",
        "Custom AI tools & automation",
        "Full e-commerce integration",
        "Advanced CRM & pipeline",
        "Multi-language support",
        "Performance optimization",
        "Advanced security & SSL",
        "Custom API integrations",
        "90 days premium support",
        "Bi-weekly strategy calls"
      ],
      idealFor: ["Established Businesses", "E-commerce", "Multi-location", "Franchises"],
      icon: <Target className="w-8 h-8" />,
      color: "from-purple-400 to-pink-500"
    },
    {
      id: "enterprise",
      name: "Enterprise Custom",
      price: "$3,000+",
      priceNote: "Custom quote",
      description: "Fully custom solutions for large organizations",
      features: [
        "Unlimited pages & features",
        "Custom web applications",
        "Enterprise AI solutions",
        "Multi-site management",
        "Dedicated project manager",
        "24/7 priority support",
        "Custom integrations",
        "Training & documentation",
        "Ongoing maintenance",
        "SLA guarantee"
      ],
      idealFor: ["Corporations", "Healthcare", "Finance", "Government"],
      icon: <Building2 className="w-8 h-8" />,
      color: "from-orange-400 to-red-500"
    }
  ];

  // Graphic Design Packages
  const graphicDesignPackages = [
    {
      id: "logo_basic",
      name: "Logo Starter",
      price: "$150",
      priceNote: "3 concepts included",
      description: "Professional logo for new businesses",
      features: [
        "3 initial logo concepts",
        "2 revision rounds",
        "Final files (PNG, JPG, SVG)",
        "Black & white versions",
        "Social media sizes",
        "Basic brand color palette",
        "5-day delivery"
      ],
      idealFor: ["Startups", "Side Projects", "Personal Brands"],
      icon: <Palette className="w-6 h-6" />,
      color: "from-pink-400 to-rose-500"
    },
    {
      id: "logo_premium",
      name: "Logo Premium",
      price: "$350",
      priceNote: "5 concepts + brand guide",
      description: "Complete logo with brand guidelines",
      features: [
        "5 initial logo concepts",
        "Unlimited revisions",
        "All file formats",
        "Full color variations",
        "Mini brand style guide",
        "Business card design",
        "Social media kit",
        "Letterhead template",
        "3-day rush available"
      ],
      idealFor: ["Growing Businesses", "Rebranding", "Professional Services"],
      icon: <Palette className="w-6 h-6" />,
      color: "from-violet-400 to-purple-500",
      popular: true
    },
    {
      id: "brand_identity",
      name: "Full Brand Identity",
      price: "$750",
      priceNote: "Complete branding package",
      description: "Everything you need to launch your brand",
      features: [
        "Logo design (unlimited concepts)",
        "Complete brand style guide",
        "Color palette & typography",
        "Business card & letterhead",
        "Email signature design",
        "Social media templates",
        "Presentation template",
        "Brand asset library",
        "Marketing collateral templates"
      ],
      idealFor: ["New Companies", "Rebrands", "Franchises"],
      icon: <Briefcase className="w-6 h-6" />,
      color: "from-amber-400 to-orange-500"
    },
    {
      id: "marketing_design",
      name: "Marketing Design Pack",
      price: "$500",
      priceNote: "Per campaign",
      description: "Complete marketing visual assets",
      features: [
        "Social media graphics (10 posts)",
        "Facebook/Instagram ads (5 sets)",
        "Email header designs",
        "Banner ads (5 sizes)",
        "Flyer or brochure design",
        "Promotional graphics",
        "Story templates",
        "Highlight covers"
      ],
      idealFor: ["Marketing Campaigns", "Product Launches", "Events"],
      icon: <TrendingUp className="w-6 h-6" />,
      color: "from-cyan-400 to-teal-500"
    }
  ];

  // Industry-specific pricing
  const industryPricing = [
    {
      industry: "Restaurants & Food",
      icon: <Utensils className="w-6 h-6" />,
      packages: [
        { name: "Menu Website", price: "$425", features: ["Online menu", "Location & hours", "Reservation system", "Photo gallery"] },
        { name: "Full Restaurant Site", price: "$950", features: ["Online ordering", "Multiple locations", "Catering page", "Events booking"] },
        { name: "Logo + Branding", price: "$400", features: ["Restaurant logo", "Menu design", "Signage ready files"] }
      ]
    },
    {
      industry: "Fitness & Wellness",
      icon: <Dumbbell className="w-6 h-6" />,
      packages: [
        { name: "Trainer Website", price: "$375", features: ["Service showcase", "Booking system", "Testimonials", "Class schedule"] },
        { name: "Gym/Studio Site", price: "$1,100", features: ["Membership portal", "Class booking", "Trainer profiles", "E-commerce"] },
        { name: "Fitness Branding", price: "$450", features: ["Dynamic logo", "Social templates", "Merchandise ready"] }
      ]
    },
    {
      industry: "Beauty & Salons",
      icon: <Scissors className="w-6 h-6" />,
      packages: [
        { name: "Salon Website", price: "$450", features: ["Service menu", "Online booking", "Gallery", "Team profiles"] },
        { name: "Spa Experience", price: "$875", features: ["Gift cards", "Package deals", "Loyalty program", "Blog"] },
        { name: "Beauty Branding", price: "$375", features: ["Elegant logo", "Appointment cards", "Social kit"] }
      ]
    },
    {
      industry: "Construction & Trades",
      icon: <Wrench className="w-6 h-6" />,
      packages: [
        { name: "Contractor Site", price: "$425", features: ["Service areas", "Project gallery", "Quote forms", "Certifications"] },
        { name: "Full Business Site", price: "$975", features: ["Job portal", "Client portal", "Project tracking", "Multi-service"] },
        { name: "Trade Branding", price: "$350", features: ["Bold logo", "Truck wrap ready", "Uniform design"] }
      ]
    },
    {
      industry: "Real Estate",
      icon: <Building2 className="w-6 h-6" />,
      packages: [
        { name: "Agent Website", price: "$550", features: ["Listing integration", "Search filters", "Virtual tours", "Lead capture"] },
        { name: "Agency Platform", price: "$1,500", features: ["MLS integration", "Agent profiles", "CRM system", "Market reports"] },
        { name: "Real Estate Brand", price: "$500", features: ["Premium logo", "Yard signs", "Business cards"] }
      ]
    },
    {
      industry: "Healthcare & Medical",
      icon: <Heart className="w-6 h-6" />,
      packages: [
        { name: "Practice Website", price: "$650", features: ["HIPAA considerations", "Appointment booking", "Patient portal", "Service info"] },
        { name: "Medical Center", price: "$1,800", features: ["Multi-provider", "Insurance info", "Patient forms", "Telehealth ready"] },
        { name: "Medical Branding", price: "$550", features: ["Professional logo", "Letterhead", "Patient materials"] }
      ]
    },
    {
      industry: "Education & Coaching",
      icon: <GraduationCap className="w-6 h-6" />,
      packages: [
        { name: "Coach Website", price: "$475", features: ["Program showcase", "Booking system", "Testimonials", "Resources"] },
        { name: "Course Platform", price: "$1,200", features: ["Course hosting", "Payment system", "Student portal", "Certificates"] },
        { name: "Education Brand", price: "$400", features: ["Inspiring logo", "Course materials", "Social presence"] }
      ]
    },
    {
      industry: "Automotive",
      icon: <Car className="w-6 h-6" />,
      packages: [
        { name: "Shop Website", price: "$450", features: ["Service menu", "Appointment booking", "Reviews", "Specials"] },
        { name: "Dealership Site", price: "$1,400", features: ["Inventory system", "Financing calculator", "Trade-in forms", "Multi-location"] },
        { name: "Auto Branding", price: "$425", features: ["Powerful logo", "Signage", "Uniforms"] }
      ]
    }
  ];

  const initiatePayment = (packageId) => {
    const allPackages = [...webDesignPackages, ...graphicDesignPackages];
    const selected = allPackages.find(pkg => pkg.id === packageId);
    setSelectedPackage(selected);
    setShowPaymentModal(true);
  };

  const processStripePayment = async (packageId) => {
    setPaymentLoading(`stripe-${packageId}`);
    
    try {
      const origin = window.location.origin;
      const response = await axios.post(`${API}/checkout/session`, {
        package_id: packageId,
        origin_url: origin,
        payment_method: "stripe"
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Stripe payment error:', error);
      alert('Failed to initiate payment. Please try again or contact me directly.');
      setPaymentLoading("");
    }
  };

  const createPayPalOrder = async (packageId) => {
    try {
      const origin = window.location.origin;
      const response = await axios.post(`${API}/paypal/orders`, {
        package_id: packageId,
        origin_url: origin
      });
      return response.data.order_id;
    } catch (error) {
      console.error('PayPal order error:', error);
      throw error;
    }
  };

  const onPayPalApprove = async (data) => {
    try {
      const response = await axios.post(`${API}/paypal/orders/${data.orderID}/capture`);
      if (response.data.status === 'COMPLETED') {
        setPaymentStatus({
          type: 'success',
          message: 'Payment successful! Thank you. I\'ll be in touch within 24 hours.'
        });
        setShowPaymentModal(false);
      }
    } catch (error) {
      console.error('PayPal capture error:', error);
      setPaymentStatus({
        type: 'error',
        message: 'Payment failed. Please try again.'
      });
    }
  };

  const PaymentStatusDisplay = () => {
    if (!paymentStatus) return null;

    const statusStyles = {
      success: "bg-green-500/20 border-green-500 text-green-400",
      error: "bg-red-500/20 border-red-500 text-red-400",
      pending: "bg-yellow-500/20 border-yellow-500 text-yellow-300"
    };

    return (
      <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg border ${statusStyles[paymentStatus.type]} max-w-md w-full mx-4`}>
        <div className="flex items-center justify-between">
          {paymentStatus.type === 'pending' && <Loader2 className="w-5 h-5 animate-spin" />}
          <span>{paymentStatus.message}</span>
          <button onClick={() => setPaymentStatus(null)} className="ml-4">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const PaymentModal = () => {
    if (!showPaymentModal || !selectedPackage) return null;

    const priceValue = parseInt(selectedPackage.price.replace(/[$,+]/g, '')) || 325;

    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 border border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Complete Payment</h3>
            <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6 p-4 bg-slate-900 rounded-lg">
            <p className="text-gray-400">Package</p>
            <p className="text-xl font-bold text-white">{selectedPackage.name}</p>
            <p className="text-2xl font-bold text-cyan-400 mt-2">{selectedPackage.price}</p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => processStripePayment(selectedPackage.id)}
              disabled={paymentLoading === `stripe-${selectedPackage.id}`}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            >
              {paymentLoading === `stripe-${selectedPackage.id}` ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <CreditCard className="w-5 h-5 mr-2" />
              )}
              Pay with Card (Stripe)
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-gray-400">or</span>
              </div>
            </div>

            <PayPalScriptProvider options={{ 
              "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
              currency: "USD"
            }}>
              <PayPalButtons
                style={{ layout: "vertical", color: "blue", shape: "rect", label: "paypal" }}
                createOrder={() => createPayPalOrder(selectedPackage.id)}
                onApprove={onPayPalApprove}
                onError={(err) => {
                  console.error('PayPal error:', err);
                  setPaymentStatus({ type: 'error', message: 'PayPal payment failed.' });
                }}
              />
            </PayPalScriptProvider>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pt-16">
      <PaymentStatusDisplay />
      <PaymentModal />

      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-cyan-600/20 text-cyan-400 border-cyan-500/30">
            Services & Pricing
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Transparent Pricing for Every Business
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            From startups to enterprises, I have packages designed for your specific needs and budget.
            No hidden fees. No surprises.
          </p>
          
          {/* Service Type Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            <Button
              onClick={() => setActiveTab('web')}
              className={activeTab === 'web' 
                ? 'bg-cyan-600 text-white' 
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}
            >
              <Globe className="w-4 h-4 mr-2" />
              Web Design
            </Button>
            <Button
              onClick={() => setActiveTab('graphic')}
              className={activeTab === 'graphic' 
                ? 'bg-cyan-600 text-white' 
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}
            >
              <Palette className="w-4 h-4 mr-2" />
              Graphic Design
            </Button>
            <Button
              onClick={() => setActiveTab('industry')}
              className={activeTab === 'industry' 
                ? 'bg-cyan-600 text-white' 
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}
            >
              <Building2 className="w-4 h-4 mr-2" />
              By Industry
            </Button>
          </div>
        </div>
      </section>

      {/* Web Design Packages */}
      {activeTab === 'web' && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Web Design Packages</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {webDesignPackages.map((pkg) => (
                <Card key={pkg.id} className={`relative bg-slate-800/50 border-slate-700 overflow-hidden ${pkg.popular ? 'ring-2 ring-cyan-500' : ''}`}>
                  {pkg.popular && (
                    <div className="absolute top-0 right-0 bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      MOST POPULAR
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${pkg.color} flex items-center justify-center text-white mb-4`}>
                      {pkg.icon}
                    </div>
                    <CardTitle className="text-white text-xl">{pkg.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-white">{pkg.price}</span>
                      <span className="text-gray-400 text-sm ml-2">{pkg.priceNote}</span>
                    </div>
                    <CardDescription className="text-gray-400 mt-2">{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-gray-300 text-sm">
                          <CheckCircle className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Ideal for:</p>
                      <div className="flex flex-wrap gap-1">
                        {pkg.idealFor.map((item, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs text-gray-400 border-gray-600">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      onClick={() => initiatePayment(pkg.id)}
                      className={`w-full bg-gradient-to-r ${pkg.color} hover:opacity-90`}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Graphic Design Packages */}
      {activeTab === 'graphic' && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Graphic Design Packages</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {graphicDesignPackages.map((pkg) => (
                <Card key={pkg.id} className={`relative bg-slate-800/50 border-slate-700 overflow-hidden ${pkg.popular ? 'ring-2 ring-purple-500' : ''}`}>
                  {pkg.popular && (
                    <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      BEST VALUE
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${pkg.color} flex items-center justify-center text-white mb-4`}>
                      {pkg.icon}
                    </div>
                    <CardTitle className="text-white text-xl">{pkg.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-white">{pkg.price}</span>
                      <span className="text-gray-400 text-sm ml-2">{pkg.priceNote}</span>
                    </div>
                    <CardDescription className="text-gray-400 mt-2">{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-gray-300 text-sm">
                          <CheckCircle className="w-4 h-4 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Ideal for:</p>
                      <div className="flex flex-wrap gap-1">
                        {pkg.idealFor.map((item, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs text-gray-400 border-gray-600">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      onClick={() => initiatePayment(pkg.id)}
                      className={`w-full bg-gradient-to-r ${pkg.color} hover:opacity-90`}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Industry-Specific Pricing */}
      {activeTab === 'industry' && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white text-center mb-4">Industry-Specific Solutions</h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              Tailored packages for your industry with features that matter most to your customers.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {industryPricing.map((industry, idx) => (
                <Card key={idx} className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                        {industry.icon}
                      </div>
                      <CardTitle className="text-white text-lg">{industry.industry}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {industry.packages.map((pkg, pkgIdx) => (
                      <div key={pkgIdx} className="p-3 bg-slate-900/50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-white text-sm">{pkg.name}</span>
                          <span className="text-cyan-400 font-bold">{pkg.price}</span>
                        </div>
                        <ul className="space-y-1">
                          {pkg.features.map((feature, fIdx) => (
                            <li key={fIdx} className="text-xs text-gray-400 flex items-center">
                              <CheckCircle className="w-3 h-3 text-cyan-400 mr-1" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <Link to="/get-quote">
                      <Button variant="outline" className="w-full border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                        Get Custom Quote
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-slate-800/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Not Sure Which Package?</h2>
          <p className="text-gray-400 mb-8">
            Let's discuss your project and find the perfect solution for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/get-quote">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
                Get Free Quote
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <a href="https://pjcpricingtiers.com" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                View Full Pricing Details
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-12 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-cyan-400">50+</div>
              <div className="text-gray-400">Projects Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-400">100%</div>
              <div className="text-gray-400">Client Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-400">24hr</div>
              <div className="text-gray-400">Response Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-400">30+</div>
              <div className="text-gray-400">Industries Served</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
