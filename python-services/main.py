"""
NeuraScore Python Services - Main FastAPI Application
Handles data processing, ML computations, and NLP analysis
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import os
from datetime import datetime
from advanced_analytics_api import router as analytics_router

from data_processor import DataProcessor
from neurascore_engine import NeuraScoreEngine
from nlp_analyzer import NLPAnalyzer
from insight_generator import InsightGenerator

# Initialize FastAPI app
app = FastAPI(
    title="NeuraScore ML Services",
    description="Machine Learning and NLP services for NeuraScore platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include advanced analytics router
app.include_router(analytics_router)

# Initialize services
data_processor = DataProcessor()
neurascore_engine = NeuraScoreEngine()
nlp_analyzer = NLPAnalyzer()
insight_generator = InsightGenerator()

# Pydantic models for API requests/responses
class ProcessingStatus(BaseModel):
    status: str
    progress: float
    message: str
    last_updated: datetime

class UserScore(BaseModel):
    user_id: str
    overall_score: float
    discovery_score: float
    collaboration_score: float
    documentation_score: float
    reuse_score: float
    percentile_rank: float

class TeamMetrics(BaseModel):
    team_id: str
    team_name: str
    member_count: int
    avg_neurascore: float
    collaboration_index: float
    top_datasets: List[str]

class Insight(BaseModel):
    id: str
    type: str
    title: str
    description: str
    impact_level: str
    target_entity: str
    target_id: str
    action_items: List[str]

# Global processing status
processing_status = ProcessingStatus(
    status="idle",
    progress=0.0,
    message="Ready to process data",
    last_updated=datetime.now()
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "NeuraScore ML Services",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "data_processor": "ready",
            "neurascore_engine": "ready",
            "nlp_analyzer": "ready",
            "insight_generator": "ready"
        },
        "timestamp": datetime.now().isoformat()
    }

@app.post("/process-data")
async def process_data(background_tasks: BackgroundTasks):
    """Trigger data processing pipeline"""
    global processing_status
    
    if processing_status.status == "processing":
        raise HTTPException(
            status_code=409, 
            detail="Data processing already in progress"
        )
    
    # Start background processing
    background_tasks.add_task(run_data_processing)
    
    processing_status.status = "processing"
    processing_status.progress = 0.0
    processing_status.message = "Starting data processing pipeline"
    processing_status.last_updated = datetime.now()
    
    return {"message": "Data processing started", "status": processing_status}

@app.get("/processing-status")
async def get_processing_status():
    """Get current processing status"""
    return processing_status

@app.post("/calculate-scores")
async def calculate_scores(background_tasks: BackgroundTasks):
    """Calculate NeuraScores for all users"""
    if processing_status.status == "processing":
        raise HTTPException(
            status_code=409,
            detail="Processing already in progress"
        )
    
    background_tasks.add_task(run_score_calculation)
    
    return {"message": "Score calculation started"}

@app.get("/user-scores")
async def get_user_scores(limit: int = 100, offset: int = 0) -> List[UserScore]:
    """Get calculated user scores"""
    try:
        scores = await neurascore_engine.get_user_scores(limit=limit, offset=offset)
        return scores
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/team-metrics")
async def get_team_metrics() -> List[TeamMetrics]:
    """Get team-level metrics"""
    try:
        metrics = await neurascore_engine.get_team_metrics()
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/insights")
async def get_insights(
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None
) -> List[Insight]:
    """Get generated insights and recommendations"""
    try:
        insights = await insight_generator.get_insights(
            entity_type=entity_type,
            entity_id=entity_id
        )
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-text")
async def analyze_text(text: str):
    """Analyze text for quality metrics"""
    try:
        analysis = await nlp_analyzer.analyze_text(text)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/data-stats")
async def get_data_stats():
    """Get data processing statistics"""
    try:
        stats = await data_processor.get_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def run_data_processing():
    """Background task for data processing"""
    global processing_status
    
    try:
        processing_status.message = "Loading raw data files"
        processing_status.progress = 10.0
        processing_status.last_updated = datetime.now()
        
        # Load and clean data
        await data_processor.load_search_logs()
        
        processing_status.message = "Processing user interactions"
        processing_status.progress = 30.0
        processing_status.last_updated = datetime.now()
        
        # Process interactions
        await data_processor.process_interactions()
        
        processing_status.message = "Enriching with metadata"
        processing_status.progress = 50.0
        processing_status.last_updated = datetime.now()
        
        # Add metadata enrichment
        await data_processor.enrich_with_metadata()
        
        processing_status.message = "Calculating user metrics"
        processing_status.progress = 70.0
        processing_status.last_updated = datetime.now()
        
        # Calculate user metrics
        await data_processor.calculate_user_metrics()
        
        processing_status.message = "Data processing completed"
        processing_status.progress = 100.0
        processing_status.status = "completed"
        processing_status.last_updated = datetime.now()
        
    except Exception as e:
        processing_status.status = "error"
        processing_status.message = f"Error: {str(e)}"
        processing_status.last_updated = datetime.now()

async def run_score_calculation():
    """Background task for score calculation"""
    global processing_status
    
    try:
        processing_status.status = "processing"
        processing_status.message = "Calculating NeuraScores"
        processing_status.progress = 0.0
        processing_status.last_updated = datetime.now()
        
        # Calculate scores
        await neurascore_engine.calculate_all_scores()
        
        processing_status.message = "Generating insights"
        processing_status.progress = 80.0
        processing_status.last_updated = datetime.now()
        
        # Generate insights
        await insight_generator.generate_insights()
        
        processing_status.status = "completed"
        processing_status.message = "Score calculation completed"
        processing_status.progress = 100.0
        processing_status.last_updated = datetime.now()
        
    except Exception as e:
        processing_status.status = "error"
        processing_status.message = f"Error: {str(e)}"
        processing_status.last_updated = datetime.now()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True if os.getenv("ENV") == "development" else False
    )
