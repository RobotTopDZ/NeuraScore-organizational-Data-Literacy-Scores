import { TeamMetrics } from '@/types';
import { formatNumber, formatPercentage } from '@/lib/utils';

interface TeamInsightsProps {
  teams: TeamMetrics[];
}

export default function TeamInsights({ teams }: TeamInsightsProps) {
  const topTeams = teams.slice(0, 5);

  return (
    <div className="card bg-gray-800 border-gray-700">
      <div className="card-content">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Team Performance</h3>
          <div className="text-sm text-gray-400">
            {teams.length} Active Teams
          </div>
        </div>

        {topTeams.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">No team data available</p>
            <p className="text-gray-500 text-xs mt-1">Teams will appear after data processing</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topTeams.map((team, index) => (
              <div key={team.team_id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-primary-400 font-semibold">#{index + 1}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{team.team_name}</h4>
                    <p className="text-sm text-gray-400">
                      {team.member_count} members
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-semibold text-white">
                    {team.avg_neurascore.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-400">NeuraScore</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {teams.length > 5 && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <button className="w-full text-center text-sm text-primary-400 hover:text-primary-300 transition-colors">
              View All Teams ({teams.length})
            </button>
          </div>
        )}

        {topTeams.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
            <div className="text-center">
              <div className="text-sm font-medium text-white">
                {formatNumber(topTeams.reduce((sum, team) => sum + team.member_count, 0))}
              </div>
              <div className="text-xs text-gray-400">Total Members</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-white">
                {(topTeams.reduce((sum, team) => sum + team.avg_neurascore, 0) / topTeams.length).toFixed(1)}
              </div>
              <div className="text-xs text-gray-400">Avg Score</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-white">
                {formatPercentage(topTeams.reduce((sum, team) => sum + team.collaboration_index, 0) / topTeams.length)}
              </div>
              <div className="text-xs text-gray-400">Collaboration</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
