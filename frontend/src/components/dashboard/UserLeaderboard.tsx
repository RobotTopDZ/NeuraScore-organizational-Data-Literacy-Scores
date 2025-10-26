import { NeuraScore } from '@/types';
import { formatNumber } from '@/lib/utils';

interface UserLeaderboardProps {
  users: NeuraScore[];
}

export default function UserLeaderboard({ users }: UserLeaderboardProps) {
  const topUsers = users.slice(0, 10);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Expert', color: 'bg-green-500/20 text-green-400' };
    if (score >= 60) return { label: 'Advanced', color: 'bg-yellow-500/20 text-yellow-400' };
    if (score >= 40) return { label: 'Intermediate', color: 'bg-orange-500/20 text-orange-400' };
    return { label: 'Beginner', color: 'bg-red-500/20 text-red-400' };
  };

  return (
    <div className="card bg-gray-800 border-gray-700">
      <div className="card-content">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">User Leaderboard</h3>
          <div className="text-sm text-gray-400">
            Top {Math.min(10, users.length)} Users
          </div>
        </div>

        {topUsers.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">No user data available</p>
            <p className="text-gray-500 text-xs mt-1">Users will appear after data processing</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topUsers.map((user, index) => {
              const badge = getScoreBadge(user.overall_score);
              return (
                <div key={user.user_id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        index === 1 ? 'bg-gray-400/20 text-gray-300' :
                        index === 2 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        User {user.user_id}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          {user.percentile_rank.toFixed(0)}th percentile
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${getScoreColor(user.overall_score)}`}>
                      {user.overall_score.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-400">NeuraScore</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {users.length > 10 && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <button className="w-full text-center text-sm text-primary-400 hover:text-primary-300 transition-colors">
              View Full Leaderboard ({users.length} users)
            </button>
          </div>
        )}

        {topUsers.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-sm font-medium text-green-400">
                  {topUsers.filter(u => u.overall_score >= 80).length}
                </div>
                <div className="text-xs text-gray-400">Expert</div>
              </div>
              <div>
                <div className="text-sm font-medium text-yellow-400">
                  {topUsers.filter(u => u.overall_score >= 60 && u.overall_score < 80).length}
                </div>
                <div className="text-xs text-gray-400">Advanced</div>
              </div>
              <div>
                <div className="text-sm font-medium text-orange-400">
                  {topUsers.filter(u => u.overall_score >= 40 && u.overall_score < 60).length}
                </div>
                <div className="text-xs text-gray-400">Intermediate</div>
              </div>
              <div>
                <div className="text-sm font-medium text-red-400">
                  {topUsers.filter(u => u.overall_score < 40).length}
                </div>
                <div className="text-xs text-gray-400">Beginner</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
