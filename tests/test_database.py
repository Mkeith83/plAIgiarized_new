import pytest
from datetime import datetime
from plAIgiarized.database.service import DatabaseService

@pytest.fixture(autouse=True)
def cleanup_database():
    """Clean up database before each test."""
    service = DatabaseService()
    service._clear_database()
    yield
    service._clear_database()

def test_database_service_init():
    service = DatabaseService()
    assert service.base_path.name == "database"
    assert "auto_backup" in service.settings

def test_student_crud():
    service = DatabaseService()
    
    # Test student creation
    student_data = {
        "id": "test_student",
        "name": "Test Student",
        "email": "test@example.com",
        "metadata": {"grade": "10"}
    }
    
    success = service.insert_student(student_data)
    assert success == True
    
    # Test student retrieval
    student = service.get_student("test_student")
    assert student is not None
    assert student["name"] == "Test Student"
    assert student["email"] == "test@example.com"
    assert student["metadata"]["grade"] == "10"

def test_essay_crud():
    service = DatabaseService()
    
    # Create test student
    student_data = {
        "id": "test_student_2",
        "name": "Test Student 2",
        "email": "test2@example.com"
    }
    service.insert_student(student_data)
    
    # Test essay creation
    essay_data = {
        "id": "test_essay",
        "student_id": "test_student_2",
        "content": "Test essay content",
        "type": "assignment",
        "metadata": {"subject": "English"}
    }
    
    success = service.insert_essay(essay_data)
    assert success == True
    
    # Test essay retrieval
    essay = service.get_essay("test_essay")
    assert essay is not None
    assert essay["content"] == "Test essay content"
    assert essay["type"] == "assignment"
    assert essay["metadata"]["subject"] == "English"

def test_analysis_crud():
    service = DatabaseService()
    
    # Create test student and essay
    student_data = {
        "id": "test_student_3",
        "name": "Test Student 3",
        "email": "test3@example.com"
    }
    service.insert_student(student_data)
    
    essay_data = {
        "id": "test_essay_2",
        "student_id": "test_student_3",
        "content": "Test essay content",
        "type": "assignment"
    }
    service.insert_essay(essay_data)
    
    # Test analysis creation
    analysis_data = {
        "id": "test_analysis",
        "essay_id": "test_essay_2",
        "type": "plagiarism",
        "score": 0.15,
        "details": {"matches": ["source1", "source2"]}
    }
    
    success = service.insert_analysis(analysis_data)
    assert success == True
    
    # Test analysis retrieval
    analysis = service.get_analysis("test_analysis")
    assert analysis is not None
    assert analysis["type"] == "plagiarism"
    assert analysis["score"] == 0.15
    assert len(analysis["details"]["matches"]) == 2