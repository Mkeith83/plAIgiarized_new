from typing import Dict, List, Optional, Tuple
import os
import json
from datetime import datetime
from statistics import mean, stdev
from ..models.essay import Essay

class ProgressService:
    def __init__(self):
        self.base_path = "data/progress"
        os.makedirs(self.base_path, exist_ok=True)
        
        # Expected improvement ranges (per year)
        self.improvement_ranges = {
            "typical": {
                "min": 5.0,    # Minimum expected improvement
                "avg": 10.0,   # Average improvement
                "max": 15.0    # Maximum typical improvement
            },
            "accelerated": {
                "min": 15.0,   # Minimum accelerated improvement
                "avg": 20.0,   # Average accelerated improvement
                "max": 25.0    # Maximum realistic improvement
            }
        }

    def track_student_progress(self, student_id: str, essays: List[Essay]) -> Dict[str, any]:
        """Track individual student progress over time."""
        try:
            # Sort essays by date
            sorted_essays = sorted(essays, key=lambda x: x.created_at)
            
            # Calculate progress metrics
            progress = {
                "overall_improvement": self._calculate_overall_improvement(sorted_essays),
                "skill_breakdown": self._analyze_skill_improvements(sorted_essays),
                "improvement_rate": self._calculate_improvement_rate(sorted_essays),
                "percentile_changes": self._track_percentile_changes(sorted_essays),
                "flags": self._check_improvement_flags(sorted_essays)
            }
            
            # Save progress data
            self._save_progress_data(student_id, progress)
            
            return progress
        except Exception as e:
            print(f"Error tracking student progress: {e}")
            return {}

    def analyze_class_progress(self, class_id: str, student_essays: Dict[str, List[Essay]]) -> Dict[str, any]:
        """Analyze progress across entire class."""
        try:
            # Calculate class-wide metrics
            class_metrics = {
                "average_improvement": self._calculate_class_average(student_essays),
                "improvement_distribution": self._analyze_improvement_distribution(student_essays),
                "skill_breakdowns": self._analyze_class_skills(student_essays),
                "outliers": self._identify_outliers(student_essays),
                "class_trends": self._analyze_class_trends(student_essays)
            }
            
            # Save class analysis
            self._save_class_data(class_id, class_metrics)
            
            return class_metrics
        except Exception as e:
            print(f"Error analyzing class progress: {e}")
            return {}

    def _calculate_overall_improvement(self, essays: List[Essay]) -> Dict[str, float]:
        """Calculate overall improvement across all metrics."""
        if len(essays) < 2:
            return {}
            
        first, last = essays[0], essays[-1]
        time_span = (last.created_at - first.created_at).days / 365.0
        
        # Calculate improvements in different areas
        improvements = {
            "writing_level": (last.metrics["grade_level"] - first.metrics["grade_level"]) / time_span,
            "vocabulary": (last.metrics["vocabulary_size"] - first.metrics["vocabulary_size"]) 
                        / first.metrics["vocabulary_size"] * 100 / time_span,
            "complexity": (last.metrics["sentence_complexity"] - first.metrics["sentence_complexity"])
                        / first.metrics["sentence_complexity"] * 100 / time_span,
            "style": (last.metrics["style_fingerprint"] - first.metrics["style_fingerprint"])
                    / first.metrics["style_fingerprint"] * 100 / time_span
        }
        
        return improvements

    def _analyze_skill_improvements(self, essays: List[Essay]) -> Dict[str, List[float]]:
        """Track improvements in specific writing skills."""
        skills = {
            "vocabulary": [],
            "grammar": [],
            "structure": [],
            "style": []
        }
        
        for i in range(1, len(essays)):
            prev, curr = essays[i-1], essays[i]
            time_diff = (curr.created_at - prev.created_at).days / 365.0
            
            # Calculate skill-specific improvements
            skills["vocabulary"].append(
                (curr.metrics["vocabulary_size"] - prev.metrics["vocabulary_size"])
                / prev.metrics["vocabulary_size"] * 100 / time_diff
            )
            skills["grammar"].append(
                (curr.metrics["sentence_complexity"] - prev.metrics["sentence_complexity"])
                / prev.metrics["sentence_complexity"] * 100 / time_diff
            )
            # Add more skill calculations...
            
        return skills

    def _calculate_improvement_rate(self, essays: List[Essay]) -> float:
        """Calculate average yearly improvement rate."""
        if len(essays) < 2:
            return 0.0
            
        improvements = []
        for i in range(1, len(essays)):
            prev, curr = essays[i-1], essays[i]
            time_diff = (curr.created_at - prev.created_at).days / 365.0
            
            # Calculate overall improvement between consecutive essays
            improvement = (
                (curr.metrics["grade_level"] - prev.metrics["grade_level"]) +
                (curr.metrics["vocabulary_size"] - prev.metrics["vocabulary_size"]) / 
                prev.metrics["vocabulary_size"] * 100 +
                (curr.metrics["sentence_complexity"] - prev.metrics["sentence_complexity"]) /
                prev.metrics["sentence_complexity"] * 100
            ) / 3 / time_diff
            
            improvements.append(improvement)
            
        return mean(improvements) if improvements else 0.0

    def _track_percentile_changes(self, essays: List[Essay]) -> List[Tuple[datetime, float]]:
        """Track percentile changes over time."""
        return [
            (essay.created_at, essay.metrics.get("percentile", 50.0))
            for essay in essays
        ]

    def _check_improvement_flags(self, essays: List[Essay]) -> List[str]:
        """Check for unusual improvement patterns."""
        flags = []
        if len(essays) < 2:
            return flags
            
        improvements = self._calculate_overall_improvement(essays)
        
        # Check each improvement metric
        for metric, value in improvements.items():
            if value > self.improvement_ranges["accelerated"]["max"]:
                flags.append(f"Unusual {metric} improvement: {value:.1f}%")
            elif value < self.improvement_ranges["typical"]["min"]:
                flags.append(f"Below expected {metric} improvement: {value:.1f}%")
                
        return flags

    def _save_progress_data(self, student_id: str, progress: Dict) -> None:
        """Save progress data to file."""
        try:
            path = os.path.join(self.base_path, f"{student_id}_progress.json")
            with open(path, "w") as f:
                json.dump(progress, f, indent=2, default=str)
        except Exception as e:
            print(f"Error saving progress data: {e}")

    # ... (class analysis methods would go here) ...
