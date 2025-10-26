'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/layout/Navigation';

interface AnalyticsData {
  user_patterns?: any;
  performance_predictions?: any;
  team_dynamics?: any;
  nlp_insights?: any;
  predictive_alerts?: any;
  skill_gaps?: any;
  benchmarking?: any;
}

export default function AdvancedAnalytics() {
  const [data, setData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('patterns');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all analytics data in parallel
      const [
        patternsRes,
        predictionsRes,
        teamDynamicsRes,
        nlpRes,
        alertsRes,
        skillGapsRes,
        benchmarkingRes
      ] = await Promise.all([
        fetch('http://localhost:8001/analytics/user-patterns'),
        fetch('http://localhost:8001/analytics/performance-predictions'),
        fetch('http://localhost:8001/analytics/team-dynamics'),
        fetch('http://localhost:8001/analytics/nlp-insights'),
        fetch('http://localhost:8001/analytics/predictive-alerts'),
        fetch('http://localhost:8001/analytics/skill-gap-analysis'),
        fetch('http://localhost:8001/analytics/benchmarking')
      ]);

      const analyticsData: AnalyticsData = {};

      if (patternsRes.ok) {
        const patterns = await patternsRes.json();
        analyticsData.user_patterns = patterns.data;
      }

      if (predictionsRes.ok) {
        const predictions = await predictionsRes.json();
        analyticsData.performance_predictions = predictions.data;
      }

      if (teamDynamicsRes.ok) {
        const teamDynamics = await teamDynamicsRes.json();
        analyticsData.team_dynamics = teamDynamics.data;
      }

      if (nlpRes.ok) {
        const nlp = await nlpRes.json();
        analyticsData.nlp_insights = nlp.data;
      }

      if (alertsRes.ok) {
        const alerts = await alertsRes.json();
        analyticsData.predictive_alerts = alerts.data;
      }

      if (skillGapsRes.ok) {
        const skillGaps = await skillGapsRes.json();
        analyticsData.skill_gaps = skillGaps.data;
      }

      if (benchmarkingRes.ok) {
        const benchmarking = await benchmarkingRes.json();
        analyticsData.benchmarking = benchmarking.data;
      }

      setData(analyticsData);
    } catch (err: any) {
      setError(`Failed to load analytics: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'patterns', name: 'User Patterns', icon: 'P' },
    { id: 'predictions', name: 'Predictions', icon: 'T' },
    { id: 'teams', name: 'Team Dynamics', icon: 'D' },
    { id: 'nlp', name: 'NLP Insights', icon: 'N' },
    { id: 'alerts', name: 'Alerts', icon: 'A' },
    { id: 'skills', name: 'Skill Gaps', icon: 'S' },
    { id: 'benchmarks', name: 'Benchmarking', icon: 'B' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading advanced analytics...</p>
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
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl font-bold">!</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Analytics Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadAnalyticsData}
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
                <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
                <p className="mt-1 text-sm text-gray-600">
                  ML-powered insights, predictions, and intelligent recommendations
                </p>
              </div>
              <button
                onClick={loadAnalyticsData}
                className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Refresh Analytics
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
                    {tab.icon}
                  </span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="space-y-6">
            
            {/* User Patterns */}
            {activeTab === 'patterns' && data.user_patterns && (
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">User Behavior Clusters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(data.user_patterns.clusters || {}).map(([clusterId, cluster]: [string, any]) => (
                      <div key={clusterId} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{cluster.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{cluster.size} users</p>
                        <div className="space-y-2">
                          {Object.entries(cluster.avg_scores).map(([skill, score]: [string, any]) => (
                            <div key={skill} className="flex justify-between items-center">
                              <span className="text-sm text-gray-500 capitalize">
                                {skill.replace('_score', '').replace('_', ' ')}
                              </span>
                              <span className="text-sm font-medium">{Number(score).toFixed(1)}</span>
                            </div>
                          ))}
                        </div>
                        {cluster.recommendations && cluster.recommendations.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">Recommendations:</p>
                            {cluster.recommendations.map((rec: string, idx: number) => (
                              <p key={idx} className="text-xs text-indigo-600">{rec}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Performance Predictions */}
            {activeTab === 'predictions' && data.performance_predictions && (
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Trend Predictions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {data.performance_predictions.predictions?.map((pred: any, idx: number) => (
                      <div key={idx} className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600">{pred.days_ahead} Days</div>
                        <div className="text-lg font-medium text-gray-900 mt-2">
                          {pred.predicted_avg_score.toFixed(1)}
                        </div>
                        <div className={`text-sm mt-1 ${pred.score_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {pred.score_change >= 0 ? '+' : ''}{pred.score_change.toFixed(1)} change
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {(pred.confidence * 100).toFixed(0)}% confidence
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {data.performance_predictions.feature_importance && (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-3">Key Performance Factors</h4>
                      <div className="space-y-2">
                        {Object.entries(data.performance_predictions.feature_importance)
                          .sort(([,a], [,b]) => (b as number) - (a as number))
                          .slice(0, 5)
                          .map(([feature, importance]: [string, any]) => (
                          <div key={feature} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 capitalize">
                              {feature.replace('_score', '').replace('_', ' ')}
                            </span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-indigo-600 h-2 rounded-full" 
                                  style={{ width: `${(importance * 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{(importance * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* NLP Insights */}
            {activeTab === 'nlp' && data.nlp_insights && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Sentiment Analysis</h3>
                    <div className="space-y-3">
                      {Object.entries(data.nlp_insights.sentiment_analysis).map(([sentiment, value]: [string, any]) => (
                        <div key={sentiment} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 capitalize">{sentiment}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  sentiment === 'positive' ? 'bg-green-500' :
                                  sentiment === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                                }`}
                                style={{ width: `${value * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{(value * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Key Topics</h3>
                    <div className="space-y-3">
                      {data.nlp_insights.key_topics?.map((topic: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{topic.topic}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full" 
                                style={{ width: `${topic.frequency * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">{(topic.frequency * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">NLP Recommendations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.nlp_insights.recommendations?.map((rec: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{idx + 1}</span>
                        </div>
                        <p className="text-sm text-gray-700">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Predictive Alerts */}
            {activeTab === 'alerts' && data.predictive_alerts && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white shadow rounded-lg p-6 text-center">
                    <div className="text-2xl font-bold text-gray-900">{data.predictive_alerts.total_alerts}</div>
                    <div className="text-sm text-gray-600">Total Alerts</div>
                  </div>
                  <div className="bg-white shadow rounded-lg p-6 text-center">
                    <div className="text-2xl font-bold text-red-600">{data.predictive_alerts.high_priority}</div>
                    <div className="text-sm text-gray-600">High Priority</div>
                  </div>
                  <div className="bg-white shadow rounded-lg p-6 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{data.predictive_alerts.medium_priority}</div>
                    <div className="text-sm text-gray-600">Medium Priority</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {data.predictive_alerts.alerts?.map((alert: any, idx: number) => (
                    <div key={idx} className={`border-l-4 p-4 bg-white shadow rounded-lg ${
                      alert.severity === 'high' ? 'border-red-500' : 'border-yellow-500'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{alert.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                          <p className="text-sm text-indigo-600 mt-2">{alert.recommendation}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          alert.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                      {alert.affected_users && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Affected users:</p>
                          <div className="flex flex-wrap gap-1">
                            {alert.affected_users.slice(0, 5).map((user: string, userIdx: number) => (
                              <span key={userIdx} className="px-2 py-1 bg-gray-100 text-xs rounded">{user}</span>
                            ))}
                            {alert.affected_users.length > 5 && (
                              <span className="px-2 py-1 bg-gray-100 text-xs rounded">
                                +{alert.affected_users.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skill Gap Analysis */}
            {activeTab === 'skills' && data.skill_gaps && (
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Skill Gap Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(data.skill_gaps.skill_analysis || {}).map(([skill, analysis]: [string, any]) => (
                      <div key={skill} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-900">{skill}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            analysis.gap_severity === 'high' ? 'bg-red-100 text-red-800' :
                            analysis.gap_severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {analysis.gap_severity} gap
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Average Score</span>
                            <span className="font-medium">{analysis.average_score}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Low Performers</span>
                            <span className="text-red-600">{analysis.low_performers}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">High Performers</span>
                            <span className="text-green-600">{analysis.high_performers}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 mb-2">Recommendations:</p>
                          {analysis.recommendations?.slice(0, 2).map((rec: string, idx: number) => (
                            <p key={idx} className="text-xs text-indigo-600">{rec}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Benchmarking */}
            {activeTab === 'benchmarks' && data.benchmarking && (
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Industry Benchmarking</h3>
                  <div className="space-y-4">
                    {Object.entries(data.benchmarking.benchmarking || {}).map(([metric, benchmark]: [string, any]) => (
                      <div key={metric} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-gray-900 capitalize">
                            {metric.replace('_score', '').replace('_', ' ')}
                          </h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            benchmark.performance === 'above' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {benchmark.performance} benchmark
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Your Org</span>
                            <div className="font-medium">{benchmark.organization_average}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Industry</span>
                            <div className="font-medium">{benchmark.industry_benchmark}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Percentile</span>
                            <div className="font-medium">{benchmark.percentile}th</div>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                benchmark.performance === 'above' ? 'bg-green-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${benchmark.percentile}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Overall Performance</h4>
                    <p className="text-sm text-gray-600">
                      Your organization ranks in the <strong>{data.benchmarking.summary?.overall_ranking}</strong> compared to industry standards.
                    </p>
                    <div className="mt-2 text-sm">
                      <span className="text-green-600">{data.benchmarking.summary?.above_benchmark} metrics above benchmark</span>
                      <span className="text-gray-400 mx-2">•</span>
                      <span className="text-red-600">{data.benchmarking.summary?.below_benchmark} metrics below benchmark</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team Dynamics */}
            {activeTab === 'teams' && data.team_dynamics && (
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Team Dynamics Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(data.team_dynamics.team_analysis || {}).map(([teamId, team]: [string, any]) => (
                      <div key={teamId} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">{team.team_name}</h4>
                        
                        <div className="space-y-2 mb-4">
                          {Object.entries(team.metrics).map(([metric, value]: [string, any]) => (
                            <div key={metric} className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 capitalize">
                                {metric.replace('_', ' ')}
                              </span>
                              <span className="text-sm font-medium">{(value * 100).toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>

                        {team.strengths && team.strengths.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-1">Strengths:</p>
                            {team.strengths.map((strength: string, idx: number) => (
                              <p key={idx} className="text-xs text-green-600">{strength}</p>
                            ))}
                          </div>
                        )}

                        {team.improvement_areas && team.improvement_areas.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-1">Improvement Areas:</p>
                            {team.improvement_areas.map((area: string, idx: number) => (
                              <p key={idx} className="text-xs text-red-600">{area}</p>
                            ))}
                          </div>
                        )}

                        {team.recommendations && team.recommendations.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Recommendations:</p>
                            {team.recommendations.map((rec: string, idx: number) => (
                              <p key={idx} className="text-xs text-indigo-600">{rec}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {data.team_dynamics.cross_team_insights && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Cross-Team Insights</h4>
                      <div className="space-y-1">
                        {data.team_dynamics.cross_team_insights.map((insight: string, idx: number) => (
                          <p key={idx} className="text-sm text-gray-600">{insight}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
