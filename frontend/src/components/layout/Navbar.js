import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const location = useLocation();

  const mainLinks = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services' },
    { path: '/tools', label: 'Tools' },
    { path: '/proof', label: 'Portfolio' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' }
  ];

  const businessLinks = [
    { path: '/newreach-transport', label: 'NewReach Transport' },
    { path: '/menace-apparel', label: 'Menace Apparel' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Pat Church
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {mainLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-cyan-400 bg-cyan-500/10'
                    : 'text-gray-300 hover:text-cyan-400 hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* More Dropdown */}
            <div className="relative">
              <button
                onClick={() => setServicesOpen(!servicesOpen)}
                className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
              >
                More
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {servicesOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2">
                  {businessLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setServicesOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-300 hover:text-cyan-400 hover:bg-slate-700"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="border-t border-slate-700 my-2"></div>
                  <Link
                    to="/blog"
                    onClick={() => setServicesOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-300 hover:text-cyan-400 hover:bg-slate-700"
                  >
                    Blog
                  </Link>
                  <Link
                    to="/admin/leads"
                    onClick={() => setServicesOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-400 hover:text-cyan-400 hover:bg-slate-700"
                  >
                    Admin Dashboard
                  </Link>
                </div>
              )}
            </div>

            <Link to="/get-quote">
              <Button className="ml-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
                Get a Quote
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-gray-300 hover:text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800">
            <div className="flex flex-col space-y-1">
              {mainLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-cyan-400 bg-cyan-500/10'
                      : 'text-gray-300 hover:text-cyan-400 hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="border-t border-slate-700 my-2"></div>
              <span className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Other Businesses</span>
              
              {businessLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm text-gray-300 hover:text-cyan-400 hover:bg-slate-800"
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="border-t border-slate-700 my-2"></div>
              
              <Link to="/get-quote" onClick={() => setMobileMenuOpen(false)} className="px-4">
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
                  Get a Quote
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
