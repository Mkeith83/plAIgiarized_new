from typing import Dict, List, Optional, Any
import os
import json
from datetime import datetime
from ..models.essay import Essay

class DashboardService:
    def __init__(self):
        self.base_path = "data/dashboard"
        os.makedirs(self.base_path, exist_ok=True)

    def generate_student_dashboard(self, student_id: str, essays: List[Essay]) -> Dict[str, Any]:
        """Generate dashboard data for a single student."""
        try:
            return {
                "overview": self._generate_student_overview(essays),
                "progress_charts": self._generate_progress_charts(essays),
                "skill_breakdown": self._generate_skill_breakdown(essays),
                "improvement_tracking": self._generate_improvement_tracking(essays),
                "ai_risk_assessment": self._generate_ai_risk_assessment(essays)
            }
        except Exception as e:
            print(f"Error generating student dashboard: {e}")
            return {}

    def generate_class_dashboard(self, class_id: str, student_essays: Dict[str, List[Essay]]) -> Dict[str, Any]:
        """Generate dashboard data for entire class."""
        try:
            return {
                "class_overview": self._generate_class_overview(student_essays),
                "performance_distribution": self._generate_performance_distribution(student_essays),
                "improvement_trends": self._generate_improvement_trends(student_essays),
                "skill_comparisons": self._generate_skill_comparisons(student_essays),
                "ai_risk_summary": self._generate_class_ai_risk_summary(student_essays)
            }
        except Exception as e:
            print(f"Error generating class dashboard: {e}")
            return {}

    def _generate_student_overview(self, essays: List[Essay]) -> Dict[str, Any]:
        """Generate overview of student's writing progress."""
        if not essays:
            return {}
            
        latest = essays[-1]
        baseline = essays[0] if len(essays) > 1 else None
        
        overview = {
            "current_grade_level": latest.metrics["grade_level"],
            "vocabulary_size": latest.metrics["vocabulary_size"],
            "writing_complexity": latest.metrics["sentence_complexity"],
            "style_score": latest.metrics["style_fingerprint"]
        }
        
        if baseline:
            # Calculate improvements
            time_span = (latest.created_at - baseline.created_at).days / 365.0
            if time_span > 0:
                overview["improvements"] = {
                    "grade_level": (latest.metrics["grade_level"] - baseline.metrics["grade_level"]) / time_span,
                    "vocabulary": ((latest.metrics["vocabulary_size"] - baseline.metrics["vocabulary_size"]) 
                                 / baseline.metrics["vocabulary_size"] * 100) / time_span,
                    "complexity": ((latest.metrics["sentence_complexity"] - baseline.metrics["sentence_complexity"])
                                 / baseline.metrics["sentence_complexity"] * 100) / time_span
                }
        
        return overview

    def _generate_progress_charts(self, essays: List[Essay]) -> Dict[str, List[Dict[str, Any]]]:
        """Generate data for progress visualization charts."""
        charts = {
            "grade_level": [],
            "vocabulary": [],
            "complexity": [],
            "style": []
        }
        
        for essay in essays:
            timestamp = essay.created_at.isoformat()
            charts["grade_level"].append({
                "date": timestamp,
                "value": essay.metrics["grade_level"]
            })
            charts["vocabulary"].append({
                "date": timestamp,
                "value": essay.metrics["vocabulary_size"]
            })
            charts["complexity"].append({
                "date": timestamp,
                "value": essay.metrics["sentence_complexity"]
            })
            charts["style"].append({
                "date": timestamp,
                "value": essay.metrics["style_fingerprint"]
            })
        
        return charts

    def _generate_skill_breakdown(self, essays: List[Essay]) -> Dict[str, float]:
        """Generate detailed breakdown of writing skills."""
        if not essays:
            return {}
            
        latest = essays[-1]
        return {
            "vocabulary_diversity": latest.metrics.get("vocabulary_size", 0) / 100,  # Normalized to 0-1
            "sentence_structure": latest.metrics.get("sentence_complexity", 0) / 20,  # Normalized to 0-1
            "style_consistency": latest.metrics.get("style_fingerprint", 0) / 10,    # Normalized to 0-1
            "grade_level_achievement": (latest.metrics.get("grade_level", 0) - 8) / 4  # Normalized around grade 8
        }

    def _generate_improvement_tracking(self, essays: List[Essay]) -> Dict[str, List[float]]:
        """Track improvement rates over time."""
        improvements = {
            "monthly_rates": [],
            "yearly_projection": None
        }
        
        if len(essays) < 2:
            return improvements
            
        # Calculate improvement rates between consecutive essays
        for i in range(1, len(essays)):
            prev, curr = essays[i-1], essays[i]
            time_diff = (curr.created_at - prev.created_at).days / 30  # Convert to months
            
            if time_diff > 0:
                rate = {
                    "grade_level": (curr.metrics["grade_level"] - prev.metrics["grade_level"]) / time_diff,
                    "vocabulary": ((curr.metrics["vocabulary_size"] - prev.metrics["vocabulary_size"]) 
                                 / prev.metrics["vocabulary_size"] * 100) / time_diff,
                    "complexity": ((curr.metrics["sentence_complexity"] - prev.metrics["sentence_complexity"])
                                 / prev.metrics["sentence_complexity"] * 100) / time_diff
                }
                improvements["monthly_rates"].append(rate)
        
        # Calculate yearly projection based on recent trends
        if improvements["monthly_rates"]:
            recent_rates = improvements["monthly_rates"][-3:]  # Last 3 months
            improvements["yearly_projection"] = {
                metric: sum(rate[metric] for rate in recent_rates) / len(recent_rates) * 12
                for metric in ["grade_level", "vocabulary", "complexity"]
            }
        
        return improvements

    def _generate_ai_risk_assessment(self, essays: List[Essay]) -> Dict[str, Any]:
        """Generate AI risk assessment summary."""
        if not essays:
            return {}
            
        latest = essays[-1]
        baseline = essays[0] if len(essays) > 1 else None
        
        risk_assessment = {
            "current_risk_level": "low",  # Default
            "suspicious_patterns": [],
            "improvement_validity": 1.0    # 1.0 = valid, 0.0 = suspicious
        }
        
        if baseline:
            # Check for suspicious improvements
            time_span = (latest.created_at - baseline.created_at).days / 365.0
            if time_span > 0:
                improvements = {
                    "grade_level": (latest.metrics["grade_level"] - baseline.metrics["grade_level"]) / time_span,
                    "vocabulary": ((latest.metrics["vocabulary_size"] - baseline.metrics["vocabulary_size"]) 
                                 / baseline.metrics["vocabulary_size"] * 100) / time_span,
                    "complexity": ((latest.metrics["sentence_complexity"] - baseline.metrics["sentence_complexity"])
                                 / baseline.metrics["sentence_complexity"] * 100) / time_span
                }
                
                # Check each improvement against thresholds
                for metric, value in improvements.items():
                    if value > 25.0:  # More than 25% improvement per year is suspicious
                        risk_assessment["suspicious_patterns"].append(f"Unusual {metric} improvement")
                        risk_assessment["improvement_validity"] *= 0.8
                
                # Update risk level based on validity score
                if risk_assessment["improvement_validity"] < 0.5:
                    risk_assessment["current_risk_level"] = "high"
                elif risk_assessment["improvement_validity"] < 0.8:
                    risk_assessment["current_risk_level"] = "medium"
        
        return risk_assessment

    # ... (class dashboard methods would go here) ...
    def _generate_class_overview(self, student_essays: Dict[str, List[Essay]]) -> Dict[str, Any]:
        """Generate overview of class performance and growth."""
        try:
            class_stats = {
                "average_grade_level": 0.0,
                "average_improvement": 0.0,
                "performance_bands": {
                    "accelerated": 0,    # >20% improvement
                    "expected": 0,        # 5-20% improvement
                    "below": 0           # <5% improvement
                },
                "growth_distribution": {
                    "vocabulary": [],
                    "complexity": [],
                    "grade_level": []
                }
            }
            
            # Calculate class-wide metrics
            total_students = len(student_essays)
            if total_students == 0:
                return class_stats
                
            for student_id, essays in student_essays.items():
                if not essays:
                    continue
                    
                # Get latest essay metrics
                latest = essays[-1]
                class_stats["average_grade_level"] += latest.metrics["grade_level"]
                
                # Calculate improvement if multiple essays exist
                if len(essays) > 1:
                    baseline = essays[0]
                    time_span = (latest.created_at - baseline.created_at).days / 365.0
                    if time_span > 0:
                        improvement = (
                            (latest.metrics["grade_level"] - baseline.metrics["grade_level"]) +
                            ((latest.metrics["vocabulary_size"] - baseline.metrics["vocabulary_size"]) 
                             / baseline.metrics["vocabulary_size"] * 100) +
                            ((latest.metrics["sentence_complexity"] - baseline.metrics["sentence_complexity"])
                             / baseline.metrics["sentence_complexity"] * 100)
                        ) / 3 / time_span
                        
                        class_stats["average_improvement"] += improvement
                        
                        # Categorize improvement
                        if improvement > 20:
                            class_stats["performance_bands"]["accelerated"] += 1
                        elif improvement > 5:
                            class_stats["performance_bands"]["expected"] += 1
                        else:
                            class_stats["performance_bands"]["below"] += 1
                            
                        # Record growth distributions
                        class_stats["growth_distribution"]["vocabulary"].append(
                            ((latest.metrics["vocabulary_size"] - baseline.metrics["vocabulary_size"]) 
                             / baseline.metrics["vocabulary_size"] * 100) / time_span
                        )
                        class_stats["growth_distribution"]["complexity"].append(
                            ((latest.metrics["sentence_complexity"] - baseline.metrics["sentence_complexity"])
                             / baseline.metrics["sentence_complexity"] * 100) / time_span
                        )
                        class_stats["growth_distribution"]["grade_level"].append(
                            (latest.metrics["grade_level"] - baseline.metrics["grade_level"]) / time_span
                        )
            
            # Calculate averages
            class_stats["average_grade_level"] /= total_students
            class_stats["average_improvement"] /= total_students
            
            return class_stats
        except Exception as e:
            print(f"Error generating class overview: {e}")
            return {}

    def _generate_performance_distribution(self, student_essays: Dict[str, List[Essay]]) -> Dict[str, List[float]]:
        """Generate performance distribution across the class."""
        try:
            distribution = {
                "grade_levels": [],
                "improvement_rates": [],
                "percentiles": {
                    "top_10": [],
                    "middle_80": [],
                    "bottom_10": []
                }
            }
            
            # Collect all metrics
            metrics = []
            for student_id, essays in student_essays.items():
                if not essays:
                    continue
                    
                latest = essays[-1]
                baseline = essays[0] if len(essays) > 1 else None
                
                student_metrics = {
                    "grade_level": latest.metrics["grade_level"],
                    "improvement": 0.0
                }
                
                if baseline:
                    time_span = (latest.created_at - baseline.created_at).days / 365.0
                    if time_span > 0:
                        student_metrics["improvement"] = (
                            (latest.metrics["grade_level"] - baseline.metrics["grade_level"]) / time_span
                        )
                
                metrics.append(student_metrics)
            
            # Sort and distribute into percentiles
            sorted_by_grade = sorted(metrics, key=lambda x: x["grade_level"])
            sorted_by_improvement = sorted(metrics, key=lambda x: x["improvement"])
            
            total = len(metrics)
            if total > 0:
                # Calculate percentile ranges
                top_10_start = int(total * 0.9)
                bottom_10_end = int(total * 0.1)
                
                # Distribute into percentile bands
                distribution["percentiles"]["top_10"] = sorted_by_improvement[top_10_start:]
                distribution["percentiles"]["middle_80"] = sorted_by_improvement[bottom_10_end:top_10_start]
                distribution["percentiles"]["bottom_10"] = sorted_by_improvement[:bottom_10_end]
                
                # Record all distributions
                distribution["grade_levels"] = [m["grade_level"] for m in sorted_by_grade]
                distribution["improvement_rates"] = [m["improvement"] for m in sorted_by_improvement]
            
            return distribution
        except Exception as e:
            print(f"Error generating performance distribution: {e}")
            return {}

    def _generate_improvement_trends(self, student_essays: Dict[str, List[Essay]]) -> Dict[str, Any]:
        """Generate class-wide improvement trends."""
        try:
            trends = {
                "monthly_averages": [],
                "skill_trends": {
                    "vocabulary": [],
                    "complexity": [],
                    "grade_level": []
                },
                "acceleration": {
                    "improving": 0,
                    "stable": 0,
                    "declining": 0
                }
            }
            
            # Calculate monthly averages and skill trends
            for month in range(12):  # Last 12 months
                month_metrics = {
                    "vocabulary": [],
                    "complexity": [],
                    "grade_level": []
                }
                
                for student_id, essays in student_essays.items():
                    # Filter essays for current month
                    # Add monthly calculations here
                    pass
                
            return trends
        except Exception as e:
            print(f"Error generating improvement trends: {e}")
            return {}

    def _generate_class_ai_risk_summary(self, student_essays: Dict[str, List[Essay]]) -> Dict[str, Any]:
        """Generate class-wide AI usage risk summary."""
        try:
            risk_summary = {
                "overall_risk_level": "low",
                "risk_distribution": {
                    "high": 0,
                    "medium": 0,
                    "low": 0
                },
                "suspicious_patterns": [],
                "recommended_actions": []
            }
            
            total_students = len(student_essays)
            if total_students == 0:
                return risk_summary
                
            # Analyze each student's risk level
            for student_id, essays in student_essays.items():
                student_risk = self._generate_ai_risk_assessment(essays)
                risk_summary["risk_distribution"][student_risk["current_risk_level"]] += 1
                
                if student_risk["suspicious_patterns"]:
                    risk_summary["suspicious_patterns"].extend(student_risk["suspicious_patterns"])
            
            # Calculate overall risk level
            high_risk_percentage = (risk_summary["risk_distribution"]["high"] / total_students) * 100
            medium_risk_percentage = (risk_summary["risk_distribution"]["medium"] / total_students) * 100
            
            if high_risk_percentage > 20 or medium_risk_percentage > 40:
                risk_summary["overall_risk_level"] = "high"
                risk_summary["recommended_actions"].append("Conduct detailed writing style analysis")
            elif high_risk_percentage > 10 or medium_risk_percentage > 25:
                risk_summary["overall_risk_level"] = "medium"
                risk_summary["recommended_actions"].append("Monitor writing style changes closely")
            
            return risk_summary
        except Exception as e:
            print(f"Error generating class AI risk summary: {e}")
            return {}
