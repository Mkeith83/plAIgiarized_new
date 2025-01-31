from typing import Dict, List, Optional, Any
import os
from pathlib import Path
import jwt
import bcrypt
import secrets
from datetime import datetime, timedelta
from ..logging.service import LoggingService
from ..database.service import DatabaseService

class SecurityService:
    def __init__(self):
        self.logger = LoggingService()
        self.db = DatabaseService()
        
        # Initialize security settings
        self.settings = {
            "min_password_length": 8,
            "max_password_length": 128,
            "password_requires_special": True,
            "password_requires_number": True,
            "token_expiry": 24 * 60 * 60,  # 24 hours
            "max_login_attempts": 5,
            "lockout_duration": 15 * 60,  # 15 minutes
        }
        
        # Load JWT secret from environment or generate one
        self.jwt_secret = os.getenv("JWT_SECRET", os.urandom(32).hex())
        
        # Initialize security data
        self._init_security_tables()

    def _init_security_tables(self) -> None:
        """Initialize security-related data."""
        try:
            # No need for SQL tables in file-based storage
            # The DatabaseService already initializes the necessary collections
            pass
        except Exception as e:
            self.logger.error("Error initializing security tables", e)

    def create_user(self, username: str, password: str, email: str, role: str = "user") -> bool:
        """Create a new user."""
        try:
            # Validate password
            if len(password) < self.settings["min_password_length"]:
                self.logger.error(f"Password too short for user {username}")
                return False
                
            if len(password) > self.settings["max_password_length"]:
                self.logger.error(f"Password too long for user {username}")
                return False
            
            # Hash password
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(password.encode(), salt)
            
            # Create user data
            user_data = {
                "id": f"user_{int(datetime.now().timestamp())}",
                "username": username,
                "password": hashed.decode(),
                "email": email,
                "role": role,
                "created_at": datetime.now().isoformat(),
                "last_login": None
            }
            
            # Store user
            return self.db.insert_user(user_data)
            
        except Exception as e:
            self.logger.error(f"Error creating user {username}", e)
            return False

    def authenticate(self, username: str, password: str) -> Optional[str]:
        """Authenticate user and return JWT token."""
        try:
            # Get user
            user = self.db.get_user(username)
            if not user:
                return None
            
            # Check password
            if not bcrypt.checkpw(password.encode(), user["password"].encode()):
                return None
            
            # Generate token
            return self.generate_token(user)
            
        except Exception as e:
            self.logger.error(f"Error authenticating user {username}", e)
            return None

    def validate_token(self, token: str) -> Optional[Dict]:
        """Validate JWT token and return user info."""
        try:
            if not token:
                return None
                
            # Decode token
            payload = jwt.decode(token, self.jwt_secret, algorithms=["HS256"])
            
            # Get user
            user = self.db.get_user_by_id(payload["user_id"])
            if not user:
                return None
                
            return {
                "user_id": user["id"],
                "username": user["username"],
                "email": user["email"],
                "role": user["role"]
            }
            
        except jwt.ExpiredSignatureError:
            self.logger.error("Token expired")
            return None
        except jwt.InvalidTokenError:
            self.logger.error("Invalid token")
            return None
        except Exception as e:
            self.logger.error("Error validating token", e)
            return None

    def revoke_token(self, token: str) -> bool:
        """Revoke access token."""
        try:
            with self.db._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE access_tokens SET revoked = TRUE
                    WHERE token = ?
                """, (token,))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            self.logger.error(f"Error revoking token", e)
            return False

    def check_permission(self, user_id: str, permission: str) -> bool:
        """Check if user has specific permission."""
        try:
            with self.db._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT EXISTS(
                        SELECT 1 FROM users u
                        JOIN role_permissions rp ON u.role = rp.role
                        JOIN permissions p ON rp.permission_id = p.id
                        WHERE u.id = ? AND p.name = ?
                    )
                """, (user_id, permission))
                
                return cursor.fetchone()[0] == 1
        except Exception as e:
            self.logger.error(f"Error checking permission for user {user_id}", e)
            return False

    def generate_token(self, user: Dict) -> str:
        """Generate JWT token for user."""
        payload = {
            "user_id": user["id"],
            "username": user["username"],
            "role": user["role"],
            "exp": int(datetime.now().timestamp()) + self.settings["token_expiry"]
        }
        return jwt.encode(payload, self.jwt_secret, algorithm="HS256")

    def update_settings(self, settings: Dict) -> bool:
        """Update security settings."""
        try:
            self.settings.update(settings)
            return True
        except Exception as e:
            self.logger.error("Error updating settings", e)
            return False