"""
Data Processing Module for NeuraScore
Handles loading, cleaning, and processing of user interaction logs
"""

import pandas as pd
import numpy as np
import json
import ast
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataProcessor:
    """Processes raw user interaction logs and metadata"""
    
    def __init__(self):
        self.data_path = Path("../data")
        self.search_logs_df = None
        self.metadata_df = None
        self.processed_interactions = None
        self.user_metrics = None
        
    async def load_search_logs(self) -> pd.DataFrame:
        """Load and parse search log data"""
        try:
            logger.info("Loading search logs...")
            
            # Read the search log file
            search_log_path = self.data_path / "2019_search_log_sessioned.txt"
            
            # Parse JSON-like strings from the file
            logs = []
            with open(search_log_path, 'r', encoding='utf-8') as file:
                for line_num, line in enumerate(file, 1):
                    try:
                        # Clean and parse the line as JSON
                        line = line.strip()
                        if line:
                            # Replace single quotes with double quotes for valid JSON
                            line = line.replace("'", '"').replace('None', 'null')
                            log_entry = json.loads(line)
                            logs.append(log_entry)
                    except json.JSONDecodeError as e:
                        logger.warning(f"Skipping invalid JSON on line {line_num}: {e}")
                        continue
                    
                    # Limit for development (remove in production)
                    if len(logs) >= 50000:  # Process first 50k records for development
                        break
            
            # Convert to DataFrame
            self.search_logs_df = pd.DataFrame(logs)
            
            # Data cleaning and type conversion
            self.search_logs_df['timestamp'] = pd.to_datetime(self.search_logs_df['timestamp'])
            self.search_logs_df['session_no'] = self.search_logs_df['session_no'].astype(int)
            
            # Create synthetic user IDs based on session patterns
            self.search_logs_df = self._create_user_ids()
            
            logger.info(f"Loaded {len(self.search_logs_df)} interaction records")
            return self.search_logs_df
            
        except Exception as e:
            logger.error(f"Error loading search logs: {e}")
            raise
    
    async def load_metadata(self) -> pd.DataFrame:
        """Load dataset metadata"""
        try:
            logger.info("Loading metadata...")
            
            metadata_path = self.data_path / "id_to_title_subject.csv"
            self.metadata_df = pd.read_csv(metadata_path)
            
            # Use the first column as record_id if it's unnamed
            if self.metadata_df.columns[0] == 'Unnamed: 0':
                self.metadata_df = self.metadata_df.rename(columns={'Unnamed: 0': 'record_id'})
            elif self.metadata_df.columns[0] != 'record_id':
                self.metadata_df['record_id'] = self.metadata_df.iloc[:, 0]
            
            # Ensure record_id is string type
            self.metadata_df['record_id'] = self.metadata_df['record_id'].astype(str)
            
            # Clean and parse subject keywords
            self.metadata_df['subject_keywords'] = self.metadata_df['tsubject_keyword'].apply(
                self._parse_list_string
            )
            self.metadata_df['subject_categories'] = self.metadata_df['tsubject_anzsrc_for'].apply(
                self._parse_list_string
            )
            
            logger.info(f"Loaded metadata for {len(self.metadata_df)} datasets")
            return self.metadata_df
            
        except Exception as e:
            logger.error(f"Error loading metadata: {e}")
            raise
    
    def _create_user_ids(self) -> pd.DataFrame:
        """Create synthetic user IDs based on session patterns and referrers"""
        df = self.search_logs_df.copy()
        
        # Group sessions by referrer and time patterns to identify likely users
        df['date'] = df['timestamp'].dt.date
        df['hour'] = df['timestamp'].dt.hour
        
        # Create user fingerprint based on referrer, time patterns, and record access patterns
        user_mapping = {}
        user_counter = 1
        
        for session_no in df['session_no'].unique():
            session_data = df[df['session_no'] == session_no]
            
            # Create fingerprint
            referrer = session_data['http_referer'].iloc[0] or 'direct'
            date = session_data['date'].iloc[0]
            hour_range = session_data['hour'].iloc[0] // 4  # 4-hour blocks
            
            fingerprint = f"{referrer}_{date}_{hour_range}"
            
            if fingerprint not in user_mapping:
                user_mapping[fingerprint] = f"user_{user_counter:05d}"
                user_counter += 1
            
            df.loc[df['session_no'] == session_no, 'user_id'] = user_mapping[fingerprint]
        
        logger.info(f"Created {len(user_mapping)} synthetic users from session data")
        return df
    
    def _parse_list_string(self, list_str: str) -> List[str]:
        """Parse string representation of list"""
        if pd.isna(list_str) or list_str == '':
            return []
        try:
            # Handle string representation of lists
            if isinstance(list_str, str):
                # Remove extra quotes and parse
                list_str = list_str.strip("'\"")
                return ast.literal_eval(list_str)
            return list_str
        except (ValueError, SyntaxError):
            return []
    
    async def process_interactions(self) -> pd.DataFrame:
        """Process user interactions to extract meaningful features"""
        try:
            logger.info("Processing user interactions...")
            
            if self.search_logs_df is None:
                await self.load_search_logs()
            
            df = self.search_logs_df.copy()
            
            # Calculate session-level metrics
            session_metrics = df.groupby(['user_id', 'session_no']).agg({
                'timestamp': ['min', 'max', 'count'],
                'record_id': 'nunique',
                'event': lambda x: list(x)
            }).reset_index()
            
            # Flatten column names
            session_metrics.columns = [
                'user_id', 'session_no', 'session_start', 'session_end', 
                'interaction_count', 'unique_records', 'events'
            ]
            
            # Calculate session duration
            session_metrics['session_duration'] = (
                session_metrics['session_end'] - session_metrics['session_start']
            ).dt.total_seconds() / 60  # in minutes
            
            # Calculate interaction diversity
            session_metrics['event_diversity'] = session_metrics['events'].apply(
                lambda x: len(set(x))
            )
            
            self.processed_interactions = session_metrics
            logger.info(f"Processed {len(session_metrics)} sessions")
            
            return session_metrics
            
        except Exception as e:
            logger.error(f"Error processing interactions: {e}")
            raise
    
    async def enrich_with_metadata(self):
        """Enrich interaction data with dataset metadata"""
        try:
            logger.info("Enriching data with metadata...")
            
            if self.metadata_df is None:
                await self.load_metadata()
            
            # Merge with metadata
            if self.metadata_df is not None:
                # Ensure record_id is string type in both dataframes
                interactions_df = self.search_logs_df.copy()
                interactions_df['record_id'] = interactions_df['record_id'].astype(str)
                self.metadata_df['record_id'] = self.metadata_df['record_id'].astype(str)
                
                interactions_df = interactions_df.merge(
                    self.metadata_df, 
                    on='record_id', 
                    how='left'
                )
                
                self.search_logs_df = interactions_df
                logger.info("Data enrichment completed")
            
        except Exception as e:
            logger.error(f"Error enriching data: {e}")
            raise
    
    async def calculate_user_metrics(self) -> pd.DataFrame:
        """Calculate comprehensive user-level metrics"""
        try:
            logger.info("Calculating user metrics...")
            
            if self.processed_interactions is None:
                await self.process_interactions()
            
            # User-level aggregations
            user_metrics = self.processed_interactions.groupby('user_id').agg({
                'session_no': 'count',  # total sessions
                'interaction_count': ['sum', 'mean'],  # total and avg interactions
                'unique_records': ['sum', 'mean'],  # total and avg unique records
                'session_duration': ['sum', 'mean'],  # total and avg session time
                'event_diversity': 'mean',  # average event diversity
                'session_start': ['min', 'max']  # activity period
            }).reset_index()
            
            # Flatten column names
            user_metrics.columns = [
                'user_id', 'total_sessions', 'total_interactions', 'avg_interactions_per_session',
                'total_unique_records', 'avg_unique_records_per_session', 'total_session_time',
                'avg_session_duration', 'avg_event_diversity', 'first_activity', 'last_activity'
            ]
            
            # Calculate additional metrics
            user_metrics['activity_span_days'] = (
                user_metrics['last_activity'] - user_metrics['first_activity']
            ).dt.days + 1
            
            user_metrics['sessions_per_day'] = (
                user_metrics['total_sessions'] / user_metrics['activity_span_days']
            )
            
            # Calculate subject diversity for each user
            user_subject_diversity = self._calculate_subject_diversity()
            user_metrics = user_metrics.merge(user_subject_diversity, on='user_id', how='left')
            
            self.user_metrics = user_metrics
            logger.info(f"Calculated metrics for {len(user_metrics)} users")
            
            return user_metrics
            
        except Exception as e:
            logger.error(f"Error calculating user metrics: {e}")
            raise
    
    def _calculate_subject_diversity(self) -> pd.DataFrame:
        """Calculate subject diversity metrics for users"""
        try:
            # Get user-subject interactions
            user_subjects = self.search_logs_df.groupby('user_id')['subject_categories'].apply(
                lambda x: [cat for sublist in x.dropna() for cat in sublist if isinstance(sublist, list)]
            ).reset_index()
            
            user_subjects['unique_subjects'] = user_subjects['subject_categories'].apply(
                lambda x: len(set(x)) if x else 0
            )
            
            user_subjects['subject_diversity_score'] = user_subjects['subject_categories'].apply(
                self._calculate_diversity_index
            )
            
            return user_subjects[['user_id', 'unique_subjects', 'subject_diversity_score']]
            
        except Exception as e:
            logger.error(f"Error calculating subject diversity: {e}")
            return pd.DataFrame(columns=['user_id', 'unique_subjects', 'subject_diversity_score'])
    
    def _calculate_diversity_index(self, items: List[str]) -> float:
        """Calculate Shannon diversity index"""
        if not items:
            return 0.0
        
        # Count frequencies
        from collections import Counter
        counts = Counter(items)
        total = len(items)
        
        # Calculate Shannon index
        shannon_index = 0.0
        for count in counts.values():
            p = count / total
            if p > 0:
                shannon_index -= p * np.log(p)
        
        return shannon_index
    
    async def get_stats(self) -> Dict[str, Any]:
        """Get processing statistics"""
        stats = {
            "total_interactions": len(self.search_logs_df) if self.search_logs_df is not None else 0,
            "total_users": len(self.user_metrics) if self.user_metrics is not None else 0,
            "total_datasets": len(self.metadata_df) if self.metadata_df is not None else 0,
            "processing_date": datetime.now().isoformat(),
            "data_quality": {
                "missing_referrers": 0,
                "invalid_timestamps": 0,
                "duplicate_sessions": 0
            }
        }
        
        if self.search_logs_df is not None:
            stats["data_quality"]["missing_referrers"] = self.search_logs_df['http_referer'].isna().sum()
            stats["date_range"] = {
                "start": self.search_logs_df['timestamp'].min().isoformat(),
                "end": self.search_logs_df['timestamp'].max().isoformat()
            }
        
        return stats
