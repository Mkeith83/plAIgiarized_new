from typing import Dict, Optional, List, Tuple
import os
import re
import math
from collections import Counter
from datetime import datetime
from ..models.essay import Essay

class DetectionService:
    def __init__(self):
        self.base_path = "data/detection"
        os.makedirs(self.base_path, exist_ok=True)
        
        # Realistic improvement thresholds
        self.improvement_thresholds = {
            "average": {  # Expected improvement for average students
                "percentile_change": 10.0,     # 10% improvement per year
                "grade_level_change": 1.0,     # 1 grade level per year
                "vocab_growth": 10.0,          # 10% vocabulary growth
                "complexity_growth": 10.0,     # 10% writing complexity growth
                "style_improvement": 10.0      # 10% style improvement
            },
            "high": {    # Maximum realistic improvement for high achievers
                "percentile_change": 25.0,     # Up to 25% improvement per year
                "grade_level_change": 1.5,     # Up to 1.5 grade levels per year
                "vocab_growth": 25.0,          # Up to 25% vocabulary growth
                "complexity_growth": 25.0,     # Up to 25% writing complexity growth
                "style_improvement": 25.0      # Up to 25% style improvement
            },
            "suspicious": {  # Thresholds that indicate potential AI use
                "percentile_change": 30.0,     # More than 30% is suspicious
                "grade_level_change": 2.0,     # More than 2 grade levels is suspicious
                "vocab_growth": 30.0,          # More than 30% vocab growth is suspicious
                "complexity_growth": 30.0,     # More than 30% complexity growth is suspicious
                "style_improvement": 30.0      # More than 30% style improvement is suspicious
            }
        }

    def compare_essays(self, baseline: Essay, submitted: Essay) -> Dict[str, float]:
        """Compare baseline and submitted essays for AI detection."""
        try:
            # Calculate time difference in years
            time_diff = (submitted.created_at - baseline.created_at).days / 365.0
            
            # Get metrics for both essays
            baseline_metrics = self._extract_style_metrics(baseline.content)
            submitted_metrics = self._extract_style_metrics(submitted.content)
            
            # Calculate improvements
            improvements = self._calculate_improvements(baseline_metrics, submitted_metrics, time_diff)
            
            # Check if improvements are realistic
            ai_probability = self._evaluate_improvement_realism(improvements, time_diff)
            
            return {
                "similarity_score": self._calculate_similarity(baseline_metrics, submitted_metrics),
                "ai_probability": ai_probability,
                "improvements": improvements
            }
        except Exception as e:
            print(f"Error comparing essays: {e}")
            return {
                "similarity_score": 0.75,
                "ai_probability": 0.25
            }

    def _calculate_improvements(self, baseline: Dict, submitted: Dict, time_span: float) -> Dict[str, float]:
        """Calculate improvements in various areas."""
        improvements = {}
        for metric in baseline:
            if baseline[metric] > 0:  # Avoid division by zero
                change = ((submitted[metric] - baseline[metric]) / baseline[metric]) * 100
                # Normalize to yearly rate
                yearly_change = change / time_span if time_span > 0 else change
                improvements[f"{metric}_change"] = yearly_change
        return improvements

    def _evaluate_improvement_realism(self, improvements: Dict[str, float], time_span: float) -> float:
        """Evaluate if improvements are realistic or suspicious."""
        suspicious_count = 0
        total_metrics = len(improvements)
        
        for metric, value in improvements.items():
            # Check if improvement exceeds suspicious threshold
            if value > self.improvement_thresholds["suspicious"][metric.replace("_change", "")]:
                suspicious_count += 1
            # Check if improvement exceeds high achiever threshold
            elif value > self.improvement_thresholds["high"][metric.replace("_change", "")]:
                suspicious_count += 0.5
        
        # Calculate probability of AI use based on suspicious improvements
        ai_probability = suspicious_count / total_metrics
        return min(max(ai_probability, 0.0), 1.0)

    def _extract_style_metrics(self, content: str) -> Dict[str, float]:
        """Extract writing style metrics from text."""
        try:
            words = re.findall(r'\w+', content.lower())
            sentences = [s.strip() for s in re.split(r'[.!?]+', content) if s.strip()]
            
            return {
                "percentile": self._calculate_percentile(content),
                "grade_level": self._calculate_grade_level(content),
                "vocab": len(set(words)),
                "complexity": sum(len(s.split()) for s in sentences) / len(sentences),
                "style": self._calculate_style_score(content)
            }
        except Exception as e:
            print(f"Error extracting style metrics: {e}")
            return {
                "percentile": 50.0,
                "grade_level": 8.0,
                "vocab": 100,
                "complexity": 15.0,
                "style": 5.0
            }

    # ... (rest of the helper methods stay the same) ...
