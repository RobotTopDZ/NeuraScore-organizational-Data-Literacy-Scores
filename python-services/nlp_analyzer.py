"""
NLP Analyzer for NeuraScore
Analyzes text quality, query diversity, and documentation metrics
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
import logging
import re
from collections import Counter
import textstat
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

logger = logging.getLogger(__name__)

class NLPAnalyzer:
    """Analyzes text content for quality and diversity metrics"""
    
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        
    async def analyze_text(self, text: str) -> Dict[str, Any]:
        """Analyze a single text for quality metrics"""
        try:
            if not text or not isinstance(text, str):
                return self._empty_analysis()
            
            # Basic text statistics
            word_count = len(word_tokenize(text))
            sentence_count = len(sent_tokenize(text))
            char_count = len(text)
            
            # Readability metrics
            readability = {
                'flesch_reading_ease': textstat.flesch_reading_ease(text),
                'flesch_kincaid_grade': textstat.flesch_kincaid_grade(text),
                'automated_readability_index': textstat.automated_readability_index(text),
                'coleman_liau_index': textstat.coleman_liau_index(text)
            }
            
            # Vocabulary richness
            words = [word.lower() for word in word_tokenize(text) 
                    if word.isalpha() and word.lower() not in self.stop_words]
            
            vocabulary_richness = len(set(words)) / len(words) if words else 0
            
            # Semantic complexity
            semantic_score = self._calculate_semantic_complexity(text)
            
            return {
                'word_count': word_count,
                'sentence_count': sentence_count,
                'char_count': char_count,
                'avg_words_per_sentence': word_count / sentence_count if sentence_count > 0 else 0,
                'vocabulary_richness': vocabulary_richness,
                'readability': readability,
                'semantic_complexity': semantic_score,
                'quality_score': self._calculate_quality_score(
                    word_count, vocabulary_richness, readability, semantic_score
                )
            }
            
        except Exception as e:
            logger.error(f"Error analyzing text: {e}")
            return self._empty_analysis()
    
    def _empty_analysis(self) -> Dict[str, Any]:
        """Return empty analysis structure"""
        return {
            'word_count': 0,
            'sentence_count': 0,
            'char_count': 0,
            'avg_words_per_sentence': 0,
            'vocabulary_richness': 0,
            'readability': {
                'flesch_reading_ease': 0,
                'flesch_kincaid_grade': 0,
                'automated_readability_index': 0,
                'coleman_liau_index': 0
            },
            'semantic_complexity': 0,
            'quality_score': 0
        }
    
    def _calculate_semantic_complexity(self, text: str) -> float:
        """Calculate semantic complexity based on vocabulary and structure"""
        try:
            words = word_tokenize(text.lower())
            words = [w for w in words if w.isalpha() and w not in self.stop_words]
            
            if not words:
                return 0.0
            
            # Measure vocabulary diversity
            word_freq = Counter(words)
            unique_words = len(word_freq)
            total_words = len(words)
            
            # Calculate entropy (information content)
            entropy = 0.0
            for count in word_freq.values():
                p = count / total_words
                if p > 0:
                    entropy -= p * np.log2(p)
            
            # Normalize entropy by maximum possible entropy
            max_entropy = np.log2(unique_words) if unique_words > 1 else 1
            normalized_entropy = entropy / max_entropy if max_entropy > 0 else 0
            
            return min(normalized_entropy * 100, 100)
            
        except Exception as e:
            logger.error(f"Error calculating semantic complexity: {e}")
            return 0.0
    
    def _calculate_quality_score(self, word_count: int, vocab_richness: float, 
                                readability: Dict[str, float], semantic_score: float) -> float:
        """Calculate overall text quality score"""
        try:
            # Normalize components
            length_score = min(word_count / 100, 1) * 20  # Up to 20 points for length
            vocab_score = vocab_richness * 30  # Up to 30 points for vocabulary
            
            # Readability score (inverse of complexity - easier to read is better for documentation)
            flesch_score = max(0, readability.get('flesch_reading_ease', 0))
            readability_score = min(flesch_score / 100, 1) * 25  # Up to 25 points
            
            # Semantic complexity score
            complexity_score = semantic_score / 100 * 25  # Up to 25 points
            
            total_score = length_score + vocab_score + readability_score + complexity_score
            return min(total_score, 100)
            
        except Exception as e:
            logger.error(f"Error calculating quality score: {e}")
            return 0.0
    
    async def analyze_query_diversity(self, queries: List[str]) -> Dict[str, Any]:
        """Analyze diversity of search queries"""
        try:
            if not queries:
                return {'diversity_score': 0, 'unique_terms': 0, 'avg_query_length': 0}
            
            # Clean and tokenize queries
            cleaned_queries = []
            all_terms = []
            
            for query in queries:
                if query and isinstance(query, str):
                    # Basic cleaning
                    clean_query = re.sub(r'[^\w\s]', ' ', query.lower())
                    terms = [term for term in clean_query.split() 
                            if term and term not in self.stop_words]
                    cleaned_queries.append(' '.join(terms))
                    all_terms.extend(terms)
            
            if not cleaned_queries:
                return {'diversity_score': 0, 'unique_terms': 0, 'avg_query_length': 0}
            
            # Calculate diversity metrics
            unique_terms = len(set(all_terms))
            total_terms = len(all_terms)
            term_diversity = unique_terms / total_terms if total_terms > 0 else 0
            
            # Calculate semantic diversity using TF-IDF
            try:
                tfidf_matrix = self.vectorizer.fit_transform(cleaned_queries)
                similarity_matrix = cosine_similarity(tfidf_matrix)
                
                # Average pairwise similarity (lower = more diverse)
                n_queries = len(cleaned_queries)
                if n_queries > 1:
                    total_similarity = 0
                    pairs = 0
                    for i in range(n_queries):
                        for j in range(i + 1, n_queries):
                            total_similarity += similarity_matrix[i][j]
                            pairs += 1
                    avg_similarity = total_similarity / pairs if pairs > 0 else 0
                    semantic_diversity = 1 - avg_similarity  # Convert to diversity score
                else:
                    semantic_diversity = 1.0
            except:
                semantic_diversity = term_diversity
            
            # Calculate average query length
            avg_length = np.mean([len(q.split()) for q in cleaned_queries])
            
            # Combined diversity score
            diversity_score = (term_diversity * 0.4 + semantic_diversity * 0.6) * 100
            
            return {
                'diversity_score': min(diversity_score, 100),
                'unique_terms': unique_terms,
                'total_terms': total_terms,
                'term_diversity': term_diversity,
                'semantic_diversity': semantic_diversity,
                'avg_query_length': avg_length,
                'query_count': len(cleaned_queries)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing query diversity: {e}")
            return {'diversity_score': 0, 'unique_terms': 0, 'avg_query_length': 0}
    
    async def analyze_documentation_quality(self, documents: List[str]) -> Dict[str, Any]:
        """Analyze quality of documentation/metadata"""
        try:
            if not documents:
                return {'overall_quality': 0, 'avg_readability': 0, 'completeness': 0}
            
            quality_scores = []
            readability_scores = []
            completeness_scores = []
            
            for doc in documents:
                if doc and isinstance(doc, str):
                    analysis = await self.analyze_text(doc)
                    quality_scores.append(analysis['quality_score'])
                    readability_scores.append(analysis['readability']['flesch_reading_ease'])
                    
                    # Completeness based on length and structure
                    completeness = min(len(doc.split()) / 50, 1) * 100  # Target ~50 words
                    completeness_scores.append(completeness)
            
            return {
                'overall_quality': np.mean(quality_scores) if quality_scores else 0,
                'avg_readability': np.mean(readability_scores) if readability_scores else 0,
                'completeness': np.mean(completeness_scores) if completeness_scores else 0,
                'document_count': len([d for d in documents if d]),
                'quality_distribution': {
                    'excellent': len([s for s in quality_scores if s >= 80]),
                    'good': len([s for s in quality_scores if 60 <= s < 80]),
                    'fair': len([s for s in quality_scores if 40 <= s < 60]),
                    'poor': len([s for s in quality_scores if s < 40])
                }
            }
            
        except Exception as e:
            logger.error(f"Error analyzing documentation quality: {e}")
            return {'overall_quality': 0, 'avg_readability': 0, 'completeness': 0}
    
    async def extract_key_topics(self, texts: List[str], n_topics: int = 10) -> List[Dict[str, Any]]:
        """Extract key topics from a collection of texts"""
        try:
            if not texts:
                return []
            
            # Clean texts
            cleaned_texts = []
            for text in texts:
                if text and isinstance(text, str):
                    clean_text = re.sub(r'[^\w\s]', ' ', text.lower())
                    cleaned_texts.append(clean_text)
            
            if not cleaned_texts:
                return []
            
            # Use TF-IDF to find important terms
            tfidf_matrix = self.vectorizer.fit_transform(cleaned_texts)
            feature_names = self.vectorizer.get_feature_names_out()
            
            # Get top terms by TF-IDF score
            tfidf_scores = tfidf_matrix.sum(axis=0).A1
            top_indices = tfidf_scores.argsort()[-n_topics:][::-1]
            
            topics = []
            for idx in top_indices:
                topics.append({
                    'term': feature_names[idx],
                    'score': float(tfidf_scores[idx]),
                    'frequency': int(tfidf_matrix[:, idx].nnz)
                })
            
            return topics
            
        except Exception as e:
            logger.error(f"Error extracting topics: {e}")
            return []
