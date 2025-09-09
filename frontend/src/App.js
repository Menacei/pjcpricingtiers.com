import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import axios from "axios";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Badge } from "./components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { 
  Code, 
  Palette, 
  Smartphone, 
  Zap, 
  Users, 
  Star, 
  MessageCircle,
  X,
  Send,
  CheckCircle,
  Globe,
  Rocket,
  Shield,
  ArrowRight,
  ExternalLink,
  CreditCard,
  Loader2,
  Calendar,
  Clock,
  Tag,
  User,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Instagram
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [blogPosts, setBlogPosts] = useState([]);
  const [socialPosts, setSocialPosts] = useState([]);
  const [socialPlatforms, setSocialPlatforms] = useState([]);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: ""
  });
  const chatEndRef = useRef(null);

  // Fetch blog posts
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await axios.get(`${API}/blog?limit=3`);
        setBlogPosts(response.data);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      }
    };

    const fetchSocialPlatforms = async () => {
      try {
        const response = await axios.get(`${API}/social/platforms`);
        setSocialPlatforms(response.data.platforms);
      } catch (error) {
        console.error("Error fetching social platforms:", error);
      }
    };

    const fetchSocialPosts = async () => {
      try {
        const response = await axios.get(`${API}/social/posts?limit=6`);
        setSocialPosts(response.data);
      } catch (error) {
        console.error("Error fetching social posts:", error);
      }
    };

    fetchBlogPosts();
    fetchSocialPlatforms();
    fetchSocialPosts();
  }, []);

  // Check for payment return from Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      checkPaymentStatus(sessionId);
    }
  }, []);

  // Function to get URL parameter
  const getUrlParameter = (name) => {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(window.location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };

  // Function to poll payment status
  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 5;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      setPaymentStatus({
        type: 'error',
        message: 'Payment status check timed out. Please check your email for confirmation.'
      });
      return;
    }

    try {
      const response = await axios.get(`${API}/checkout/status/${sessionId}`);
      
      if (response.data.payment_status === 'paid') {
        setPaymentStatus({
          type: 'success',
          message: 'Payment successful! Thank you for your purchase. We will contact you soon to start your project.'
        });
        return;
      } else if (response.data.status === 'expired') {
        setPaymentStatus({
          type: 'error',
          message: 'Payment session expired. Please try again.'
        });
        return;
      }

      // If payment is still pending, continue polling
      setPaymentStatus({
        type: 'pending',
        message: 'Payment is being processed...'
      });
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus({
        type: 'error',
        message: 'Error checking payment status. Please try again.'
      });
    }
  };

  // Function to check payment status when returning from Stripe
  const checkPaymentStatus = (sessionId) => {
    setPaymentStatus({
      type: 'pending',
      message: 'Checking payment status...'
    });
    pollPaymentStatus(sessionId);
  };

  // Function to initiate payment (opens payment modal)
  const initiatePayment = async (packageId) => {
    const selectedService = services.find(service => service.id === packageId);
    setSelectedPackage(selectedService);
    setShowPaymentModal(true);
  };

  // Function to process Stripe payment
  const processStripePayment = async (packageId) => {
    setPaymentLoading(`stripe-${packageId}`);
    
    try {
      const originUrl = window.location.origin;
      
      const requestBody = {
        package_id: packageId,
        origin_url: originUrl,
        customer_email: contactForm.email || null,
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
      alert('Failed to initiate Stripe payment. Please try again.');
      setPaymentLoading("");
    }
  };

  // Function to create PayPal order
  const createPayPalOrder = async (packageId) => {
    try {
      const originUrl = window.location.origin;
      
      const requestBody = {
        package_id: packageId,
        origin_url: originUrl,
        customer_email: contactForm.email || null
      };

      const response = await axios.post(`${API}/paypal/orders`, requestBody);
      return response.data.order_id;
    } catch (error) {
      console.error('PayPal order creation error:', error);
      throw error;
    }
  };

  // Function to capture PayPal payment
  const capturePayPalOrder = async (orderId) => {
    try {
      const response = await axios.post(`${API}/paypal/orders/${orderId}/capture`);
      
      if (response.data.status === "COMPLETED") {
        setPaymentStatus({
          type: 'success',
          message: 'PayPal payment successful! Thank you for your purchase. We will contact you soon to start your project.'
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

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { type: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        message: chatInput,
        session_id: sessionId
      });

      const aiMessage = { type: "ai", content: response.data.response };
      setChatMessages(prev => [...prev, aiMessage]);
      setSessionId(response.data.session_id);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = { type: "ai", content: "Sorry, I'm having trouble connecting right now. Please try again!" };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/contact`, contactForm);
      alert("Thank you! We'll get back to you soon.");
      setContactForm({ name: "", email: "", phone: "", service: "", message: "" });
    } catch (error) {
      console.error("Contact form error:", error);
      alert("Sorry, there was an error submitting your form. Please try again.");
    }
  };

  // Social sharing function
  const handleSocialShare = async (platform, postId) => {
    try {
      const response = await axios.post(`${API}/social/share?post_id=${postId}&platform=${platform}`);
      if (response.data.share_url) {
        window.open(response.data.share_url, '_blank', 'width=600,height=400');
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Social platform icons
  const getSocialIcon = (platform) => {
    switch (platform) {
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      default: return <Share2 className="w-4 h-4" />;
    }
  };

  // Function to handle post engagement
  const handlePostEngagement = async (postId, action) => {
    try {
      await axios.post(`${API}/social/posts/${postId}/engage?action=${action}`);
      // Update the local state to reflect the engagement
      setSocialPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, [`${action}s`]: post[`${action}s`] + 1 }
            : post
        )
      );
    } catch (error) {
      console.error("Error tracking engagement:", error);
    }
  };

  // Function to get platform-specific styling
  const getPlatformStyling = (platform) => {
    const styles = {
      instagram: "bg-gradient-to-r from-purple-500 to-pink-500",
      twitter: "bg-blue-500",
      linkedin: "bg-blue-600",
      facebook: "bg-blue-700",
      default: "bg-slate-600"
    };
    return styles[platform] || styles.default;
  };

  const services = [
    {
      id: "essential",
      name: "Essential Web Presence",
      price: "$599.99",
      features: [
        "5-page responsive website",
        "Mobile-optimized design",
        "Basic SEO setup",
        "Contact form integration",
        "Social media integration",
        "30 days support"
      ],
      icon: <Globe className="w-8 h-8" />,
      color: "from-cyan-400 to-blue-500"
    },
    {
      id: "professional",
      name: "Professional Business Suite",
      price: "$2,999.99",
      features: [
        "Up to 15 custom pages",
        "Advanced animations & interactions",
        "E-commerce integration",
        "CMS for easy updates",
        "Advanced SEO & analytics",
        "90 days premium support",
        "Performance optimization",
        "Security features"
      ],
      icon: <Rocket className="w-8 h-8" />,
      color: "from-purple-400 to-pink-500",
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise Digital Ecosystem",
      price: "$10,000",
      features: [
        "Unlimited custom pages",
        "Custom web application",
        "API integrations",
        "Advanced user management",
        "Custom dashboard & analytics",
        "1 year premium support",
        "Dedicated project manager",
        "Training & documentation",
        "Regular maintenance & updates"
      ],
      icon: <Shield className="w-8 h-8" />,
      color: "from-orange-400 to-red-500"
    }
  ];

  const portfolioItems = [
    {
      title: "E-commerce Revolution",
      description: "Modern online store with seamless checkout experience",
      image: "https://images.unsplash.com/photo-1559028012-481c04fa702d",
      tech: ["React", "Node.js", "Stripe"]
    },
    {
      title: "Creative Agency Platform",
      description: "Dynamic portfolio showcase with interactive elements",
      image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d",
      tech: ["Vue.js", "Three.js", "GSAP"]
    },
    {
      title: "SaaS Dashboard",
      description: "Complex data visualization and user management",
      image: "https://images.unsplash.com/photo-1547658719-da2b51169166",
      tech: ["Angular", "D3.js", "Firebase"]
    }
  ];

  const affiliatePartners = [
    { name: "TechStartup Inc", link: "https://example.com/partner1", clicks: 0 },
    { name: "Digital Agency Pro", link: "https://example.com/partner2", clicks: 0 },
    { name: "E-commerce Solutions", link: "https://example.com/partner3", clicks: 0 }
  ];

  // Payment Status Display Component
  const PaymentStatusDisplay = () => {
    if (!paymentStatus) return null;

    const statusStyles = {
      success: "bg-green-500/20 border-green-500 text-green-300",
      error: "bg-red-500/20 border-red-500 text-red-300",
      pending: "bg-yellow-500/20 border-yellow-500 text-yellow-300"
    };

    return (
      <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg border ${statusStyles[paymentStatus.type]} max-w-md w-full mx-4`}>
        <div className="flex items-center space-x-2">
          {paymentStatus.type === 'pending' && <Loader2 className="w-5 h-5 animate-spin" />}
          {paymentStatus.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {paymentStatus.type === 'error' && <X className="w-5 h-5" />}
          <p className="text-sm font-medium">{paymentStatus.message}</p>
        </div>
        {paymentStatus.type !== 'pending' && (
          <button
            onClick={() => setPaymentStatus(null)}
            className="absolute top-2 right-2 text-current hover:opacity-70"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  // Payment Modal Component
  const PaymentModal = () => {
    if (!showPaymentModal || !selectedPackage) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="bg-slate-800 border-slate-700 w-full max-w-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">Choose Payment Method</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription className="text-gray-300">
              {selectedPackage.name} - {selectedPackage.price}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stripe Payment Button */}
            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              onClick={() => processStripePayment(selectedPackage.id)}
              disabled={paymentLoading === `stripe-${selectedPackage.id}`}
            >
              {paymentLoading === `stripe-${selectedPackage.id}` ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay with Stripe
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-gray-400">or</span>
              </div>
            </div>

            {/* PayPal Payment Component */}
            <PayPalScriptProvider options={{ 
              clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || "demo",
              currency: "USD"
            }}>
              <PayPalButtons
                style={{
                  layout: "vertical",
                  color: "blue",
                  shape: "rect",
                  label: "paypal"
                }}
                createOrder={() => createPayPalOrder(selectedPackage.id)}
                onApprove={(data) => capturePayPalOrder(data.orderID)}
                onError={(err) => {
                  console.error('PayPal error:', err);
                  setPaymentStatus({
                    type: 'error',
                    message: 'PayPal payment failed. Please try again.'
                  });
                }}
              />
            </PayPalScriptProvider>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <PaymentStatusDisplay />
      <PaymentModal />
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 font-fredoka">
              PJC Web Designs
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Crafting digital experiences that merge urban aesthetics with cutting-edge technology. 
              We don't just build websites – we create digital ecosystems.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 text-lg">
                Start Your Project
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 px-8 py-4 text-lg">
                View Portfolio
              </Button>
            </div>
          </div>
        </div>
        
        {/* Hero Image */}
        <div className="relative max-w-6xl mx-auto px-4 pb-20">
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1707226845968-c7e5e3409e35" 
              alt="Urban Tech Architecture"
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your Digital Journey
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            From startup essentials to enterprise solutions, we've got the perfect package to elevate your digital presence.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className={`relative overflow-hidden bg-slate-800/50 border-slate-700 hover:border-cyan-400 transition-all duration-300 ${service.popular ? 'scale-105 ring-2 ring-purple-400' : ''}`}>
              {service.popular && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center text-white mb-4`}>
                  {service.icon}
                </div>
                <CardTitle className="text-2xl text-white mb-2">{service.name}</CardTitle>
                <CardDescription className="text-3xl font-bold text-cyan-400">{service.price}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full bg-gradient-to-r ${service.color} hover:opacity-90 text-white`}
                  onClick={() => initiatePayment(service.id)}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Purchase Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Portfolio Section */}
      <div className="bg-slate-800/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Digital Masterpieces
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Explore our latest creations where urban design meets technological innovation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {portfolioItems.map((item, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-cyan-400 transition-all duration-300 group overflow-hidden">
                <div className="relative overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 mb-4">{item.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.tech.map((tech, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-slate-700 text-cyan-400">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Affiliate Partners Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            Partner Network
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Join our affiliate program and earn commissions by referring clients to our premium web design services.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {affiliatePartners.map((partner, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-cyan-400 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold text-white mb-2">{partner.name}</h3>
                <p className="text-gray-400 mb-4">Clicks: {partner.clicks}</p>
                <Button 
                  variant="outline" 
                  className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900"
                  onClick={() => window.open(partner.link, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Partner
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Blog Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Latest Insights
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Stay updated with the latest trends in web design, development, and digital innovation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-cyan-400 transition-all duration-300 group overflow-hidden">
              <div className="relative overflow-hidden">
                <img 
                  src={post.featured_image} 
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-cyan-600 text-white">
                    {post.category}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center text-gray-400 text-sm mb-3 space-x-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(post.timestamp).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {post.reading_time} min read
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-gray-400 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.slice(0, 3).map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-slate-700 text-gray-300">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-400">
                    <User className="w-4 h-4 mr-2" />
                    <span className="text-sm">{post.author}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {socialPlatforms.slice(0, 4).map((platform) => (
                      <Button
                        key={platform.id}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-cyan-400"
                        onClick={() => handleSocialShare(platform.id, post.slug)}
                        title={`Share on ${platform.name}`}
                      >
                        {getSocialIcon(platform.id)}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900">
            View All Articles
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-slate-800/30 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Let's Create Something Amazing
            </h2>
            <p className="text-xl text-gray-400">
              Ready to transform your digital presence? Get in touch and let's discuss your project.
            </p>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-8">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Input
                      placeholder="Your Name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Input
                      placeholder="Phone Number (Optional)"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <Select value={contactForm.service} onValueChange={(value) => setContactForm({...contactForm, service: value})}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select Service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="essential">Essential Web Presence</SelectItem>
                        <SelectItem value="professional">Professional Business Suite</SelectItem>
                        <SelectItem value="enterprise">Enterprise Digital Ecosystem</SelectItem>
                        <SelectItem value="custom">Custom Solution</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Textarea
                    placeholder="Tell us about your project..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 min-h-[120px]"
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white">
                  Send Message
                  <Send className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Social Media Integration Section */}
      <div className="bg-slate-800/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Connect With Us
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Stay connected and follow our latest projects, insights, and industry updates across all major social platforms.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {socialPlatforms.map((platform) => (
              <Card key={platform.id} className="bg-slate-700/50 border-slate-600 hover:border-cyan-400 transition-all duration-300 group">
                <CardContent className="p-4 text-center">
                  <div 
                    className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${platform.color}20`, border: `2px solid ${platform.color}` }}
                  >
                    <div style={{ color: platform.color }}>
                      {getSocialIcon(platform.id)}
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                    {platform.name}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-gray-400 hover:text-cyan-400"
                    onClick={() => handleSocialShare(platform.id, 'pjc-web-designs')}
                  >
                    Follow
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
                PJC Web Designs
              </h3>
              <p className="text-gray-400 mb-6">
                Crafting digital experiences that merge urban aesthetics with cutting-edge technology. 
                We don't just build websites – we create digital ecosystems.
              </p>
              <div className="flex space-x-4">
                {socialPlatforms.slice(0, 6).map((platform) => (
                  <Button
                    key={platform.id}
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-full border border-slate-700 hover:border-cyan-400 text-gray-400 hover:text-cyan-400"
                    onClick={() => handleSocialShare(platform.id, 'pjc-web-designs')}
                    title={`Follow us on ${platform.name}`}
                  >
                    {getSocialIcon(platform.id)}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Services</h4>
              <ul className="space-y-2">
                <li><Button variant="ghost" className="text-gray-400 hover:text-cyan-400 p-0 h-auto">Web Design</Button></li>
                <li><Button variant="ghost" className="text-gray-400 hover:text-cyan-400 p-0 h-auto">Development</Button></li>
                <li><Button variant="ghost" className="text-gray-400 hover:text-cyan-400 p-0 h-auto">E-commerce</Button></li>
                <li><Button variant="ghost" className="text-gray-400 hover:text-cyan-400 p-0 h-auto">SEO</Button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Button variant="ghost" className="text-gray-400 hover:text-cyan-400 p-0 h-auto">About</Button></li>
                <li><Button variant="ghost" className="text-gray-400 hover:text-cyan-400 p-0 h-auto">Blog</Button></li>
                <li><Button variant="ghost" className="text-gray-400 hover:text-cyan-400 p-0 h-auto">Careers</Button></li>
                <li><Button variant="ghost" className="text-gray-400 hover:text-cyan-400 p-0 h-auto">Contact</Button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 mb-4 md:mb-0">
                © 2025 PJC Web Designs. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <Button variant="ghost" className="text-gray-400 hover:text-cyan-400">Privacy Policy</Button>
                <Button variant="ghost" className="text-gray-400 hover:text-cyan-400">Terms of Service</Button>
                <Button variant="ghost" className="text-gray-400 hover:text-cyan-400">Cookie Policy</Button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Chatbot */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen && (
          <Button
            onClick={() => setIsChatOpen(true)}
            className="rounded-full w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        )}

        {isChatOpen && (
          <Card className="w-80 h-96 bg-slate-800 border-slate-700 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">PJC Assistant</CardTitle>
                  <CardDescription className="text-cyan-100">How can I help you today?</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsChatOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="flex flex-col h-64 p-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 && (
                  <div className="text-gray-400 text-sm">
                    Hi! I'm here to help you learn about our web design services. Ask me anything!
                  </div>
                )}
                
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-cyan-600 text-white' 
                        : 'bg-slate-700 text-gray-200'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-700 text-gray-200 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              
              <div className="p-4 border-t border-slate-700">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleChatSend}
                    disabled={isLoading || !chatInput.trim()}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default App;