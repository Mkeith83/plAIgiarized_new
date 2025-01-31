import pytest
from pathlib import Path
import json
from plAIgiarized.report.service import ReportService

@pytest.fixture
def report_service():
    return ReportService()

@pytest.fixture
def sample_essay():
    return {
        "id": "test_essay_1",
        "title": "Test Essay",
        "content": "This is a test essay.\n\nIt has multiple paragraphs.\n\nIn conclusion, testing is important.",
        "author": "Test Author",
        "created_at": "2024-01-01T00:00:00"
    }

@pytest.fixture
def sample_analysis():
    return {
        "readability": {
            "score": 75.5,
            "grade_level": 8.5,
            "avg_syllables_per_word": 1.5,
            "avg_words_per_sentence": 15.2
        },
        "vocabulary": {
            "grade_level": 8.5,
            "vocabulary_metrics": {
                "unique_words": 10,
                "avg_word_length": 4.5,
                "complexity_score": 0.6
            }
        },
        "ai_detection": {
            "is_ai_generated": False,
            "confidence_score": 0.3
        }
    }

def test_report_service_init(report_service):
    assert report_service.base_path.name == "reports"
    assert "formats" in report_service.settings
    assert report_service.jinja_env is not None

def test_prepare_report_data(report_service, sample_essay, sample_analysis):
    data = report_service._prepare_report_data(sample_essay, sample_analysis)
    assert data["essay"]["id"] == sample_essay["id"]
    assert "analysis" in data
    assert "summary" in data
    assert "timestamp" in data

def test_generate_summary(report_service, sample_analysis):
    summary = report_service._generate_summary(sample_analysis)
    assert "ai_likelihood" in summary
    assert "quality_rating" in summary
    assert "readability_level" in summary
    assert "structure_complete" in summary

def test_generate_visualizations(report_service, sample_analysis):
    visualizations = report_service._generate_visualizations(sample_analysis)
    assert len(visualizations) > 0
    for viz_bytes in visualizations.values():
        # Check that we got PNG image bytes
        assert isinstance(viz_bytes, bytes)
        assert viz_bytes.startswith(b'\x89PNG')  # PNG magic number

def test_generate_report_pdf(report_service, sample_essay, sample_analysis):
    report_path = report_service._generate_report_file(
        report_service._prepare_report_data(sample_essay, sample_analysis),
        "pdf"
    )
    assert report_path is not None
    assert report_path.exists()
    assert report_path.suffix == ".pdf"

def test_generate_report_html(report_service, sample_essay, sample_analysis):
    report_path = report_service._generate_report_file(
        report_service._prepare_report_data(sample_essay, sample_analysis),
        "html"
    )
    assert report_path is not None
    assert report_path.exists()
    assert report_path.suffix == ".html"

def test_generate_report_json(report_service, sample_essay, sample_analysis):
    report_path = report_service._generate_report_file(
        report_service._prepare_report_data(sample_essay, sample_analysis),
        "json"
    )
    assert report_path is not None
    assert report_path.exists()
    assert report_path.suffix == ".json"