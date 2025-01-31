from typing import Dict, List, Optional, Tuple
import torch
from transformers import AutoTokenizer, AutoModel, AutoModelForSequenceClassification
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from collections import defaultdict
import nltk
from nltk.tokenize import sent_tokenize
from ..logging.service import LoggingService
import os

class AdvancedTextAnalyzer:
    def __init__(self, testing_mode=False):
        self.logger = LoggingService()
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.logger.info(f"Device set to use {self.device}")
        
        # Initialize model containers
        self.model_instances = {}
        self.tokenizers = {}
        
        # Use smaller model for testing
        if testing_mode or os.getenv("TESTING") == "True":
            self.model_paths = {
                'ai_detector': 'distilbert-base-uncased',  # Smaller model for testing
            }
        else:
            self.model_paths = {
                'ai_detector': 'roberta-base-openai-detector',
            }
        
        self._initialize_models()
        self._initialize_nltk()

    def _initialize_models(self):
        """Initialize AI models with error handling and caching."""
        try:
            # Initialize AI detector model
            name = 'ai_detector'
            model_path = self.model_paths[name]
            
            if name not in self.model_instances:
                self.logger.info(f"Loading model: {model_path}")
                
                # Load tokenizer
                self.tokenizers[name] = AutoTokenizer.from_pretrained(
                    model_path,
                    local_files_only=False,  # Allow downloading
                    cache_dir='models'  # Store models locally
                )
                
                # Load model
                self.model_instances[name] = AutoModelForSequenceClassification.from_pretrained(
                    model_path,
                    local_files_only=False,  # Allow downloading
                    cache_dir='models'  # Store models locally
                )
                
                # Move model to appropriate device
                self.model_instances[name].to(self.device)
                
                self.logger.info(f"Successfully loaded {name} model")

        except Exception as e:
            self.logger.error(f"Error initializing models: {str(e)}")
            raise

    def _initialize_nltk(self):
        """Initialize NLTK resources."""
        try:
            nltk.download('punkt', quiet=True)
            nltk.download('averaged_perceptron_tagger', quiet=True)
            nltk.download('wordnet', quiet=True)

        except Exception as e:
            self.logger.error("Error initializing NLTK", e)
            raise

    def analyze_text(self, text: str, reference_texts: List[str] = None) -> Dict:
        """Perform comprehensive text analysis."""
        try:
            results = {
                "plagiarism_score": 0.0,
                "style_consistency": 0.0,
                "matches": [],
                "style_changes": [],
                "language_analysis": {},
                "complexity_metrics": {},
                "suspicious_segments": [],
                "is_ai_generated": False,
                "confidence_score": 0.0
            }
            
            # Basic text preprocessing
            sentences = sent_tokenize(text)
            
            # Analyze writing style
            style_results = self._analyze_writing_style(sentences)
            results.update(style_results)
            
            # Check for plagiarism if reference texts provided
            if reference_texts:
                plagiarism_results = self._check_plagiarism(
                    text,
                    reference_texts
                )
                results.update(plagiarism_results)
            
            # Analyze language patterns
            language_results = self._analyze_language_patterns(sentences)
            results["language_analysis"] = language_results
            
            # Calculate complexity metrics
            complexity_results = self._calculate_complexity(text)
            results["complexity_metrics"] = complexity_results
            
            # Get AI detector model and tokenizer
            model = self.model_instances.get('ai_detector')
            tokenizer = self.tokenizers.get('ai_detector')
            
            if not model or not tokenizer:
                raise ValueError("Models not properly initialized")
            
            # Tokenize and prepare input
            inputs = tokenizer(
                text,
                return_tensors="pt",
                truncation=True,
                max_length=512
            ).to(self.device)
            
            # Get prediction
            with torch.no_grad():
                outputs = model(**inputs)
                probabilities = torch.softmax(outputs.logits, dim=1)
                
            # Convert to Python types for JSON serialization
            is_ai_generated = bool(probabilities[0][1] > 0.5)
            confidence_score = float(probabilities[0][1])
            
            results["is_ai_generated"] = is_ai_generated
            results["confidence_score"] = confidence_score
            
            return results

        except Exception as e:
            self.logger.error("Error analyzing text", e)
            return {"error": str(e)}

    def _analyze_writing_style(self, sentences: List[str]) -> Dict:
        """Analyze writing style consistency."""
        try:
            style_embeddings = []
            style_changes = []
            
            # Get style embeddings for each sentence
            for i in range(0, len(sentences), self.settings["batch_size"]):
                batch = sentences[i:i + self.settings["batch_size"]]
                
                # Tokenize
                inputs = self.tokenizers["style"](
                    batch,
                    padding=True,
                    truncation=True,
                    return_tensors="pt",
                    max_length=self.settings["max_sequence_length"]
                )
                
                if self.settings["use_gpu"]:
                    inputs = {k: v.cuda() for k, v in inputs.items()}
                
                # Get embeddings
                with torch.no_grad():
                    outputs = self.model_instances["style"](**inputs)
                    embeddings = outputs.last_hidden_state[:, 0, :].cpu().numpy()
                    style_embeddings.extend(embeddings)
            
            # Analyze style consistency
            style_changes = self._detect_style_changes(style_embeddings)
            
            return {
                "style_consistency": self._calculate_style_consistency(style_embeddings),
                "style_changes": style_changes
            }

        except Exception as e:
            self.logger.error("Error analyzing writing style", e)
            return {"style_consistency": 0.0, "style_changes": []}

    def _check_plagiarism(self, text: str, reference_texts: List[str]) -> Dict:
        """Check for potential plagiarism."""
        try:
            results = {
                "plagiarism_score": 0.0,
                "matches": []
            }
            
            # Get text embeddings
            text_embedding = self._get_text_embedding(text)
            
            # Compare with reference texts
            for ref_idx, ref_text in enumerate(reference_texts):
                ref_embedding = self._get_text_embedding(ref_text)
                
                similarity = cosine_similarity(
                    text_embedding.reshape(1, -1),
                    ref_embedding.reshape(1, -1)
                )[0][0]
                
                if similarity > self.settings["min_similarity_threshold"]:
                    results["matches"].append({
                        "reference_id": ref_idx,
                        "similarity": float(similarity),
                        "segments": self._find_similar_segments(
                            text,
                            ref_text
                        )
                    })
            
            # Calculate overall plagiarism score
            if results["matches"]:
                results["plagiarism_score"] = max(
                    match["similarity"] for match in results["matches"]
                )
            
            return results

        except Exception as e:
            self.logger.error("Error checking plagiarism", e)
            return {"plagiarism_score": 0.0, "matches": []}

    def _get_text_embedding(self, text: str) -> np.ndarray:
        """Get text embedding using the embedding model."""
        try:
            inputs = self.tokenizers["embedding"](
                text,
                padding=True,
                truncation=True,
                return_tensors="pt",
                max_length=self.settings["max_sequence_length"]
            )
            
            if self.settings["use_gpu"]:
                inputs = {k: v.cuda() for k, v in inputs.items()}
            
            with torch.no_grad():
                outputs = self.model_instances["embedding"](**inputs)
                return outputs.last_hidden_state[:, 0, :].cpu().numpy()

        except Exception as e:
            self.logger.error("Error getting text embedding", e)
            return np.zeros((1, 768))  # Default embedding size

    def _find_similar_segments(self, text1: str, text2: str) -> List[Dict]:
        """Find similar text segments between two texts."""
        try:
            segments = []
            sentences1 = sent_tokenize(text1)
            sentences2 = sent_tokenize(text2)
            
            # Compare sentence pairs
            for i, sent1 in enumerate(sentences1):
                for j, sent2 in enumerate(sentences2):
                    similarity = self._calculate_sentence_similarity(
                        sent1,
                        sent2
                    )
                    
                    if similarity > self.settings["min_similarity_threshold"]:
                        segments.append({
                            "text1_start": i,
                            "text2_start": j,
                            "text1_content": sent1,
                            "text2_content": sent2,
                            "similarity": float(similarity)
                        })
            
            return segments

        except Exception as e:
            self.logger.error("Error finding similar segments", e)
            return []

    def _calculate_sentence_similarity(self, sent1: str, sent2: str) -> float:
        """Calculate similarity between two sentences."""
        try:
            # Get embeddings
            emb1 = self._get_text_embedding(sent1)
            emb2 = self._get_text_embedding(sent2)
            
            # Calculate cosine similarity
            return float(cosine_similarity(emb1, emb2)[0][0])

        except Exception as e:
            self.logger.error("Error calculating sentence similarity", e)
            return 0.0

    def _detect_style_changes(self, style_embeddings: List[np.ndarray]) -> List[Dict]:
        """Detect significant changes in writing style."""
        try:
            changes = []
            window_size = self.settings["context_window"]
            
            for i in range(window_size, len(style_embeddings)):
                # Compare current window with previous
                current = np.mean(style_embeddings[i-window_size:i], axis=0)
                previous = np.mean(style_embeddings[i:i+window_size], axis=0)
                
                similarity = float(cosine_similarity(
                    current.reshape(1, -1),
                    previous.reshape(1, -1)
                )[0][0])
                
                if similarity < self.settings["style_change_threshold"]:
                    changes.append({
                        "position": i,
                        "confidence": 1 - similarity
                    })
            
            return changes

        except Exception as e:
            self.logger.error("Error detecting style changes", e)
            return []

    def _calculate_complexity(self, text: str) -> Dict:
        """Calculate text complexity metrics."""
        try:
            words = text.split()
            sentences = sent_tokenize(text)
            
            return {
                "word_count": len(words),
                "sentence_count": len(sentences),
                "avg_word_length": np.mean([len(w) for w in words]),
                "avg_sentence_length": len(words) / len(sentences),
                "unique_words": len(set(words)),
                "lexical_density": len(set(words)) / len(words)
            }

        except Exception as e:
            self.logger.error("Error calculating complexity", e)
            return {}

    def _calculate_style_consistency(self, style_embeddings: List[np.ndarray]) -> float:
        """Calculate overall style consistency score."""
        try:
            if len(style_embeddings) < 2:
                return 1.0
            
            # Calculate pairwise similarities
            similarities = []
            for i in range(len(style_embeddings)-1):
                similarity = cosine_similarity(
                    style_embeddings[i].reshape(1, -1),
                    style_embeddings[i+1].reshape(1, -1)
                )[0][0]
                similarities.append(similarity)
            
            return float(np.mean(similarities))

        except Exception as e:
            self.logger.error("Error calculating style consistency", e)
            return 0.0 