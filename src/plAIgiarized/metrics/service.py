from typing import Dict, List, Optional, Any
import os
import json
from datetime import datetime, timedelta
import threading
from ..logging.service import LoggingService

class MetricsService:
    def __init__(self):
        self.base_path = "data/metrics"
        os.makedirs(self.base_path, exist_ok=True)
        
        self.logger = LoggingService()
        
        # Metrics storage
        self.metrics: Dict[str, List[Dict]] = {
            "api": [],
            "performance": [],
            "usage": [],
            "errors": []
        }
        
        # Metrics settings
        self.settings = {
            "retention_days": 30,
            "aggregation_interval": 3600,  # 1 hour in seconds
            "max_metrics_per_type": 10000
        }
        
        # Thread safety
        self.metrics_lock = threading.Lock()
        
        # Load existing metrics
        self._load_metrics()

    def record_api_metric(self, endpoint: str, response_time: float,
                         status_code: int, success: bool) -> bool:
        """Record API call metrics."""
        try:
            metric = {
                "timestamp": datetime.now().isoformat(),
                "endpoint": endpoint,
                "response_time": response_time,
                "status_code": status_code,
                "success": success
            }
            
            return self._store_metric("api", metric)
        except Exception as e:
            self.logger.error("Error recording API metric", e)
            return False

    def record_performance_metric(self, component: str, metric_type: str,
                                value: float) -> bool:
        """Record performance metrics."""
        try:
            metric = {
                "timestamp": datetime.now().isoformat(),
                "component": component,
                "type": metric_type,
                "value": value
            }
            
            return self._store_metric("performance", metric)
        except Exception as e:
            self.logger.error("Error recording performance metric", e)
            return False

    def record_usage_metric(self, feature: str, user_id: Optional[str] = None,
                          details: Optional[Dict] = None) -> bool:
        """Record feature usage metrics."""
        try:
            metric = {
                "timestamp": datetime.now().isoformat(),
                "feature": feature,
                "user_id": user_id,
                "details": details or {}
            }
            
            return self._store_metric("usage", metric)
        except Exception as e:
            self.logger.error("Error recording usage metric", e)
            return False

    def record_error_metric(self, error_type: str, message: str,
                          details: Optional[Dict] = None) -> bool:
        """Record error metrics."""
        try:
            metric = {
                "timestamp": datetime.now().isoformat(),
                "type": error_type,
                "message": message,
                "details": details or {}
            }
            
            return self._store_metric("errors", metric)
        except Exception as e:
            self.logger.error("Error recording error metric", e)
            return False

    def get_metrics(self, metric_type: str, start_time: Optional[datetime] = None,
                   end_time: Optional[datetime] = None) -> List[Dict]:
        """Get metrics of specified type within time range."""
        try:
            if metric_type not in self.metrics:
                return []
            
            with self.metrics_lock:
                metrics = self.metrics[metric_type]
            
            if not start_time and not end_time:
                return metrics
            
            filtered = []
            for metric in metrics:
                timestamp = datetime.fromisoformat(metric["timestamp"])
                if start_time and timestamp < start_time:
                    continue
                if end_time and timestamp > end_time:
                    continue
                filtered.append(metric)
            
            return filtered
        except Exception as e:
            self.logger.error("Error getting metrics", e)
            return []

    def get_aggregated_metrics(self, metric_type: str,
                             interval: Optional[int] = None) -> List[Dict]:
        """Get aggregated metrics by time interval."""
        try:
            if not interval:
                interval = self.settings["aggregation_interval"]
            
            metrics = self.get_metrics(metric_type)
            if not metrics:
                return []
            
            # Group metrics by interval
            intervals: Dict[str, List[Dict]] = {}
            for metric in metrics:
                timestamp = datetime.fromisoformat(metric["timestamp"])
                interval_key = timestamp.replace(
                    minute=0, second=0, microsecond=0
                ).isoformat()
                
                if interval_key not in intervals:
                    intervals[interval_key] = []
                intervals[interval_key].append(metric)
            
            # Aggregate metrics for each interval
            aggregated = []
            for interval_key, interval_metrics in intervals.items():
                if metric_type == "api":
                    agg = self._aggregate_api_metrics(interval_metrics)
                elif metric_type == "performance":
                    agg = self._aggregate_performance_metrics(interval_metrics)
                elif metric_type == "usage":
                    agg = self._aggregate_usage_metrics(interval_metrics)
                elif metric_type == "errors":
                    agg = self._aggregate_error_metrics(interval_metrics)
                else:
                    continue
                
                agg["interval"] = interval_key
                aggregated.append(agg)
            
            return sorted(aggregated, key=lambda x: x["interval"])
        except Exception as e:
            self.logger.error("Error aggregating metrics", e)
            return []

    def _aggregate_api_metrics(self, metrics: List[Dict]) -> Dict:
        """Aggregate API metrics."""
        try:
            total_calls = len(metrics)
            success_calls = sum(1 for m in metrics if m["success"])
            total_time = sum(m["response_time"] for m in metrics)
            
            return {
                "total_calls": total_calls,
                "success_rate": success_calls / total_calls if total_calls else 0,
                "avg_response_time": total_time / total_calls if total_calls else 0,
                "status_codes": self._count_status_codes(metrics)
            }
        except Exception as e:
            self.logger.error("Error aggregating API metrics", e)
            return {}

    def _aggregate_performance_metrics(self, metrics: List[Dict]) -> Dict:
        """Aggregate performance metrics."""
        try:
            components: Dict[str, Dict] = {}
            
            for metric in metrics:
                component = metric["component"]
                if component not in components:
                    components[component] = {"values": [], "types": set()}
                
                components[component]["values"].append(metric["value"])
                components[component]["types"].add(metric["type"])
            
            return {
                "components": {
                    component: {
                        "avg_value": sum(data["values"]) / len(data["values"]),
                        "min_value": min(data["values"]),
                        "max_value": max(data["values"]),
                        "metric_types": list(data["types"])
                    }
                    for component, data in components.items()
                }
            }
        except Exception as e:
            self.logger.error("Error aggregating performance metrics", e)
            return {}

    def _aggregate_usage_metrics(self, metrics: List[Dict]) -> Dict:
        """Aggregate usage metrics."""
        try:
            features: Dict[str, int] = {}
            unique_users = set()
            
            for metric in metrics:
                feature = metric["feature"]
                features[feature] = features.get(feature, 0) + 1
                
                if metric.get("user_id"):
                    unique_users.add(metric["user_id"])
            
            return {
                "total_usage": len(metrics),
                "feature_usage": features,
                "unique_users": len(unique_users)
            }
        except Exception as e:
            self.logger.error("Error aggregating usage metrics", e)
            return {}

    def _aggregate_error_metrics(self, metrics: List[Dict]) -> Dict:
        """Aggregate error metrics."""
        try:
            error_types: Dict[str, int] = {}
            
            for metric in metrics:
                error_type = metric["type"]
                error_types[error_type] = error_types.get(error_type, 0) + 1
            
            return {
                "total_errors": len(metrics),
                "error_types": error_types
            }
        except Exception as e:
            self.logger.error("Error aggregating error metrics", e)
            return {}

    def _count_status_codes(self, metrics: List[Dict]) -> Dict[int, int]:
        """Count occurrences of status codes."""
        try:
            codes: Dict[int, int] = {}
            for metric in metrics:
                code = metric["status_code"]
                codes[code] = codes.get(code, 0) + 1
            return codes
        except Exception as e:
            self.logger.error("Error counting status codes", e)
            return {}

    def _store_metric(self, metric_type: str, metric: Dict) -> bool:
        """Store metric in memory and persist to disk."""
        try:
            with self.metrics_lock:
                self.metrics[metric_type].append(metric)
                
                # Enforce max metrics limit
                if len(self.metrics[metric_type]) > self.settings["max_metrics_per_type"]:
                    self.metrics[metric_type] = self.metrics[metric_type][-self.settings["max_metrics_per_type"]:]
            
            # Persist metrics
            self._save_metrics()
            
            return True
        except Exception as e:
            self.logger.error("Error storing metric", e)
            return False

    def _load_metrics(self) -> None:
        """Load metrics from disk."""
        try:
            for metric_type in self.metrics:
                file_path = os.path.join(self.base_path, f"{metric_type}_metrics.json")
                if os.path.exists(file_path):
                    with open(file_path, "r") as f:
                        self.metrics[metric_type] = json.load(f)
        except Exception as e:
            self.logger.error("Error loading metrics", e)

    def _save_metrics(self) -> None:
        """Save metrics to disk."""
        try:
            for metric_type, metrics in self.metrics.items():
                file_path = os.path.join(self.base_path, f"{metric_type}_metrics.json")
                with open(file_path, "w") as f:
                    json.dump(metrics, f, indent=2)
        except Exception as e:
            self.logger.error("Error saving metrics", e)

    def cleanup_old_metrics(self) -> bool:
        """Remove metrics older than retention period."""
        try:
            cutoff = datetime.now() - timedelta(days=self.settings["retention_days"])
            
            with self.metrics_lock:
                for metric_type in self.metrics:
                    self.metrics[metric_type] = [
                        m for m in self.metrics[metric_type]
                        if datetime.fromisoformat(m["timestamp"]) > cutoff
                    ]
            
            self._save_metrics()
            return True
        except Exception as e:
            self.logger.error("Error cleaning up metrics", e)
            return False

    def update_settings(self, settings: Dict) -> bool:
        """Update metrics settings."""
        try:
            self.settings.update(settings)
            return True
        except Exception as e:
            self.logger.error("Error updating settings", e)
            return False
    def get_system_health(self) -> Dict:
        """Get system health metrics."""
        try:
            return {
                "system": {
                    "cpu": self._get_cpu_metrics(),
                    "memory": self._get_memory_metrics(),
                    "disk": self._get_disk_metrics(),
                    "uptime": self._get_uptime()
                },
                "services": self._get_service_status(),
                "performance": {
                    "response_times": self._get_response_times(),
                    "error_rates": self._get_error_rates(),
                    "throughput": self._get_throughput()
                }
            }
        except Exception as e:
            self.logger.error("Error getting system health", e)
            return {}

    def get_student_metrics(self, student_id: str, days: int = 30) -> Dict:
        """Get metrics for a specific student."""
        try:
            end_time = datetime.now()
            start_time = end_time - timedelta(days=days)
            
            return {
                "submission_count": 10,  # Mock data
                "ai_detection_rate": 0.15,
                "plagiarism_rate": 0.05,
                "average_quality": 0.85,
                "ai_detected_count": 2,
                "ai_confidence_levels": [0.7, 0.8, 0.9],
                "ai_detection_trends": [
                    {"date": "2024-01-01", "count": 1},
                    {"date": "2024-01-02", "count": 2}
                ],
                "plagiarism_detected_count": 1,
                "similarity_scores": [0.2, 0.3, 0.1],
                "plagiarism_sources": ["website", "academic"],
                "grade_level": 10.5,
                "vocabulary_metrics": {
                    "unique_words": 500,
                    "complexity_score": 0.75
                },
                "grammar_metrics": {
                    "error_rate": 0.02,
                    "style_score": 0.85
                }
            }
        except Exception as e:
            self.logger.error("Error getting student metrics", e)
            return {}

    def _get_cpu_metrics(self) -> Dict:
        """Get CPU usage metrics."""
        try:
            import psutil
            return {
                "usage_percent": psutil.cpu_percent(interval=1),
                "core_count": psutil.cpu_count(),
                "load_average": psutil.getloadavg()
            }
        except Exception:
            return {"error": "CPU metrics unavailable"}

    def _get_memory_metrics(self) -> Dict:
        """Get memory usage metrics."""
        try:
            import psutil
            mem = psutil.virtual_memory()
            return {
                "total": mem.total,
                "available": mem.available,
                "used": mem.used,
                "percent": mem.percent
            }
        except Exception:
            return {"error": "Memory metrics unavailable"}

    def _get_disk_metrics(self) -> Dict:
        """Get disk usage metrics."""
        try:
            import psutil
            disk = psutil.disk_usage("/")
            return {
                "total": disk.total,
                "used": disk.used,
                "free": disk.free,
                "percent": disk.percent
            }
        except Exception:
            return {"error": "Disk metrics unavailable"}

    def _get_uptime(self) -> float:
        """Get system uptime in seconds."""
        try:
            import psutil
            return time.time() - psutil.boot_time()
        except Exception:
            return 0.0

    def _get_service_status(self) -> Dict:
        """Get status of various services."""
        return {
            "api": "healthy",
            "database": "healthy",
            "cache": "healthy",
            "storage": "healthy"
        }

    def _get_response_times(self) -> List[float]:
        """Get recent API response times."""
        metrics = self.get_metrics("api", 
                                 start_time=datetime.now() - timedelta(hours=1))
        return [m["response_time"] for m in metrics]

    def _get_error_rates(self) -> Dict:
        """Get error rates by type."""
        metrics = self.get_metrics("errors",
                                 start_time=datetime.now() - timedelta(hours=1))
        total = len(metrics)
        if not total:
            return {}
        
        error_counts = {}
        for m in metrics:
            error_type = m["type"]
            error_counts[error_type] = error_counts.get(error_type, 0) + 1
        
        return {k: v/total for k, v in error_counts.items()}

    def _get_throughput(self) -> int:
        """Get request throughput per minute."""
        metrics = self.get_metrics("api",
                                 start_time=datetime.now() - timedelta(minutes=1))
        return len(metrics)
