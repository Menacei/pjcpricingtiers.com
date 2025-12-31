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
  X
} from 'lucide-react';

const ProofPage = () => {
  const [selectedWork, setSelectedWork] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // Portfolio items - Logo designs
  const portfolioItems = [
    {
      id: 1,
      title: "EcoTech Solutions",
      category: "logo",
      description: "Modern eco-friendly tech company logo combining nature with industry. Features a leaf integrated into a gear design symbolizing sustainable technology.",
      image: "https://customer-assets.emergentagent.com/job_patjames-services/artifacts/cj2fsgei_EcoTech%20Solutions%20Logo%20-%20Nature%20and%20Industry_20251106_102749_0000.png",
      tags: ["Logo Design", "Branding", "Tech"],
      services: ["Logo Design", "Brand Identity"]
    },
    {
      id: 2,
      title: "Dreamy Designs",
      category: "logo",
      description: "Elegant and graceful logo for a creative design studio. Crescent moon with stars creates a dreamy, aspirational feel perfect for a creative brand.",
      image: "https://customer-assets.emergentagent.com/job_patjames-services/artifacts/8ippwcgh_Graceful%20Emblem%20for%20Dreamy%20Designs_20251106_102326_0000.png",
      tags: ["Logo Design", "Creative", "Elegant"],
      services: ["Logo Design", "Visual Identity"]
    },
    {
      id: 3,
      title: "Stellar Solutions",
      category: "logo",
      description: "Dynamic business logo featuring a shooting star motif. The upward diagonal design conveys growth, ambition, and forward momentum.",
      image: "https://customer-assets.emergentagent.com/job_patjames-services/artifacts/yn1grkhy_Diagonal%20Shooting%20Star%20Logo%20for%20Stellar%20Solutions_20251106_103713_0000.png",
      tags: ["Logo Design", "Corporate", "Modern"],
      services: ["Logo Design", "Branding"]
    },
    {
      id: 4,
      title: "Pamela Learning Centre",
      category: "logo",
      description: "Educational institution logo combining a graduate silhouette with an open book. Professional design that conveys knowledge and achievement.",
      image: "https://customer-assets.emergentagent.com/job_patjames-services/artifacts/h8f8j6r4_1762387705600.png",
      tags: ["Logo Design", "Education", "Professional"],
      services: ["Logo Design", "Brand Identity"]
    },
    {
      id: 5,
      title: "Zina Logistics Ltd",
      category: "logo",
      description: "Bold transportation company logo featuring a red semi-truck on a highway. Strong visual identity perfect for the logistics and freight industry.",
      image: "https://customer-assets.emergentagent.com/job_patjames-services/artifacts/821v0hj2_1762387831661.png",
      tags: ["Logo Design", "Transport", "Industrial"],
      services: ["Logo Design", "Commercial Branding"]
    },
    {
      id: 6,
      title: "Chess Royale Apparel",
      category: "apparel",
      description: "Premium t-shirt design featuring life-sized gold chess pieces wielding swords. Luxurious aesthetic perfect for high-end apparel and merchandise.",
      image: "https://customer-assets.emergentagent.com/job_patjames-services/artifacts/pxog9cao_Lets%20create%20a%20t%20shirt%20design%20life%20sized%20chess%20pieces%20holding%20gold%20swords%20an_20251202_192203_0000.jpg",
      tags: ["Apparel Design", "T-Shirt", "Premium"],
      services: ["Graphic Design", "Merchandise Design"]
    }
  ];

  // Dashboard projects - placeholders for now
  const dashboardProjects = [
    {
      id: 7,
      title: "LogiDash",
      category: "dashboard",
      description: "Comprehensive logistics management dashboard with real-time tracking, fleet management, and analytics.",
      image: null, // Placeholder - will be added
      tags: ["Dashboard", "Web App", "Logistics"],
      services: ["UI/UX Design", "Web Development"],
      comingSoon: true
    },
    {
      id: 8,
      title: "MoneyRadar",
      category: "dashboard",
      description: "Personal finance tracking dashboard with expense analytics, budget management, and investment tracking.",
      image: null, // Placeholder - will be added
      tags: ["Dashboard", "Finance", "Analytics"],
      services: ["UI/UX Design", "Web Development"],
      comingSoon: true
    }
  ];

  const allWorks = [...portfolioItems, ...dashboardProjects];

  const filteredWorks = activeFilter === 'all' 
    ? allWorks 
    : allWorks.filter(item => item.category === activeFilter);

  const categories = [
    { id: 'all', label: 'All Work', icon: Layout },
    { id: 'logo', label: 'Logo Design', icon: Palette },
    { id: 'dashboard', label: 'Dashboards', icon: Monitor },
    { id: 'apparel', label: 'Apparel', icon: TrendingUp }
  ];

  // Overall metrics
  const overallMetrics = [
    { label: "Projects Completed", value: "50+" },
    { label: "Logo Designs", value: "30+" },
    { label: "Dashboards Built", value: "15+" },
    { label: "Happy Clients", value: "100%" }
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
            My Work Speaks for Itself
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            From logo designs to full-stack dashboards - here's a showcase of projects
            that demonstrate my range and capabilities.
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

      {/* Filter Tabs */}
      <section className="py-8 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
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
                  <Icon className="w-4 h-4 mr-2" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                        <span className="text-slate-500">Screenshot Coming Soon</span>
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
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-white font-medium flex items-center">
                      View Details <ExternalLink className="w-4 h-4 ml-2" />
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{work.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{work.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {work.tags.slice(0, 3).map((tag, i) => (
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
            </div>
          </div>
        </div>
      )}

      {/* Services Highlight */}
      <section className="py-16 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">What I Create</h2>
            <p className="text-gray-400">Full-service design and development capabilities</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 p-6 text-center">
              <Palette className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Logo & Branding</h3>
              <p className="text-gray-400">Custom logos, brand identities, and visual guidelines that make businesses stand out.</p>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700 p-6 text-center">
              <Monitor className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Web Applications</h3>
              <p className="text-gray-400">Full-stack dashboards, admin panels, and custom web applications with modern tech.</p>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700 p-6 text-center">
              <TrendingUp className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Marketing Design</h3>
              <p className="text-gray-400">T-shirt designs, merchandise graphics, and marketing materials that convert.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-cyan-900/30 to-purple-900/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-gray-300 mb-8">
            Let's create something amazing together. Get a free quote for your project.
          </p>
          <Link to="/get-quote">
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
              Get Your Free Quote
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ProofPage;
