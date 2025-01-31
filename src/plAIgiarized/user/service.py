from typing import Dict, List, Optional, Any
import os
import json
import time
from pathlib import Path
from datetime import datetime
import bcrypt
import jwt
from ..logging.service import LoggingService
from ..database.service import DatabaseService
from ..security.service import SecurityService

class UserError(Exception):
    """Base class for user-related errors."""
    pass

class AuthenticationError(UserError):
    """Raised when authentication fails."""
    pass

class UserService:
    def __init__(self):
        self.logger = LoggingService()
        self.db = DatabaseService()
        self.security = SecurityService()
        
        # Load JWT secret from environment or generate one
        self.jwt_secret = os.getenv("JWT_SECRET", os.urandom(32).hex())
        
        # User settings
        self.settings = {
            "min_password_length": 8,
            "max_password_length": 128,
            "password_requires_special": True,
            "password_requires_number": True,
            "token_expiry": 24 * 60 * 60,  # 24 hours
            "max_login_attempts": 5,
            "lockout_duration": 15 * 60,  # 15 minutes
            "session_duration": 7 * 24 * 60 * 60  # 7 days
        }
        
        # Track login attempts
        self.login_attempts = {}

    def register_user(self, username: str, password: str, email: str) -> Optional[str]:
        """Register a new user."""
        try:
            # Validate input
            if not self._validate_username(username):
                raise UserError("Invalid username")
            if not self._validate_password(password):
                raise UserError("Invalid password")
            if not self._validate_email(email):
                raise UserError("Invalid email")
            
            # Check if user exists
            if self.db.get_user(username):
                raise UserError("Username already exists")
            
            # Hash password
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(password.encode(), salt)
            
            # Create user
            user_id = f"user_{int(time.time())}"
            user_data = {
                "id": user_id,
                "username": username,
                "email": email,
                "password_hash": hashed.decode(),
                "created_at": datetime.now().isoformat(),
                "role": "user",
                "status": "active"
            }
            
            # Store user
            self.db.insert_user(user_data)
            
            return user_id
        except Exception as e:
            self.logger.error(f"Error registering user {username}", e)
            return None

    def authenticate(self, username: str, password: str) -> Optional[str]:
        """Authenticate user and return JWT token."""
        try:
            # Check login attempts
            if not self._check_login_attempts(username):
                raise AuthenticationError("Too many login attempts")
            
            # Get user
            user = self.db.get_user(username)
            if not user:
                self._record_login_attempt(username, False)
                raise AuthenticationError("Invalid username or password")
            
            # Check password
            if not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
                self._record_login_attempt(username, False)
                raise AuthenticationError("Invalid username or password")
            
            # Clear login attempts on success
            self._record_login_attempt(username, True)
            
            # Generate token
            token = self._generate_token(user)
            
            return token
        except Exception as e:
            self.logger.error(f"Error authenticating user {username}", e)
            return None

    def validate_token(self, token: str) -> Optional[Dict]:
        """Validate JWT token and return user data."""
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=["HS256"])
            user = self.db.get_user(payload["username"])
            
            if not user or user["status"] != "active":
                raise AuthenticationError("Invalid token")
            
            return {
                "id": user["id"],
                "username": user["username"],
                "email": user["email"],
                "role": user["role"]
            }
        except jwt.ExpiredSignatureError:
            raise AuthenticationError("Token expired")
        except jwt.InvalidTokenError:
            raise AuthenticationError("Invalid token")
        except Exception as e:
            self.logger.error("Error validating token", e)
            return None

    def update_user(self, user_id: str, data: Dict) -> bool:
        """Update user information."""
        try:
            user = self.db.get_user_by_id(user_id)
            if not user:
                raise UserError("User not found")
            
            # Validate updates
            if "password" in data:
                if not self._validate_password(data["password"]):
                    raise UserError("Invalid password")
                salt = bcrypt.gensalt()
                data["password_hash"] = bcrypt.hashpw(
                    data["password"].encode(), salt
                ).decode()
                del data["password"]
            
            if "email" in data:
                if not self._validate_email(data["email"]):
                    raise UserError("Invalid email")
            
            # Update user
            user.update(data)
            self.db.update_user(user)
            
            return True
        except Exception as e:
            self.logger.error(f"Error updating user {user_id}", e)
            return False

    def _validate_username(self, username: str) -> bool:
        """Validate username format."""
        return (
            isinstance(username, str) and
            3 <= len(username) <= 32 and
            username.isalnum()
        )

    def _validate_password(self, password: str) -> bool:
        """Validate password strength."""
        if not isinstance(password, str):
            return False
            
        if not (self.settings["min_password_length"] <= 
                len(password) <= 
                self.settings["max_password_length"]):
            return False
            
        if self.settings["password_requires_special"]:
            if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
                return False
                
        if self.settings["password_requires_number"]:
            if not any(c.isdigit() for c in password):
                return False
                
        return True

    def _validate_email(self, email: str) -> bool:
        """Validate email format."""
        return (
            isinstance(email, str) and
            "@" in email and
            "." in email.split("@")[1]
        )

    def _check_login_attempts(self, username: str) -> bool:
        """Check if user can attempt login."""
        if username not in self.login_attempts:
            return True
            
        attempts = self.login_attempts[username]
        if len(attempts) < self.settings["max_login_attempts"]:
            return True
            
        # Check if oldest attempt is outside lockout window
        oldest = min(attempts)
        if time.time() - oldest > self.settings["lockout_duration"]:
            self.login_attempts[username] = set()
            return True
            
        return False

    def _record_login_attempt(self, username: str, success: bool) -> None:
        """Record login attempt."""
        if success:
            self.login_attempts[username] = set()
        else:
            if username not in self.login_attempts:
                self.login_attempts[username] = set()
            self.login_attempts[username].add(time.time())

    def _generate_token(self, user: Dict) -> str:
        """Generate JWT token."""
        payload = {
            "user_id": user["id"],
            "username": user["username"],
            "role": user["role"],
            "exp": int(time.time()) + self.settings["token_expiry"]
        }
        return jwt.encode(payload, self.jwt_secret, algorithm="HS256")

    def update_settings(self, settings: Dict) -> bool:
        """Update user service settings."""
        try:
            self.settings.update(settings)
            return True
        except Exception as e:
            self.logger.error("Error updating settings", e)
            return False 