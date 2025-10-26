"""
NeuraScore Engine - Core scoring algorithm implementation
Calculates multi-dimensional data literacy scores
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from sklearn.preprocessing import MinMaxScaler
from sklearn.cluster import KMeans
import logging

logger = logging.getLogger(__name__)

class NeuraScoreEngine:
    """Core engine for calculating NeuraScore metrics"""
    
    def __init__(self):
        self.user_scores = None
        self.team_metrics = None
        self.scaler = MinMaxScaler()
        
        # Scoring weights for different pillars
        self.pillar_weights = {
            'discovery': 0.3,
            'collaboration': 0.25,
            'documentation': 0.25,
            'reuse': 0.2
        }
        
    async def calculate_all_scores(self, user_metrics: pd.DataFrame = None) -> pd.DataFrame:
        """Calculate NeuraScores for all users"""
        try:
            logger.info("Starting NeuraScore calculation...")
            
            if user_metrics is None:
                # Load from data processor (would be injected in real implementation)
                from data_processor import DataProcessor
                processor = DataProcessor()
                user_metrics = await processor.calculate_user_metrics()
            
            # Calculate individual pillar scores
            discovery_scores = self._calculate_discovery_scores(user_metrics)
            collaboration_scores = self._calculate_collaboration_scores(user_metrics)
            documentation_scores = self._calculate_documentation_scores(user_metrics)
            reuse_scores = self._calculate_reuse_scores(user_metrics)
            
            # Combine into final NeuraScore
            user_scores = pd.DataFrame({
                'user_id': user_metrics['user_id'],
                'discovery_score': discovery_scores,
                'collaboration_score': collaboration_scores,
                'documentation_score': documentation_scores,
                'reuse_score': reuse_scores
            })
            
            # Calculate overall score
            user_scores['overall_score'] = (
                user_scores['discovery_score'] * self.pillar_weights['discovery'] +
                user_scores['collaboration_score'] * self.pillar_weights['collaboration'] +
                user_scores['documentation_score'] * self.pillar_weights['documentation'] +
                user_scores['reuse_score'] * self.pillar_weights['reuse']
            )
            
            # Calculate percentile ranks
            user_scores['percentile_rank'] = user_scores['overall_score'].rank(pct=True) * 100
            
            # Add computed timestamp
            user_scores['computed_at'] = datetime.now()
            
            self.user_scores = user_scores
            logger.info(f"Calculated NeuraScores for {len(user_scores)} users")
            
            return user_scores
            
        except Exception as e:
            logger.error(f"Error calculating NeuraScores: {e}")
            raise
    
    def _calculate_discovery_scores(self, user_metrics: pd.DataFrame) -> np.ndarray:
        """Calculate Discovery pillar scores (search & exploration activity)"""
        try:
            # Normalize metrics to 0-100 scale
            features = user_metrics[[
                'total_sessions',
                'total_interactions', 
                'total_unique_records',
                'unique_subjects',
                'subject_diversity_score'
            ]].fillna(0)
            
            # Apply log transformation to reduce skewness
            log_features = np.log1p(features)
            
            # Normalize to 0-1 scale
            normalized = self.scaler.fit_transform(log_features)
            
            # Weighted combination of discovery factors
            weights = np.array([0.2, 0.25, 0.25, 0.15, 0.15])
            discovery_scores = np.dot(normalized, weights) * 100
            
            return np.clip(discovery_scores, 0, 100)
            
        except Exception as e:
            logger.error(f"Error calculating discovery scores: {e}")
            return np.zeros(len(user_metrics))
    
    def _calculate_collaboration_scores(self, user_metrics: pd.DataFrame) -> np.ndarray:
        """Calculate Collaboration pillar scores (shared dataset usage patterns)"""
        try:
            # For now, use session frequency and record overlap as proxy
            # In full implementation, would analyze actual collaboration patterns
            
            features = user_metrics[[
                'sessions_per_day',
                'avg_interactions_per_session',
                'total_unique_records'
            ]].fillna(0)
            
            # Normalize features
            normalized = self.scaler.fit_transform(features)
            
            # Calculate collaboration index based on activity patterns
            weights = np.array([0.4, 0.3, 0.3])
            collaboration_scores = np.dot(normalized, weights) * 100
            
            return np.clip(collaboration_scores, 0, 100)
            
        except Exception as e:
            logger.error(f"Error calculating collaboration scores: {e}")
            return np.zeros(len(user_metrics))
    
    def _calculate_documentation_scores(self, user_metrics: pd.DataFrame) -> np.ndarray:
        """Calculate Documentation pillar scores (query quality & metadata usage)"""
        try:
            # Use event diversity and subject diversity as proxies for documentation quality
            features = user_metrics[[
                'avg_event_diversity',
                'subject_diversity_score',
                'avg_session_duration'
            ]].fillna(0)
            
            # Normalize features
            normalized = self.scaler.fit_transform(features)
            
            # Calculate documentation quality score
            weights = np.array([0.4, 0.4, 0.2])
            documentation_scores = np.dot(normalized, weights) * 100
            
            return np.clip(documentation_scores, 0, 100)
            
        except Exception as e:
            logger.error(f"Error calculating documentation scores: {e}")
            return np.zeros(len(user_metrics))
    
    def _calculate_reuse_scores(self, user_metrics: pd.DataFrame) -> np.ndarray:
        """Calculate Reuse pillar scores (frequency of returning to datasets)"""
        try:
            # Use session patterns and activity span as reuse indicators
            features = user_metrics[[
                'total_sessions',
                'activity_span_days',
                'sessions_per_day',
                'avg_unique_records_per_session'
            ]].fillna(0)
            
            # Calculate reuse patterns
            features['reuse_ratio'] = features['total_sessions'] / (features['total_unique_records'] + 1)
            
            # Normalize features
            normalized = self.scaler.fit_transform(features[['reuse_ratio', 'sessions_per_day', 'activity_span_days']])
            
            # Calculate reuse score
            weights = np.array([0.5, 0.3, 0.2])
            reuse_scores = np.dot(normalized, weights) * 100
            
            return np.clip(reuse_scores, 0, 100)
            
        except Exception as e:
            logger.error(f"Error calculating reuse scores: {e}")
            return np.zeros(len(user_metrics))
    
    async def get_user_scores(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """Get calculated user scores with pagination"""
        try:
            if self.user_scores is None:
                await self.calculate_all_scores()
            
            # Sort by overall score descending
            sorted_scores = self.user_scores.sort_values('overall_score', ascending=False)
            
            # Apply pagination
            paginated = sorted_scores.iloc[offset:offset + limit]
            
            # Convert to list of dictionaries
            return paginated.to_dict('records')
            
        except Exception as e:
            logger.error(f"Error getting user scores: {e}")
            return []
    
    async def get_team_metrics(self) -> List[Dict[str, Any]]:
        """Calculate and return team-level metrics"""
        try:
            if self.user_scores is None:
                await self.calculate_all_scores()
            
            # Simulate team assignments (in real implementation, would come from user data)
            teams = self._simulate_team_assignments()
            
            team_metrics = []
            for team_id, team_data in teams.items():
                team_users = self.user_scores[self.user_scores['user_id'].isin(team_data['members'])]
                
                if len(team_users) > 0:
                    metrics = {
                        'team_id': team_id,
                        'team_name': team_data['name'],
                        'member_count': len(team_users),
                        'avg_neurascore': float(team_users['overall_score'].mean()),
                        'avg_discovery_score': float(team_users['discovery_score'].mean()),
                        'avg_collaboration_score': float(team_users['collaboration_score'].mean()),
                        'avg_documentation_score': float(team_users['documentation_score'].mean()),
                        'avg_reuse_score': float(team_users['reuse_score'].mean()),
                        'top_performers': team_users.nlargest(3, 'overall_score')['user_id'].tolist(),
                        'collaboration_index': float(team_users['collaboration_score'].mean()),
                        'improvement_potential': float(100 - team_users['overall_score'].mean())
                    }
                    team_metrics.append(metrics)
            
            self.team_metrics = team_metrics
            return team_metrics
            
        except Exception as e:
            logger.error(f"Error calculating team metrics: {e}")
            return []
    
    def _simulate_team_assignments(self) -> Dict[str, Dict[str, Any]]:
        """Simulate team assignments using clustering"""
        try:
            if self.user_scores is None:
                return {}
            
            # Use K-means clustering to create synthetic teams
            features = self.user_scores[['discovery_score', 'collaboration_score', 
                                       'documentation_score', 'reuse_score']].values
            
            n_teams = min(8, len(self.user_scores) // 5)  # Create teams of ~5 users
            if n_teams < 2:
                n_teams = 2
            
            kmeans = KMeans(n_clusters=n_teams, random_state=42, n_init=10)
            team_labels = kmeans.fit_predict(features)
            
            # Create team assignments
            teams = {}
            team_names = [
                'Data Explorers', 'Analytics Team', 'Research Group', 'Insights Squad',
                'Data Scientists', 'Business Intelligence', 'Data Engineers', 'ML Team'
            ]
            
            for i in range(n_teams):
                team_members = self.user_scores[team_labels == i]['user_id'].tolist()
                teams[f'team_{i+1:02d}'] = {
                    'name': team_names[i] if i < len(team_names) else f'Team {i+1}',
                    'members': team_members
                }
            
            return teams
            
        except Exception as e:
            logger.error(f"Error creating team assignments: {e}")
            return {}
    
    def get_score_distribution(self) -> Dict[str, Any]:
        """Get score distribution statistics"""
        try:
            if self.user_scores is None:
                return {}
            
            distribution = {
                'overall': {
                    'mean': float(self.user_scores['overall_score'].mean()),
                    'median': float(self.user_scores['overall_score'].median()),
                    'std': float(self.user_scores['overall_score'].std()),
                    'min': float(self.user_scores['overall_score'].min()),
                    'max': float(self.user_scores['overall_score'].max())
                },
                'by_pillar': {}
            }
            
            for pillar in ['discovery_score', 'collaboration_score', 'documentation_score', 'reuse_score']:
                distribution['by_pillar'][pillar.replace('_score', '')] = {
                    'mean': float(self.user_scores[pillar].mean()),
                    'median': float(self.user_scores[pillar].median()),
                    'std': float(self.user_scores[pillar].std())
                }
            
            # Score ranges
            distribution['score_ranges'] = {
                'expert': len(self.user_scores[self.user_scores['overall_score'] >= 80]),
                'advanced': len(self.user_scores[(self.user_scores['overall_score'] >= 60) & 
                                               (self.user_scores['overall_score'] < 80)]),
                'intermediate': len(self.user_scores[(self.user_scores['overall_score'] >= 40) & 
                                                   (self.user_scores['overall_score'] < 60)]),
                'beginner': len(self.user_scores[self.user_scores['overall_score'] < 40])
            }
            
            return distribution
            
        except Exception as e:
            logger.error(f"Error calculating score distribution: {e}")
            return {}
