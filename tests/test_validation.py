import pytest
from datetime import datetime
from plAIgiarized.validation.service import ValidationService
from plAIgiarized.models.essay import Essay

def test_validation_service_init():
    service = ValidationService()
    assert "essay" in service.rules
    assert "email" in service.patterns

def test_validate_essay():
    service = ValidationService()
    
    # Create valid essay
    essay = Essay(
        id="test_1",
        student_id="student123",
        content="This is a test essay that meets the minimum length requirement. " * 5,
        type="assignment",
        created_at=datetime.now()
    )
    
    # Validate
    errors = service.validate_essay(essay)
    assert len(errors) == 0

def test_validate_invalid_essay():
    service = ValidationService()
    
    # Create invalid essay
    essay = Essay(
        id="test_2",
        student_id="st",  # Too short
        content="Too short",  # Below minimum length
        type="invalid_type",  # Invalid type
        created_at=datetime.now()
    )
    
    # Validate
    errors = service.validate_essay(essay)
    assert len(errors) > 0
