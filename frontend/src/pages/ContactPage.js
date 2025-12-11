import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Send,
  Mail,
  MapPin,
  Clock
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ContactPage = () => {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: ""
  });

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

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-purple-600/20 text-purple-400 border-purple-500/30">
            Let's Connect
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Tell me about your project and I'll get back to you within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                        <SelectValue placeholder="What do you need?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="web-design">Web Design</SelectItem>
                        <SelectItem value="ai-automation">AI & Automation</SelectItem>
                        <SelectItem value="box-truck">Box Truck Services</SelectItem>
                        <SelectItem value="moving">Moving Services</SelectItem>
                        <SelectItem value="menace-apparel">Menace Apparel</SelectItem>
                        <SelectItem value="other">Other / General Inquiry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Textarea
                    placeholder="Tell me about your project or how I can help..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 min-h-[150px]"
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
    </div>
  );
};

export default ContactPage;
