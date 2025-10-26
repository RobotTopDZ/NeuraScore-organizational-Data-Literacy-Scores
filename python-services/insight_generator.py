"""
Insight Generator for NeuraScore
Generates AI-driven insights and recommendations for improving data literacy
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
import logging
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

class InsightGenerator:
    """Generates insights and recommendations based on NeuraScore data"""
    
    def __init__(self):
        self.insights_cache = []
        self.recommendation_templates = self._load_recommendation_templates()
        
    def _load_recommendation_templates(self) -> Dict[str, Dict[str, Any]]:
        """Load recommendation templates for different scenarios"""
        return {
            'low_discovery': {
                'title': 'Improve Data Discovery',
                'description': 'Users are not actively exploring available datasets',
                'action_items': [
                    'Organize data discovery workshops',
                    'Create guided data exploration tutorials',
                    'Implement data catalog search training',
                    'Set up regular "Dataset of the Week" showcases'
                ],
                'impact_level': 'high'
            },
            'low_collaboration': {
                'title': 'Enhance Team Collaboration',
                'description': 'Limited data sharing and collaborative analysis patterns detected',
                'action_items': [
                    'Establish cross-team data sharing protocols',
                    'Create collaborative workspaces for data projects',
                    'Implement peer review processes for analyses',
                    'Set up regular data collaboration meetings'
                ],
                'impact_level': 'medium'
            },
            'low_documentation': {
                'title': 'Improve Documentation Quality',
                'description': 'Dataset documentation and metadata quality needs enhancement',
                'action_items': [
                    'Develop documentation standards and templates',
                    'Provide metadata quality training sessions',
                    'Implement documentation review processes',
                    'Create automated documentation quality checks'
                ],
                'impact_level': 'high'
            },
            'low_reuse': {
                'title': 'Increase Data Reuse',
                'description': 'Users are not effectively reusing existing datasets',
                'action_items': [
                    'Create dataset recommendation system',
                    'Highlight frequently used datasets',
                    'Develop data reuse best practices guide',
                    'Implement usage analytics and insights'
                ],
                'impact_level': 'medium'
            },
            'high_performer': {
                'title': 'Leverage High Performers',
                'description': 'Identify and leverage users with exceptional data literacy',
                'action_items': [
                    'Designate as data champions or mentors',
                    'Create knowledge sharing sessions',
                    'Develop advanced training programs',
                    'Establish data literacy ambassador roles'
                ],
                'impact_level': 'low'
            },
            'team_imbalance': {
                'title': 'Address Team Skill Imbalances',
                'description': 'Significant skill gaps detected within teams',
                'action_items': [
                    'Implement peer mentoring programs',
                    'Provide targeted skill development training',
                    'Create balanced project team compositions',
                    'Establish skill-sharing initiatives'
                ],
                'impact_level': 'high'
            }
        }
    
    async def generate_insights(self, user_scores: pd.DataFrame = None, 
                              team_metrics: List[Dict] = None) -> List[Dict[str, Any]]:
        """Generate comprehensive insights and recommendations"""
        try:
            logger.info("Generating insights and recommendations...")
            
            insights = []
            
            # Load data if not provided
            if user_scores is None or team_metrics is None:
                from neurascore_engine import NeuraScoreEngine
                engine = NeuraScoreEngine()
                if user_scores is None:
                    user_scores = await engine.calculate_all_scores()
                if team_metrics is None:
                    team_metrics = await engine.get_team_metrics()
            
            # Generate user-level insights
            user_insights = await self._generate_user_insights(user_scores)
            insights.extend(user_insights)
            
            # Generate team-level insights
            team_insights = await self._generate_team_insights(team_metrics, user_scores)
            insights.extend(team_insights)
            
            # Generate organizational insights
            org_insights = await self._generate_organizational_insights(user_scores, team_metrics)
            insights.extend(org_insights)
            
            # Cache insights
            self.insights_cache = insights
            
            logger.info(f"Generated {len(insights)} insights")
            return insights
            
        except Exception as e:
            logger.error(f"Error generating insights: {e}")
            return []
    
    async def _generate_user_insights(self, user_scores: pd.DataFrame) -> List[Dict[str, Any]]:
        """Generate insights for individual users"""
        insights = []
        
        try:
            # Identify users with specific patterns
            low_discovery_users = user_scores[user_scores['discovery_score'] < 40]
            high_performers = user_scores[user_scores['overall_score'] >= 80]
            inconsistent_performers = user_scores[
                (user_scores[['discovery_score', 'collaboration_score', 'documentation_score', 'reuse_score']].max(axis=1) - 
                 user_scores[['discovery_score', 'collaboration_score', 'documentation_score', 'reuse_score']].min(axis=1)) > 40
            ]
            
            # Generate insights for low discovery users
            if len(low_discovery_users) > 0:
                insight = self._create_insight(
                    'low_discovery',
                    'user',
                    f"group_{len(low_discovery_users)}_users",
                    f"{len(low_discovery_users)} users showing low data discovery activity"
                )
                insights.append(insight)
            
            # Generate insights for high performers
            if len(high_performers) > 0:
                insight = self._create_insight(
                    'high_performer',
                    'user',
                    f"group_{len(high_performers)}_users",
                    f"{len(high_performers)} users demonstrating exceptional data literacy"
                )
                insights.append(insight)
            
            # Generate insights for inconsistent performers
            if len(inconsistent_performers) > 0:
                insight = self._create_insight(
                    'team_imbalance',
                    'user',
                    f"group_{len(inconsistent_performers)}_users",
                    f"{len(inconsistent_performers)} users showing uneven skill development"
                )
                insights.append(insight)
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating user insights: {e}")
            return []
    
    async def _generate_team_insights(self, team_metrics: List[Dict], 
                                    user_scores: pd.DataFrame) -> List[Dict[str, Any]]:
        """Generate insights for teams"""
        insights = []
        
        try:
            for team in team_metrics:
                team_id = team['team_id']
                team_name = team['team_name']
                avg_score = team['avg_neurascore']
                
                # Low performing teams
                if avg_score < 50:
                    insight = self._create_insight(
                        'low_discovery',
                        'team',
                        team_id,
                        f"Team {team_name} shows below-average data literacy (Score: {avg_score:.1f})"
                    )
                    insights.append(insight)
                
                # Teams with low collaboration
                if team.get('collaboration_index', 0) < 40:
                    insight = self._create_insight(
                        'low_collaboration',
                        'team',
                        team_id,
                        f"Team {team_name} needs improved collaboration practices"
                    )
                    insights.append(insight)
                
                # High performing teams
                if avg_score >= 75:
                    insight = self._create_insight(
                        'high_performer',
                        'team',
                        team_id,
                        f"Team {team_name} demonstrates excellent data literacy (Score: {avg_score:.1f})"
                    )
                    insights.append(insight)
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating team insights: {e}")
            return []
    
    async def _generate_organizational_insights(self, user_scores: pd.DataFrame, 
                                              team_metrics: List[Dict]) -> List[Dict[str, Any]]:
        """Generate organization-level insights"""
        insights = []
        
        try:
            # Overall score distribution
            avg_org_score = user_scores['overall_score'].mean()
            score_std = user_scores['overall_score'].std()
            
            # Organization-wide patterns
            if avg_org_score < 60:
                insight = self._create_insight(
                    'low_discovery',
                    'organization',
                    'org_001',
                    f"Organization-wide data literacy needs improvement (Average: {avg_org_score:.1f})"
                )
                insights.append(insight)
            
            # High variability in scores
            if score_std > 25:
                insight = self._create_insight(
                    'team_imbalance',
                    'organization',
                    'org_001',
                    "High variability in data literacy across the organization"
                )
                insights.append(insight)
            
            # Documentation quality issues
            avg_doc_score = user_scores['documentation_score'].mean()
            if avg_doc_score < 50:
                insight = self._create_insight(
                    'low_documentation',
                    'organization',
                    'org_001',
                    f"Organization-wide documentation quality needs attention (Score: {avg_doc_score:.1f})"
                )
                insights.append(insight)
            
            # Data reuse patterns
            avg_reuse_score = user_scores['reuse_score'].mean()
            if avg_reuse_score < 45:
                insight = self._create_insight(
                    'low_reuse',
                    'organization',
                    'org_001',
                    f"Low data reuse patterns across organization (Score: {avg_reuse_score:.1f})"
                )
                insights.append(insight)
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating organizational insights: {e}")
            return []
    
    def _create_insight(self, insight_type: str, target_entity: str, 
                       target_id: str, custom_description: str = None) -> Dict[str, Any]:
        """Create an insight object from template"""
        template = self.recommendation_templates.get(insight_type, {})
        
        return {
            'id': str(uuid.uuid4()),
            'type': 'recommendation',
            'title': template.get('title', 'Data Literacy Recommendation'),
            'description': custom_description or template.get('description', ''),
            'impact_level': template.get('impact_level', 'medium'),
            'target_entity': target_entity,
            'target_id': target_id,
            'action_items': template.get('action_items', []),
            'created_at': datetime.now().isoformat(),
            'priority_score': self._calculate_priority_score(template.get('impact_level', 'medium'))
        }
    
    def _calculate_priority_score(self, impact_level: str) -> int:
        """Calculate priority score based on impact level"""
        impact_scores = {
            'high': 90,
            'medium': 60,
            'low': 30
        }
        return impact_scores.get(impact_level, 50)
    
    async def get_insights(self, entity_type: Optional[str] = None, 
                          entity_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get filtered insights"""
        try:
            if not self.insights_cache:
                await self.generate_insights()
            
            insights = self.insights_cache
            
            # Filter by entity type and ID if provided
            if entity_type:
                insights = [i for i in insights if i['target_entity'] == entity_type]
            
            if entity_id:
                insights = [i for i in insights if i['target_id'] == entity_id]
            
            # Sort by priority score
            insights.sort(key=lambda x: x['priority_score'], reverse=True)
            
            return insights
            
        except Exception as e:
            logger.error(f"Error getting insights: {e}")
            return []
    
    async def generate_summary_report(self, user_scores: pd.DataFrame, 
                                    team_metrics: List[Dict]) -> Dict[str, Any]:
        """Generate a comprehensive summary report"""
        try:
            # Calculate key statistics
            total_users = len(user_scores)
            avg_score = user_scores['overall_score'].mean()
            
            # Score distribution
            score_ranges = {
                'expert': len(user_scores[user_scores['overall_score'] >= 80]),
                'advanced': len(user_scores[(user_scores['overall_score'] >= 60) & 
                                          (user_scores['overall_score'] < 80)]),
                'intermediate': len(user_scores[(user_scores['overall_score'] >= 40) & 
                                              (user_scores['overall_score'] < 60)]),
                'beginner': len(user_scores[user_scores['overall_score'] < 40])
            }
            
            # Top performing teams
            top_teams = sorted(team_metrics, key=lambda x: x['avg_neurascore'], reverse=True)[:3]
            
            # Key insights
            insights = await self.get_insights()
            high_priority_insights = [i for i in insights if i['impact_level'] == 'high']
            
            return {
                'summary': {
                    'total_users': total_users,
                    'total_teams': len(team_metrics),
                    'avg_neurascore': round(avg_score, 1),
                    'score_distribution': score_ranges
                },
                'top_teams': top_teams,
                'key_insights': high_priority_insights[:5],
                'recommendations': {
                    'immediate_actions': len([i for i in insights if i['impact_level'] == 'high']),
                    'medium_term_actions': len([i for i in insights if i['impact_level'] == 'medium']),
                    'long_term_actions': len([i for i in insights if i['impact_level'] == 'low'])
                },
                'generated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating summary report: {e}")
            return {}
