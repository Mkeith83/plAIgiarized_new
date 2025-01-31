from typing import Dict, List, Optional, Any
import os
import json
import requests
from pathlib import Path
from datetime import datetime
from ..logging.service import LoggingService
from ..config.service import ConfigService

class APIError(Exception):
    """Base class for API-related errors."""
    pass

class AuthenticationError(APIError):
    """Raised when API authentication fails."""
    pass

class RateLimitError(APIError):
    """Raised when API rate limit is exceeded."""
    pass

class APIService:
    def __init__(self):
        self.logger = LoggingService()
        self.config = ConfigService()
        
        # Load API configurations
        self.settings = {
            "timeout": 30,
            "max_retries": 3,
            "retry_delay": 1,
            "rate_limit": {
                "requests_per_minute": 60,
                "requests_per_day": 1000
            },
            "endpoints": {
                "openai": "https://api.openai.com/v1",
                "turnitin": "https://api.turnitin.com/v1",
                "google_docs": "https://docs.googleapis.com/v1",
                "microsoft_word": "https://graph.microsoft.com/v1.0"
            }
        }
        
        # Initialize API clients
        self._init_clients()
        
        # Track API usage
        self.usage = {
            "daily": {},
            "minute": {},
            "last_reset": datetime.now().isoformat()
        }

    def _init_clients(self) -> None:
        """Initialize API clients with authentication."""
        try:
            # Load API keys from config
            self.api_keys = {
                "openai": self.config.get("api.openai.key"),
                "turnitin": self.config.get("api.turnitin.key"),
                "google": self.config.get("api.google.key"),
                "microsoft": self.config.get("api.microsoft.key")
            }
            
            # Initialize session with default headers
            self.session = requests.Session()
            self.session.headers.update({
                "User-Agent": "plAIgiarized/1.0",
                "Accept": "application/json"
            })
        except Exception as e:
            self.logger.error("Error initializing API clients", e)
            raise APIError(f"Failed to initialize API clients: {str(e)}")

    def check_ai_content(self, text: str) -> Dict:
        """Check text for AI-generated content using OpenAI API."""
        try:
            self._check_rate_limit("openai")
            
            response = self._make_request(
                "post",
                f"{self.settings['endpoints']['openai']}/completions",
                headers={"Authorization": f"Bearer {self.api_keys['openai']}"},
                json={
                    "model": "text-davinci-003",
                    "prompt": f"Analyze if this text is AI-generated:\n\n{text}\n\nResult:",
                    "max_tokens": 100,
                    "temperature": 0.3
                }
            )
            
            return {
                "is_ai_generated": self._parse_ai_response(response),
                "confidence": response.get("confidence", 0.0),
                "details": response.get("details", {})
            }
        except Exception as e:
            self.logger.error("Error checking AI content", e)
            return {"error": str(e)}

    def check_plagiarism(self, text: str) -> Dict:
        """Check text for plagiarism using Turnitin API."""
        try:
            self._check_rate_limit("turnitin")
            
            response = self._make_request(
                "post",
                f"{self.settings['endpoints']['turnitin']}/submissions",
                headers={"Authorization": f"Bearer {self.api_keys['turnitin']}"},
                json={
                    "content": text,
                    "settings": {
                        "similarity_threshold": 0.8,
                        "exclude_quotes": True,
                        "exclude_bibliography": True
                    }
                }
            )
            
            return {
                "similarity_score": response.get("similarity_score", 0.0),
                "matches": response.get("matches", []),
                "report_url": response.get("report_url")
            }
        except Exception as e:
            self.logger.error("Error checking plagiarism", e)
            return {"error": str(e)}

    def export_to_google_docs(self, content: str, title: str) -> Dict:
        """Export content to Google Docs."""
        try:
            self._check_rate_limit("google")
            
            response = self._make_request(
                "post",
                f"{self.settings['endpoints']['google_docs']}/documents",
                headers={"Authorization": f"Bearer {self.api_keys['google']}"},
                json={
                    "title": title,
                    "content": content
                }
            )
            
            return {
                "document_id": response.get("documentId"),
                "url": response.get("url"),
                "success": True
            }
        except Exception as e:
            self.logger.error("Error exporting to Google Docs", e)
            return {"error": str(e)}

    def export_to_word_online(self, content: str, title: str) -> Dict:
        """Export content to Microsoft Word Online."""
        try:
            self._check_rate_limit("microsoft")
            
            response = self._make_request(
                "post",
                f"{self.settings['endpoints']['microsoft_word']}/documents",
                headers={"Authorization": f"Bearer {self.api_keys['microsoft']}"},
                json={
                    "name": title,
                    "content": content,
                    "contentType": "text"
                }
            )
            
            return {
                "document_id": response.get("id"),
                "web_url": response.get("webUrl"),
                "success": True
            }
        except Exception as e:
            self.logger.error("Error exporting to Word Online", e)
            return {"error": str(e)}

    def _make_request(self, method: str, url: str, **kwargs) -> Dict:
        """Make HTTP request with retry logic."""
        retries = 0
        while retries < self.settings["max_retries"]:
            try:
                response = self.session.request(
                    method,
                    url,
                    timeout=self.settings["timeout"],
                    **kwargs
                )
                response.raise_for_status()
                return response.json()
            except requests.exceptions.RequestException as e:
                retries += 1
                if retries == self.settings["max_retries"]:
                    raise APIError(f"Request failed after {retries} retries: {str(e)}")
                self.logger.warning(f"Request failed, retrying ({retries}/{self.settings['max_retries']})")
                time.sleep(self.settings["retry_delay"])

    def _check_rate_limit(self, api: str) -> None:
        """Check and update API rate limits."""
        now = datetime.now()
        today = now.date().isoformat()
        minute = now.replace(second=0, microsecond=0).isoformat()
        
        # Reset daily counter if needed
        if today not in self.usage["daily"]:
            self.usage["daily"] = {today: {}}
        
        # Reset minute counter if needed
        if minute not in self.usage["minute"]:
            self.usage["minute"] = {minute: {}}
        
        # Initialize counters if needed
        if api not in self.usage["daily"][today]:
            self.usage["daily"][today][api] = 0
        if api not in self.usage["minute"][minute]:
            self.usage["minute"][minute][api] = 0
        
        # Check limits
        if self.usage["daily"][today][api] >= self.settings["rate_limit"]["requests_per_day"]:
            raise RateLimitError(f"Daily rate limit exceeded for {api}")
        if self.usage["minute"][minute][api] >= self.settings["rate_limit"]["requests_per_minute"]:
            raise RateLimitError(f"Minute rate limit exceeded for {api}")
        
        # Update counters
        self.usage["daily"][today][api] += 1
        self.usage["minute"][minute][api] += 1

    def _parse_ai_response(self, response: Dict) -> bool:
        """Parse AI detection response."""
        try:
            text = response.get("choices", [{}])[0].get("text", "").strip().lower()
            return "ai-generated" in text or "artificial" in text
        except Exception:
            return False

    def update_settings(self, settings: Dict) -> bool:
        """Update API settings."""
        try:
            self.settings.update(settings)
            return True
        except Exception as e:
            self.logger.error("Error updating settings", e)
            return False