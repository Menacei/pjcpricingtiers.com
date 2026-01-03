import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  DollarSign,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  TrendingUp,
  ArrowLeft,
  Shield,
  Lock,
  LogOut
} from 'lucide-react';
import { Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PaymentsDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

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
    setPayments([]);
    setStats(null);
  };

  const authAxios = axios.create({
    headers: { 'X-Admin-Key': adminKey }
  });

  useEffect(() => {
    if (isAuthenticated && adminKey) {
      fetchPayments();
      fetchStats();
    }
  }, [filterStatus, isAuthenticated, adminKey]);

  const fetchPayments = async () => {
    try {
      let url = `${API}/admin/payments?limit=100`;
      if (filterStatus !== 'all') url += `&status=${filterStatus}`;
      
      const response = await authAxios.get(url);
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await authAxios.get(`${API}/admin/payments/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
      initiated: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPaymentMethodIcon = (method) => {
    if (method === 'paypal') {
      return <span className="text-blue-400 font-bold text-xs">PayPal</span>;
    }
    return <CreditCard className="w-4 h-4 text-purple-400" />;
  };

  const filteredPayments = payments.filter(payment => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      payment.customer_email?.toLowerCase().includes(search) ||
      payment.package_id?.toLowerCase().includes(search) ||
      payment.id?.toLowerCase().includes(search)
    );
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-12 flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-600/20 rounded-full">
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl text-white">Payments Dashboard</CardTitle>
            <p className="text-gray-400">Enter credentials to view payment data</p>
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
                className="w-full bg-green-600 hover:bg-green-700" 
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
            <div className="flex items-center gap-3 mb-2">
              <Link to="/admin/leads" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-bold text-white">Payments Dashboard</h1>
            </div>
            <p className="text-gray-400">Track Stripe & PayPal transactions</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button onClick={() => { fetchPayments(); fetchStats(); }} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Link to="/admin/leads">
              <Button variant="outline">
                View Leads
              </Button>
            </Link>
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
                    <p className="text-gray-400 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.total_revenue)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Completed</p>
                    <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Stripe</p>
                    <p className="text-2xl font-bold text-purple-400">{stats.by_method?.stripe || 0}</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">PayPal</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.by_method?.paypal || 0}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-400" />
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
              placeholder="Search by email, package, or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
              data-testid="payment-search"
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payments Table */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading payments...</div>
            ) : filteredPayments.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No payment transactions found</p>
                <p className="text-sm mt-2">Payments will appear here once customers make purchases</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="payments-table">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-4 text-gray-400 font-medium">Transaction</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Customer</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Package</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Amount</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Method</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr 
                        key={payment.id} 
                        className="border-b border-slate-700/50 hover:bg-slate-700/30"
                        data-testid={`payment-row-${payment.id}`}
                      >
                        <td className="p-4">
                          <div className="font-mono text-sm text-gray-300">
                            {payment.id?.substring(0, 8)}...
                          </div>
                          {payment.session_id && (
                            <div className="text-xs text-gray-500 mt-1">
                              Session: {payment.session_id?.substring(0, 12)}...
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-gray-300">{payment.customer_email || 'N/A'}</div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">
                            {payment.package_id?.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="text-white font-semibold">
                            {formatCurrency(payment.amount)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(payment.metadata?.payment_method)}
                            <span className="text-gray-400 text-sm capitalize">
                              {payment.metadata?.payment_method || 'stripe'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={`${getStatusColor(payment.payment_status)} flex items-center gap-1 w-fit`}>
                            {getStatusIcon(payment.payment_status)}
                            {payment.payment_status}
                          </Badge>
                        </td>
                        <td className="p-4 text-gray-400 text-sm">
                          {formatDate(payment.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentsDashboard;
