import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import axios from "axios";
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
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: ""
  });
  const chatEndRef = useRef(null);

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

  // Function to initiate payment
  const initiatePayment = async (packageId) => {
    setPaymentLoading(packageId);
    
    try {
      const originUrl = window.location.origin;
      
      const requestBody = {
        package_id: packageId,
        origin_url: originUrl,
        customer_email: contactForm.email || null
      };

      const response = await axios.post(`${API}/checkout/session`, requestBody);
      
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
      setPaymentLoading("");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <PaymentStatusDisplay />
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
                  disabled={paymentLoading === service.id}
                >
                  {paymentLoading === service.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Purchase Now
                    </>
                  )}
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

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
              PJC Web Designs
            </h3>
            <p className="text-gray-400 mb-6">
              Crafting digital experiences that merge urban aesthetics with cutting-edge technology.
            </p>
            <div className="flex justify-center space-x-6">
              <Button variant="ghost" className="text-gray-400 hover:text-cyan-400">Privacy</Button>
              <Button variant="ghost" className="text-gray-400 hover:text-cyan-400">Terms</Button>
              <Button variant="ghost" className="text-gray-400 hover:text-cyan-400">Contact</Button>
            </div>
            <p className="text-gray-500 mt-8">
              © 2025 PJC Web Designs. All rights reserved.
            </p>
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