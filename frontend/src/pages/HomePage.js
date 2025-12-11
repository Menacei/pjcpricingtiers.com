import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  ArrowRight,
  Bot,
  Zap,
  TrendingUp,
  Globe,
  Code,
  Brain,
  Briefcase,
  CheckCircle,
  Sparkles,
  Truck,
  Package,
  Shirt
} from 'lucide-react';

const HomePage = () => {
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

  const ventures = [
    {
      name: "Web Design & AI",
      description: "AI-powered websites and automation for small businesses",
      icon: <Globe className="w-8 h-8" />,
      link: "/services",
      color: "from-cyan-400 to-blue-500"
    },
    {
      name: "NewReach Transport LLC",
      description: "Box truck services and affordable moving in Kansas City",
      icon: <Truck className="w-8 h-8" />,
      link: "/newreach-transport",
      color: "from-orange-400 to-red-500"
    },
    {
      name: "Menace Apparel",
      description: "Coming soon - streetwear with attitude",
      icon: <Shirt className="w-8 h-8" />,
      link: "/menace-apparel",
      color: "from-purple-400 to-pink-500"
    }
  ];

  return (
    <div>
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
            <Link to="/contact">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-6 text-lg">
                Start Your Project
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/services">
              <Button size="lg" variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 px-8 py-6 text-lg">
                View Services
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* About Section */}
      <section className="py-20 bg-slate-800/30">
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

      {/* My Ventures Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-cyan-600/20 text-cyan-400 border-cyan-500/30">
              What I Do
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              My Ventures
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              I wear many hats — from building AI-powered websites to running a transport company.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {ventures.map((venture, index) => (
              <Link to={venture.link} key={index}>
                <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 h-full cursor-pointer group">
                  <CardContent className="p-8 text-center">
                    <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r ${venture.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                      {venture.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                      {venture.name}
                    </h3>
                    <p className="text-gray-400 mb-4">{venture.description}</p>
                    <span className="text-cyan-400 inline-flex items-center">
                      Learn More <ArrowRight className="ml-2 w-4 h-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-800/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Let's talk about your project. Whether you need a website, moving help, or just want to chat—I'm here.
          </p>
          <Link to="/contact">
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-6 text-lg">
              Contact Me
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
