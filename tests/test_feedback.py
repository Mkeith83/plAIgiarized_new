import pytest
from datetime import datetime
from plAIgiarized.feedback.service import FeedbackService
from plAIgiarized.models.essay import Essay

def test_feedback_service_init():
    service = FeedbackService()
    assert service.base_path.endswith("feedback")
    assert "ai_suspected" in service.templates

def test_generate_feedback():
    service = FeedbackService()
    
    # Create test essay
    essay = Essay(
        id="test_1",
        student_id="student_1",
        content="Test essay content",
        type="assignment",
        created_at=datetime.now(),
        metrics={
            "grade_level": 8.0,
            "vocabulary_size": 1000,
            "sentence_complexity": 5.0,
            "style_fingerprint": 7.5
        }
    )
    
    # Test feedback generation
    analysis = {
        "ai_probability": 0.2,
        "expected_grade_level": 8.0,
        "showing_improvement": True
    }
    
    feedback = service.generate_feedback(essay, analysis)
    assert "comments" in feedback
    assert "suggestions" in feedback
    assert "improvement_areas" in feedback
