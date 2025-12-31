import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Calendar, Clock, Tag, User, Search, ArrowRight, Mail, CheckCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BlogPage = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const categories = [
    { id: 'all', label: 'All Posts' },
    { id: 'Design Trends', label: 'Design Trends' },
    { id: 'Development', label: 'Development' },
    { id: 'AI & Technology', label: 'AI & Tech' },
    { id: 'Social Media', label: 'Social Media' },
    { id: 'Business Tips', label: 'Business' }
  ];

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await axios.get(`${API}/blog?limit=20`);
        setBlogPosts(response.data);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogPosts();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setSubscribing(true);
    try {
      await axios.post(`${API}/newsletter/subscribe`, { email, name: '' });
      setSubscribed(true);
      setEmail('');
    } catch (error) {
      console.error("Error subscribing:", error);
    } finally {
      setSubscribing(false);
    }
  };

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="pt-16 bg-slate-900 min-h-screen">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-cyan-600/20 text-cyan-400 border-cyan-500/30">
            Blog
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Latest Insights & Tips
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Thoughts on AI, automation, web design, logo creation, and building profitable online businesses.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-slate-800 border-slate-700 text-white h-12 text-lg"
              data-testid="blog-search"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 border-b border-slate-700 sticky top-16 bg-slate-900/95 backdrop-blur-md z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white'
                }`}
                data-testid={`category-${cat.id}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg mb-4">
                {searchTerm || activeCategory !== 'all' 
                  ? 'No posts match your search criteria.' 
                  : 'No blog posts yet. Check back soon!'}
              </p>
              {(searchTerm || activeCategory !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <Card 
                  key={index} 
                  className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden group"
                  data-testid={`blog-post-${index}`}
                >
                  <div className="relative overflow-hidden">
                    <img 
                      src={post.featured_image} 
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-cyan-600 text-white">{post.category}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center text-gray-400 text-sm mb-3 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(post.timestamp).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {post.reading_time} min read
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-400 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags && post.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-slate-700 text-gray-300 text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-400">
                        <User className="w-4 h-4 mr-2" />
                        <span className="text-sm">{post.author}</span>
                      </div>
                      <span className="text-cyan-400 text-sm font-medium group-hover:underline cursor-pointer flex items-center">
                        Read More <ArrowRight className="w-4 h-4 ml-1" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gradient-to-r from-cyan-900/30 to-purple-900/30">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Mail className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-gray-300 mb-8">
            Get the latest insights on web design, AI tools, and business growth tips delivered to your inbox.
          </p>
          
          {subscribed ? (
            <div className="flex items-center justify-center text-green-400">
              <CheckCircle className="w-6 h-6 mr-2" />
              <span className="text-lg">Thanks for subscribing!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-slate-800 border-slate-700 text-white"
                required
                data-testid="newsletter-email"
              />
              <Button 
                type="submit" 
                disabled={subscribing}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                data-testid="newsletter-submit"
              >
                {subscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* Topics Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Topics I Write About</h2>
            <p className="text-gray-400">Practical knowledge to help your business grow</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: 'Web Design', desc: 'Modern, conversion-focused designs', count: '12 articles' },
              { title: 'AI Integration', desc: 'Chatbots, automation, and AI tools', count: '8 articles' },
              { title: 'Logo & Branding', desc: 'Creating memorable brand identities', count: '6 articles' },
              { title: 'Business Growth', desc: 'Strategies for scaling online', count: '10 articles' }
            ].map((topic, idx) => (
              <Card key={idx} className="bg-slate-800/50 border-slate-700 p-6 hover:border-cyan-500/50 transition-colors cursor-pointer">
                <h3 className="text-lg font-bold text-white mb-2">{topic.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{topic.desc}</p>
                <span className="text-cyan-400 text-sm">{topic.count}</span>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
