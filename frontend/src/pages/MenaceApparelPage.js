import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Shirt,
  ArrowRight,
  Instagram,
  Mail,
  Clock
} from 'lucide-react';

const MenaceApparelPage = () => {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-purple-900/30 to-slate-900">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-purple-600/20 text-purple-400 border-purple-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Coming Soon
          </Badge>
          
          <div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white mb-8">
            <Shirt className="w-16 h-16" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Menace Apparel
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Streetwear with attitude. Bold designs for those who don't follow the crowd.
            <span className="block mt-2 text-purple-400 font-semibold">Launching Soon.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://www.instagram.com/menace_apparel" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-6 text-lg">
                <Instagram className="mr-2 w-5 h-5" />
                Follow on Instagram
              </Button>
            </a>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10 px-8 py-6 text-lg">
                <Mail className="mr-2 w-5 h-5" />
                Get Notified
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Teaser Section */}
      <section className="py-20 bg-slate-800/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">What's Coming</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Streetwear", desc: "Bold designs that make a statement" },
              { title: "Limited Drops", desc: "Exclusive releases you won't find anywhere else" },
              { title: "Quality First", desc: "Premium materials built to last" }
            ].map((item, idx) => (
              <Card key={idx} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12">
            <p className="text-gray-400 mb-4">
              Want to be the first to know when we drop?
            </p>
            <Link to="/contact">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                Join the Waitlist
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MenaceApparelPage;
