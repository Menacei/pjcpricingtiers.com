import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  Users,
  TrendingUp,
  Calendar,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Phone,
  Building,
  DollarSign,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit,
  Lock,
  LogOut,
  Shield
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LeadsDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNote, setEditingNote] = useState('');
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Check for stored admin key on mount
  useEffect(() => {
    const storedKey = sessionStorage.getItem('adminApiKey');
    if (storedKey) {
      setAdminKey(storedKey);
      verifyKey(storedKey);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyKey = async (key) => {
    try {
      await axios.get(`${API}/admin/verify`, {
        headers: { 'X-Admin-Key': key }
      });
      setIsAuthenticated(true);
      setAdminKey(key);
    } catch (error) {
      sessionStorage.removeItem('adminApiKey');
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    
    try {
      const response = await axios.post(`${API}/admin/login`, {
        username: loginUsername,
        password: loginPassword
      });
      
      const key = response.data.api_key;
      sessionStorage.setItem('adminApiKey', key);
      setAdminKey(key);
      setIsAuthenticated(true);
    } catch (error) {
      setLoginError('Invalid credentials. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminApiKey');
    setAdminKey('');
    setIsAuthenticated(false);
    setLeads([]);
    setStats(null);
  };

  // Axios instance with auth header
  const authAxios = axios.create({
    headers: { 'X-Admin-Key': adminKey }
  });

  useEffect(() => {
    if (isAuthenticated && adminKey) {
      fetchLeads();
      fetchStats();
    }
  }, [filterStatus, filterSource, isAuthenticated, adminKey]);

  const fetchLeads = async () => {
    try {
      let url = `${API}/leads?limit=100`;
      if (filterStatus !== 'all') url += `&status=${filterStatus}`;
      if (filterSource !== 'all') url += `&source=${filterSource}`;
      
      const response = await authAxios.get(url);
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await authAxios.get(`${API}/leads/stats/summary`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      await authAxios.patch(`${API}/leads/${leadId}`, { status: newStatus });
      fetchLeads();
      fetchStats();
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const updateLeadNotes = async (leadId, notes) => {
    try {
      await authAxios.patch(`${API}/leads/${leadId}`, { notes });
      fetchLeads();
      setEditingNote('');
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  const deleteLead = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await authAxios.delete(`${API}/leads/${leadId}`);
      fetchLeads();
      fetchStats();
      setSelectedLead(null);
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      contacted: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      booked: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      closed: 'bg-green-500/20 text-green-400 border-green-500/30',
      lost: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  const getSourceIcon = (source) => {
    const icons = {
      organic: <TrendingUp className="w-4 h-4" />,
      paid: <DollarSign className="w-4 h-4" />,
      social: <Users className="w-4 h-4" />,
      referral: <MessageSquare className="w-4 h-4" />
    };
    return icons[source] || <AlertCircle className="w-4 h-4" />;
  };

  const filteredLeads = leads.filter(lead => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      lead.full_name?.toLowerCase().includes(search) ||
      lead.email?.toLowerCase().includes(search) ||
      lead.business_type?.toLowerCase().includes(search)
    );
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-12 flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-cyan-600/20 rounded-full">
                <Shield className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <CardTitle className="text-2xl text-white">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the lead dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {loginError}
                </div>
              )}
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Username</label>
                <Input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter username"
                  required
                  data-testid="admin-username"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Password</label>
                <Input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter password"
                  required
                  data-testid="admin-password"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginLoading}
                data-testid="admin-login-btn"
              >
                {loginLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                {loginLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Lead Dashboard</h1>
            <p className="text-gray-400">Manage and track your leads</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button onClick={() => { fetchLeads(); fetchStats(); }} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleLogout} variant="destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Leads</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                  </div>
                  <Users className="w-8 h-8 text-cyan-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">New</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.by_status?.new || 0}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Contacted</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.by_status?.contacted || 0}</p>
                  </div>
                  <Phone className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Booked</p>
                    <p className="text-2xl font-bold text-purple-400">{stats.by_status?.booked || 0}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Closed</p>
                    <p className="text-2xl font-bold text-green-400">{stats.by_status?.closed || 0}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name, email, or business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
              data-testid="lead-search"
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="organic">Organic</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Leads Table */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading leads...</div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No leads found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="leads-table">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-4 text-gray-400 font-medium">Lead</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Contact</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Business</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Budget</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Source</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr 
                        key={lead.id} 
                        className="border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer"
                        onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
                        data-testid={`lead-row-${lead.id}`}
                      >
                        <td className="p-4">
                          <div className="font-medium text-white">{lead.full_name}</div>
                          <div className="text-sm text-gray-400">Score: {lead.lead_score || 0}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-300 text-sm">{lead.email}</div>
                          <div className="text-gray-400 text-sm">{lead.phone || '-'}</div>
                        </td>
                        <td className="p-4 text-gray-300">{lead.business_type?.replace('_', ' ') || '-'}</td>
                        <td className="p-4 text-gray-300">{lead.budget_range?.replace('_', '-').replace('over', '$') || '-'}</td>
                        <td className="p-4">
                          <div className="flex items-center text-gray-300">
                            {getSourceIcon(lead.lead_source)}
                            <span className="ml-2 capitalize">{lead.lead_source}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-gray-400 text-sm">
                          {formatDate(lead.timestamp)}
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                            <Select 
                              value={lead.status} 
                              onValueChange={(value) => updateLeadStatus(lead.id, value)}
                            >
                              <SelectTrigger className="w-28 h-8 bg-slate-700 border-slate-600 text-white text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="booked">Booked</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                                <SelectItem value="lost">Lost</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lead Detail Panel */}
        {selectedLead && (
          <Card className="mt-6 bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white">{selectedLead.full_name}</CardTitle>
                  <p className="text-gray-400">{selectedLead.email}</p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => deleteLead(selectedLead.id)}
                  data-testid="delete-lead-btn"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-white mb-3">Contact Info</h4>
                  <div className="space-y-2 text-gray-300">
                    <p><Mail className="w-4 h-4 inline mr-2" />{selectedLead.email}</p>
                    <p><Phone className="w-4 h-4 inline mr-2" />{selectedLead.phone || 'Not provided'}</p>
                    <p><Building className="w-4 h-4 inline mr-2" />{selectedLead.business_type?.replace('_', ' ') || 'Not specified'}</p>
                    <p><DollarSign className="w-4 h-4 inline mr-2" />Budget: {selectedLead.budget_range?.replace('_', '-') || 'Not specified'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-3">Problem/Challenge</h4>
                  <p className="text-gray-300 bg-slate-900/50 p-3 rounded-lg">
                    {selectedLead.biggest_problem || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-white mb-3">Notes</h4>
                <Textarea
                  placeholder="Add notes about this lead..."
                  value={editingNote || selectedLead.notes || ''}
                  onChange={(e) => setEditingNote(e.target.value)}
                  className="bg-slate-900/50 border-slate-700 text-white mb-3"
                  data-testid="lead-notes"
                />
                <Button 
                  onClick={() => updateLeadNotes(selectedLead.id, editingNote)}
                  disabled={!editingNote}
                  data-testid="save-notes-btn"
                >
                  Save Notes
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700">
                <h4 className="font-medium text-white mb-3">Tracking Info</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Source:</span>
                    <span className="ml-2 text-gray-300 capitalize">{selectedLead.lead_source}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">UTM Source:</span>
                    <span className="ml-2 text-gray-300">{selectedLead.utm_source || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">UTM Medium:</span>
                    <span className="ml-2 text-gray-300">{selectedLead.utm_medium || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Landing Page:</span>
                    <span className="ml-2 text-gray-300">{selectedLead.landing_page || '-'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LeadsDashboard;
