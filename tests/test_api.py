import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime
from plAIgiarized.api.service import APIService, APIError, RateLimitError

@pytest.fixture
def api_service():
    return APIService()

def test_api_service_init(api_service):
    assert api_service.settings["timeout"] > 0
    assert len(api_service.settings["endpoints"]) > 0
    assert api_service.session is not None

@patch("requests.Session.request")
def test_check_ai_content(mock_request, api_service):
    # Mock successful response
    mock_request.return_value.json.return_value = {
        "choices": [{"text": "This text appears to be AI-generated"}],
        "confidence": 0.85
    }
    mock_request.return_value.raise_for_status = MagicMock()
    
    result = api_service.check_ai_content("Test text")
    assert result["is_ai_generated"] == True
    assert "confidence" in result

@patch("requests.Session.request")
def test_check_plagiarism(mock_request, api_service):
    # Mock successful response
    mock_request.return_value.json.return_value = {
        "similarity_score": 0.25,
        "matches": [{"source": "example.com", "similarity": 0.25}]
    }
    mock_request.return_value.raise_for_status = MagicMock()
    
    result = api_service.check_plagiarism("Test text")
    assert "similarity_score" in result
    assert "matches" in result

def test_rate_limit(api_service):
    # Test rate limit checking
    api = "test_api"
    
    # Should not raise error
    api_service._check_rate_limit(api)
    
    # Simulate rate limit exceeded
    today = datetime.now().date().isoformat()
    minute = datetime.now().replace(second=0, microsecond=0).isoformat()
    api_service.usage["daily"][today] = {api: 1000}
    api_service.usage["minute"][minute] = {api: 60}
    
    with pytest.raises(RateLimitError):
        api_service._check_rate_limit(api)