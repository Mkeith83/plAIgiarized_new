import pytest
import time
import jwt
from plAIgiarized.user.service import UserService, UserError, AuthenticationError

@pytest.fixture
def user_service():
    return UserService()

@pytest.fixture
def test_user_data():
    return {
        "username": "testuser",
        "password": "Test123!@#",
        "email": "test@example.com"
    }

def test_user_service_init(user_service):
    assert user_service.jwt_secret is not None
    assert "min_password_length" in user_service.settings
    assert user_service.login_attempts == {}

def test_register_user(user_service, test_user_data):
    user_id = user_service.register_user(
        test_user_data["username"],
        test_user_data["password"],
        test_user_data["email"]
    )
    assert user_id is not None
    assert user_id.startswith("user_")

def test_authenticate_user(user_service, test_user_data):
    # Register user first
    user_service.register_user(
        test_user_data["username"],
        test_user_data["password"],
        test_user_data["email"]
    )
    
    # Test authentication
    token = user_service.authenticate(
        test_user_data["username"],
        test_user_data["password"]
    )
    assert token is not None
    
    # Validate token
    user_data = user_service.validate_token(token)
    assert user_data is not None
    assert user_data["username"] == test_user_data["username"]

def test_invalid_login(user_service, test_user_data):
    # Register user
    user_service.register_user(
        test_user_data["username"],
        test_user_data["password"],
        test_user_data["email"]
    )
    
    # Test wrong password
    token = user_service.authenticate(
        test_user_data["username"],
        "wrong_password"
    )
    assert token is None

def test_login_attempts(user_service, test_user_data):
    # Clear any existing data
    user_service.db._clear_database()
    
    # Register user
    user_id = user_service.register_user(
        test_user_data["username"],
        test_user_data["password"],
        test_user_data["email"]
    )
    assert user_id is not None

    # Make multiple failed attempts
    for _ in range(user_service.settings["max_login_attempts"]):
        token = user_service.authenticate(
            test_user_data["username"],
            "wrong_password"
        )
        assert token is None

    # Next attempt should fail due to lockout
    token = user_service.authenticate(
        test_user_data["username"],
        test_user_data["password"]
    )
    assert token is None  # Should be None due to lockout

def test_password_validation(user_service):
    assert user_service._validate_password("short") == False
    assert user_service._validate_password("no_numbers_or_special") == False
    assert user_service._validate_password("Test123!@#") == True

def test_email_validation(user_service):
    assert user_service._validate_email("invalid") == False
    assert user_service._validate_email("test@example") == False
    assert user_service._validate_email("test@example.com") == True

def test_update_user(user_service, test_user_data):
    # Clear any existing data
    user_service.db._clear_database()
    
    # Register user
    user_id = user_service.register_user(
        test_user_data["username"],
        test_user_data["password"],
        test_user_data["email"]
    )
    assert user_id is not None

    # Update email
    success = user_service.update_user(user_id, {
        "email": "new@example.com"
    })
    assert success == True

    # Verify update
    token = user_service.authenticate(
        test_user_data["username"],
        test_user_data["password"]
    )
    user_data = user_service.validate_token(token)
    assert user_data["email"] == "new@example.com" 