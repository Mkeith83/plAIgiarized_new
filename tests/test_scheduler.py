import pytest
import time
from plAIgiarized.scheduler.service import SchedulerService

def test_scheduler_service_init():
    service = SchedulerService()
    assert service.base_path.endswith("scheduler")
    assert len(service.tasks) >= 3  # Default tasks

def test_schedule_task():
    service = SchedulerService()
    
    # Test task function
    def test_task():
        print("Test task executed")
    
    # Schedule task
    success = service.schedule_task(
        "test_task",
        test_task,
        "interval",
        5  # Run every 5 seconds
    )
    
    assert success == True
    
    # Verify task was scheduled
    task = service.get_task_status("test_task")
    assert task is not None
    assert task["schedule_type"] == "interval"
    assert task["schedule_value"] == 5

def test_cancel_task():
    service = SchedulerService()
    
    # Schedule test task
    def test_task():
        print("Test task executed")
    
    service.schedule_task("test_task", test_task, "interval", 5)
    
    # Cancel task
    success = service.cancel_task("test_task")
    assert success == True
    
    # Verify task was canceled
    task = service.get_task_status("test_task")
    assert task is None
