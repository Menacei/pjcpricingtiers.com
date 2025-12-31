import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import axios from 'axios';
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  ArrowRight,
  Send,
  Phone,
  Mail,
  DollarSign,
  Home,
  Building,
  Route,
  X,
  CreditCard,
  Loader2,
  Globe,
  ExternalLink
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const NewReachTransportPage = () => {
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    email: '',
    phone: '',
    service_type: '',
    from_location: '',
    to_location: '',
    move_date: '',
    details: ''
  });

  // Payment state
  const [paymentLoading, setPaymentLoading] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/contact`, {
        name: quoteForm.name,
        email: quoteForm.email,
        phone: quoteForm.phone,
        service: `NewReach Transport - ${quoteForm.service_type}`,
        message: `Service: ${quoteForm.service_type}\nFrom: ${quoteForm.from_location}\nTo: ${quoteForm.to_location}\nDate: ${quoteForm.move_date}\nDetails: ${quoteForm.details}`
      });
      alert("Quote request received! I'll get back to you within 24 hours with a detailed estimate.");
      setQuoteForm({
        name: '', email: '', phone: '', service_type: '',
        from_location: '', to_location: '', move_date: '', details: ''
      });
    } catch (error) {
      console.error("Quote form error:", error);
      alert("Sorry, there was an error. Please call or text me directly.");
    }
  };

  // Payment functions
  const initiatePayment = (pkg) => {
    setSelectedPackage(pkg);
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
          message: 'Payment successful! I\'ll contact you within 24 hours to schedule your service.'
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

  // Moving tiers with payment integration
  const movingTiers = [
    {
      id: "move_local_basic",
      name: "Local Move - Basic",
      price: "$99/hour",
      depositPrice: "$99",
      priceNote: "2-hour minimum • KC Metro Area",
      avgComparison: "KC Average: $130-180/hr",
      description: "Perfect for apartment moves and small homes within Kansas City",
      features: [
        "2 professional movers",
        "26ft box truck included",
        "Basic loading/unloading",
        "Furniture blankets provided",
        "Within 25 miles of KC"
      ],
      icon: <Home className="w-8 h-8" />,
      color: "from-green-400 to-emerald-500",
      savings: "Save ~$30-80/hr vs average"
    },
    {
      id: "move_local_full",
      name: "Local Move - Full Service",
      price: "$149/hour",
      depositPrice: "$149",
      priceNote: "2-hour minimum • KC Metro Area",
      avgComparison: "KC Average: $195-270/hr",
      description: "Complete moving solution for larger homes and offices",
      features: [
        "3 professional movers",
        "26ft box truck included",
        "Furniture disassembly/reassembly",
        "Premium padding & protection",
        "Appliance handling",
        "Within 50 miles of KC"
      ],
      icon: <Building className="w-8 h-8" />,
      color: "from-cyan-400 to-blue-500",
      popular: true,
      savings: "Save ~$50-120/hr vs average"
    },
    {
      id: "move_long_distance",
      name: "Long Distance Move",
      price: "From $0.45/lb",
      depositPrice: "$500",
      priceNote: "Based on weight & distance",
      avgComparison: "Industry Average: $0.50-0.80/lb",
      description: "Interstate and cross-country moves at competitive rates",
      features: [
        "Full-service packing available",
        "Dedicated truck for your items",
        "Real-time tracking",
        "Delivery window guarantee",
        "Storage options available",
        "All 48 continental states"
      ],
      icon: <Route className="w-8 h-8" />,
      color: "from-purple-400 to-pink-500",
      savings: "Save up to 40% vs national movers"
    }
  ];

  // Box truck services
  const boxTruckServices = [
    {
      id: "box_truck_local",
      title: "Local Box Truck Jobs",
      rate: "$1.90 - $2.60/mile",
      depositPrice: "$150",
      description: "Competitive rates for local deliveries and hauls in the Kansas City metro area.",
      features: ["Same-day availability", "Professional handling", "Flexible scheduling", "Insured loads"]
    },
    {
      id: "box_truck_regional",
      title: "Regional Hauls",
      rate: "$1.90 - $2.60/mile",
      depositPrice: "$250",
      description: "Box truck services throughout Missouri, Kansas, and surrounding states.",
      features: ["Route optimization", "Reliable delivery windows", "Load tracking", "Competitive pricing"]
    }
  ];

  // Payment Status Display
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

  // Payment Modal
  const PaymentModal = () => {
    if (!showPaymentModal || !selectedPackage) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="bg-slate-800 border-slate-700 w-full max-w-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">Book Your Service</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription className="text-gray-300">
              {selectedPackage.name || selectedPackage.title} - {selectedPackage.depositPrice} deposit
            </CardDescription>
            <p className="text-xs text-gray-400 mt-2">
              This is a booking deposit. Final price will be calculated based on actual service.
            </p>
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
                  setPaymentStatus({ type: 'error', message: 'PayPal payment failed. Please try again or use card.' });
                }}
              />
            </PayPalScriptProvider>

            <p className="text-xs text-center text-gray-500">
              Secure payments via Stripe & PayPal. Your deposit is applied to your final bill.
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

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-slate-900 via-orange-900/20 to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-orange-600/20 text-orange-400 border-orange-500/30">
            <Truck className="w-3 h-3 mr-1" />
            NewReach Transport LLC
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            Box Truck Services &
            <span className="block bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Affordable Moving
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Professional box truck services and moving solutions in Kansas City, MO. 
            <span className="text-orange-400 font-semibold"> Less than average prices, more than average care.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#quote">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-6 text-lg">
                Get Free Quote
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
            <a href="tel:+18163668960">
              <Button size="lg" variant="outline" className="border-orange-500 text-orange-400 hover:bg-orange-500/10 px-8 py-6 text-lg">
                <Phone className="mr-2 w-5 h-5" />
                (816) 366-8960
              </Button>
            </a>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <a href="https://www.newreachtransport.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-400 hover:text-orange-400 transition-colors">
              <Globe className="w-4 h-4 mr-2" />
              newreachtransport.com
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
            <a href="https://usdirectory.com/NewReach-Transport-Kansas-City-MO" target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-400 hover:text-orange-400 transition-colors">
              <ExternalLink className="w-4 h-4 mr-2" />
              US Directory
            </a>
          </div>
        </div>
      </section>

      {/* Box Truck Services */}
      <section className="py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-600/20 text-orange-400 border-orange-500/30">
              Box Truck Services
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Reliable Box Truck Jobs
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Competitive per-mile rates for all your hauling needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {boxTruckServices.map((service, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-orange-500/50 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Truck className="w-10 h-10 text-orange-400" />
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-lg px-4 py-1">
                      {service.rate}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-white">{service.title}</CardTitle>
                  <p className="text-gray-400 mt-2">{service.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-300">
                        <CheckCircle className="w-4 h-4 text-orange-400 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                    onClick={() => initiatePayment(service)}
                  >
                    Book Now ({service.depositPrice} deposit)
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Moving Services Tiers */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-cyan-600/20 text-cyan-400 border-cyan-500/30">
              Moving Services
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Kansas City Moving Made Affordable
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Professional moving services at prices below the Kansas City average. 
              Same quality, better value.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {movingTiers.map((tier, index) => (
              <Card 
                key={index} 
                className={`relative bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden ${tier.popular ? 'ring-2 ring-cyan-500' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-cyan-500 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${tier.color} flex items-center justify-center text-white mb-4`}>
                    {tier.icon}
                  </div>
                  <CardTitle className="text-xl text-white">{tier.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-white">{tier.price}</span>
                    <p className="text-sm text-gray-400 mt-1">{tier.priceNote}</p>
                    <p className="text-xs text-gray-500 mt-1">{tier.avgComparison}</p>
                  </div>
                  {tier.savings && (
                    <Badge className="mt-3 bg-green-500/20 text-green-400 border-green-500/30">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {tier.savings}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-4">{tier.description}</p>
                  <ul className="space-y-2 mb-6">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-gray-300 text-sm">
                        <CheckCircle className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${tier.popular ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700' : 'bg-slate-700 hover:bg-slate-600'} text-white`}
                    onClick={() => initiatePayment(tier)}
                  >
                    Book Now ({tier.depositPrice} deposit)
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-4">
              Deposits are applied to your final bill. Get a free quote for exact pricing.
            </p>
            <a href="#quote">
              <Button variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                Get Free Quote Instead
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Quote Form */}
      <section id="quote" className="py-20 bg-slate-800/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-orange-600/20 text-orange-400 border-orange-500/30">
              Free Quote
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Get Your Free Estimate
            </h2>
            <p className="text-lg text-gray-400">
              Tell me about your move or haul and I'll get back to you within 24 hours.
            </p>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-8">
              <form onSubmit={handleQuoteSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    placeholder="Your Name"
                    value={quoteForm.name}
                    onChange={(e) => setQuoteForm({...quoteForm, name: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={quoteForm.email}
                    onChange={(e) => setQuoteForm({...quoteForm, email: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    placeholder="Phone Number"
                    value={quoteForm.phone}
                    onChange={(e) => setQuoteForm({...quoteForm, phone: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                    required
                  />
                  <Select value={quoteForm.service_type} onValueChange={(value) => setQuoteForm({...quoteForm, service_type: value})}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Service Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="box-truck-local">Box Truck - Local</SelectItem>
                      <SelectItem value="box-truck-regional">Box Truck - Regional</SelectItem>
                      <SelectItem value="move-local-basic">Local Move - Basic</SelectItem>
                      <SelectItem value="move-local-full">Local Move - Full Service</SelectItem>
                      <SelectItem value="move-long-distance">Long Distance Move</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    placeholder="From (Address or City)"
                    value={quoteForm.from_location}
                    onChange={(e) => setQuoteForm({...quoteForm, from_location: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                    required
                  />
                  <Input
                    placeholder="To (Address or City)"
                    value={quoteForm.to_location}
                    onChange={(e) => setQuoteForm({...quoteForm, to_location: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                    required
                  />
                </div>

                <Input
                  type="date"
                  placeholder="Preferred Date"
                  value={quoteForm.move_date}
                  onChange={(e) => setQuoteForm({...quoteForm, move_date: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                />

                <Textarea
                  placeholder="Additional details (items to move, special requirements, etc.)"
                  value={quoteForm.details}
                  onChange={(e) => setQuoteForm({...quoteForm, details: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 min-h-[120px]"
                />

                <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white">
                  Request Free Quote
                  <Send className="ml-2 w-5 h-5" />
                </Button>
              </form>

              {/* Contact Info */}
              <div className="mt-8 pt-8 border-t border-slate-700">
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div className="flex flex-col items-center">
                    <Phone className="w-6 h-6 text-orange-400 mb-2" />
                    <a href="tel:+18163668960" className="text-gray-300 hover:text-orange-400 transition-colors text-sm font-semibold">
                      (816) 366-8960
                    </a>
                  </div>
                  <div className="flex flex-col items-center">
                    <Mail className="w-6 h-6 text-orange-400 mb-2" />
                    <a href="mailto:info@newreachtransport.com" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                      info@newreachtransport.com
                    </a>
                  </div>
                  <div className="flex flex-col items-center">
                    <MapPin className="w-6 h-6 text-orange-400 mb-2" />
                    <span className="text-gray-300 text-sm">Kansas City, MO</span>
                  </div>
                </div>
                <div className="flex justify-center gap-6 mt-6">
                  <a href="https://www.newreachtransport.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors text-sm flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    Website
                  </a>
                  <a href="https://usdirectory.com/NewReach-Transport-Kansas-City-MO" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors text-sm flex items-center">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    US Directory
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default NewReachTransportPage;
