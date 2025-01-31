from typing import Dict, List, Optional
import os
import json
import psutil
import platform
from datetime import datetime
import threading
from ..metrics.service import MetricsService

class HealthService:
    def __init__(self):
        self.base_path = "data/health"
        os.makedirs(self.base_path, exist_ok=True)
        
        self.metrics_service = MetricsService()
        
        # Health check settings
        self.settings = {
            "cpu_warning_threshold": 80.0,    # 80% CPU usage
            "memory_warning_threshold": 85.0,  # 85% memory usage
            "disk_warning_threshold": 90.0,    # 90% disk usage
            "error_rate_threshold": 5.0,      # 5% error rate
            "response_time_threshold": 2.0     # 2 seconds
        }
        
        # Initialize monitoring
        self.monitoring = False
        self.monitor_thread: Optional[threading.Thread] = None
        self.monitor_interval = 60  # seconds
        
        # Health history
        self.health_history: List[Dict] = []
        self.history_lock = threading.Lock()

    def start_monitoring(self) -> bool:
        """Start health monitoring."""
        try:
            if not self.monitoring:
                self.monitoring = True
                self.monitor_thread = threading.Thread(target=self._monitor_health)
                self.monitor_thread.daemon = True
                self.monitor_thread.start()
                return True
            return False
        except Exception as e:
            print(f"Error starting health monitoring: {e}")
            return False

    def stop_monitoring(self) -> bool:
        """Stop health monitoring."""
        try:
            if self.monitoring:
                self.monitoring = False
                if self.monitor_thread:
                    self.monitor_thread.join(timeout=5)
                return True
            return False
        except Exception as e:
            print(f"Error stopping health monitoring: {e}")
            return False

    def get_system_health(self) -> Dict:
        """Get current system health status."""
        try:
            # Get system metrics
            cpu_usage = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Get application metrics
            app_metrics = self.metrics_service.get_system_health()
            
            health_status = {
                "timestamp": datetime.now().isoformat(),
                "status": self._calculate_overall_status(
                    cpu_usage, memory.percent, disk.percent, app_metrics
                ),
                "system": {
                    "cpu": {
                        "usage": cpu_usage,
                        "status": "warning" if cpu_usage > self.settings["cpu_warning_threshold"]
                                else "healthy"
                    },
                    "memory": {
                        "total": memory.total,
                        "available": memory.available,
                        "used_percent": memory.percent,
                        "status": "warning" if memory.percent > self.settings["memory_warning_threshold"]
                                else "healthy"
                    },
                    "disk": {
                        "total": disk.total,
                        "used": disk.used,
                        "free": disk.free,
                        "used_percent": disk.percent,
                        "status": "warning" if disk.percent > self.settings["disk_warning_threshold"]
                                else "healthy"
                    }
                },
                "application": {
                    "error_rate": app_metrics.get("error_rate", 0),
                    "avg_response_time": app_metrics.get("avg_response_time", 0),
                    "status": "warning" if app_metrics.get("error_rate", 0) > 
                             self.settings["error_rate_threshold"] else "healthy"
                },
                "environment": self._get_environment_info()
            }
            
            return health_status
        except Exception as e:
            print(f"Error getting system health: {e}")
            return {}

    def get_health_history(self, hours: int = 24) -> List[Dict]:
        """Get health history for specified period."""
        try:
            with self.history_lock:
                cutoff_time = datetime.now().timestamp() - (hours * 3600)
                return [
                    entry for entry in self.health_history
                    if datetime.fromisoformat(entry["timestamp"]).timestamp() > cutoff_time
                ]
        except Exception as e:
            print(f"Error getting health history: {e}")
            return []

    def check_component_health(self, component: str) -> Dict:
        """Check health of specific component."""
        try:
            health = self.get_system_health()
            
            if component == "cpu":
                return health["system"]["cpu"]
            elif component == "memory":
                return health["system"]["memory"]
            elif component == "disk":
                return health["system"]["disk"]
            elif component == "application":
                return health["application"]
            else:
                raise ValueError(f"Unknown component: {component}")
        except Exception as e:
            print(f"Error checking component health: {e}")
            return {}

    def _monitor_health(self) -> None:
        """Background health monitoring task."""
        while self.monitoring:
            try:
                health_status = self.get_system_health()
                
                # Update health history
                with self.history_lock:
                    self.health_history.append(health_status)
                    
                    # Keep last 24 hours of history
                    cutoff_time = datetime.now().timestamp() - (24 * 3600)
                    self.health_history = [
                        entry for entry in self.health_history
                        if datetime.fromisoformat(entry["timestamp"]).timestamp() > cutoff_time
                    ]
                
                # Sleep for monitoring interval
                for _ in range(self.monitor_interval):
                    if not self.monitoring:
                        break
                    threading.Event().wait(1)
                    
            except Exception as e:
                print(f"Error in health monitoring: {e}")
                threading.Event().wait(self.monitor_interval)

    def _calculate_overall_status(self, cpu_usage: float, memory_usage: float, 
                                disk_usage: float, app_metrics: Dict) -> str:
        """Calculate overall system health status."""
        try:
            # Check system metrics
            if (cpu_usage > self.settings["cpu_warning_threshold"] or
                memory_usage > self.settings["memory_warning_threshold"] or
                disk_usage > self.settings["disk_warning_threshold"]):
                return "warning"
            
            # Check application metrics
            error_rate = app_metrics.get("error_rate", 0)
            response_time = app_metrics.get("avg_response_time", 0)
            
            if (error_rate > self.settings["error_rate_threshold"] or
                response_time > self.settings["response_time_threshold"]):
                return "warning"
            
            return "healthy"
        except Exception as e:
            print(f"Error calculating overall status: {e}")
            return "unknown"

    def _get_environment_info(self) -> Dict:
        """Get information about the system environment."""
        try:
            return {
                "platform": platform.platform(),
                "python_version": platform.python_version(),
                "processor": platform.processor(),
                "machine": platform.machine(),
                "cores": psutil.cpu_count(),
                "boot_time": datetime.fromtimestamp(psutil.boot_time()).isoformat()
            }
        except Exception as e:
            print(f"Error getting environment info: {e}")
            return {}
