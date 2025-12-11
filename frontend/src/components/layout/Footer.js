import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Facebook, Twitter, Linkedin, Instagram, Share2 } from 'lucide-react';

const Footer = () => {
  const socialMediaLinks = {
    facebook: "https://www.facebook.com/pjcwebdesigns",
    twitter: "https://www.twitter.com/pjcwebdesigns", 
    linkedin: "https://www.linkedin.com/in/patrickjameschurch",
    instagram: "https://www.instagram.com/pjcwebdesigns"
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
      default: return <Share2 className="w-4 h-4" />;
    }
  };

  return (
    <footer className="bg-slate-900 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Pat Church
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              AI-powered web design, automation, transportation, and apparel. 
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
              <li><Link to="/services" className="hover:text-cyan-400 transition-colors">Web Design</Link></li>
              <li><Link to="/services" className="hover:text-cyan-400 transition-colors">AI Integration</Link></li>
              <li><Link to="/newreach-transport" className="hover:text-cyan-400 transition-colors">Box Truck Services</Link></li>
              <li><Link to="/newreach-transport" className="hover:text-cyan-400 transition-colors">Moving Services</Link></li>
              <li><Link to="/menace-apparel" className="hover:text-cyan-400 transition-colors">Menace Apparel</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link></li>
              <li><Link to="/blog" className="hover:text-cyan-400 transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-cyan-400 transition-colors">Contact</Link></li>
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
  );
};

export default Footer;
