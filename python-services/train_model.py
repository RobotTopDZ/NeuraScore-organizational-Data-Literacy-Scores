#!/usr/bin/env python3
"""
Training script for NeuraScore ML models
Processes data and trains the scoring algorithms
"""

import asyncio
import logging
from data_processor import DataProcessor
from neurascore_engine import NeuraScoreEngine
from nlp_analyzer import NLPAnalyzer

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def main():
    """Main training pipeline"""
    try:
        logger.info("🚀 Starting NeuraScore Model Training Pipeline...")
        
        # Step 1: Initialize components
        logger.info("📊 Initializing data processor...")
        data_processor = DataProcessor()
        
        logger.info("🧠 Initializing NeuraScore engine...")
        neurascore_engine = NeuraScoreEngine()
        
        logger.info("📝 Initializing NLP analyzer...")
        nlp_analyzer = NLPAnalyzer()
        
        # Step 2: Load and process data
        logger.info("📂 Loading search logs...")
        search_logs = await data_processor.load_search_logs()
        logger.info(f"✅ Loaded {len(search_logs)} search log entries")
        
        logger.info("📋 Loading metadata...")
        metadata = await data_processor.load_metadata()
        logger.info(f"✅ Loaded {len(metadata)} metadata entries")
        
        # Step 3: Process interactions
        logger.info("🔄 Processing interactions...")
        processed_data = await data_processor.process_interactions()
        logger.info(f"✅ Processed {len(processed_data)} interactions")
        
        # Step 4: Calculate user metrics
        logger.info("📈 Calculating user metrics...")
        user_metrics = await data_processor.calculate_user_metrics()
        logger.info(f"✅ Calculated metrics for {len(user_metrics)} users")
        
        # Step 5: Train NeuraScore models
        logger.info("🎯 Training NeuraScore models...")
        await neurascore_engine.train_models(processed_data, user_metrics)
        logger.info("✅ NeuraScore models trained successfully")
        
        # Step 6: Train NLP models
        logger.info("🔤 Training NLP models...")
        await nlp_analyzer.train_models(processed_data)
        logger.info("✅ NLP models trained successfully")
        
        # Step 7: Generate sample insights
        logger.info("💡 Generating sample insights...")
        sample_insights = await neurascore_engine.generate_insights(user_metrics[:10])
        logger.info(f"✅ Generated {len(sample_insights)} sample insights")
        
        logger.info("🎉 Training pipeline completed successfully!")
        logger.info("📊 Model training summary:")
        logger.info(f"   - Search logs processed: {len(search_logs)}")
        logger.info(f"   - Interactions processed: {len(processed_data)}")
        logger.info(f"   - Users analyzed: {len(user_metrics)}")
        logger.info(f"   - Sample insights: {len(sample_insights)}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Training pipeline failed: {str(e)}")
        logger.exception("Full error details:")
        return False

if __name__ == "__main__":
    print("🎯 NeuraScore Model Training")
    print("=" * 50)
    
    success = asyncio.run(main())
    
    if success:
        print("\n✅ Training completed successfully!")
        print("🚀 Models are ready for use!")
    else:
        print("\n❌ Training failed!")
        print("🔧 Check logs for details.")
