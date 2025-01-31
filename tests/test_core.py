import sys
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

import pytest
from plAIgiarized.models.essay import Essay
from plAIgiarized.baseline.service import BaselineService
from plAIgiarized.storage.service import StorageService, StorageError, ValidationError
from datetime import datetime
import os

def test_essay_model():
    essay = Essay(
        id="test_1",
        student_id="student_1",
        content="This is a test essay with sufficient length to pass validation. It contains multiple sentences and should work fine.",
        type="handwritten",
        created_at=datetime.now()
    )
    assert essay.id == "test_1"
    assert essay.content == "This is a test essay with sufficient length to pass validation. It contains multiple sentences and should work fine."

# ... rest of test functions ...
