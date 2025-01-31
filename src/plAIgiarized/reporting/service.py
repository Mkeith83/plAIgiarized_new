from typing import Dict, List, Optional, Any
import os
import json
from datetime import datetime, timedelta
import pandas as pd
import matplotlib.pyplot as plt
from ..logging.service import LoggingService
from ..metrics.service import MetricsService

class ReportingService:
    def __init__(self):
        self.base_path = "data/reports"
        os.makedirs(self.base_path, exist_ok=True)
        
        self.logger = LoggingService()
        self.metrics = MetricsService()
        
        # Report templates
        self.templates = {
            "student": {
                "sections": ["summary", "ai_detection", "plagiarism", "writing_quality"],
                "charts": ["submission_history", "similarity_scores", "writing_metrics"]
            },
            "class": {
                "sections": ["overview", "trends", "alerts", "recommendations"],
                "charts": ["submission_distribution", "issue_types", "performance_trends"]
            },
            "system": {
                "sections": ["health", "usage", "errors", "performance"],
                "charts": ["api_performance", "error_rates", "resource_usage"]
            }
        }

    def generate_report(self, report_type: str, params: Dict) -> Optional[str]:
        """Generate report of specified type."""
        try:
            if report_type not in self.templates:
                raise ValueError(f"Unknown report type: {report_type}")
            
            # Create report directory
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            report_id = f"{report_type}_{timestamp}"
            report_dir = os.path.join(self.base_path, report_id)
            os.makedirs(report_dir, exist_ok=True)
            
            # Generate report content
            if report_type == "student":
                content = self._generate_student_report(params)
            elif report_type == "class":
                content = self._generate_class_report(params)
            elif report_type == "system":
                content = self._generate_system_report(params)
            
            # Generate charts
            self._generate_charts(report_type, content, report_dir)
            
            # Save report
            report_path = os.path.join(report_dir, "report.json")
            with open(report_path, "w") as f:
                json.dump(content, f, indent=2)
            
            return report_dir
        except Exception as e:
            self.logger.error("Error generating report", e)
            return None

    def get_report(self, report_id: str) -> Optional[Dict]:
        """Get generated report by ID."""
        try:
            report_path = os.path.join(self.base_path, report_id, "report.json")
            if not os.path.exists(report_path):
                return None
            
            with open(report_path, "r") as f:
                return json.load(f)
        except Exception as e:
            self.logger.error("Error getting report", e)
            return None

    def list_reports(self, report_type: Optional[str] = None) -> List[Dict]:
        """List available reports."""
        try:
            reports = []
            for item in os.listdir(self.base_path):
                try:
                    item_path = os.path.join(self.base_path, item)
                    if not os.path.isdir(item_path):
                        continue
                    
                    report_path = os.path.join(item_path, "report.json")
                    if not os.path.exists(report_path):
                        continue
                    
                    with open(report_path, "r") as f:
                        report = json.load(f)
                    
                    if report_type and not item.startswith(report_type):
                        continue
                    
                    reports.append({
                        "id": item,
                        "type": report["type"],
                        "generated_at": report["generated_at"],
                        "summary": report.get("summary", {})
                    })
                except Exception as e:
                    self.logger.error(f"Error processing report {item}", e)
            
            return sorted(reports, key=lambda x: x["generated_at"], reverse=True)
        except Exception as e:
            self.logger.error("Error listing reports", e)
            return []

    def _generate_student_report(self, params: Dict) -> Dict:
        """Generate student analysis report."""
        try:
            student_id = params["student_id"]
            date_range = params.get("date_range", 30)
            
            # Get student metrics
            metrics = self.metrics.get_student_metrics(student_id, days=date_range)
            
            return {
                "type": "student",
                "generated_at": datetime.now().isoformat(),
                "student_id": student_id,
                "summary": {
                    "total_submissions": metrics["submission_count"],
                    "ai_detection_rate": metrics["ai_detection_rate"],
                    "plagiarism_rate": metrics["plagiarism_rate"],
                    "average_quality": metrics["average_quality"]
                },
                "ai_detection": {
                    "detected_count": metrics["ai_detected_count"],
                    "confidence_levels": metrics["ai_confidence_levels"],
                    "trends": metrics["ai_detection_trends"]
                },
                "plagiarism": {
                    "detected_count": metrics["plagiarism_detected_count"],
                    "similarity_scores": metrics["similarity_scores"],
                    "source_types": metrics["plagiarism_sources"]
                },
                "writing_quality": {
                    "grade_level": metrics["grade_level"],
                    "vocabulary_metrics": metrics["vocabulary_metrics"],
                    "grammar_metrics": metrics["grammar_metrics"]
                },
                "recommendations": self._generate_recommendations(metrics)
            }
        except Exception as e:
            self.logger.error("Error generating student report", e)
            raise

    def _generate_class_report(self, params: Dict) -> Dict:
        """Generate class analysis report."""
        try:
            class_id = params["class_id"]
            date_range = params.get("date_range", 30)
            
            # Get class metrics
            metrics = self.metrics.get_class_metrics(class_id, days=date_range)
            
            return {
                "type": "class",
                "generated_at": datetime.now().isoformat(),
                "class_id": class_id,
                "overview": {
                    "student_count": metrics["student_count"],
                    "submission_count": metrics["submission_count"],
                    "issue_rate": metrics["issue_rate"]
                },
                "trends": {
                    "submission_trends": metrics["submission_trends"],
                    "issue_trends": metrics["issue_trends"],
                    "quality_trends": metrics["quality_trends"]
                },
                "alerts": {
                    "high_risk_students": metrics["high_risk_students"],
                    "common_issues": metrics["common_issues"]
                },
                "recommendations": self._generate_class_recommendations(metrics)
            }
        except Exception as e:
            self.logger.error("Error generating class report", e)
            raise

    def _generate_system_report(self, params: Dict) -> Dict:
        """Generate system analysis report."""
        try:
            date_range = params.get("date_range", 7)
            
            # Get system metrics
            metrics = self.metrics.get_system_metrics(days=date_range)
            
            return {
                "type": "system",
                "generated_at": datetime.now().isoformat(),
                "health": {
                    "overall_status": metrics["health_status"],
                    "component_status": metrics["component_status"],
                    "resource_usage": metrics["resource_usage"]
                },
                "usage": {
                    "total_requests": metrics["request_count"],
                    "active_users": metrics["active_users"],
                    "peak_times": metrics["peak_usage_times"]
                },
                "errors": {
                    "error_rate": metrics["error_rate"],
                    "common_errors": metrics["common_errors"],
                    "affected_components": metrics["error_components"]
                },
                "performance": {
                    "response_times": metrics["response_times"],
                    "api_performance": metrics["api_performance"],
                    "resource_efficiency": metrics["resource_efficiency"]
                }
            }
        except Exception as e:
            self.logger.error("Error generating system report", e)
            raise

    def _generate_charts(self, report_type: str, content: Dict, report_dir: str) -> None:
        """Generate charts for report."""
        try:
            charts_dir = os.path.join(report_dir, "charts")
            os.makedirs(charts_dir, exist_ok=True)
            
            for chart_type in self.templates[report_type]["charts"]:
                try:
                    plt.figure(figsize=(10, 6))
                    
                    if chart_type == "submission_history":
                        self._plot_submission_history(content)
                    elif chart_type == "similarity_scores":
                        self._plot_similarity_scores(content)
                    elif chart_type == "writing_metrics":
                        self._plot_writing_metrics(content)
                    elif chart_type == "submission_distribution":
                        self._plot_submission_distribution(content)
                    elif chart_type == "issue_types":
                        self._plot_issue_types(content)
                    elif chart_type == "performance_trends":
                        self._plot_performance_trends(content)
                    
                    plt.tight_layout()
                    plt.savefig(os.path.join(charts_dir, f"{chart_type}.png"))
                    plt.close()
                except Exception as e:
                    self.logger.error(f"Error generating chart {chart_type}", e)
        except Exception as e:
            self.logger.error("Error generating charts", e)
            raise

    def _generate_recommendations(self, metrics: Dict) -> List[Dict]:
        """Generate recommendations based on metrics."""
        try:
            recommendations = []
            
            # AI detection recommendations
            if metrics["ai_detection_rate"] > 0.2:
                recommendations.append({
                    "type": "warning",
                    "message": "High rate of AI-generated content detected",
                    "action": "Review submission guidelines and academic integrity policies"
                })
            
            # Plagiarism recommendations
            if metrics["plagiarism_rate"] > 0.15:
                recommendations.append({
                    "type": "warning",
                    "message": "Elevated plagiarism detection rate",
                    "action": "Schedule academic integrity workshop"
                })
            
            # Writing quality recommendations
            if metrics["average_quality"] < 0.7:
                recommendations.append({
                    "type": "improvement",
                    "message": "Writing quality below target level",
                    "action": "Consider writing support resources"
                })
            
            return recommendations
        except Exception as e:
            self.logger.error("Error generating recommendations", e)
            return []

    def _plot_submission_history(self, content: Dict) -> None:
        """Plot submission history chart."""
        try:
            data = pd.DataFrame(content["ai_detection"]["trends"])
            plt.plot(data["date"], data["count"], marker="o")
            plt.title("Submission History")
            plt.xlabel("Date")
            plt.ylabel("Submissions")
            plt.xticks(rotation=45)
        except Exception as e:
            self.logger.error("Error plotting submission history", e)
            raise

    def _plot_similarity_scores(self, content: Dict) -> None:
        """Plot similarity scores distribution."""
        try:
            scores = content["plagiarism"]["similarity_scores"]
            plt.hist(scores, bins=20)
            plt.title("Similarity Score Distribution")
            plt.xlabel("Similarity Score")
            plt.ylabel("Frequency")
        except Exception as e:
            self.logger.error("Error plotting similarity scores", e)
            raise

    def update_template(self, report_type: str, template: Dict) -> bool:
        """Update report template."""
        try:
            if report_type not in self.templates:
                return False
            
            self.templates[report_type].update(template)
            return True
        except Exception as e:
            self.logger.error("Error updating template", e)
            return False

    def delete_report(self, report_id: str) -> bool:
        """Delete generated report."""
        try:
            report_path = os.path.join(self.base_path, report_id)
            if not os.path.exists(report_path):
                return False
            
            import shutil
            shutil.rmtree(report_path)
            return True
        except Exception as e:
            self.logger.error("Error deleting report", e)
            return False
    def _plot_writing_metrics(self, content: Dict) -> None:
        """Plot writing quality metrics."""
        try:
            metrics = content["writing_quality"]
            
            # Create bar chart of writing metrics
            categories = ["Grade Level", "Vocabulary", "Grammar"]
            values = [
                metrics["grade_level"],
                metrics["vocabulary_metrics"]["complexity_score"],
                1 - metrics["grammar_metrics"]["error_rate"]  # Convert error rate to score
            ]
            
            plt.bar(categories, values)
            plt.title("Writing Quality Metrics")
            plt.ylabel("Score")
            plt.ylim(0, 1.2)  # Set y-axis limit
        except Exception as e:
            self.logger.error("Error plotting writing metrics", e)
            raise

    def _plot_submission_distribution(self, content: Dict) -> None:
        """Plot submission distribution."""
        try:
            data = content["overview"]["submission_count"]
            plt.bar(["Total Submissions"], [data])
            plt.title("Submission Distribution")
            plt.ylabel("Count")
        except Exception as e:
            self.logger.error("Error plotting submission distribution", e)
            raise

    def _plot_issue_types(self, content: Dict) -> None:
        """Plot distribution of issue types."""
        try:
            issues = content["alerts"]["common_issues"]
            if issues:
                types = [issue["type"] for issue in issues]
                counts = [issue["count"] for issue in issues]
                plt.bar(types, counts)
                plt.title("Common Issues")
                plt.ylabel("Count")
                plt.xticks(rotation=45)
            else:
                plt.text(0.5, 0.5, "No issues found", ha="center", va="center")
                plt.title("Issue Types")
        except Exception as e:
            self.logger.error("Error plotting issue types", e)
            raise

    def _plot_performance_trends(self, content: Dict) -> None:
        """Plot performance trends over time."""
        try:
            trends = content["trends"]["quality_trends"]
            if trends:
                dates = [trend["date"] for trend in trends]
                scores = [trend["score"] for trend in trends]
                plt.plot(dates, scores, marker="o")
                plt.title("Performance Trends")
                plt.xlabel("Date")
                plt.ylabel("Score")
                plt.xticks(rotation=45)
            else:
                plt.text(0.5, 0.5, "No trend data available", ha="center", va="center")
                plt.title("Performance Trends")
        except Exception as e:
            self.logger.error("Error plotting performance trends", e)
            raise
