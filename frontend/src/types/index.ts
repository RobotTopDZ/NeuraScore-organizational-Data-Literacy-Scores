// Core data types for NeuraScore platform

export interface UserInteraction {
  session_no: number;
  timestamp: string;
  event: 'portal_view' | 'portal_accessed' | 'search' | 'download';
  url: string;
  http_referer: string | null;
  record_id: string;
  record_class: 'collection' | 'party' | 'activity';
  record_type: 'dataset' | 'person' | 'group' | 'grant' | 'publication' | 'collection';
  query?: string;
  user_id?: string;
}

export interface DatasetMetadata {
  id: string;
  title: string;
  subject_keywords: string[];
  subject_anzsrc: string[];
  subject_anzsrc_codes: string[];
}

export interface UserMetrics {
  user_id: string;
  total_sessions: number;
  total_interactions: number;
  unique_datasets: number;
  avg_session_duration: number;
  search_frequency: number;
  query_diversity_score: number;
  last_activity: string;
}

export interface NeuraScore {
  user_id: string;
  overall_score: number;
  discovery_score: number;
  collaboration_score: number;
  documentation_score: number;
  reuse_score: number;
  computed_at: string;
  percentile_rank: number;
}

export interface TeamMetrics {
  team_id: string;
  team_name: string;
  member_count: number;
  avg_neurascore: number;
  total_interactions: number;
  collaboration_index: number;
  top_datasets: string[];
  activity_trend: number[];
}

export interface OrganizationMetrics {
  total_users: number;
  total_teams: number;
  avg_neurascore: number;
  data_literacy_distribution: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
  top_performing_teams: TeamMetrics[];
  improvement_areas: string[];
}

export interface Insight {
  id: string;
  type: 'recommendation' | 'warning' | 'achievement';
  title: string;
  description: string;
  impact_level: 'low' | 'medium' | 'high';
  target_entity: 'user' | 'team' | 'organization';
  target_id: string;
  action_items: string[];
  priority_score: number;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  acknowledged_at?: string;
  resolved_at?: string;
  created_at: string;
}

export interface DashboardData {
  organization: OrganizationMetrics;
  teams: TeamMetrics[];
  user_scores: NeuraScore[];
  insights: Insight[];
  activity_timeline: {
    date: string;
    interactions: number;
    unique_users: number;
  }[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
  color?: string;
}

export interface RadarChartData {
  subject: string;
  score: number;
  fullMark: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
