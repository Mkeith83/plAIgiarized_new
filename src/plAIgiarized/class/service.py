from typing import Dict, List, Optional, Tuple
from datetime import datetime
import numpy as np
from scipy import stats
from collections import defaultdict
import pandas as pd
from ..logging.service import LoggingService
from ..database.service import DatabaseService
from ..student.service import StudentProgressService

class ClassProgressService:
    def __init__(self):
        self.logger = LoggingService()
        self.db = DatabaseService()
        self.student_service = StudentProgressService()
        
        # Class analysis settings
        self.settings = {
            "min_students": 5,  # Minimum students for reliable class metrics
            "min_essays_per_student": 3,  # Minimum essays per student for trends
            "significant_improvement": 0.3,  # 30% improvement threshold
            "percentile_ranges": [25, 50, 75, 90],  # Key percentiles to track
            "metrics": [
                "grade_level",
                "vocabulary_diversity",
                "syntax_complexity",
                "writing_style",
                "coherence"
            ],
            "trend_window": 90  # Days to analyze for trends
        }

    def analyze_class_progress(self, class_id: str, time_period: Optional[Tuple[str, str]] = None) -> Dict:
        """Analyze progress for entire class."""
        try:
            # Get class data
            class_data = self.db.get_class(class_id)
            if not class_data:
                raise ValueError(f"Class not found: {class_id}")

            # Get all students in class
            students = self.db.get_class_students(class_id)
            if len(students) < self.settings["min_students"]:
                return {"error": "Insufficient students for reliable analysis"}

            # Analyze each student's progress
            student_progress = []
            for student in students:
                progress = self._analyze_student_progress(student["id"], time_period)
                if progress:
                    student_progress.append(progress)

            # Calculate class-wide metrics
            analysis = {
                "class_id": class_id,
                "timestamp": datetime.now().isoformat(),
                "metrics": self._calculate_class_metrics(student_progress),
                "distribution": self._analyze_class_distribution(student_progress),
                "trends": self._analyze_class_trends(student_progress),
                "teacher_effectiveness": self._analyze_teacher_effectiveness(student_progress),
                "recommendations": self._generate_class_recommendations(student_progress)
            }

            # Store class analysis
            self.db.store_class_analysis(analysis)

            return analysis

        except Exception as e:
            self.logger.error(f"Error analyzing class progress for {class_id}", e)
            return None

    def _analyze_student_progress(self, student_id: str, 
                                time_period: Optional[Tuple[str, str]]) -> Optional[Dict]:
        """Analyze individual student progress within time period."""
        try:
            # Get student essays within time period
            essays = self.db.get_student_essays(student_id, time_period)
            if len(essays) < self.settings["min_essays_per_student"]:
                return None

            # Get baseline
            baseline = self.db.get_student_baseline(student_id)
            if not baseline:
                return None

            # Calculate progress metrics
            progress = {
                "student_id": student_id,
                "baseline": baseline,
                "current": essays[-1]["analysis"],
                "improvement": self._calculate_improvement(baseline, essays[-1]["analysis"]),
                "trend": self._calculate_student_trend(essays)
            }

            return progress

        except Exception as e:
            self.logger.error(f"Error analyzing progress for student {student_id}", e)
            return None

    def _calculate_class_metrics(self, student_progress: List[Dict]) -> Dict:
        """Calculate aggregate class metrics."""
        try:
            metrics = {}
            for metric in self.settings["metrics"]:
                values = [p["current"][metric] for p in student_progress 
                         if metric in p["current"]]
                if values:
                    metrics[metric] = {
                        "mean": np.mean(values),
                        "median": np.median(values),
                        "std": np.std(values),
                        "percentiles": {
                            str(p): np.percentile(values, p) 
                            for p in self.settings["percentile_ranges"]
                        }
                    }

            return metrics

        except Exception as e:
            self.logger.error("Error calculating class metrics", e)
            return {}

    def _analyze_class_distribution(self, student_progress: List[Dict]) -> Dict:
        """Analyze distribution of student performance."""
        try:
            distribution = {}
            for metric in self.settings["metrics"]:
                values = [p["current"][metric] for p in student_progress 
                         if metric in p["current"]]
                if values:
                    # Perform statistical analysis
                    skew = stats.skew(values)
                    kurtosis = stats.kurtosis(values)
                    
                    # Create performance bands
                    hist, bins = np.histogram(values, bins='auto')
                    
                    distribution[metric] = {
                        "skewness": skew,
                        "kurtosis": kurtosis,
                        "histogram": {
                            "counts": hist.tolist(),
                            "bins": bins.tolist()
                        }
                    }

            return distribution

        except Exception as e:
            self.logger.error("Error analyzing class distribution", e)
            return {}

    def _analyze_class_trends(self, student_progress: List[Dict]) -> Dict:
        """Analyze trends across the class."""
        try:
            trends = {}
            for metric in self.settings["metrics"]:
                # Collect improvement rates
                improvements = [p["improvement"][metric] for p in student_progress 
                              if metric in p["improvement"]]
                
                if improvements:
                    trends[metric] = {
                        "average_improvement": np.mean(improvements),
                        "improvement_rate": sum(i > self.settings["significant_improvement"] 
                                             for i in improvements) / len(improvements),
                        "consistency": np.std(improvements)
                    }

            return trends

        except Exception as e:
            self.logger.error("Error analyzing class trends", e)
            return {}

    def _analyze_teacher_effectiveness(self, student_progress: List[Dict]) -> Dict:
        """Analyze teacher effectiveness based on student progress."""
        try:
            effectiveness = {
                "overall_improvement": {},
                "skill_development": {},
                "student_engagement": {}
            }

            # Calculate overall improvement metrics
            for metric in self.settings["metrics"]:
                improvements = [p["improvement"][metric] for p in student_progress 
                              if metric in p["improvement"]]
                if improvements:
                    effectiveness["overall_improvement"][metric] = {
                        "average": np.mean(improvements),
                        "consistency": np.std(improvements),
                        "success_rate": sum(i > 0 for i in improvements) / len(improvements)
                    }

            # Analyze skill development patterns
            skill_trends = defaultdict(list)
            for progress in student_progress:
                for metric in self.settings["metrics"]:
                    if metric in progress["trend"]:
                        skill_trends[metric].append(progress["trend"][metric])

            for metric, trends in skill_trends.items():
                effectiveness["skill_development"][metric] = {
                    "positive_trends": sum(t > 0 for t in trends) / len(trends),
                    "trend_strength": np.mean(trends)
                }

            # Calculate student engagement metrics
            engagement_scores = []
            for progress in student_progress:
                if "current" in progress and "baseline" in progress:
                    engagement = self._calculate_engagement_score(
                        progress["baseline"],
                        progress["current"]
                    )
                    engagement_scores.append(engagement)

            if engagement_scores:
                effectiveness["student_engagement"] = {
                    "average": np.mean(engagement_scores),
                    "distribution": {
                        "low": sum(s < 0.3 for s in engagement_scores) / len(engagement_scores),
                        "medium": sum(0.3 <= s < 0.7 for s in engagement_scores) / len(engagement_scores),
                        "high": sum(s >= 0.7 for s in engagement_scores) / len(engagement_scores)
                    }
                }

            return effectiveness

        except Exception as e:
            self.logger.error("Error analyzing teacher effectiveness", e)
            return {}

    def _generate_class_recommendations(self, student_progress: List[Dict]) -> List[str]:
        """Generate recommendations for improving class performance."""
        try:
            recommendations = []
            
            # Analyze common areas needing improvement
            weak_areas = self._identify_common_weaknesses(student_progress)
            for area, score in weak_areas.items():
                if score < 0.6:  # Below 60% performance
                    recommendations.append(
                        f"Consider focusing on {area} improvement through targeted exercises. "
                        f"Current class average is showing room for improvement."
                    )

            # Analyze performance distribution
            distribution = self._analyze_class_distribution(student_progress)
            for metric, dist in distribution.items():
                if dist.get("skewness", 0) > 1:  # Highly skewed distribution
                    recommendations.append(
                        f"Consider implementing differentiated instruction for {metric}. "
                        f"Current class performance shows significant variation."
                    )

            # Check engagement levels
            engagement = self._calculate_class_engagement(student_progress)
            if engagement < 0.5:
                recommendations.append(
                    "Consider implementing more interactive writing exercises to increase "
                    "student engagement. Current engagement metrics indicate room for improvement."
                )

            return recommendations

        except Exception as e:
            self.logger.error("Error generating class recommendations", e)
            return []

    def _calculate_improvement(self, baseline: Dict, current: Dict) -> Dict:
        """Calculate improvement between baseline and current metrics."""
        try:
            improvement = {}
            for metric in self.settings["metrics"]:
                if metric in baseline and metric in current:
                    baseline_value = baseline[metric]
                    current_value = current[metric]
                    if baseline_value != 0:
                        improvement[metric] = (current_value - baseline_value) / baseline_value
                    else:
                        improvement[metric] = 0
            return improvement
        except Exception as e:
            self.logger.error("Error calculating improvement", e)
            return {}

    def _calculate_student_trend(self, essays: List[Dict]) -> Dict:
        """Calculate trend for student's essays."""
        try:
            trends = {}
            for metric in self.settings["metrics"]:
                values = [essay["analysis"][metric] for essay in essays 
                         if "analysis" in essay and metric in essay["analysis"]]
                if len(values) >= 3:
                    x = np.arange(len(values))
                    slope, _, r_value, _, _ = stats.linregress(x, values)
                    trends[metric] = slope * r_value  # Weighted by correlation
            return trends
        except Exception as e:
            self.logger.error("Error calculating student trend", e)
            return {}

    def _calculate_engagement_score(self, baseline: Dict, current: Dict) -> float:
        """Calculate student engagement score based on improvements and consistency."""
        try:
            improvements = []
            for metric in self.settings["metrics"]:
                if metric in baseline and metric in current:
                    rel_improvement = (current[metric] - baseline[metric]) / baseline[metric] \
                                    if baseline[metric] != 0 else 0
                    improvements.append(min(max(rel_improvement, -1), 1))  # Clamp to [-1, 1]
            
            return (np.mean(improvements) + 1) / 2 if improvements else 0  # Normalize to [0, 1]
        except Exception as e:
            self.logger.error("Error calculating engagement score", e)
            return 0.0

    def _identify_common_weaknesses(self, student_progress: List[Dict]) -> Dict:
        """Identify common areas needing improvement across the class."""
        try:
            weaknesses = {}
            for metric in self.settings["metrics"]:
                values = [p["current"][metric] for p in student_progress 
                         if metric in p["current"]]
                if values:
                    # Calculate performance score (0-1)
                    mean_value = np.mean(values)
                    max_value = np.max(values)
                    weaknesses[metric] = mean_value / max_value if max_value != 0 else 0
            return weaknesses
        except Exception as e:
            self.logger.error("Error identifying common weaknesses", e)
            return {}

    def _calculate_class_engagement(self, student_progress: List[Dict]) -> float:
        """Calculate overall class engagement level."""
        try:
            engagement_scores = []
            for progress in student_progress:
                if "current" in progress and "baseline" in progress:
                    score = self._calculate_engagement_score(
                        progress["baseline"],
                        progress["current"]
                    )
                    engagement_scores.append(score)
            
            return np.mean(engagement_scores) if engagement_scores else 0.0
        except Exception as e:
            self.logger.error("Error calculating class engagement", e)
            return 0.0 