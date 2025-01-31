import sys
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

import pytest
from datetime import datetime
from plAIgiarized.models.essay import Essay
from plAIgiarized.detection.service import DetectionService

def test_detection_service_init():
    service = DetectionService()
    assert service.base_path.endswith("detection")

def test_style_comparison():
    service = DetectionService()
    
    # Create two essays from same student
    essay1 = Essay(
        id="test_1",
        student_id="student_1",
        content="This is a normal student essay with typical writing patterns and style. It shows consistent language use and natural flow.",
        type="baseline",
        created_at=datetime.now()
    )
    
    essay2 = Essay(
        id="test_2",
        student_id="student_1",
        content="This essay demonstrates significantly different writing patterns. The vocabulary complexity and sentence structures show marked deviation from established style.",
        type="submitted",
        created_at=datetime.now()
    )
    
    # Compare writing styles
    comparison = service.compare_essays(essay1, essay2)
    assert isinstance(comparison["similarity_score"], float)
    assert 0 <= comparison["similarity_score"] <= 1.0
    assert "ai_probability" in comparison
