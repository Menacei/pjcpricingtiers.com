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
  Instagram,
  Brain,
  Bot,
  TrendingUp,
  Target,
  Sparkles,
  Cpu,
  BarChart3,
  Mail,
  Phone,
  MapPin,
  Award,
  Briefcase,
  GraduationCap
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
    fetchBlogPosts();
  }, []);

  // Check for payment return from Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    if (sessionId) {
      checkPaymentStatus(sessionId);
    }
  }, []);

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
          message: 'Payment successful! Thank you for your trust. I\'ll be in touch within 24 hours to kick off your project.'
        });
        return;
      } else if (response.data.status === 'expired') {
        setPaymentStatus({
          type: 'error',
          message: 'Payment session expired. Please try again.'
        });
        return;
      }

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

  const checkPaymentStatus = (sessionId) => {
    setPaymentStatus({
      type: 'pending',
      message: 'Checking payment status...'
    });
    pollPaymentStatus(sessionId);
  };

  const initiatePayment = async (packageId) => {
    const selectedService = services.find(service => service.id === packageId);
    setSelectedPackage(selectedService);
    setShowPaymentModal(true);
  };

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
      alert('Failed to initiate payment. Please try again or contact me directly.');
      setPaymentLoading("");
    }
  };

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
      alert("Thanks for reaching out! I'll get back to you within 24 hours.");
      setContactForm({ name: "", email: "", phone: "", service: "", message: "" });
    } catch (error) {
      console.error("Contact form error:", error);
      alert("Sorry, there was an error. Please email me directly at Patrickjchurch04@gmail.com");
    }
  };

  const socialMediaLinks = {
    facebook: "https://www.facebook.com/pjcwebdesigns",
    twitter: "https://www.twitter.com/pjcwebdesigns", 
    linkedin: "https://www.linkedin.com/in/patrickjameschurch",
    instagram: "https://www.instagram.com/pjcwebdesigns"
  };

  const openSocialPlatform = (platform) => {
    const url = socialMediaLinks[platform] || `https://www.${platform}.com`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getSocialIcon = (platform) => {
    switch (platform) {
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      default: return <Share2 className="w-4 h-4" />;
    }
  };

  // Services/Packages - Updated for Pat's personal brand
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

  // Skills showcase
  const skills = [
    {
      category: "AI & Automation",
      icon: <Brain className="w-6 h-6" />,
      items: ["Custom AI Chatbots", "Research Crawlers", "Lead Automation", "Content Generation"]
    },
    {
      category: "Web Development",
      icon: <Code className="w-6 h-6" />,
      items: ["React/Next.js", "Landing Pages", "E-commerce", "Web Apps"]
    },
    {
      category: "Marketing",
      icon: <TrendingUp className="w-6 h-6" />,
      items: ["SEO Strategy", "Social Content", "Email Campaigns", "Brand Design"]
    },
    {
      category: "Business Tools",
      icon: <Briefcase className="w-6 h-6" />,
      items: ["CRM Setup", "Analytics", "Payment Integration", "Workflow Automation"]
    }
  ];

  // Featured projects
  const projects = [
    {
      title: "AI-Powered Lead Capture",
      description: "Built an intelligent lead capture system that increased client conversions by 150%",
      image: "https://images.unsplash.com/photo-1559028012-481c04fa702d",
      tags: ["AI", "Automation", "Lead Gen"],
      result: "150% more leads"
    },
    {
      title: "E-commerce Transformation",
      description: "Complete website redesign with AI product recommendations and automated inventory",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d",
      tags: ["E-commerce", "AI", "UX Design"],
      result: "3x sales increase"
    },
    {
      title: "Custom Research Crawler",
      description: "Automated competitor research tool that saves 20+ hours of manual work weekly",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
      tags: ["AI", "Automation", "Research"],
      result: "20hrs saved/week"
    }
  ];

  // Testimonials
  const testimonials = [
    {
      name: "Sarah Mitchell",
      business: "Mitchell's Boutique",
      quote: "Pat didn't just build me a website—he built a money-making machine. The AI chatbot handles customer questions 24/7 and the automation saves me hours every week.",
      result: "Revenue up 200%"
    },
    {
      name: "Marcus Johnson",
      business: "Johnson Consulting",
      quote: "I was skeptical about AI, but Pat showed me how it could work for my business. Now I have automated follow-ups that book clients while I sleep.",
      result: "40% more bookings"
    },
    {
      name: "Lisa Chen",
      business: "Chen's Real Estate",
      quote: "The research crawler Pat built saves me hours of market research every single day. It's like having a full-time research assistant.",
      result: "3 hours saved daily"
    }
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
            {/* Stripe Payment Option */}
            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
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
                  Pay with Card (Stripe)
                </>
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

            {/* PayPal Payment Option */}
            <PayPalScriptProvider options={{ 
              "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID || "test",
              currency: "USD"
            }}>
              <PayPalButtons
                style={{ layout: "horizontal", height: 40 }}
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

            <p className="text-xs text-center text-gray-500">
              Secure payments processed by Stripe & PayPal. Your information is protected.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <PaymentStatusDisplay />
      <PaymentModal />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Pat Church
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#about" className="text-gray-300 hover:text-cyan-400 transition-colors">About</a>
              <a href="#services" className="text-gray-300 hover:text-cyan-400 transition-colors">Services</a>
              <a href="#work" className="text-gray-300 hover:text-cyan-400 transition-colors">Work</a>
              <a href="#blog" className="text-gray-300 hover:text-cyan-400 transition-colors">Blog</a>
              <a href="#contact">
                <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
                  Let's Talk
                </Button>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-cyan-600/20 text-cyan-400 border-cyan-500/30">
            <Sparkles className="w-3 h-3 mr-1" />
            Kansas City, MO • Available for Projects
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-6 leading-tight">
            I Build Websites That
            <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Actually Make Money
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Hey, I'm <span className="text-cyan-400 font-semibold">Patrick "Pat" James Church</span>. 
            I combine AI, automation, and strategic web design to help small businesses 
            get more leads, close more sales, and save hours every week.
          </p>

          {/* Value props */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-10">
            {[
              { icon: <Bot className="w-5 h-5" />, text: "AI Integration" },
              { icon: <Zap className="w-5 h-5" />, text: "Automation" },
              { icon: <TrendingUp className="w-5 h-5" />, text: "Lead Generation" },
              { icon: <Globe className="w-5 h-5" />, text: "Web Design" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-center space-x-2 bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                <span className="text-cyan-400">{item.icon}</span>
                <span className="text-gray-300 text-sm">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-6 text-lg">
                Start Your Project
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
            <a href="#work">
              <Button size="lg" variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 px-8 py-6 text-lg">
                See My Work
              </Button>
            </a>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 border-2 border-slate-900"></div>
                ))}
              </div>
              <span>Trusted by <span className="text-cyan-400">50+</span> businesses</span>
            </div>
            <div className="flex items-center space-x-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2">5.0 rating</span>
            </div>
          </div>
        </div>
      </header>

      {/* About Section */}
      <section id="about" className="py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-purple-600/20 text-purple-400 border-purple-500/30">
                About Me
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Not Your Typical Web Designer
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  I'm Pat Church, and I do things differently. While most web designers just make things look pretty, 
                  <span className="text-cyan-400 font-medium"> I build digital systems that actually work for your business</span>.
                </p>
                <p>
                  Based in Kansas City, I've spent years mastering the intersection of 
                  <span className="text-purple-400 font-medium"> AI, automation, and web development</span>. 
                  This unique combination means your website doesn't just sit there—it actively 
                  generates leads, nurtures customers, and helps you close deals.
                </p>
                <p>
                  Whether you need a simple landing page or a full AI-powered business system, 
                  I'm here to help you leverage technology to grow your business.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="text-3xl font-bold text-cyan-400">50+</div>
                  <div className="text-sm text-gray-400">Projects Delivered</div>
                </div>
                <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="text-3xl font-bold text-purple-400">150%</div>
                  <div className="text-sm text-gray-400">Avg Lead Increase</div>
                </div>
                <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="text-3xl font-bold text-pink-400">5.0</div>
                  <div className="text-sm text-gray-400">Client Rating</div>
                </div>
              </div>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-2 gap-4">
              {skills.map((skill, idx) => (
                <Card key={idx} className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg text-cyan-400">
                        {skill.icon}
                      </div>
                      <h3 className="font-semibold text-white">{skill.category}</h3>
                    </div>
                    <ul className="space-y-2">
                      {skill.items.map((item, i) => (
                        <li key={i} className="flex items-center text-sm text-gray-400">
                          <CheckCircle className="w-3 h-3 mr-2 text-cyan-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-cyan-600/20 text-cyan-400 border-cyan-500/30">
              Services & Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Packages Built for Growth
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Every package includes AI integration, because in 2025, that's not optional—it's essential.
            </p>
          </div>

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
            <a href="#contact">
              <Button variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                Request Custom Quote
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Portfolio/Work Section */}
      <section id="work" className="py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-600/20 text-purple-400 border-purple-500/30">
              Featured Work
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Real Results for Real Businesses
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Every project is built to deliver measurable outcomes—not just pretty designs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 overflow-hidden group">
                <div className="relative overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500/90 text-white">{project.result}</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-400 mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-slate-700 text-gray-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-pink-600/20 text-pink-400 border-pink-500/30">
              Client Success Stories
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              What My Clients Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{testimonial.name}</p>
                      <p className="text-sm text-gray-400">{testimonial.business}</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      {testimonial.result}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      {blogPosts.length > 0 && (
        <section id="blog" className="py-20 bg-slate-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-cyan-600/20 text-cyan-400 border-cyan-500/30">
                Latest Insights
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                From the Blog
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Thoughts on AI, automation, web design, and building profitable online businesses.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden group">
                  <div className="relative overflow-hidden">
                    <img 
                      src={post.featured_image} 
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-cyan-600 text-white">{post.category}</Badge>
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
                    <p className="text-gray-400 line-clamp-2">{post.excerpt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-600/20 text-purple-400 border-purple-500/30">
              Let's Connect
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Grow Your Business?
            </h2>
            <p className="text-lg text-gray-400">
              Tell me about your project and I'll get back to you within 24 hours.
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
                        <SelectItem value="launch-pad">Launch Pad ($325+)</SelectItem>
                        <SelectItem value="growth-engine">Growth Engine ($812+)</SelectItem>
                        <SelectItem value="scale-dominate">Scale & Dominate ($1,625+)</SelectItem>
                        <SelectItem value="custom">Custom Project</SelectItem>
                        <SelectItem value="consultation">Free Consultation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Textarea
                    placeholder="Tell me about your project... What's your biggest business challenge right now?"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 min-h-[120px]"
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white">
                  Send Message
                  <Send className="ml-2 w-5 h-5" />
                </Button>
              </form>

              {/* Contact Info */}
              <div className="mt-8 pt-8 border-t border-slate-700">
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div className="flex flex-col items-center">
                    <Mail className="w-6 h-6 text-cyan-400 mb-2" />
                    <a href="mailto:Patrickjchurch04@gmail.com" className="text-gray-300 hover:text-cyan-400 transition-colors text-sm">
                      Patrickjchurch04@gmail.com
                    </a>
                  </div>
                  <div className="flex flex-col items-center">
                    <MapPin className="w-6 h-6 text-purple-400 mb-2" />
                    <span className="text-gray-300 text-sm">Kansas City, MO</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Clock className="w-6 h-6 text-pink-400 mb-2" />
                    <span className="text-gray-300 text-sm">Response within 24hrs</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Pat Church
                </span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                AI-powered web design & automation for small businesses that want to grow. 
                Based in Kansas City, serving clients nationwide.
              </p>
              <div className="flex space-x-4">
                {['facebook', 'twitter', 'linkedin', 'instagram'].map((platform) => (
                  <Button
                    key={platform}
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-full border border-slate-700 hover:border-cyan-400 text-gray-400 hover:text-cyan-400"
                    onClick={() => openSocialPlatform(platform)}
                  >
                    {getSocialIcon(platform)}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#services" className="hover:text-cyan-400 transition-colors">AI Integration</a></li>
                <li><a href="#services" className="hover:text-cyan-400 transition-colors">Web Design</a></li>
                <li><a href="#services" className="hover:text-cyan-400 transition-colors">Automation</a></li>
                <li><a href="#services" className="hover:text-cyan-400 transition-colors">Lead Generation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-cyan-400 transition-colors">About</a></li>
                <li><a href="#work" className="hover:text-cyan-400 transition-colors">Portfolio</a></li>
                <li><a href="#blog" className="hover:text-cyan-400 transition-colors">Blog</a></li>
                <li><a href="#contact" className="hover:text-cyan-400 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
              <p>© 2025 Patrick James Church. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
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
            className="rounded-full w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 shadow-lg shadow-cyan-500/25"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        )}

        {isChatOpen && (
          <Card className="w-80 h-96 bg-slate-800 border-slate-700 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white p-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">Chat with Pat</CardTitle>
                  <CardDescription className="text-cyan-100">AI Assistant • Usually replies instantly</CardDescription>
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
                    Hey! 👋 I'm Pat's AI assistant. Ask me anything about services, pricing, or how I can help grow your business!
                  </div>
                )}
                
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-cyan-600 text-white' 
                        : 'bg-slate-700 text-gray-200'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-700 p-3 rounded-lg">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              
              <div className="border-t border-slate-700 p-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                  />
                  <Button 
                    onClick={handleChatSend} 
                    className="bg-gradient-to-r from-cyan-500 to-purple-600"
                    disabled={isLoading}
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
