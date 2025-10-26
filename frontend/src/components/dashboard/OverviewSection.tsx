import { OrganizationMetrics } from '@/types';
import { formatNumber, formatPercentage } from '@/lib/utils';

interface OverviewSectionProps {
  data: OrganizationMetrics;
}

export default function OverviewSection({ data }: OverviewSectionProps) {
  const totalUsers = data.total_users || 0;
  const avgScore = parseFloat(data.avg_neurascore?.toString() || '0');
  const distribution = data.data_literacy_distribution;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Users */}
      <div className="card bg-gray-800 border-gray-700">
        <div className="card-content">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Users</p>
              <p className="text-3xl font-bold text-white">{formatNumber(totalUsers)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-green-400">↗ 12%</span>
              <span className="text-gray-400 ml-2">vs last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Average NeuraScore */}
      <div className="card bg-gray-800 border-gray-700">
        <div className="card-content">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Avg NeuraScore</p>
              <p className="text-3xl font-bold text-white">{avgScore.toFixed(1)}</p>
            </div>
            <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-green-400">↗ 5.2%</span>
              <span className="text-gray-400 ml-2">vs last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Total Teams */}
      <div className="card bg-gray-800 border-gray-700">
        <div className="card-content">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Active Teams</p>
              <p className="text-3xl font-bold text-white">{data.total_teams || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-green-400">↗ 8%</span>
              <span className="text-gray-400 ml-2">vs last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Literacy Distribution */}
      <div className="card bg-gray-800 border-gray-700">
        <div className="card-content">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-400">Expert Level</p>
              <p className="text-3xl font-bold text-white">
                {formatPercentage((distribution?.expert || 0) / totalUsers * 100)}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Advanced</span>
              <span className="text-gray-300">{distribution?.advanced || 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Intermediate</span>
              <span className="text-gray-300">{distribution?.intermediate || 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Beginner</span>
              <span className="text-gray-300">{distribution?.beginner || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
