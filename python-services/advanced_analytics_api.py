"""
Advanced Analytics API endpoints for NeuraScore
Provides ML-powered insights and predictions
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import pandas as pd
import logging
from advanced_insights import advanced_insights_engine
from data_processor import DataProcessor
from neurascore_engine import NeuraScoreEngine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analytics", tags=["advanced-analytics"])

class AnalyticsRequest(BaseModel):
    analysis_type: str
    parameters: Optional[Dict[str, Any]] = {}

class PredictionRequest(BaseModel):
    user_ids: Optional[List[str]] = None
    days_ahead: int = 30
    include_trends: bool = True

@router.get("/user-patterns")
async def analyze_user_patterns():
    """Analyze user behavior patterns using ML clustering"""
    try:
        # Load sample data for analysis
        from sample_data_generator import generateSampleData
        sample_data = generateSampleData()
        user_df = pd.DataFrame(sample_data['user_scores'])
        
        # Perform ML analysis
        analysis = advanced_insights_engine.analyze_user_patterns(user_df)
        
        return {
            "success": True,
            "data": analysis,
            "analysis_type": "user_patterns",
            "timestamp": pd.Timestamp.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in user patterns analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/performance-predictions")
async def predict_performance_trends():
    """Predict future performance trends using ML"""
    try:
        # Load sample data for prediction
        from sample_data_generator import generateSampleData
        sample_data = generateSampleData()
        user_df = pd.DataFrame(sample_data['user_scores'])
        
        # Generate predictions
        predictions = advanced_insights_engine.predict_performance_trends(user_df)
        
        return {
            "success": True,
            "data": predictions,
            "analysis_type": "performance_predictions",
            "timestamp": pd.Timestamp.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in performance predictions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/team-dynamics")
async def analyze_team_dynamics():
    """Analyze team collaboration and performance dynamics"""
    try:
        # Load sample data
        from sample_data_generator import generateSampleData
        sample_data = generateSampleData()
        team_df = pd.DataFrame(sample_data['teams'])
        user_df = pd.DataFrame(sample_data['user_scores'])
        
        # Perform team analysis
        analysis = advanced_insights_engine.analyze_team_dynamics(team_df, user_df)
        
        return {
            "success": True,
            "data": analysis,
            "analysis_type": "team_dynamics",
            "timestamp": pd.Timestamp.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in team dynamics analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/nlp-insights")
async def generate_nlp_insights():
    """Generate insights from text data using NLP"""
    try:
        # Simulate text data analysis
        sample_texts = [
            "Users are struggling with data quality issues",
            "Great collaboration between teams this month",
            "Documentation needs improvement across all departments",
            "Advanced analytics training was very helpful",
            "Dashboard visualizations are excellent"
        ]
        
        # Generate NLP insights
        insights = advanced_insights_engine.generate_nlp_insights(sample_texts)
        
        return {
            "success": True,
            "data": insights,
            "analysis_type": "nlp_insights",
            "timestamp": pd.Timestamp.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in NLP insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/predictive-alerts")
async def generate_predictive_alerts():
    """Generate predictive alerts for potential issues"""
    try:
        # Load sample data
        from sample_data_generator import generateSampleData
        sample_data = generateSampleData()
        user_df = pd.DataFrame(sample_data['user_scores'])
        
        # Generate alerts
        alerts = advanced_insights_engine.generate_predictive_alerts(user_df)
        
        return {
            "success": True,
            "data": {
                "alerts": alerts,
                "total_alerts": len(alerts),
                "high_priority": len([a for a in alerts if a['severity'] == 'high']),
                "medium_priority": len([a for a in alerts if a['severity'] == 'medium'])
            },
            "analysis_type": "predictive_alerts",
            "timestamp": pd.Timestamp.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating predictive alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/skill-gap-analysis")
async def analyze_skill_gaps():
    """Analyze skill gaps across the organization"""
    try:
        # Load sample data
        from sample_data_generator import generateSampleData
        sample_data = generateSampleData()
        user_df = pd.DataFrame(sample_data['user_scores'])
        
        # Analyze skill gaps
        skills = ['discovery_score', 'collaboration_score', 'documentation_score', 'reuse_score']
        skill_analysis = {}
        
        for skill in skills:
            skill_name = skill.replace('_score', '').replace('_', ' ').title()
            avg_score = user_df[skill].mean()
            low_performers = len(user_df[user_df[skill] < 40])
            high_performers = len(user_df[user_df[skill] > 80])
            
            skill_analysis[skill_name] = {
                "average_score": round(avg_score, 1),
                "low_performers": low_performers,
                "high_performers": high_performers,
                "gap_severity": "high" if avg_score < 50 else "medium" if avg_score < 70 else "low",
                "recommendations": [
                    f"Focus training on {skill_name.lower()} skills",
                    f"Pair high performers with those needing improvement",
                    f"Create {skill_name.lower()} best practices documentation"
                ]
            }
        
        return {
            "success": True,
            "data": {
                "skill_analysis": skill_analysis,
                "overall_insights": [
                    f"Organization has {len(user_df)} users analyzed",
                    f"Average performance across all skills: {user_df[skills].mean().mean():.1f}",
                    "Focus areas identified for targeted improvement"
                ]
            },
            "analysis_type": "skill_gap_analysis",
            "timestamp": pd.Timestamp.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in skill gap analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/benchmarking")
async def generate_benchmarking_report():
    """Generate benchmarking report against industry standards"""
    try:
        # Load sample data
        from sample_data_generator import generateSampleData
        sample_data = generateSampleData()
        user_df = pd.DataFrame(sample_data['user_scores'])
        
        # Industry benchmarks (simulated)
        industry_benchmarks = {
            "discovery_score": 65.0,
            "collaboration_score": 70.0,
            "documentation_score": 60.0,
            "reuse_score": 55.0,
            "overall_score": 62.5
        }
        
        # Calculate organization performance vs benchmarks
        org_performance = {}
        for metric, benchmark in industry_benchmarks.items():
            org_avg = user_df[metric].mean()
            difference = org_avg - benchmark
            
            org_performance[metric] = {
                "organization_average": round(org_avg, 1),
                "industry_benchmark": benchmark,
                "difference": round(difference, 1),
                "performance": "above" if difference > 0 else "below",
                "percentile": min(95, max(5, int(50 + (difference / benchmark) * 50)))
            }
        
        return {
            "success": True,
            "data": {
                "benchmarking": org_performance,
                "summary": {
                    "above_benchmark": len([p for p in org_performance.values() if p['difference'] > 0]),
                    "below_benchmark": len([p for p in org_performance.values() if p['difference'] < 0]),
                    "overall_ranking": "Upper quartile" if sum(p['difference'] for p in org_performance.values()) > 0 else "Lower quartile"
                }
            },
            "analysis_type": "benchmarking",
            "timestamp": pd.Timestamp.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in benchmarking analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/custom-analysis")
async def run_custom_analysis(request: AnalyticsRequest):
    """Run custom analysis based on parameters"""
    try:
        analysis_type = request.analysis_type
        parameters = request.parameters
        
        # Load sample data
        from sample_data_generator import generateSampleData
        sample_data = generateSampleData()
        
        if analysis_type == "correlation_analysis":
            user_df = pd.DataFrame(sample_data['user_scores'])
            skills = ['discovery_score', 'collaboration_score', 'documentation_score', 'reuse_score']
            correlation_matrix = user_df[skills].corr().round(3).to_dict()
            
            return {
                "success": True,
                "data": {
                    "correlation_matrix": correlation_matrix,
                    "insights": [
                        "Strong correlation between collaboration and documentation scores",
                        "Discovery skills show independence from other metrics",
                        "Reuse efficiency correlates with overall experience"
                    ]
                },
                "analysis_type": analysis_type
            }
        
        elif analysis_type == "performance_distribution":
            user_df = pd.DataFrame(sample_data['user_scores'])
            
            distribution = {
                "excellent": len(user_df[user_df['overall_score'] >= 80]),
                "good": len(user_df[(user_df['overall_score'] >= 60) & (user_df['overall_score'] < 80)]),
                "average": len(user_df[(user_df['overall_score'] >= 40) & (user_df['overall_score'] < 60)]),
                "needs_improvement": len(user_df[user_df['overall_score'] < 40])
            }
            
            return {
                "success": True,
                "data": {
                    "distribution": distribution,
                    "percentages": {k: round(v/len(user_df)*100, 1) for k, v in distribution.items()}
                },
                "analysis_type": analysis_type
            }
        
        else:
            raise HTTPException(status_code=400, detail=f"Unknown analysis type: {analysis_type}")
        
    except Exception as e:
        logger.error(f"Error in custom analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))
