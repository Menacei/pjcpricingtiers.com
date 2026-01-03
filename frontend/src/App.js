import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

// Layout Components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ChatWidget from "./components/layout/ChatWidget";

// Main Pages
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import ProofPage from "./pages/ProofPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import BlogPage from "./pages/BlogPage";
import ToolsPage from "./pages/ToolsPage";

// Funnel Pages
import LeadFormPage from "./pages/funnel/LeadFormPage";
import ThankYouPage from "./pages/funnel/ThankYouPage";

// Business Pages
import NewReachTransportPage from "./pages/NewReachTransportPage";
import MenaceApparelPage from "./pages/MenaceApparelPage";

// Admin Pages
import LeadsDashboard from "./pages/admin/LeadsDashboard";

// Analytics tracking component
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page views
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: location.pathname + location.search
      });
    }
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location]);

  return null;
};

function App() {
  return (
    <Router>
      <AnalyticsTracker />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        <Navbar />
        
        <Routes>
          {/* Main Pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/proof" element={<ProofPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/tools" element={<ToolsPage />} />

          {/* Funnel Pages */}
          <Route path="/get-quote" element={<LeadFormPage />} />
          <Route path="/get-quote/thank-you" element={<ThankYouPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />

          {/* Business Pages */}
          <Route path="/newreach-transport" element={<NewReachTransportPage />} />
          <Route path="/menace-apparel" element={<MenaceApparelPage />} />

          {/* Admin Pages */}
          <Route path="/admin/leads" element={<LeadsDashboard />} />
        </Routes>
        
        <Footer />
        <ChatWidget />
      </div>
    </Router>
  );
}

export default App;
