import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Search,
  Globe,
  Users,
  BarChart3,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Target,
  Lightbulb
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ToolsPage = () => {
  const [activeTab, setActiveTab] = useState('website');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Form states
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [leadLocation, setLeadLocation] = useState('');
  const [leadIndustry, setLeadIndustry] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [contentTopic, setContentTopic] = useState('');
  const [contentIndustry, setContentIndustry] = useState('');

  const analyzeWebsite = async () => {
    if (!websiteUrl) return;
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await axios.post(`${API}/tools/analyze-website`, {
        url: websiteUrl,
        analysis_type: 'full'
      });
      setResults(response.data);
    } catch (err) {
      setError('Failed to analyze website. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const findLeads = async () => {
    if (!leadLocation || !leadIndustry) return;
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await axios.post(`${API}/tools/find-leads`, {
        location: leadLocation,
        industry: leadIndustry
      });
      setResults(response.data);
    } catch (err) {
      setError('Failed to search for leads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeCompetitor = async () => {
    if (!competitorUrl) return;
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await axios.post(`${API}/tools/competitor-analysis`, {
        competitor_url: competitorUrl
      });
      setResults(response.data);
    } catch (err) {
      setError('Failed to analyze competitor. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const researchContent = async () => {
    if (!contentTopic) return;
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await axios.post(`${API}/tools/content-research`, {
        topic: contentTopic,
        industry: contentIndustry || null
      });
      setResults(response.data);
    } catch (err) {
      setError('Failed to research content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const renderWebsiteResults = () => {
    if (!results || !results.success) return null;

    const { seo_data, quality_analysis, contact_info, ai_insights } = results;
    
    // Safe defaults for nested objects
    const safeQuality = quality_analysis || { overall_score: 0, scores: {}, issues: [], recommendations: [] };
    const safeSeo = seo_data || { title: '', title_length: 0, description: '', description_length: 0, word_count: 0, internal_links_count: 0, total_images: 0, h1_tags: [] };

    return (
      <div className="space-y-6">
        {/* Score Overview */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className={`text-6xl font-bold ${getScoreColor(safeQuality.overall_score || 0)}`}>
                {safeQuality.overall_score || 0}
              </div>
              <span className="text-2xl text-gray-400 ml-2">/100</span>
            </div>
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        {safeQuality.scores && Object.keys(safeQuality.scores).length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(safeQuality.scores).map(([key, score]) => (
                  <div key={key} className="text-center p-3 bg-slate-900/50 rounded-lg">
                    <div className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</div>
                    <div className="text-xs text-gray-400 capitalize">{key}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Issues & Recommendations */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                Issues Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              {safeQuality.issues && safeQuality.issues.length > 0 ? (
                <ul className="space-y-2">
                  {safeQuality.issues.map((issue, idx) => (
                    <li key={idx} className="flex items-start text-gray-300">
                      <XCircle className="w-4 h-4 mr-2 text-red-400 flex-shrink-0 mt-0.5" />
                      {issue}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-400">No major issues found</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-cyan-400" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {safeQuality.recommendations && safeQuality.recommendations.length > 0 ? (
                <ul className="space-y-2">
                  {safeQuality.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start text-gray-300">
                      <CheckCircle className="w-4 h-4 mr-2 text-cyan-400 flex-shrink-0 mt-0.5" />
                      {rec}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No recommendations available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* SEO Data */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">SEO Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm">Title ({safeSeo.title_length || 0} chars)</label>
              <p className="text-white bg-slate-900/50 p-2 rounded">{safeSeo.title || 'Not found'}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Meta Description ({safeSeo.description_length || 0} chars)</label>
              <p className="text-white bg-slate-900/50 p-2 rounded">{safeSeo.description || 'Not found'}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-slate-900/50 rounded">
                <div className="text-xl font-bold text-white">{safeSeo.word_count || 0}</div>
                <div className="text-xs text-gray-400">Words</div>
              </div>
              <div className="text-center p-3 bg-slate-900/50 rounded">
                <div className="text-xl font-bold text-white">{safeSeo.internal_links_count || 0}</div>
                <div className="text-xs text-gray-400">Internal Links</div>
              </div>
              <div className="text-center p-3 bg-slate-900/50 rounded">
                <div className="text-xl font-bold text-white">{safeSeo.total_images || 0}</div>
                <div className="text-xs text-gray-400">Images</div>
              </div>
              <div className="text-center p-3 bg-slate-900/50 rounded">
                <div className="text-xl font-bold text-white">{safeSeo.h1_tags?.length || 0}</div>
                <div className="text-xs text-gray-400">H1 Tags</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        {ai_insights && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 whitespace-pre-line">{ai_insights}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderLeadResults = () => {
    if (!results || !results.success) return null;

    const strategies = results.search_strategies || [];
    const criteria = results.lead_criteria || [];

    return (
      <div className="space-y-6">
        {strategies.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Search Strategies</CardTitle>
              <CardDescription>Click to search these directories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {strategies.map((strategy, idx) => (
                  <a
                    key={idx}
                    href={strategy.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-slate-900/50 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">{strategy.source}</span>
                      <ExternalLink className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-sm text-gray-400">{strategy.query}</p>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {criteria.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">What to Look For</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {criteria.map((item, idx) => (
                  <li key={idx} className="flex items-center text-gray-300">
                    <Target className="w-4 h-4 mr-2 text-cyan-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {results.ai_recommendations && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 whitespace-pre-line">{results.ai_recommendations}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderCompetitorResults = () => {
    if (!results || !results.success) return null;

    const safeSeo = results.seo_data || { title: '', description: '', word_count: 0, internal_links_count: 0, total_images: 0 };
    const safeStrengths = results.strengths || [];
    const safeWeaknesses = results.weaknesses || [];

    return (
      <div className="space-y-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Competitor Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm">Title</label>
              <p className="text-white">{safeSeo.title || 'Not found'}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Description</label>
              <p className="text-white">{safeSeo.description || 'Not found'}</p>
            </div>
            {results.technologies_detected && results.technologies_detected.length > 0 && (
              <div>
                <label className="text-gray-400 text-sm">Technologies Detected</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {results.technologies_detected.map((tech, idx) => (
                    <Badge key={idx} className="bg-slate-700 text-gray-300">{tech}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {results.contact_info && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Contact Info Found</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {results.contact_info.emails?.length > 0 && (
                  <div>
                    <label className="text-gray-400 text-sm">Emails</label>
                    <ul className="mt-1">
                      {results.contact_info.emails.map((email, idx) => (
                        <li key={idx} className="text-cyan-400">{email}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {results.contact_info.phones?.length > 0 && (
                  <div>
                    <label className="text-gray-400 text-sm">Phone Numbers</label>
                    <ul className="mt-1">
                      {results.contact_info.phones.map((phone, idx) => (
                        <li key={idx} className="text-white">{phone}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {results.ai_analysis && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 whitespace-pre-line">{results.ai_analysis}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderContentResults = () => {
    if (!results || !results.success) return null;

    const tips = results.planning_tips || [];

    return (
      <div className="space-y-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Content Ideas for "{results.topic || 'Your Topic'}"</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 whitespace-pre-line">{results.content_ideas || 'No content ideas available'}</p>
          </CardContent>
        </Card>

        {tips.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Content Planning Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start text-gray-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-cyan-400 flex-shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="py-12 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-cyan-600/20 text-cyan-400 border-cyan-500/30">
            AI-Powered Tools
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Free Business Tools
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Analyze websites, find leads, research competitors, and generate content ideas.
          </p>
        </div>
      </section>

      {/* Tools */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setResults(null); setError(null); }}>
            <TabsList className="grid grid-cols-4 bg-slate-800 mb-8">
              <TabsTrigger value="website" className="data-[state=active]:bg-cyan-600">
                <Globe className="w-4 h-4 mr-2" />
                Website
              </TabsTrigger>
              <TabsTrigger value="leads" className="data-[state=active]:bg-cyan-600">
                <Users className="w-4 h-4 mr-2" />
                Leads
              </TabsTrigger>
              <TabsTrigger value="competitor" className="data-[state=active]:bg-cyan-600">
                <BarChart3 className="w-4 h-4 mr-2" />
                Competitor
              </TabsTrigger>
              <TabsTrigger value="content" className="data-[state=active]:bg-cyan-600">
                <FileText className="w-4 h-4 mr-2" />
                Content
              </TabsTrigger>
            </TabsList>

            {/* Website Analyzer */}
            <TabsContent value="website">
              <Card className="bg-slate-800/50 border-slate-700 mb-8">
                <CardHeader>
                  <CardTitle className="text-white">Website Analyzer</CardTitle>
                  <CardDescription>Analyze any website for SEO, content quality, and issues</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Input
                      placeholder="Enter website URL (e.g., example.com)"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Button onClick={analyzeWebsite} disabled={loading || !websiteUrl}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                      Analyze
                    </Button>
                  </div>
                </CardContent>
              </Card>
              {renderWebsiteResults()}
            </TabsContent>

            {/* Lead Finder */}
            <TabsContent value="leads">
              <Card className="bg-slate-800/50 border-slate-700 mb-8">
                <CardHeader>
                  <CardTitle className="text-white">Lead Finder</CardTitle>
                  <CardDescription>Find potential business leads by location and industry</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Location (e.g., Kansas City)"
                      value={leadLocation}
                      onChange={(e) => setLeadLocation(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Input
                      placeholder="Industry (e.g., restaurants)"
                      value={leadIndustry}
                      onChange={(e) => setLeadIndustry(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Button onClick={findLeads} disabled={loading || !leadLocation || !leadIndustry}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                      Find Leads
                    </Button>
                  </div>
                </CardContent>
              </Card>
              {renderLeadResults()}
            </TabsContent>

            {/* Competitor Analyzer */}
            <TabsContent value="competitor">
              <Card className="bg-slate-800/50 border-slate-700 mb-8">
                <CardHeader>
                  <CardTitle className="text-white">Competitor Analyzer</CardTitle>
                  <CardDescription>Analyze your competitor's website and strategy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Input
                      placeholder="Competitor URL (e.g., competitor.com)"
                      value={competitorUrl}
                      onChange={(e) => setCompetitorUrl(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Button onClick={analyzeCompetitor} disabled={loading || !competitorUrl}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                      Analyze
                    </Button>
                  </div>
                </CardContent>
              </Card>
              {renderCompetitorResults()}
            </TabsContent>

            {/* Content Research */}
            <TabsContent value="content">
              <Card className="bg-slate-800/50 border-slate-700 mb-8">
                <CardHeader>
                  <CardTitle className="text-white">Content Research</CardTitle>
                  <CardDescription>Generate content ideas and SEO strategies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Topic (e.g., web design tips)"
                      value={contentTopic}
                      onChange={(e) => setContentTopic(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Input
                      placeholder="Industry (optional)"
                      value={contentIndustry}
                      onChange={(e) => setContentIndustry(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Button onClick={researchContent} disabled={loading || !contentTopic}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                      Research
                    </Button>
                  </div>
                </CardContent>
              </Card>
              {renderContentResults()}
            </TabsContent>
          </Tabs>

          {/* Error Display */}
          {error && (
            <Card className="bg-red-900/20 border-red-500/30 mt-4">
              <CardContent className="p-4">
                <p className="text-red-400">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              <span className="ml-3 text-gray-400">Analyzing...</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ToolsPage;
