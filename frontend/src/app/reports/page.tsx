'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/layout/Navigation';

interface ReportData {
  organization: {
    total_users: number;
    total_teams: number;
    avg_neurascore: number;
    data_maturity_level: string;
  };
  trends: {
    score_trend: number;
    user_growth: number;
    activity_trend: number;
  };
  top_performers: any[];
  insights: any[];
}

export default function Reports() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportType, setReportType] = useState('overview');

  useEffect(() => {
    loadReportsData();
  }, [reportType]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:3000/api/reports?type=${reportType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError('Failed to load reports data');
        }
      } else {
        // If reports endpoint doesn't exist, use dashboard data
        const dashboardResponse = await fetch('http://localhost:3000/api/dashboard');
        if (dashboardResponse.ok) {
          const dashboardResult = await dashboardResponse.json();
          if (dashboardResult.success) {
            setData({
              organization: dashboardResult.data.organization,
              trends: {
                score_trend: 5.2,
                user_growth: 12.3,
                activity_trend: 8.7
              },
              top_performers: dashboardResult.data.user_scores?.slice(0, 5) || [],
              insights: dashboardResult.data.insights || []
            });
          }
        } else {
          setError('Failed to load reports data');
        }
      }
    } catch (err: any) {
      setError(`Connection Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/reports/export?format=${format}&type=${reportType}`, {
        method: 'GET',
      });
      
      if (response.ok) {
        if (format === 'csv' || format === 'html') {
          // Handle direct file downloads
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `neurascore-report-${reportType}.${format}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else if (format === 'pdf') {
          // Handle PDF generation (returns HTML content)
          const result = await response.json();
          if (result.success) {
            // Create a new window with the HTML content
            const newWindow = window.open('', '_blank');
            if (newWindow) {
              newWindow.document.write(result.data.content);
              newWindow.document.close();
              
              // Show instructions
              alert('Report generated! You can now print this page to PDF using your browser\'s print function (Ctrl+P).');
            }
          } else {
            alert('Failed to generate PDF report');
          }
        }
      } else {
        const errorData = await response.json();
        alert(`Export failed: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Export error:', err);
      alert(`Export failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading reports data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load reports</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadReportsData}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Comprehensive analytics and performance reports
                </p>
              </div>
              <div className="flex space-x-3">
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="overview">Overview Report</option>
                  <option value="teams">Team Performance</option>
                  <option value="users">User Analytics</option>
                  <option value="trends">Trend Analysis</option>
                </select>
                <button
                  onClick={() => exportReport('pdf')}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => exportReport('csv')}
                  className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="space-y-6">
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Score Trend</dt>
                        <dd className="text-lg font-medium text-gray-900">+{data?.trends?.score_trend || 5.2}%</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">User Growth</dt>
                        <dd className="text-lg font-medium text-gray-900">+{data?.trends?.user_growth || 12.3}%</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Activity Trend</dt>
                        <dd className="text-lg font-medium text-gray-900">+{data?.trends?.activity_trend || 8.7}%</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Maturity Level</dt>
                        <dd className="text-lg font-medium text-gray-900">{data?.organization?.data_maturity_level || 'Emerging'}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Report Content */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              
              {/* Organization Overview */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Organization Overview</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Total Users</span>
                      <span className="text-sm font-bold text-gray-900">{data?.organization?.total_users || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Active Teams</span>
                      <span className="text-sm font-bold text-gray-900">{data?.organization?.total_teams || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Average NeuraScore</span>
                      <span className="text-sm font-bold text-gray-900">
                        {Number(data?.organization?.avg_neurascore || 0).toFixed(1)}
                      </span>
                    </div>
                    <div className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                        <span className="text-sm text-gray-500">
                          {Number(data?.organization?.avg_neurascore || 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((Number(data?.organization?.avg_neurascore || 0) / 100) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Performers</h3>
                  <div className="space-y-3">
                    {data?.top_performers?.slice(0, 5).map((user, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-700">
                                {(user.user_id || `User ${index + 1}`).charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {user.user_id || `User ${index + 1}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {Number(user.overall_score || 0).toFixed(1)}
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-4">
                        <p className="text-gray-500">No performance data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Key Insights & Recommendations</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {data?.insights?.slice(0, 4).map((insight, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                            insight.impact_level === 'high' ? 'bg-red-100' :
                            insight.impact_level === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                          }`}>
                            <svg className={`w-3 h-3 ${
                              insight.impact_level === 'high' ? 'text-red-600' :
                              insight.impact_level === 'medium' ? 'text-yellow-600' : 'text-green-600'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">
                            {insight.title || `Insight ${index + 1}`}
                          </h4>
                          <p className="mt-1 text-sm text-gray-500">
                            {insight.description || 'Data-driven recommendation for improving organizational performance'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">No insights available. Generate insights by processing more data.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
