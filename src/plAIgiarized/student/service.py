from typing import Dict, List, Optional
from datetime import datetime
from pathlib import Path
import json
import numpy as np
from ..logging.service import LoggingService
from ..database.service import DatabaseService
from ..analysis.service import AnalysisService

class StudentProgressService:
    def __init__(self):
        self.logger = LoggingService()
        self.db = DatabaseService()
        self.analyzer = AnalysisService()
        
        # Progress tracking settings
        self.settings = {
            "min_essays_for_trend": 3,
            "significant_improvement_threshold": 0.5,  # 50% improvement
            "anomaly_threshold": 2.0,  # 2 standard deviations
            "grade_level_jump_threshold": 2.0,  # 2 grade levels
            "metrics": [
                "grade_level",
                "vocabulary_diversity",
                "syntax_complexity",
                "writing_style",
                "coherence"
            ]
        }

    def set_student_baseline(self, student_id: str, essay_ids: List[str]) -> bool:
        """Set baseline essays for a student."""
        try:
            # Get and analyze all baseline essays
            baseline_analyses = []
            for essay_id in essay_ids:
                essay = self.db.get_essay(essay_id)
                if not essay:
                    raise ValueError(f"Essay not found: {essay_id}")
                analysis = self.analyzer._analyze_text(essay["content"])
                baseline_analyses.append(analysis)

            # Calculate average baseline metrics
            baseline = self._calculate_average_metrics(baseline_analyses)
            baseline["student_id"] = student_id
            baseline["essay_ids"] = essay_ids
            baseline["timestamp"] = datetime.now().isoformat()

            # Store baseline
            return self.db.set_student_baseline(student_id, baseline)

        except Exception as e:
            self.logger.error(f"Error setting baseline for student {student_id}", e)
            return False

    def analyze_progress(self, student_id: str, new_essay_id: str) -> Dict:
        """Analyze student's progress compared to their baseline."""
        try:
            # Get baseline
            baseline = self.db.get_student_baseline(student_id)
            if not baseline:
                raise ValueError(f"No baseline found for student {student_id}")

            # Get previous essays for trend analysis
            previous_essays = self.db.get_student_essays(student_id)
            
            # Analyze new essay
            new_essay = self.db.get_essay(new_essay_id)
            if not new_essay:
                raise ValueError(f"Essay not found: {new_essay_id}")
            
            new_analysis = self.analyzer.analyze_essay(new_essay_id)

            # Calculate progress metrics
            progress = {
                "student_id": student_id,
                "essay_id": new_essay_id,
                "timestamp": datetime.now().isoformat(),
                "metrics": self._calculate_progress_metrics(baseline, new_analysis),
                "trends": self._analyze_trends(previous_essays, new_analysis),
                "anomalies": self._detect_anomalies(baseline, previous_essays, new_analysis),
                "recommendations": self._generate_recommendations(baseline, new_analysis)
            }

            # Store progress report
            self.db.store_progress_report(progress)

            return progress

        except Exception as e:
            self.logger.error(f"Error analyzing progress for student {student_id}", e)
            return None

    def _calculate_progress_metrics(self, baseline: Dict, new_analysis: Dict) -> Dict:
        """Calculate progress metrics comparing to baseline."""
        try:
            metrics = {}
            for metric in self.settings["metrics"]:
                if metric in baseline and metric in new_analysis:
                    baseline_value = baseline[metric]
                    new_value = new_analysis[metric]
                    
                    # Calculate absolute and relative change
                    abs_change = new_value - baseline_value
                    rel_change = (new_value - baseline_value) / baseline_value if baseline_value != 0 else 0
                    
                    metrics[metric] = {
                        "baseline": baseline_value,
                        "current": new_value,
                        "absolute_change": abs_change,
                        "relative_change": rel_change,
                        "significant_improvement": rel_change > self.settings["significant_improvement_threshold"]
                    }
            
            return metrics

        except Exception as e:
            self.logger.error("Error calculating progress metrics", e)
            return {}

    def _analyze_trends(self, previous_essays: List[Dict], new_analysis: Dict) -> Dict:
        """Analyze trends in student's writing."""
        try:
            if len(previous_essays) < self.settings["min_essays_for_trend"]:
                return {"sufficient_data": False}

            trends = {}
            for metric in self.settings["metrics"]:
                values = [essay["analysis"][metric] for essay in previous_essays 
                         if "analysis" in essay and metric in essay["analysis"]]
                values.append(new_analysis[metric])
                
                if len(values) >= self.settings["min_essays_for_trend"]:
                    # Calculate trend using linear regression
                    x = np.arange(len(values))
                    z = np.polyfit(x, values, 1)
                    slope = z[0]
                    
                    trends[metric] = {
                        "slope": slope,
                        "improving": slope > 0,
                        "trend_strength": self._calculate_trend_strength(values)
                    }

            return {"sufficient_data": True, "metrics": trends}

        except Exception as e:
            self.logger.error("Error analyzing trends", e)
            return {"sufficient_data": False}

    def _detect_anomalies(self, baseline: Dict, previous_essays: List[Dict], 
                         new_analysis: Dict) -> Dict:
        """Detect anomalies in student's writing."""
        try:
            anomalies = {}
            
            # Check for sudden grade level jumps
            grade_change = new_analysis["grade_level"] - baseline["grade_level"]
            if abs(grade_change) > self.settings["grade_level_jump_threshold"]:
                anomalies["grade_level_jump"] = {
                    "change": grade_change,
                    "severity": "high" if abs(grade_change) > 3 else "medium"
                }

            # Check for statistical anomalies in metrics
            for metric in self.settings["metrics"]:
                if metric in baseline and metric in new_analysis:
                    values = [essay["analysis"][metric] for essay in previous_essays 
                             if "analysis" in essay and metric in essay["analysis"]]
                    
                    if values:
                        mean = np.mean(values)
                        std = np.std(values)
                        z_score = (new_analysis[metric] - mean) / std if std != 0 else 0
                        
                        if abs(z_score) > self.settings["anomaly_threshold"]:
                            anomalies[metric] = {
                                "z_score": z_score,
                                "severity": "high" if abs(z_score) > 3 else "medium"
                            }

            return anomalies

        except Exception as e:
            self.logger.error("Error detecting anomalies", e)
            return {}

    def _generate_recommendations(self, baseline: Dict, new_analysis: Dict) -> List[str]:
        """Generate personalized recommendations based on analysis."""
        try:
            recommendations = []
            
            # Check grade level
            grade_change = new_analysis["grade_level"] - baseline["grade_level"]
            if grade_change < 0:
                recommendations.append(
                    "Consider using more complex sentence structures and vocabulary "
                    "to maintain your previous grade level."
                )
            
            # Check vocabulary
            if new_analysis["vocabulary_diversity"] < baseline["vocabulary_diversity"]:
                recommendations.append(
                    "Try to incorporate a wider range of vocabulary. Consider using "
                    "synonyms to avoid word repetition."
                )
            
            # Check coherence
            if new_analysis["coherence"] < baseline["coherence"]:
                recommendations.append(
                    "Focus on improving paragraph transitions and maintaining a clear "
                    "flow of ideas throughout your writing."
                )
            
            return recommendations

        except Exception as e:
            self.logger.error("Error generating recommendations", e)
            return []

    def _calculate_trend_strength(self, values: List[float]) -> float:
        """Calculate the strength of a trend using R-squared value."""
        try:
            x = np.arange(len(values))
            z = np.polyfit(x, values, 1)
            p = np.poly1d(z)
            
            # Calculate R-squared
            y_hat = p(x)
            y_bar = np.mean(values)
            ss_tot = sum((values - y_bar) ** 2)
            ss_res = sum((values - y_hat) ** 2)
            
            r_squared = 1 - (ss_res / ss_tot)
            return r_squared

        except Exception as e:
            self.logger.error("Error calculating trend strength", e)
            return 0.0 