import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Facebook, Twitter, Linkedin, Instagram, Share2, Mail, MapPin, Phone, Youtube } from 'lucide-react';

const Footer = () => {
  const socialMediaLinks = {
    facebook: "https://www.facebook.com/pjcwebdesigns",
    twitter: "https://www.twitter.com/pjcwebdesigns", 
    linkedin: "https://www.linkedin.com/in/patrickjameschurch",
    instagram: "https://www.instagram.com/pjcwebdesigns",
    youtube: "https://www.youtube.com/@Patrick-z8m4b"
  };

  const openSocialPlatform = (platform) => {
    const url = socialMediaLinks[platform];
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getSocialIcon = (platform) => {
    switch (platform) {
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      default: return <Share2 className="w-4 h-4" />;
    }
  };

  return (
    <footer className="bg-slate-900 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Pat Church
              </span>
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              AI-powered web design & automation for small businesses that want to grow.
            </p>
            <div className="flex space-x-3">
              {['facebook', 'twitter', 'linkedin', 'instagram', 'youtube'].map((platform) => (
                <Button
                  key={platform}
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-full border border-slate-700 hover:border-cyan-400 text-gray-400 hover:text-cyan-400"
                  onClick={() => openSocialPlatform(platform)}
                >
                  {getSocialIcon(platform)}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-400 hover:text-cyan-400 transition-colors">Home</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-cyan-400 transition-colors">Services</Link></li>
              <li><Link to="/proof" className="text-gray-400 hover:text-cyan-400 transition-colors">Proof</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-cyan-400 transition-colors">About</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-cyan-400 transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/services" className="text-gray-400 hover:text-cyan-400 transition-colors">Web Design</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-cyan-400 transition-colors">AI Integration</Link></li>
              <li><Link to="/newreach-transport" className="text-gray-400 hover:text-cyan-400 transition-colors">Moving Services</Link></li>
              <li><Link to="/newreach-transport" className="text-gray-400 hover:text-cyan-400 transition-colors">Box Truck Services</Link></li>
              <li><Link to="/menace-apparel" className="text-gray-400 hover:text-cyan-400 transition-colors">Menace Apparel</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start text-gray-400">
                <Mail className="w-4 h-4 mr-2 mt-0.5 text-cyan-400" />
                <a href="mailto:Patrickjchurch04@gmail.com" className="hover:text-cyan-400 transition-colors">
                  Patrickjchurch04@gmail.com
                </a>
              </li>
              <li className="flex items-start text-gray-400">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 text-cyan-400" />
                Kansas City, MO
              </li>
            </ul>
            <Link to="/get-quote" className="mt-4 inline-block">
              <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
                Get a Quote
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="text-gray-500">
              © {new Date().getFullYear()} Patrick James Church. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-500 hover:text-gray-300 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/contact" className="text-gray-500 hover:text-gray-300 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
