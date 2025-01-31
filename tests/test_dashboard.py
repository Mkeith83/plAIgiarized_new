import pytest
from datetime import datetime
from plAIgiarized.dashboard.service import DashboardService
from plAIgiarized.models.essay import Essay

def test_dashboard_service_init():
    service = DashboardService()
    assert service.base_path.endswith("dashboard")

def test_generate_student_dashboard():
    service = DashboardService()
    
    # Create test essay
    essay = Essay(
        id="test_1",
        student_id="student_1",
        content="Test essay content",
        type="baseline",
        created_at=datetime.now(),
        metrics={
            "grade_level": 8.0,
            "vocabulary_size": 100,
            "sentence_complexity": 5.0,
            "style_fingerprint": 7.5
        }
    )
    
    dashboard = service.generate_student_dashboard("student_1", [essay])
    assert "overview" in dashboard
    assert "progress_charts" in dashboard
    assert "skill_breakdown" in dashboard
