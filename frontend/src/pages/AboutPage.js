import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  ArrowRight,
  Code,
  Brain,
  Truck,
  Shirt,
  MapPin,
  Mail,
  Calendar,
  CheckCircle
} from 'lucide-react';

const AboutPage = () => {
  const skills = [
    "AI Integration & Chatbots",
    "Web Design & Development",
    "Lead Generation Systems",
    "Marketing Automation",
    "E-commerce Solutions",
    "SEO Optimization"
  ];

  const ventures = [
    {
      name: "Web Design & AI",
      description: "AI-powered websites for small businesses",
      icon: <Code className="w-6 h-6" />
    },
    {
      name: "NewReach Transport LLC",
      description: "Box truck and moving services in KC",
      icon: <Truck className="w-6 h-6" />
    },
    {
      name: "Menace Apparel",
      description: "Streetwear brand (Coming Soon)",
      icon: <Shirt className="w-6 h-6" />
    }
  ];

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-purple-600/20 text-purple-400 border-purple-500/30">
                About Me
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Hey, I'm Pat Church
              </h1>
              <div className="space-y-4 text-gray-300">
                <p className="text-lg">
                  I'm a <span className="text-cyan-400 font-semibold">web designer, AI specialist, and entrepreneur</span> based in Kansas City, MO.
                </p>
                <p>
                  I believe in doing things differently. While most web designers just make things look pretty, 
                  I build digital systems that actually work for your business—generating leads, nurturing customers, 
                  and helping you close deals.
                </p>
                <p>
                  My approach combines modern web design with AI and automation to create websites that 
                  work 24/7, even while you sleep.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-8">
                <a href="tel:+18163668960" className="flex items-center text-gray-400 hover:text-cyan-400">
                  <Phone className="w-5 h-5 mr-2 text-green-400" />
                  (816) 366-8960
                </a>
                <a href="mailto:Patrickjchurch04@gmail.com" className="flex items-center text-gray-400 hover:text-cyan-400">
                  <Mail className="w-5 h-5 mr-2 text-cyan-400" />
                  Email Me
                </a>
                <div className="flex items-center text-gray-400">
                  <MapPin className="w-5 h-5 mr-2 text-purple-400" />
                  Kansas City, MO
                </div>
                <a href="https://www.youtube.com/@Patrick-z8m4b" target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-400 hover:text-red-400">
                  <Youtube className="w-5 h-5 mr-2 text-red-400" />
                  YouTube
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center mb-4">
                    <span className="text-5xl font-bold text-white">P</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Patrick Church</h3>
                  <p className="text-gray-400">Web Designer & AI Specialist</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">What I Bring to the Table</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {skills.map((skill, idx) => (
              <div key={idx} className="flex items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <CheckCircle className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0" />
                <span className="text-gray-300">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* My Ventures */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">My Ventures</h2>
            <p className="text-gray-400">I wear many hats—here's what I'm building</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {ventures.map((venture, idx) => (
              <Card key={idx} className="bg-slate-800/50 border-slate-700 text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-cyan-400 mb-4">
                    {venture.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{venture.name}</h3>
                  <p className="text-gray-400 text-sm">{venture.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-cyan-900/30 to-purple-900/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Let's Work Together
          </h2>
          <p className="text-gray-300 mb-8">
            Ready to build something amazing? I'd love to hear about your project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/get-quote">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
                Get a Free Quote
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <a href="https://calendly.com/patrickjchurch" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                <Calendar className="mr-2 w-5 h-5" />
                Book a Call
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
