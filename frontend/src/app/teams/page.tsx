'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/layout/Navigation';

interface TeamData {
  team_id: string;
  team_name: string;
  member_count: number;
  avg_score: number;
  discovery_score: number;
  collaboration_score: number;
  documentation_score: number;
  reuse_score: number;
  created_at: string;
}

export default function Teams() {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTeamsData();
  }, []);

  const loadTeamsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3000/api/teams', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTeams(result.data.teams || []);
        } else {
          setError('Failed to load teams data');
        }
      } else {
        setError(`API Error: ${response.status}`);
      }
    } catch (err: any) {
      setError(`Connection Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading teams data...</p>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load teams</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadTeamsData}
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
                <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Team performance metrics and collaboration insights
                </p>
              </div>
              <button
                onClick={loadTeamsData}
                className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>

          {/* Teams Grid */}
          {teams.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map((team, index) => (
                <div key={team.team_id || index} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {(team.team_name || `Team ${index + 1}`).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {team.team_name || `Team ${index + 1}`}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {team.member_count || 0} members
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Overall Score</span>
                        <span className="text-sm font-bold text-gray-900">
                          {Number(team.avg_score || 0).toFixed(1)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((Number(team.avg_score || 0) / 100) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Discovery</dt>
                        <dd className="text-sm text-gray-900">{Number(team.discovery_score || 0).toFixed(1)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Collaboration</dt>
                        <dd className="text-sm text-gray-900">{Number(team.collaboration_score || 0).toFixed(1)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Documentation</dt>
                        <dd className="text-sm text-gray-900">{Number(team.documentation_score || 0).toFixed(1)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Reuse</dt>
                        <dd className="text-sm text-gray-900">{Number(team.reuse_score || 0).toFixed(1)}</dd>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No teams found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No team data is currently available. Teams will appear here once data is processed.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
