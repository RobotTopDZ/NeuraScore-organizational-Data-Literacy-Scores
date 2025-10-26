'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/layout/Navigation';

interface DashboardData {
  organization: {
    total_users: number;
    total_teams: number;
    avg_neurascore: number;
    data_maturity_level: string;
  };
  teams: any[];
  user_scores: any[];
  insights: any[];
  activity_timeline: any[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading dashboard data...');
      
      const response = await fetch('http://localhost:3000/api/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Dashboard API response:', result);
        if (result.success) {
          // Ensure numeric values are properly formatted
          const processedData = {
            ...result.data,
            organization: {
              ...result.data.organization,
              avg_neurascore: Number(result.data.organization.avg_neurascore || 0),
              total_users: Number(result.data.organization.total_users || 0),
              total_teams: Number(result.data.organization.total_teams || 0),
            },
            user_scores: (result.data.user_scores || []).map((user: any) => ({
              ...user,
              overall_score: Number(user.overall_score || 0)
            }))
          };
          setData(processedData);
        } else {
          setError('Failed to load dashboard data');
        }
      } else {
        setError(`API Error: ${response.status}`);
      }
    } catch (err: any) {
      console.error('Dashboard loading error:', err);
      setError(`Connection Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full border-4 border-blue-500 border-t-transparent w-16 h-16 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading NeuraScore Dashboard...</h2>
          <p className="text-gray-400">Fetching analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Dashboard Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="ml-2 text-xl font-bold text-white">NeuraScore</span>
            </div>
            <nav className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#" className="text-white bg-blue-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Teams</a>
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Users</a>
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Reports</a>
              </div>
            </nav>
            <button
              onClick={loadDashboardData}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">📊 Analytics Dashboard</h1>
            <p className="text-gray-400 mt-2">Real-time data literacy insights and organizational metrics</p>
          </div>

          {/* Organization Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">{data?.organization.total_users || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">🏢</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Teams</p>
                  <p className="text-2xl font-bold text-white">{data?.organization.total_teams || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">🎯</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Avg NeuraScore</p>
                  <p className="text-2xl font-bold text-white">{data?.organization.avg_neurascore?.toFixed(1) || '0.0'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">📈</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Maturity Level</p>
                  <p className="text-lg font-bold text-white">{data?.organization.data_maturity_level || 'Emerging'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Activity Timeline */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">📅 Recent Activity</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {data?.activity_timeline?.slice(0, 10).map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">🔍</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{activity.description || 'Data processing activity'}</p>
                        <p className="text-gray-400 text-xs">{activity.timestamp || 'Recent'}</p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No recent activity data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Top Performers */}
            <div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">🏆 Top Performers</h3>
                <div className="space-y-3">
                  {data?.user_scores?.slice(0, 5).map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{user.user_id || `User ${index + 1}`}</p>
                          <p className="text-gray-400 text-xs">Data Analyst</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{user.overall_score?.toFixed(1) || '0.0'}</p>
                        <p className="text-gray-400 text-xs">Score</p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No user scores available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Insights Section */}
          <div className="mt-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">💡 AI-Powered Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.insights?.slice(0, 6).map((insight, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">💡</span>
                      </div>
                      <div>
                        <h4 className="text-white font-medium text-sm">{insight.title || 'Data Insight'}</h4>
                        <p className="text-gray-400 text-xs mt-1">{insight.description || 'AI-generated recommendation for improving data literacy'}</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs mt-2 ${
                          insight.impact_level === 'high' ? 'bg-red-600 text-white' :
                          insight.impact_level === 'medium' ? 'bg-yellow-600 text-white' :
                          'bg-green-600 text-white'
                        }`}>
                          {insight.impact_level || 'medium'} impact
                        </span>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-400">No insights available. Generate insights by processing more data.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Data Processing Status */}
          <div className="mt-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">⚙️ System Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-2xl mb-2">🔄</div>
                  <p className="text-white font-medium">Data Processing</p>
                  <p className="text-green-400 text-sm">Completed</p>
                  <p className="text-gray-400 text-xs">9,461 users processed</p>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-2xl mb-2">🤖</div>
                  <p className="text-white font-medium">ML Models</p>
                  <p className="text-green-400 text-sm">Trained</p>
                  <p className="text-gray-400 text-xs">NeuraScore algorithm active</p>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-2xl mb-2">📊</div>
                  <p className="text-white font-medium">Analytics</p>
                  <p className="text-green-400 text-sm">Real-time</p>
                  <p className="text-gray-400 text-xs">Live dashboard updates</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
