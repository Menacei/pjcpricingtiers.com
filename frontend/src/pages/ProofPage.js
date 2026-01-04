import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  ArrowRight,
  TrendingUp,
  Palette,
  Layout,
  Monitor,
  ExternalLink,
  X,
  Utensils,
  Dumbbell,
  Building2,
  Cpu,
  Sparkles,
  Truck,
  GraduationCap,
  Hammer
} from 'lucide-react';

const ProofPage = () => {
  const [selectedWork, setSelectedWork] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // Portfolio items - All logo designs
  const portfolioItems = [
    // New AI-Generated Logos
    {
      id: 1,
      title: "Urban Bistro",
      category: "logo",
      industry: "Restaurant",
      description: "Modern restaurant logo featuring elegant fork and knife integrated with stylized letter U. Warm orange and dark brown colors create an inviting, upscale dining atmosphere.",
      image: "https://static.prod-images.emergentagent.com/jobs/db77f348-bb27-4fa4-a4d1-60882dce1ba8/images/d33194743a22f90310c674a81255c4d07a2a43556e1f1fe25de2dd65f4b6c348.png",
      tags: ["Restaurant", "Food & Beverage", "Hospitality"],
      services: ["Logo Design", "Brand Identity"],
      icon: <Utensils className="w-4 h-4" />
    },
    {
      id: 2,
      title: "Iron Peak Fitness",
      category: "logo",
      industry: "Fitness",
      description: "Bold dynamic fitness gym logo featuring stylized mountain peak merged with dumbbell silhouette. Strong red and black colors convey power and determination.",
      image: "https://static.prod-images.emergentagent.com/jobs/db77f348-bb27-4fa4-a4d1-60882dce1ba8/images/8557cec1b5e774fa15c9538e1509aec0b4f104a8760ec54dc2ca8d2a3d5aeff5.png",
      tags: ["Fitness", "Gym", "Sports"],
      services: ["Logo Design", "Sports Branding"],
      icon: <Dumbbell className="w-4 h-4" />
    },
    {
      id: 3,
      title: "Apex Realty Group",
      category: "logo",
      industry: "Real Estate",
      description: "Luxury real estate company logo featuring elegant house roof integrated with letter A. Gold and navy blue colors convey premium sophistication and trust.",
      image: "https://static.prod-images.emergentagent.com/jobs/db77f348-bb27-4fa4-a4d1-60882dce1ba8/images/32de6850fda80ec65526b6603a289ccc7b98d68c2ccab8de3c11630c69ff0b14.png",
      tags: ["Real Estate", "Luxury", "Corporate"],
      services: ["Logo Design", "Premium Branding"],
      icon: <Building2 className="w-4 h-4" />
    },
    {
      id: 4,
      title: "NexGen Solutions",
      category: "logo",
      industry: "Technology",
      description: "Modern tech startup logo featuring abstract geometric N letter with circuit board elements. Gradient blue and cyan colors reflect innovation and digital excellence.",
      image: "https://static.prod-images.emergentagent.com/jobs/db77f348-bb27-4fa4-a4d1-60882dce1ba8/images/15cf90825961d61748e699be67b1bb63897632fa75cc2e57a1b66b7cc82b162f.png",
      tags: ["Technology", "Startup", "SaaS"],
      services: ["Logo Design", "Tech Branding"],
      icon: <Cpu className="w-4 h-4" />
    },
    {
      id: 5,
      title: "Bloom Beauty Studio",
      category: "logo",
      industry: "Beauty",
      description: "Elegant beauty salon logo featuring stylized flower petals forming letter B. Soft pink and rose gold colors create a feminine, luxurious spa aesthetic.",
      image: "https://static.prod-images.emergentagent.com/jobs/db77f348-bb27-4fa4-a4d1-60882dce1ba8/images/48d3c74a0bd372933286c6549458b18df6cfd8d342d87f44fea6b5f595e7c57d.png",
      tags: ["Beauty", "Salon", "Wellness"],
      services: ["Logo Design", "Spa Branding"],
      icon: <Sparkles className="w-4 h-4" />
    },
    {
      id: 6,
      title: "BuildRight Construction",
      category: "logo",
      industry: "Construction",
      description: "Strong construction company logo featuring hard hat merged with building skyline. Bold orange and charcoal gray colors convey reliability and industrial strength.",
      image: "https://static.prod-images.emergentagent.com/jobs/db77f348-bb27-4fa4-a4d1-60882dce1ba8/images/5e1d5e56de500dace88286715ad281fa4659c264b9e3bcf63fe74004666d4324.png",
      tags: ["Construction", "Contractor", "Industrial"],
      services: ["Logo Design", "Trade Branding"],
      icon: <Hammer className="w-4 h-4" />
    },
    // Original Portfolio Items
    {
      id: 7,
      title: "EcoTech Solutions",
      category: "logo",
      industry: "Technology",
      description: "Modern eco-friendly tech company logo combining nature with industry. Features a leaf integrated into a gear design symbolizing sustainable technology.",
      image: "https://customer-assets.emergentagent.com/job_patjames-services/artifacts/cj2fsgei_EcoTech%20Solutions%20Logo%20-%20Nature%20and%20Industry_20251106_102749_0000.png",
      tags: ["Technology", "Eco-Friendly", "Sustainability"],
      services: ["Logo Design", "Brand Identity"],
      icon: <Cpu className="w-4 h-4" />
    },
    {
      id: 8,
      title: "Dreamy Designs",
      category: "logo",
      industry: "Creative",
      description: "Elegant and graceful logo for a creative design studio. Crescent moon with stars creates a dreamy, aspirational feel perfect for a creative brand.",
      image: "https://customer-assets.emergentagent.com/job_patjames-services/artifacts/8ippwcgh_Graceful%20Emblem%20for%20Dreamy%20Designs_20251106_102326_0000.png",
      tags: ["Creative", "Design Studio", "Elegant"],
      services: ["Logo Design", "Visual Identity"],
      icon: <Sparkles className="w-4 h-4" />
    },
    {
      id: 9,
      title: "Stellar Solutions",
      category: "logo",
      industry: "Business",
      description: "Dynamic business logo featuring a shooting star motif. The upward diagonal design conveys growth, ambition, and forward momentum.",
      image: "https://customer-assets.emergentagent.com/job_patjames-services/artifacts/yn1grkhy_Diagonal%20Shooting%20Star%20Logo%20for%20Stellar%20Solutions_20251106_103713_0000.png",
      tags: ["Business", "Corporate", "Modern"],
      services: ["Logo Design", "Branding"],
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      id: 10,
      title: "Pamela Learning Centre",
      category: "logo",
      industry: "Education",
      description: "Educational institution logo combining a graduate silhouette with an open book. Professional design that conveys knowledge and achievement.",
      image: "https://customer-assets.emergentagent.com/job_patjames-services/artifacts/h8f8j6r4_1762387705600.png",
      tags: ["Education", "Learning", "Professional"],
      services: ["Logo Design", "Brand Identity"],
      icon: <GraduationCap className="w-4 h-4" />
    },
    {
      id: 11,
      title: "Zina Logistics Ltd",
      category: "logo",
      industry: "Logistics",
      description: "Bold transportation company logo featuring a red semi-truck on a highway. Strong visual identity perfect for the logistics and freight industry.",
      image: "https://customer-assets.emergentagent.com/job_patjames-services/artifacts/821v0hj2_1762387831661.png",
      tags: ["Logistics", "Transport", "Freight"],
      services: ["Logo Design", "Commercial Branding"],
      icon: <Truck className="w-4 h-4" />
    },
    {
      id: 12,
      title: "Chess Royale Apparel",
      category: "apparel",
      industry: "Fashion",
      description: "Premium t-shirt design featuring life-sized gold chess pieces wielding swords. Luxurious aesthetic perfect for high-end apparel and merchandise.",
      image: "https://customer-assets.emergentagent.com/job_patjames-services/artifacts/pxog9cao_Lets%20create%20a%20t%20shirt%20design%20life%20sized%20chess%20pieces%20holding%20gold%20swords%20an_20251202_192203_0000.jpg",
      tags: ["Apparel", "T-Shirt", "Premium"],
      services: ["Graphic Design", "Merchandise Design"],
      icon: <Palette className="w-4 h-4" />
    }
  ];

  // Dashboard projects - with actual screenshots
  const dashboardProjects = [
    {
      id: 13,
      title: "NewReach Control",
      category: "dashboard",
      industry: "Logistics",
      description: "Real-time logistics management dashboard featuring fleet overview, AI command center with insights, risk monitoring, and smart pricing calculator. Built for transportation and delivery businesses.",
      image: "https://customer-assets.emergentagent.com/job_patjames-services/artifacts/ct2p0ab4_2e1eedfc1742cba5fc174dc12bc2d0e6cdd84656ead88e4895954739f92dab31.jpeg",
      tags: ["Dashboard", "Logistics", "Fleet Management", "AI"],
      services: ["UI/UX Design", "Web Development", "AI Integration"],
      icon: <Truck className="w-4 h-4" />
    },
    {
      id: 14,
      title: "Incident Management System",
      category: "dashboard",
      industry: "Security",
      description: "Security incident tracking dashboard with real-time status monitoring, incident creation, and resolution workflow. Track open, investigating, and resolved incidents at a glance.",
      image: "https://customer-assets.emergentagent.com/job_patjames-services/artifacts/khi9pr9y_750071547b109544196c70dd1efaf0ef88226e65b03e995702410b64f08dfba9.jpeg",
      tags: ["Dashboard", "Security", "Incident Tracking"],
      services: ["UI/UX Design", "Web Development"],
      icon: <Monitor className="w-4 h-4" />
    },
    {
      id: 15,
      title: "MoneyRadar OS - Discovery",
      category: "dashboard",
      industry: "Finance",
      description: "AI-powered opportunity intelligence platform with automated job and opportunity discovery across 31 platforms. Features sentiment analysis and smart filtering for freelancers and job seekers.",
      image: "https://customer-assets.emergentagent.com/job_patjames-services/artifacts/b75gvk8z_ab6ce1ff1745006eb930cd2721321d5d5c64ca51a17b3e5e92b18a8f2fc57c46.jpeg",
      tags: ["Dashboard", "AI", "Career", "Finance"],
      services: ["UI/UX Design", "Web Development", "AI Integration"],
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      id: 16,
      title: "MoneyRadar OS - Command Center",
      category: "dashboard",
      industry: "Finance",
      description: "Central command dashboard with intelligence modules, system capabilities overview, and quick actions. Features career tracking, salary negotiation tools, and certification recommendations.",
      image: "https://customer-assets.emergentagent.com/job_patjames-services/artifacts/mt67txa4_2aa676a286df5c51d0e6d4f1d0c71ffdbbd2e242b2d94c7dd35f037f3e306023.jpeg",
      tags: ["Dashboard", "Intelligence", "Analytics", "Career"],
      services: ["UI/UX Design", "Web Development", "AI Integration"],
      icon: <Monitor className="w-4 h-4" />
    }
  ];

  const allWorks = [...portfolioItems, ...dashboardProjects];

  const filteredWorks = activeFilter === 'all' 
    ? allWorks 
    : allWorks.filter(item => item.category === activeFilter);

  const categories = [
    { id: 'all', label: 'All Work', count: allWorks.length },
    { id: 'logo', label: 'Logo Design', count: portfolioItems.filter(i => i.category === 'logo').length },
    { id: 'apparel', label: 'Apparel', count: portfolioItems.filter(i => i.category === 'apparel').length },
    { id: 'dashboard', label: 'Dashboards', count: dashboardProjects.length }
  ];

  const industries = [...new Set(portfolioItems.map(item => item.industry))];

  const overallMetrics = [
    { label: "Logo Designs", value: "50+" },
    { label: "Industries Served", value: "30+" },
    { label: "Happy Clients", value: "100%" },
    { label: "Years Experience", value: "5+" }
  ];

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-cyan-600/20 text-cyan-400 border-cyan-500/30">
            Portfolio
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Designs That Make an Impact
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            From restaurants to tech startups, real estate to fitness - explore logos and designs
            crafted for businesses across every industry.
          </p>
        </div>
      </section>

      {/* Overall Metrics */}
      <section className="py-12 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {overallMetrics.map((metric, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">{metric.value}</div>
                <div className="text-gray-400">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Served */}
      <section className="py-8 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 mb-4">Industries I've designed for:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {industries.map((industry, idx) => (
              <Badge key={idx} variant="outline" className="text-gray-400 border-gray-600">
                {industry}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-8 border-b border-slate-700 sticky top-16 bg-slate-900/95 backdrop-blur-md z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`flex items-center px-6 py-3 rounded-full transition-all ${
                  activeFilter === cat.id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white'
                }`}
                data-testid={`filter-${cat.id}`}
              >
                {cat.label}
                <span className="ml-2 text-xs bg-slate-900/50 px-2 py-0.5 rounded-full">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredWorks.map((work) => (
              <Card 
                key={work.id} 
                className={`bg-slate-800/50 border-slate-700 overflow-hidden group cursor-pointer transition-all hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 ${work.comingSoon ? 'opacity-75' : ''}`}
                onClick={() => !work.comingSoon && setSelectedWork(work)}
                data-testid={`portfolio-item-${work.id}`}
              >
                <div className="relative aspect-square overflow-hidden bg-slate-900">
                  {work.image ? (
                    <img 
                      src={work.image} 
                      alt={work.title}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <Monitor className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <span className="text-slate-500">Coming Soon</span>
                      </div>
                    </div>
                  )}
                  {work.comingSoon && (
                    <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                      <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-500/30">
                        Coming Soon
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-slate-900/80 text-gray-300 border-slate-700 flex items-center gap-1">
                      {work.icon}
                      {work.industry}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-white font-medium flex items-center">
                      View Details <ExternalLink className="w-4 h-4 ml-2" />
                    </span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold text-white mb-1">{work.title}</h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{work.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {work.tags.slice(0, 2).map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs text-cyan-400 border-cyan-500/30">
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

      {/* Modal for detailed view */}
      {selectedWork && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedWork(null)}
        >
          <div 
            className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <button 
                onClick={() => setSelectedWork(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-slate-900/80 rounded-full text-white hover:bg-slate-700"
                data-testid="close-modal"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="bg-slate-900 p-8">
                <img 
                  src={selectedWork.image} 
                  alt={selectedWork.title}
                  className="max-h-96 mx-auto object-contain"
                />
              </div>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-cyan-600/20 text-cyan-400">
                  {selectedWork.industry}
                </Badge>
                <Badge variant="outline" className="text-gray-400 border-gray-600">
                  {selectedWork.category === 'logo' ? 'Logo Design' : selectedWork.category}
                </Badge>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">{selectedWork.title}</h2>
              <p className="text-gray-300 mb-6">{selectedWork.description}</p>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Services Provided</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedWork.services.map((service, i) => (
                    <Badge key={i} className="bg-cyan-600/20 text-cyan-400">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedWork.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-gray-400 border-gray-600">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-700">
                <p className="text-gray-400 mb-4">Want something similar for your business?</p>
                <Link to="/get-quote">
                  <Button className="bg-gradient-to-r from-cyan-500 to-purple-600">
                    Get Your Custom Design
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Highlight */}
      <section className="py-16 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Design Services</h2>
            <p className="text-gray-400">Professional design solutions for every business need</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="bg-slate-800/50 border-slate-700 p-6 text-center hover:border-cyan-500/50 transition-colors">
              <Palette className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Logo Design</h3>
              <p className="text-gray-400 text-sm mb-3">Custom logos that capture your brand essence</p>
              <p className="text-cyan-400 font-bold">From $150</p>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700 p-6 text-center hover:border-cyan-500/50 transition-colors">
              <Layout className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Brand Identity</h3>
              <p className="text-gray-400 text-sm mb-3">Complete branding packages with guidelines</p>
              <p className="text-cyan-400 font-bold">From $750</p>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700 p-6 text-center hover:border-cyan-500/50 transition-colors">
              <Monitor className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Web Design</h3>
              <p className="text-gray-400 text-sm mb-3">Modern websites that convert visitors</p>
              <p className="text-cyan-400 font-bold">From $325</p>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700 p-6 text-center hover:border-cyan-500/50 transition-colors">
              <TrendingUp className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Marketing Design</h3>
              <p className="text-gray-400 text-sm mb-3">Social media and ad graphics</p>
              <p className="text-cyan-400 font-bold">From $500</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-cyan-900/30 to-purple-900/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Elevate Your Brand?
          </h2>
          <p className="text-gray-300 mb-8">
            Let's create something amazing together. Get a free quote for your project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/get-quote">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
                Get Your Free Quote
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/services">
              <Button size="lg" variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                View All Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProofPage;
