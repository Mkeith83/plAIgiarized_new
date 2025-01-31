from typing import Dict, Optional, Any
import os
import json
import yaml
from pathlib import Path
from ..logging.service import LoggingService
from copy import deepcopy

class ConfigService:
    def __init__(self):
        self.logger = LoggingService()
        self.base_path = Path("data/config")
        self.base_path.mkdir(parents=True, exist_ok=True)
        self.config_file = self.base_path / "config.json"
        
        # Default configuration - store as immutable
        self._default_config = {
            "api": {
                "timeout": 30,
                "retries": 3,
                "base_url": "http://localhost:8000"
            },
            "storage": {
                "max_size": 1024 * 1024 * 100,  # 100MB
                "allowed_types": ["txt", "pdf", "doc", "docx"]
            },
            "analysis": {
                "min_words": 100,
                "max_words": 10000,
                "similarity_threshold": 0.8
            },
            "security": {
                "token_expiry": 24 * 60 * 60,
                "max_login_attempts": 5
            }
        }
        
        # Create a copy for working defaults
        self.defaults = deepcopy(self._default_config)
        
        # Load or create config
        self._load_config()

    def _load_config(self) -> None:
        """Load configuration from file or create with defaults."""
        try:
            if self.config_file.exists():
                with open(self.config_file, 'r') as f:
                    self.config = json.load(f)
            else:
                self.config = self.defaults.copy()
                self._save_config()
        except Exception as e:
            self.logger.error("Error loading config", e)
            self.config = self.defaults.copy()

    def _save_config(self) -> bool:
        """Save configuration to file."""
        try:
            with open(self.config_file, 'w') as f:
                json.dump(self.config, f, indent=2)
            return True
        except Exception as e:
            self.logger.error("Error saving config", e)
            return False

    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value."""
        try:
            parts = key.split(".")
            value = self.config
            for part in parts:
                value = value[part]
            return value
        except Exception:
            try:
                value = self.defaults
                for part in parts:
                    value = value[part]
                return value
            except Exception:
                return default

    def set(self, key: str, value: Any) -> bool:
        """Set configuration value."""
        try:
            parts = key.split(".")
            config = self.config
            for part in parts[:-1]:
                if part not in config:
                    config[part] = {}
                config = config[part]
            config[parts[-1]] = value
            return self._save_config()
        except Exception as e:
            self.logger.error(f"Error setting config {key}", e)
            return False

    def reset(self, key: str) -> bool:
        """Reset configuration value to default."""
        try:
            # Get the default value from immutable defaults
            parts = key.split(".")
            default_value = self._default_config
            for part in parts:
                default_value = default_value[part]
            
            # Set the value back to default
            return self.set(key, default_value)
        except Exception as e:
            self.logger.error(f"Error resetting config {key}", e)
            return False

    def reset_all(self) -> bool:
        """Reset all configuration values to defaults."""
        try:
            self.config = self.defaults.copy()
            if not self._save_config():
                return False
            self._load_config()
            return True
        except Exception as e:
            self.logger.error("Error resetting all config", e)
            return False

    def load_file(self, file_path: str) -> bool:
        """Load configuration from file."""
        try:
            path = Path(file_path)
            if not path.exists():
                return False
            
            with path.open("r") as f:
                if path.suffix == ".json":
                    config = json.load(f)
                elif path.suffix in (".yml", ".yaml"):
                    config = yaml.safe_load(f)
                else:
                    return False
            
            self.config.update(config)
            self._save_config()
            return True
        except Exception as e:
            self.logger.error(f"Error loading config file {file_path}", e)
            return False