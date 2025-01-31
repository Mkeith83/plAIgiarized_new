import pytest
from pathlib import Path
import time
from plAIgiarized.logging.service import LoggingService

@pytest.fixture
def logging_service():
    service = LoggingService()
    service.clear_logs()  # Start fresh
    return service

def test_logging_service_init(logging_service):
    assert logging_service.logger is not None
    assert logging_service.log_dir.exists()

def test_log_messages(logging_service):
    # Test different log levels
    assert logging_service.debug("Debug message") is True
    assert logging_service.info("Info message") is True
    assert logging_service.warning("Warning message") is True
    assert logging_service.error("Error message") is True
    assert logging_service.critical("Critical message") is True

    # Test with exception
    try:
        raise ValueError("Test error")
    except Exception as e:
        assert logging_service.error("Error occurred", e) is True

    # Check if log file exists
    assert logging_service.log_dir.exists()
    assert (logging_service.log_dir / "app.log").exists()

def test_log_file_creation(logging_service):
    # Create a log message
    logging_service.info("Test message")
    
    # Check if log file exists
    log_file = logging_service.log_dir / "app.log"
    assert log_file.exists()
    assert log_file.stat().st_size > 0

def test_error_logging(logging_service):
    # Test error logging
    try:
        raise ValueError("Test error")
    except Exception as e:
        assert logging_service.error("Error occurred", e) is True

    # Give logger time to write
    time.sleep(0.1)

    # Check if log file exists and contains error
    log_file = logging_service.log_dir / "app.log"
    assert log_file.exists()
    assert log_file.stat().st_size > 0
