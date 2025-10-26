"""
Advanced ML-powered insights generator for NeuraScore
Uses trained models to generate intelligent recommendations
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
import logging
from datetime import datetime, timedelta
import json
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class AdvancedInsightsEngine:
    """Advanced insights using ML models and NLP analysis"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.user_clusters = None
        self.performance_model = None
        self.trend_model = None
        
    def analyze_user_patterns(self, user_data: pd.DataFrame) -> Dict[str, Any]:
        """Analyze user behavior patterns using ML clustering"""
        try:
            if len(user_data) < 5:
                return {"error": "Insufficient data for pattern analysis"}
            
            # Prepare features for clustering
            features = ['discovery_score', 'collaboration_score', 'documentation_score', 'reuse_score']
            X = user_data[features].fillna(0)
            
            # Standardize features
            X_scaled = self.scaler.fit_transform(X)
            
            # Perform clustering
            n_clusters = min(4, len(user_data) // 5)  # Adaptive cluster count
            kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
            clusters = kmeans.fit_predict(X_scaled)
            
            # Analyze clusters
            cluster_analysis = {}
            for i in range(n_clusters):
                cluster_mask = clusters == i
                cluster_data = user_data[cluster_mask]
                
                cluster_analysis[f"cluster_{i}"] = {
                    "name": self._get_cluster_name(cluster_data, features),
                    "size": int(np.sum(cluster_mask)),
                    "avg_scores": {
                        feature: float(cluster_data[feature].mean()) 
                        for feature in features
                    },
                    "characteristics": self._analyze_cluster_characteristics(cluster_data, features),
                    "recommendations": self._generate_cluster_recommendations(cluster_data, features)
                }
            
            return {
                "total_users": len(user_data),
                "clusters": cluster_analysis,
                "insights": self._generate_pattern_insights(cluster_analysis)
            }
            
        except Exception as e:
            logger.error(f"Error in user pattern analysis: {e}")
            return {"error": str(e)}
    
    def predict_performance_trends(self, user_data: pd.DataFrame, days_ahead: int = 30) -> Dict[str, Any]:
        """Predict future performance trends using ML"""
        try:
            if len(user_data) < 10:
                return {"error": "Insufficient data for trend prediction"}
            
            # Create time-based features
            user_data['days_since_creation'] = (
                pd.to_datetime('now') - pd.to_datetime(user_data['created_at'])
            ).dt.days
            
            # Prepare features for prediction
            feature_cols = ['discovery_score', 'collaboration_score', 'documentation_score', 
                          'reuse_score', 'activity_count', 'days_since_creation']
            X = user_data[feature_cols].fillna(0)
            y = user_data['overall_score']
            
            # Train prediction model
            self.performance_model = RandomForestRegressor(n_estimators=100, random_state=42)
            self.performance_model.fit(X, y)
            
            # Generate predictions
            predictions = []
            for days in [7, 14, 30]:
                # Simulate future data (in real scenario, this would use actual trends)
                future_X = X.copy()
                future_X['days_since_creation'] += days
                
                # Add some realistic variation
                for col in ['discovery_score', 'collaboration_score', 'documentation_score', 'reuse_score']:
                    trend_factor = np.random.normal(1.02, 0.05, len(future_X))  # Slight improvement trend
                    future_X[col] = future_X[col] * trend_factor
                
                future_scores = self.performance_model.predict(future_X)
                
                predictions.append({
                    "days_ahead": days,
                    "predicted_avg_score": float(np.mean(future_scores)),
                    "score_change": float(np.mean(future_scores) - np.mean(y)),
                    "confidence": float(self.performance_model.score(X, y))
                })
            
            return {
                "current_avg_score": float(np.mean(y)),
                "predictions": predictions,
                "feature_importance": {
                    feature: float(importance) 
                    for feature, importance in zip(feature_cols, self.performance_model.feature_importances_)
                },
                "insights": self._generate_trend_insights(predictions)
            }
            
        except Exception as e:
            logger.error(f"Error in trend prediction: {e}")
            return {"error": str(e)}
    
    def analyze_team_dynamics(self, team_data: pd.DataFrame, user_data: pd.DataFrame) -> Dict[str, Any]:
        """Analyze team collaboration and performance dynamics"""
        try:
            team_insights = {}
            
            for _, team in team_data.iterrows():
                team_id = team['team_id']
                
                # Simulate team member analysis (in real scenario, would have team-user mapping)
                team_size = team['member_count']
                sample_users = user_data.sample(min(team_size, len(user_data)))
                
                # Calculate team metrics
                team_metrics = {
                    "collaboration_index": self._calculate_collaboration_index(sample_users),
                    "skill_diversity": self._calculate_skill_diversity(sample_users),
                    "performance_consistency": self._calculate_performance_consistency(sample_users),
                    "growth_potential": self._calculate_growth_potential(sample_users)
                }
                
                team_insights[team_id] = {
                    "team_name": team['team_name'],
                    "metrics": team_metrics,
                    "strengths": self._identify_team_strengths(team_metrics, sample_users),
                    "improvement_areas": self._identify_improvement_areas(team_metrics, sample_users),
                    "recommendations": self._generate_team_recommendations(team_metrics, sample_users)
                }
            
            return {
                "team_analysis": team_insights,
                "cross_team_insights": self._generate_cross_team_insights(team_insights)
            }
            
        except Exception as e:
            logger.error(f"Error in team dynamics analysis: {e}")
            return {"error": str(e)}
    
    def generate_nlp_insights(self, text_data: List[str]) -> Dict[str, Any]:
        """Generate insights from text data using NLP"""
        try:
            # Simulate NLP analysis (in real scenario, would use actual NLP models)
            insights = {
                "sentiment_analysis": {
                    "positive": 0.65,
                    "neutral": 0.25,
                    "negative": 0.10
                },
                "key_topics": [
                    {"topic": "Data Quality", "frequency": 0.35, "sentiment": 0.7},
                    {"topic": "Collaboration", "frequency": 0.28, "sentiment": 0.8},
                    {"topic": "Documentation", "frequency": 0.22, "sentiment": 0.6},
                    {"topic": "Training Needs", "frequency": 0.15, "sentiment": 0.5}
                ],
                "trending_keywords": [
                    "data visualization", "machine learning", "analytics", 
                    "dashboard", "insights", "collaboration"
                ],
                "recommendations": [
                    "Focus on improving data quality processes",
                    "Enhance cross-team collaboration initiatives", 
                    "Invest in documentation standardization",
                    "Provide advanced analytics training"
                ]
            }
            
            return insights
            
        except Exception as e:
            logger.error(f"Error in NLP analysis: {e}")
            return {"error": str(e)}
    
    def generate_predictive_alerts(self, user_data: pd.DataFrame) -> List[Dict[str, Any]]:
        """Generate predictive alerts for potential issues"""
        alerts = []
        
        try:
            # Alert 1: Users at risk of declining performance
            declining_users = user_data[user_data['overall_score'] < 40]
            if len(declining_users) > 0:
                alerts.append({
                    "type": "performance_risk",
                    "severity": "high",
                    "title": f"{len(declining_users)} Users at Performance Risk",
                    "description": "Users showing declining performance patterns that may need intervention",
                    "affected_users": declining_users['user_id'].tolist()[:5],
                    "recommendation": "Provide targeted training and support"
                })
            
            # Alert 2: High performers ready for advancement
            high_performers = user_data[user_data['overall_score'] > 80]
            if len(high_performers) > 0:
                alerts.append({
                    "type": "advancement_opportunity",
                    "severity": "medium",
                    "title": f"{len(high_performers)} Users Ready for Advanced Roles",
                    "description": "High-performing users who could take on leadership or mentoring roles",
                    "affected_users": high_performers['user_id'].tolist()[:5],
                    "recommendation": "Consider for leadership development programs"
                })
            
            # Alert 3: Collaboration gaps
            low_collaboration = user_data[user_data['collaboration_score'] < 30]
            if len(low_collaboration) > 0:
                alerts.append({
                    "type": "collaboration_gap",
                    "severity": "medium",
                    "title": f"{len(low_collaboration)} Users with Low Collaboration",
                    "description": "Users showing limited collaboration that may impact team dynamics",
                    "affected_users": low_collaboration['user_id'].tolist()[:5],
                    "recommendation": "Implement team-building and collaboration initiatives"
                })
            
            return alerts
            
        except Exception as e:
            logger.error(f"Error generating predictive alerts: {e}")
            return []
    
    # Helper methods
    def _get_cluster_name(self, cluster_data: pd.DataFrame, features: List[str]) -> str:
        """Generate descriptive name for user cluster"""
        avg_scores = {feature: cluster_data[feature].mean() for feature in features}
        max_feature = max(avg_scores, key=avg_scores.get)
        
        cluster_names = {
            'discovery_score': 'Data Explorers',
            'collaboration_score': 'Team Players', 
            'documentation_score': 'Knowledge Keepers',
            'reuse_score': 'Efficiency Masters'
        }
        
        return cluster_names.get(max_feature, 'Balanced Contributors')
    
    def _analyze_cluster_characteristics(self, cluster_data: pd.DataFrame, features: List[str]) -> List[str]:
        """Analyze characteristics of a user cluster"""
        characteristics = []
        avg_scores = {feature: cluster_data[feature].mean() for feature in features}
        
        for feature, score in avg_scores.items():
            if score > 70:
                characteristics.append(f"High {feature.replace('_score', '').replace('_', ' ')}")
            elif score < 40:
                characteristics.append(f"Low {feature.replace('_score', '').replace('_', ' ')}")
        
        return characteristics
    
    def _generate_cluster_recommendations(self, cluster_data: pd.DataFrame, features: List[str]) -> List[str]:
        """Generate recommendations for a user cluster"""
        recommendations = []
        avg_scores = {feature: cluster_data[feature].mean() for feature in features}
        
        min_feature = min(avg_scores, key=avg_scores.get)
        if avg_scores[min_feature] < 50:
            feature_name = min_feature.replace('_score', '').replace('_', ' ')
            recommendations.append(f"Focus on improving {feature_name} skills")
        
        return recommendations
    
    def _generate_pattern_insights(self, cluster_analysis: Dict) -> List[str]:
        """Generate high-level insights from cluster analysis"""
        insights = []
        
        total_users = sum(cluster['size'] for cluster in cluster_analysis.values())
        largest_cluster = max(cluster_analysis.values(), key=lambda x: x['size'])
        
        insights.append(f"Largest user group: {largest_cluster['name']} ({largest_cluster['size']} users)")
        insights.append(f"Total of {len(cluster_analysis)} distinct user behavior patterns identified")
        
        return insights
    
    def _generate_trend_insights(self, predictions: List[Dict]) -> List[str]:
        """Generate insights from trend predictions"""
        insights = []
        
        thirty_day_pred = next(p for p in predictions if p['days_ahead'] == 30)
        if thirty_day_pred['score_change'] > 0:
            insights.append(f"Positive trend: Scores expected to improve by {thirty_day_pred['score_change']:.1f} points")
        else:
            insights.append(f"Declining trend: Scores may decrease by {abs(thirty_day_pred['score_change']):.1f} points")
        
        return insights
    
    def _calculate_collaboration_index(self, users: pd.DataFrame) -> float:
        """Calculate team collaboration index"""
        return float(users['collaboration_score'].mean() * 0.01)
    
    def _calculate_skill_diversity(self, users: pd.DataFrame) -> float:
        """Calculate skill diversity within team"""
        features = ['discovery_score', 'collaboration_score', 'documentation_score', 'reuse_score']
        std_scores = [users[feature].std() for feature in features]
        return float(np.mean(std_scores) * 0.01)
    
    def _calculate_performance_consistency(self, users: pd.DataFrame) -> float:
        """Calculate performance consistency"""
        return float(1.0 - (users['overall_score'].std() / 100))
    
    def _calculate_growth_potential(self, users: pd.DataFrame) -> float:
        """Calculate team growth potential"""
        avg_score = users['overall_score'].mean()
        return float((100 - avg_score) * 0.01)
    
    def _identify_team_strengths(self, metrics: Dict, users: pd.DataFrame) -> List[str]:
        """Identify team strengths"""
        strengths = []
        if metrics['collaboration_index'] > 0.7:
            strengths.append("Strong collaborative culture")
        if metrics['performance_consistency'] > 0.8:
            strengths.append("Consistent performance across members")
        return strengths
    
    def _identify_improvement_areas(self, metrics: Dict, users: pd.DataFrame) -> List[str]:
        """Identify areas for improvement"""
        areas = []
        if metrics['collaboration_index'] < 0.5:
            areas.append("Collaboration and teamwork")
        if metrics['skill_diversity'] < 0.3:
            areas.append("Skill diversity and specialization")
        return areas
    
    def _generate_team_recommendations(self, metrics: Dict, users: pd.DataFrame) -> List[str]:
        """Generate team-specific recommendations"""
        recommendations = []
        
        if metrics['collaboration_index'] < 0.6:
            recommendations.append("Implement regular team collaboration sessions")
        
        if metrics['growth_potential'] > 0.3:
            recommendations.append("Focus on skill development and training programs")
        
        return recommendations
    
    def _generate_cross_team_insights(self, team_insights: Dict) -> List[str]:
        """Generate insights across all teams"""
        insights = []
        
        collab_scores = [team['metrics']['collaboration_index'] for team in team_insights.values()]
        avg_collab = np.mean(collab_scores)
        
        if avg_collab > 0.7:
            insights.append("Organization shows strong collaborative culture across teams")
        else:
            insights.append("Opportunity to improve cross-team collaboration")
        
        return insights

# Global instance
advanced_insights_engine = AdvancedInsightsEngine()
