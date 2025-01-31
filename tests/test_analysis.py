import pytest
from plAIgiarized.analysis.service import AnalysisService
from plAIgiarized.database.service import DatabaseService

@pytest.fixture
def analysis_service():
    return AnalysisService()

@pytest.fixture
def sample_essay():
    return {
        "id": "test_essay_1",
        "title": "Test Essay",
        "content": """This is a test essay about writing analysis.

        The purpose of this essay is to test various analysis features.
        We need multiple sentences to test different metrics properly.
        This paragraph contains several sentences of varying length and complexity.

        In conclusion, this essay demonstrates basic structure and content
        for testing the analysis service functionality.""",
        "author": "Test Author",
        "created_at": "2024-01-01T00:00:00"
    }

def test_analysis_service_init(analysis_service):
    assert analysis_service.settings["min_words"] > 0
    assert analysis_service.settings["readability_target"] > 0
    assert analysis_service.settings["cache_enabled"] is True

def test_word_count(analysis_service, sample_essay):
    count = analysis_service._count_words(sample_essay["content"])
    assert count > 0
    assert isinstance(count, int)

def test_sentence_count(analysis_service, sample_essay):
    count = analysis_service._count_sentences(sample_essay["content"])
    assert count > 0
    assert isinstance(count, int)

def test_readability_analysis(analysis_service, sample_essay):
    readability = analysis_service._analyze_readability(sample_essay["content"])
    assert "score" in readability
    assert "grade_level" in readability
    assert isinstance(readability["score"], float)
    assert isinstance(readability["grade_level"], float)

def test_structure_analysis(analysis_service, sample_essay):
    structure = analysis_service._analyze_structure(sample_essay["content"])
    assert "paragraph_count" in structure
    assert "has_introduction" in structure
    assert "has_conclusion" in structure
    assert structure["paragraph_count"] > 0

def test_vocabulary_analysis(analysis_service, sample_essay):
    vocabulary = analysis_service._analyze_vocabulary(sample_essay["content"])
    assert "unique_words" in vocabulary
    assert "avg_word_length" in vocabulary
    assert "complexity_score" in vocabulary
    assert vocabulary["unique_words"] > 0

def test_ai_detection(analysis_service, sample_essay):
    detection = analysis_service._detect_ai_content(sample_essay["content"])
    assert "confidence_score" in detection
    assert "is_ai_generated" in detection
    assert isinstance(detection["confidence_score"], float)
    assert isinstance(detection["is_ai_generated"], bool)

def test_complete_analysis(analysis_service, sample_essay):
    # First, store the essay in the database
    analysis_service.db.insert_essay(sample_essay)
    
    # Perform complete analysis
    analysis = analysis_service.analyze_essay(sample_essay["id"])
    assert analysis is not None
    assert analysis["essay_id"] == sample_essay["id"]
    assert "readability" in analysis
    assert "structure" in analysis
    assert "vocabulary" in analysis
    assert "ai_detection" in analysis

def test_cached_analysis(analysis_service, sample_essay):
    # Store essay and perform initial analysis
    analysis_service.db.insert_essay(sample_essay)
    first_analysis = analysis_service.analyze_essay(sample_essay["id"])
    
    # Get cached analysis
    cached_analysis = analysis_service._get_cached_analysis(sample_essay["id"])
    assert cached_analysis is not None
    assert cached_analysis["essay_id"] == first_analysis["essay_id"]

def test_update_settings(analysis_service):
    new_settings = {
        "min_words": 150,
        "readability_target": 9.0,
        "cache_duration": 7200
    }
    assert analysis_service.update_settings(new_settings) is True
    assert analysis_service.settings["min_words"] == 150
    assert analysis_service.settings["readability_target"] == 9.0