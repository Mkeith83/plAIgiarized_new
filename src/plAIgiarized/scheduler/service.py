from typing import Dict, List, Optional, Any, Callable
import os
import json
from datetime import datetime, timedelta
import threading
import time
import schedule
from ..logging.service import LoggingService
from ..backup.service import BackupService
from ..metrics.service import MetricsService

class SchedulerService:
    def __init__(self):
        self.base_path = "data/scheduler"
        os.makedirs(self.base_path, exist_ok=True)
        
        # Initialize services
        self.logger = LoggingService()
        self.backup = BackupService()
        self.metrics = MetricsService()
        
        # Task settings
        self.settings = {
            "max_concurrent_tasks": 5,
            "retry_attempts": 3,
            "retry_delay": 300,  # 5 minutes
            "task_timeout": 3600  # 1 hour
        }
        
        # Task storage
        self.tasks: Dict[str, Dict] = {}
        self.running_tasks: Dict[str, threading.Thread] = {}
        
        # Thread safety
        self.task_lock = threading.Lock()
        
        # Schedule default tasks
        self._schedule_default_tasks()
        
        # Start scheduler thread
        self.scheduler_thread = threading.Thread(target=self._run_scheduler, daemon=True)
        self.scheduler_thread.start()

    def schedule_task(self, task_id: str, func: Callable, schedule_type: str,
                     schedule_value: Any, args: Optional[tuple] = None,
                     kwargs: Optional[Dict] = None) -> bool:
        """Schedule a new task."""
        try:
            with self.task_lock:
                if task_id in self.tasks:
                    return False
                
                task = {
                    "id": task_id,
                    "function": func,
                    "schedule_type": schedule_type,
                    "schedule_value": schedule_value,
                    "args": args or (),
                    "kwargs": kwargs or {},
                    "status": "scheduled",
                    "last_run": None,
                    "next_run": None,
                    "error_count": 0
                }
                
                # Schedule task based on type
                if schedule_type == "interval":
                    schedule.every(schedule_value).seconds.do(
                        self._execute_task, task_id
                    )
                elif schedule_type == "daily":
                    schedule.every().day.at(schedule_value).do(
                        self._execute_task, task_id
                    )
                elif schedule_type == "weekly":
                    schedule.every().week.at(schedule_value).do(
                        self._execute_task, task_id
                    )
                else:
                    raise ValueError(f"Invalid schedule type: {schedule_type}")
                
                self.tasks[task_id] = task
                self._save_tasks()
                
                return True
        except Exception as e:
            self.logger.error(f"Error scheduling task {task_id}", e)
            return False

    def cancel_task(self, task_id: str) -> bool:
        """Cancel scheduled task."""
        try:
            with self.task_lock:
                if task_id not in self.tasks:
                    return False
                
                # Cancel task in schedule
                schedule.clear(task_id)
                
                # Stop running task if active
                if task_id in self.running_tasks:
                    # Note: This doesn't actually stop the thread,
                    # just marks it for cleanup
                    self.running_tasks[task_id].join(0)
                    del self.running_tasks[task_id]
                
                # Remove task
                del self.tasks[task_id]
                self._save_tasks()
                
                return True
        except Exception as e:
            self.logger.error(f"Error canceling task {task_id}", e)
            return False

    def get_task_status(self, task_id: str) -> Optional[Dict]:
        """Get status of scheduled task."""
        try:
            with self.task_lock:
                if task_id not in self.tasks:
                    return None
                
                task = self.tasks[task_id].copy()
                # Remove non-serializable items
                task.pop("function", None)
                return task
        except Exception as e:
            self.logger.error(f"Error getting task status {task_id}", e)
            return None

    def list_tasks(self) -> List[Dict]:
        """List all scheduled tasks."""
        try:
            with self.task_lock:
                tasks = []
                for task_id, task in self.tasks.items():
                    task_info = task.copy()
                    # Remove non-serializable items
                    task_info.pop("function", None)
                    tasks.append(task_info)
                return tasks
        except Exception as e:
            self.logger.error("Error listing tasks", e)
            return []

    def _execute_task(self, task_id: str) -> None:
        """Execute scheduled task."""
        try:
            with self.task_lock:
                if task_id not in self.tasks:
                    return
                
                task = self.tasks[task_id]
                if task["status"] == "running":
                    return
                
                task["status"] = "running"
                task["last_run"] = datetime.now().isoformat()
            
            # Start task in new thread
            thread = threading.Thread(
                target=self._run_task,
                args=(task_id,),
                daemon=True
            )
            
            with self.task_lock:
                self.running_tasks[task_id] = thread
            
            thread.start()
        except Exception as e:
            self.logger.error(f"Error executing task {task_id}", e)
            with self.task_lock:
                if task_id in self.tasks:
                    self.tasks[task_id]["status"] = "error"
                    self.tasks[task_id]["error_count"] += 1

    def _run_task(self, task_id: str) -> None:
        """Run task function with timeout."""
        try:
            task = self.tasks[task_id]
            func = task["function"]
            args = task["args"]
            kwargs = task["kwargs"]
            
            # Execute task
            func(*args, **kwargs)
            
            # Update task status
            with self.task_lock:
                if task_id in self.tasks:
                    self.tasks[task_id]["status"] = "completed"
                    self.tasks[task_id]["error_count"] = 0
        except Exception as e:
            self.logger.error(f"Error running task {task_id}", e)
            with self.task_lock:
                if task_id in self.tasks:
                    self.tasks[task_id]["status"] = "error"
                    self.tasks[task_id]["error_count"] += 1
        finally:
            # Cleanup
            with self.task_lock:
                if task_id in self.running_tasks:
                    del self.running_tasks[task_id]

    def _schedule_default_tasks(self) -> None:
        """Schedule default system tasks."""
        try:
            # Daily backup
            self.schedule_task(
                "daily_backup",
                self.backup.create_backup,
                "daily",
                "00:00",
                args=("full",)
            )
            
            # Hourly metrics cleanup
            self.schedule_task(
                "metrics_cleanup",
                self.metrics.cleanup_old_metrics,
                "interval",
                3600
            )
            
            # System health check every 5 minutes
            self.schedule_task(
                "health_check",
                self.metrics.get_system_health,
                "interval",
                300
            )
        except Exception as e:
            self.logger.error("Error scheduling default tasks", e)

    def _run_scheduler(self) -> None:
        """Run scheduler loop."""
        while True:
            try:
                schedule.run_pending()
                time.sleep(1)
            except Exception as e:
                self.logger.error("Error in scheduler loop", e)
                time.sleep(5)

    def _save_tasks(self) -> None:
        """Save tasks to disk."""
        try:
            tasks_file = os.path.join(self.base_path, "tasks.json")
            with open(tasks_file, "w") as f:
                # Create serializable task list
                tasks = {}
                for task_id, task in self.tasks.items():
                    task_info = task.copy()
                    # Remove non-serializable items
                    task_info.pop("function", None)
                    tasks[task_id] = task_info
                
                json.dump(tasks, f, indent=2)
        except Exception as e:
            self.logger.error("Error saving tasks", e)

    def _load_tasks(self) -> None:
        """Load tasks from disk."""
        try:
            tasks_file = os.path.join(self.base_path, "tasks.json")
            if not os.path.exists(tasks_file):
                return
            
            with open(tasks_file, "r") as f:
                saved_tasks = json.load(f)
            
            # Reschedule saved tasks
            for task_id, task in saved_tasks.items():
                if task["schedule_type"] == "interval":
                    schedule.every(task["schedule_value"]).seconds.do(
                        self._execute_task, task_id
                    )
                elif task["schedule_type"] == "daily":
                    schedule.every().day.at(task["schedule_value"]).do(
                        self._execute_task, task_id
                    )
                elif task["schedule_type"] == "weekly":
                    schedule.every().week.at(task["schedule_value"]).do(
                        self._execute_task, task_id
                    )
        except Exception as e:
            self.logger.error("Error loading tasks", e)

    def update_settings(self, settings: Dict) -> bool:
        """Update scheduler settings."""
        try:
            self.settings.update(settings)
            return True
        except Exception as e:
            self.logger.error("Error updating settings", e)
            return False
