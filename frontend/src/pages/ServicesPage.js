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
  Loader2
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ServicesPage = () => {
  const [paymentLoading, setPaymentLoading] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const services = [
    {
      id: "starter",
      name: "Launch Pad",
      price: "Starting at $325",
      basePrice: "$325",
      priceNote: "Perfect for getting started",
      features: [
        "3-page professional website",
        "Mobile-responsive design",
        "Basic AI chatbot integration",
        "Contact form setup",
        "Basic SEO optimization",
        "Social media links",
        "30 days of support",
        "Perfect for solopreneurs"
      ],
      icon: <Rocket className="w-8 h-8" />,
      color: "from-emerald-400 to-teal-500"
    },
    {
      id: "growth",
      name: "Growth Engine",
      price: "Starting at $812",
      basePrice: "$812",
      priceNote: "Most popular choice",
      features: [
        "Up to 8 custom pages",
        "Advanced AI automation",
        "Lead capture system",
        "Blog integration",
        "Advanced SEO setup",
        "Email marketing integration",
        "Analytics dashboard",
        "60 days of support",
        "Monthly strategy call"
      ],
      icon: <TrendingUp className="w-8 h-8" />,
      color: "from-cyan-400 to-blue-500",
      popular: true
    },
    {
      id: "scale",
      name: "Scale & Dominate",
      price: "Starting at $1,625",
      basePrice: "$1,625",
      priceNote: "For serious growth",
      features: [
        "Up to 15 custom pages",
        "Custom AI tools & crawlers",
        "Full automation suite",
        "E-commerce integration",
        "CRM integration",
        "Performance optimization",
        "Advanced security",
        "90 days premium support",
        "Bi-weekly strategy calls"
      ],
      icon: <Target className="w-8 h-8" />,
      color: "from-purple-400 to-pink-500"
    }
  ];

  const initiatePayment = (packageId) => {
    const selected = services.find(service => service.id === packageId);
    setSelectedPackage(selected);
    setShowPaymentModal(true);
  };

  const processStripePayment = async (packageId) => {
    setPaymentLoading(`stripe-${packageId}`);
    
    try {
      const originUrl = window.location.origin;
      const requestBody = {
        package_id: packageId,
        origin_url: originUrl,
        payment_method: "stripe"
      };

      const response = await axios.post(`${API}/checkout/session`, requestBody);
      
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Stripe payment error:', error);
      alert('Failed to initiate payment. Please try again or contact me directly.');
      setPaymentLoading("");
    }
  };

  const createPayPalOrder = async (packageId) => {
    try {
      const originUrl = window.location.origin;
      const requestBody = {
        package_id: packageId,
        origin_url: originUrl
      };

      const response = await axios.post(`${API}/paypal/orders`, requestBody);
      return response.data.order_id;
    } catch (error) {
      console.error('PayPal order creation error:', error);
      throw error;
    }
  };

  const capturePayPalOrder = async (orderId) => {
    try {
      const response = await axios.post(`${API}/paypal/orders/${orderId}/capture`);
      
      if (response.data.status === "COMPLETED") {
        setPaymentStatus({
          type: 'success',
          message: 'PayPal payment successful! Thank you for your trust. I\'ll be in touch within 24 hours.'
        });
        setShowPaymentModal(false);
      }
      
      return response.data;
    } catch (error) {
      console.error('PayPal capture error:', error);
      setPaymentStatus({
        type: 'error',
        message: 'PayPal payment failed. Please try again.'
      });
      throw error;
    }
  };

  const PaymentStatusDisplay = () => {
    if (!paymentStatus) return null;

    const statusStyles = {
      success: "bg-green-500/20 border-green-500 text-green-300",
      error: "bg-red-500/20 border-red-500 text-red-300",
      pending: "bg-yellow-500/20 border-yellow-500 text-yellow-300"
    };

    return (
      <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg border ${statusStyles[paymentStatus.type]} max-w-md w-full mx-4`}>
        <div className="flex items-center space-x-2">
          {paymentStatus.type === 'pending' && <Loader2 className="w-5 h-5 animate-spin" />}
          {paymentStatus.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {paymentStatus.type === 'error' && <X className="w-5 h-5" />}
          <p className="text-sm font-medium">{paymentStatus.message}</p>
        </div>
        {paymentStatus.type !== 'pending' && (
          <button onClick={() => setPaymentStatus(null)} className="absolute top-2 right-2 text-current hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  const PaymentModal = () => {
    if (!showPaymentModal || !selectedPackage) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="bg-slate-800 border-slate-700 w-full max-w-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">Choose Payment Method</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription className="text-gray-300">
              {selectedPackage.name} - {selectedPackage.price}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              onClick={() => processStripePayment(selectedPackage.id)}
              disabled={paymentLoading === `stripe-${selectedPackage.id}`}
            >
              {paymentLoading === `stripe-${selectedPackage.id}` ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
              ) : (
                <><CreditCard className="w-4 h-4 mr-2" />Pay with Card (Stripe)</>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-800 px-2 text-gray-400">Or</span>
              </div>
            </div>

            <PayPalScriptProvider options={{ "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID || "test", currency: "USD" }}>
              <PayPalButtons
                style={{ layout: "horizontal", height: 40 }}
                createOrder={() => createPayPalOrder(selectedPackage.id)}
                onApprove={(data) => capturePayPalOrder(data.orderID)}
                onError={(err) => {
                  console.error('PayPal error:', err);
                  setPaymentStatus({ type: 'error', message: 'PayPal payment failed. Please try again.' });
                }}
              />
            </PayPalScriptProvider>

            <p className="text-xs text-center text-gray-500">
              Secure payments processed by Stripe & PayPal.
            </p>
          </CardContent>
        </Card>
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
            Web Design & AI Services
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Packages Built for Growth
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Every package includes AI integration, because in 2025, that's not optional—it's essential.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card 
                key={index} 
                className={`relative bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden ${service.popular ? 'ring-2 ring-cyan-500' : ''}`}
              >
                {service.popular && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-cyan-500 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${service.color} flex items-center justify-center text-white mb-4`}>
                    {service.icon}
                  </div>
                  <CardTitle className="text-2xl text-white">{service.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-white">{service.price}</span>
                    <p className="text-sm text-gray-400 mt-1">{service.priceNote}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-gray-300">
                        <CheckCircle className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${service.popular ? 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700' : 'bg-slate-700 hover:bg-slate-600'} text-white`}
                    onClick={() => initiatePayment(service.id)}
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-4">
              Need something custom? Let's talk about your specific needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                  Request Custom Quote
                </Button>
              </Link>
              <a href="https://pjcpricingtiers.com" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10">
                  View Full Pricing Details
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
