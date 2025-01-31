import pytest
from datetime import datetime, timedelta
from plAIgiarized.progress.service import ProgressService
from plAIgiarized.models.essay import Essay

def test_progress_service_init():
    service = ProgressService()
    assert service.base_path.endswith("progress")
    assert service.improvement_ranges["typical"]["avg"] == 10.0
    assert service.improvement_ranges["accelerated"]["max"] == 25.0
