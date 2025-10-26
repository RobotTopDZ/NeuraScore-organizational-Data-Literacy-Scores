import { Insight } from '@/types';

interface RecommendationsPanelProps {
  insights: Insight[];
}

export default function RecommendationsPanel({ insights }: RecommendationsPanelProps) {
  const getImpactColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'recommendation':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'achievement':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const priorityInsights = insights
    .filter(insight => insight.status === 'active')
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, 6);

  return (
    <div className="card bg-gray-800 border-gray-700">
      <div className="card-content">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">AI Recommendations</h3>
          <div className="text-sm text-gray-400">
            {insights.filter(i => i.status === 'active').length} Active
          </div>
        </div>

        {priorityInsights.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">No recommendations available</p>
            <p className="text-gray-500 text-xs mt-1">Insights will appear after data analysis</p>
          </div>
        ) : (
          <div className="space-y-4">
            {priorityInsights.map((insight) => (
              <div key={insight.id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    insight.type === 'recommendation' ? 'bg-blue-500/20 text-blue-400' :
                    insight.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {getTypeIcon(insight.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-white truncate">
                        {insight.title}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getImpactColor(insight.impact_level)}`}>
                        {insight.impact_level}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-3">
                      {insight.description}
                    </p>
                    
                    {insight.action_items && insight.action_items.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                          Action Items:
                        </p>
                        <ul className="text-xs text-gray-300 space-y-1">
                          {insight.action_items.slice(0, 2).map((item, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-primary-400 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-600">
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <span className="capitalize">{insight.target_entity}</span>
                        <span>•</span>
                        <span>Priority: {insight.priority_score}/100</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                          View Details
                        </button>
                        <button className="text-xs text-gray-400 hover:text-gray-300 transition-colors">
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {insights.filter(i => i.status === 'active').length > 6 && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <button className="w-full text-center text-sm text-primary-400 hover:text-primary-300 transition-colors">
              View All Recommendations ({insights.filter(i => i.status === 'active').length})
            </button>
          </div>
        )}

        {priorityInsights.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm font-medium text-red-400">
                  {insights.filter(i => i.impact_level === 'high' && i.status === 'active').length}
                </div>
                <div className="text-xs text-gray-400">High Impact</div>
              </div>
              <div>
                <div className="text-sm font-medium text-yellow-400">
                  {insights.filter(i => i.impact_level === 'medium' && i.status === 'active').length}
                </div>
                <div className="text-xs text-gray-400">Medium Impact</div>
              </div>
              <div>
                <div className="text-sm font-medium text-green-400">
                  {insights.filter(i => i.impact_level === 'low' && i.status === 'active').length}
                </div>
                <div className="text-xs text-gray-400">Low Impact</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
