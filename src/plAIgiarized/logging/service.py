from typing import Dict, List, Optional, Any
import os
import json
import logging
import traceback
from datetime import datetime
import threading
from logging.handlers import RotatingFileHandler
from pathlib import Path
import atexit
import time

class LoggingService:
    _instance = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(LoggingService, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
            
        # Initialize logging directory
        self.log_dir = Path("data/logs")
        self.log_dir.mkdir(parents=True, exist_ok=True)
        
        # Configure logging
        self.logger = logging.getLogger("plAIgiarized")
        self.logger.setLevel(logging.DEBUG)
        
        # Remove any existing handlers
        if self.logger.handlers:
            for handler in self.logger.handlers[:]:
                handler.close()
                self.logger.removeHandler(handler)
        
        # File handler with rotation
        log_file = self.log_dir / "app.log"
        self.file_handler = RotatingFileHandler(
            log_file,
            maxBytes=1024 * 1024,  # 1MB
            backupCount=3,
            delay=True
        )
        self.file_handler.setLevel(logging.DEBUG)
        
        # Console handler
        self.console_handler = logging.StreamHandler()
        self.console_handler.setLevel(logging.INFO)
        
        # Formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.file_handler.setFormatter(formatter)
        self.console_handler.setFormatter(formatter)
        
        # Add handlers
        self.logger.addHandler(self.file_handler)
        self.logger.addHandler(self.console_handler)
        
        # Register cleanup
        atexit.register(self.cleanup)
        
        self._initialized = True

    def cleanup(self):
        """Cleanup logging handlers."""
        if hasattr(self, 'logger'):
            if hasattr(self, 'file_handler'):
                self.file_handler.close()
                self.logger.removeHandler(self.file_handler)
            if hasattr(self, 'console_handler'):
                self.console_handler.close()
                self.logger.removeHandler(self.console_handler)
            # Wait a moment for file handles to be released
            time.sleep(0.1)

    def debug(self, message: str, error: Optional[Exception] = None) -> bool:
        """Log debug message."""
        try:
            if error:
                self.logger.debug(f"{message}: {str(error)}")
            else:
                self.logger.debug(message)
            return True
        except Exception:
            return False

    def info(self, message: str, error: Optional[Exception] = None) -> bool:
        """Log info message."""
        try:
            if error:
                self.logger.info(f"{message}: {str(error)}")
            else:
                self.logger.info(message)
            return True
        except Exception:
            return False

    def warning(self, message: str, error: Optional[Exception] = None) -> bool:
        """Log warning message."""
        try:
            if error:
                self.logger.warning(f"{message}: {str(error)}")
            else:
                self.logger.warning(message)
            return True
        except Exception:
            return False

    def error(self, message: str, error: Optional[Exception] = None) -> bool:
        """Log error message."""
        try:
            if error:
                self.logger.error(f"{message}: {str(error)}")
            else:
                self.logger.error(message)
            return True
        except Exception:
            return False

    def critical(self, message: str, error: Optional[Exception] = None) -> bool:
        """Log critical message."""
        try:
            if error:
                self.logger.critical(f"{message}: {str(error)}")
            else:
                self.logger.critical(message)
            return True
        except Exception:
            return False

    def log(self, level: str, message: str, category: str = "system", 
            extra: Optional[Dict] = None) -> bool:
        """Log a message with specified level and category."""
        try:
            logger = self.get_logger(category)
            if not logger:
                return False
            
            log_level = getattr(logging, level.upper(), logging.INFO)
            
            # Format message with extra data
            if extra:
                message = f"{message} | Extra: {json.dumps(extra)}"
            
            logger.log(log_level, message)
            return True
        except Exception as e:
            print(f"Error logging message: {e}")
            return False

    def security(self, event_type: str, details: Dict, 
                severity: str = "info") -> bool:
        """Log security-related events."""
        try:
            logger = self.get_logger("security")
            if not logger:
                return False
            
            message = (f"Security Event: {event_type}\n"
                      f"Severity: {severity}\n"
                      f"Details: {json.dumps(details)}")
            
            log_level = getattr(logging, severity.upper(), logging.INFO)
            logger.log(log_level, message)
            return True
        except Exception as e:
            print(f"Error logging security event: {e}")
            return False

    def performance(self, operation: str, duration: float, 
                   details: Optional[Dict] = None) -> bool:
        """Log performance metrics."""
        try:
            logger = self.get_logger("performance")
            if not logger:
                return False
            
            message = f"Operation: {operation} | Duration: {duration:.3f}s"
            if details:
                message = f"{message} | Details: {json.dumps(details)}"
            
            logger.info(message)
            return True
        except Exception as e:
            print(f"Error logging performance: {e}")
            return False

    def get_logger(self, category: str) -> Optional[logging.Logger]:
        """Get logger for specified category."""
        try:
            return self.logger
        except Exception as e:
            print(f"Error getting logger: {e}")
            return None

    def get_logs(self, category: str, level: Optional[str] = None, 
                limit: int = 100) -> List[str]:
        """Get recent logs for specified category."""
        try:
            log_file = self.log_dir / f"{category}.log"
            if not log_file.exists():
                return []
            
            logs = []
            with open(log_file, "r") as f:
                for line in f:
                    if level:
                        if level.upper() in line:
                            logs.append(line.strip())
                    else:
                        logs.append(line.strip())
            
            return logs[-limit:]
        except Exception as e:
            print(f"Error getting logs: {e}")
            return []

    def clear_logs(self, level: Optional[str] = None) -> bool:
        """Clear log files."""
        try:
            # Close current handlers
            self.cleanup()
            
            # Remove log files
            if self.log_dir.exists():
                for log_file in self.log_dir.glob("*.log*"):
                    try:
                        log_file.unlink()
                    except:
                        pass
            
            # Reinitialize logging
            self._initialized = False
            self.__init__()
            return True
        except Exception:
            return False

    def __del__(self):
        """Cleanup on deletion."""
        self.cleanup()
