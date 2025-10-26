#!/usr/bin/env python3
"""
Simple training script that actually works with existing methods
"""

import asyncio
import logging
from data_processor import DataProcessor
from neurascore_engine import NeuraScoreEngine
from nlp_analyzer import NLPAnalyzer

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def run_data_processing():
    """Run the data processing pipeline"""
    try:
        logger.info("🚀 Starting NeuraScore Data Processing...")
        
        # Initialize data processor
        processor = DataProcessor()
        
        # Load and process data
        logger.info("📂 Loading search logs...")
        search_logs = await processor.load_search_logs()
        logger.info(f"✅ Loaded {len(search_logs)} search log entries")
        
        logger.info("📋 Loading metadata...")
        metadata = await processor.load_metadata()
        logger.info(f"✅ Loaded {len(metadata)} metadata entries")
        
        logger.info("🔄 Processing interactions...")
        processed_data = await processor.process_interactions()
        logger.info(f"✅ Processed {len(processed_data)} interactions")
        
        logger.info("📈 Calculating user metrics...")
        user_metrics = await processor.calculate_user_metrics()
        logger.info(f"✅ Calculated metrics for {len(user_metrics)} users")
        
        # Calculate NeuraScores
        logger.info("🎯 Calculating NeuraScores...")
        engine = NeuraScoreEngine()
        scores = await engine.calculate_all_scores(user_metrics)
        logger.info(f"✅ Calculated NeuraScores for {len(scores)} users")
        
        # Generate insights
        logger.info("💡 Generating insights...")
        insights = await engine.generate_insights(scores.head(10))
        logger.info(f"✅ Generated {len(insights)} insights")
        
        logger.info("🎉 Data processing completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Data processing failed: {str(e)}")
        logger.exception("Full error details:")
        return False

if __name__ == "__main__":
    print("🎯 NeuraScore Data Processing")
    print("=" * 50)
    
    success = asyncio.run(run_data_processing())
    
    if success:
        print("\n✅ Processing completed successfully!")
        print("🚀 Data is ready for the dashboard!")
    else:
        print("\n❌ Processing failed!")
        print("🔧 Check logs for details.")
