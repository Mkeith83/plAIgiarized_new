import os
import sys
import pytest
from pathlib import Path
import shutil
import time
import logging

# Add the project root directory to Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

@pytest.fixture(autouse=True)
def clean_test_data():
    """Clean up test data before and after each test."""
    # Clean before test
    data_dir = Path("data")
    if data_dir.exists():
        # Close all logging handlers
        loggers = [logging.getLogger(), logging.getLogger("plAIgiarized")]
        for logger in loggers:
            for handler in logger.handlers[:]:
                handler.close()
                logger.removeHandler(handler)
        # Wait a moment for file handles to be released
        time.sleep(0.1)
        try:
            shutil.rmtree(data_dir)
        except PermissionError:
            pass  # Ignore permission errors during cleanup
    
    yield
    
    # Clean after test
    if data_dir.exists():
        # Close all logging handlers again
        loggers = [logging.getLogger(), logging.getLogger("plAIgiarized")]
        for logger in loggers:
            for handler in logger.handlers[:]:
                handler.close()
                logger.removeHandler(handler)
        # Wait a moment for file handles to be released
        time.sleep(0.1)
        try:
            shutil.rmtree(data_dir)
        except PermissionError:
            pass  # Ignore permission errors during cleanup
