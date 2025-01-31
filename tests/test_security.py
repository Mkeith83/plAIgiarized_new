import pytest
import jwt
from datetime import datetime, timedelta
from plAIgiarized.security.service import SecurityService

@pytest.fixture
def security_service():
    return SecurityService()

@pytest.fixture
def sample_user_data():
    return {
        "id": "user_123",
        "username": "testuser",
        "email": "test@example.com",
        "role": "user"
    }

@pytest.fixture(autouse=True)
def cleanup_database():
    """Clean up database before each test."""
    service = SecurityService()
    service.db._clear_database()
    return service

def test_security_service_init(security_service):
    assert security_service.jwt_secret is not None
    assert "token_expiry" in security_service.settings

def test_generate_token(security_service, sample_user_data):
    token = security_service.generate_token(sample_user_data)
    assert token is not None
    
    # Verify token
    payload = jwt.decode(token, security_service.jwt_secret, algorithms=["HS256"])
    assert payload["user_id"] == sample_user_data["id"]
    assert payload["username"] == sample_user_data["username"]
    assert payload["role"] == sample_user_data["role"]

def test_validate_token(security_service, sample_user_data):
    # First create the user in the database
    security_service.create_user(
        username=sample_user_data["username"],
        password="TestPass123!",
        email=sample_user_data["email"]
    )
    
    # Get the actual user from database to ensure we have the right ID
    user = security_service.db.get_user(sample_user_data["username"])
    assert user is not None
    
    # Generate and validate token
    token = security_service.generate_token(user)
    payload = security_service.validate_token(token)
    assert payload is not None
    assert payload["username"] == sample_user_data["username"]
    assert payload["role"] == "user"

def test_expired_token(security_service, sample_user_data):
    # Create token that's already expired
    payload = {
        "user_id": sample_user_data["id"],
        "username": sample_user_data["username"],
        "role": sample_user_data["role"],
        "exp": int((datetime.now() - timedelta(hours=1)).timestamp())
    }
    token = jwt.encode(payload, security_service.jwt_secret, algorithm="HS256")
    
    # Validate should fail
    assert security_service.validate_token(token) is None

def test_invalid_token(security_service):
    assert security_service.validate_token("invalid.token.here") is None

def test_update_settings(security_service):
    new_settings = {
        "token_expiry": 12 * 60 * 60,  # 12 hours
        "max_login_attempts": 3
    }
    assert security_service.update_settings(new_settings) is True
    assert security_service.settings["token_expiry"] == 12 * 60 * 60
    assert security_service.settings["max_login_attempts"] == 3

def test_user_creation(security_service):
    success = security_service.create_user(
        username="testuser2",
        password="TestPass123!",
        email="test2@example.com"
    )
    assert success is True

def test_authentication(security_service):
    # Create user first
    security_service.create_user(
        username="testuser2",
        password="TestPass123!",
        email="test2@example.com"
    )
    
    # Test authentication
    token = security_service.authenticate("testuser2", "TestPass123!")
    assert token is not None
    
    # Test wrong password
    token = security_service.authenticate("testuser2", "WrongPass!")
    assert token is None

def test_token_validation():
    service = SecurityService()
    
    # Create and authenticate user
    service.create_user(
        username="testuser3",
        password="TestPass123!",
        email="test3@example.com"
    )
    token = service.authenticate("testuser3", "TestPass123!")
    
    # Validate token
    user_info = service.validate_token(token)
    assert user_info is not None
    assert user_info["username"] == "testuser3"
    assert user_info["role"] == "user"  # Default role