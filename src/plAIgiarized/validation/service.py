from typing import Dict, List, Optional, Any, Union
import re
from datetime import datetime
from ..models.essay import Essay
from ..logging.service import LoggingService

class ValidationService:
    def __init__(self):
        self.logger = LoggingService()
        
        # Validation rules
        self.rules = {
            "essay": {
                "content": {
                    "min_length": 100,
                    "max_length": 50000,
                    "required": True
                },
                "student_id": {
                    "pattern": r"^[A-Za-z0-9_-]{3,32}$",
                    "required": True
                },
                "type": {
                    "allowed_values": ["assignment", "exam", "practice"],
                    "required": True
                }
            },
            "metrics": {
                "grade_level": {
                    "min": 1.0,
                    "max": 12.0,
                    "required": False
                },
                "vocabulary_size": {
                    "min": 0,
                    "max": 100000,
                    "required": False
                },
                "sentence_complexity": {
                    "min": 0.0,
                    "max": 10.0,
                    "required": False
                }
            }
        }
        
        # Common patterns
        self.patterns = {
            "email": r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
            "url": r"^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$",
            "date": r"^\d{4}-\d{2}-\d{2}$",
            "time": r"^\d{2}:\d{2}:\d{2}$"
        }

    def validate_essay(self, essay: Union[Essay, Dict]) -> List[str]:
        """Validate essay data."""
        try:
            errors = []
            
            # Convert Essay model to dict if needed
            data = essay if isinstance(essay, dict) else essay.dict()
            
            # Validate content
            content_rules = self.rules["essay"]["content"]
            if not data.get("content"):
                if content_rules["required"]:
                    errors.append("Essay content is required")
            else:
                content_length = len(data["content"])
                if content_length < content_rules["min_length"]:
                    errors.append(f"Essay content must be at least {content_rules['min_length']} characters")
                if content_length > content_rules["max_length"]:
                    errors.append(f"Essay content cannot exceed {content_rules['max_length']} characters")
            
            # Validate student_id
            student_rules = self.rules["essay"]["student_id"]
            if not data.get("student_id"):
                if student_rules["required"]:
                    errors.append("Student ID is required")
            else:
                if not re.match(student_rules["pattern"], data["student_id"]):
                    errors.append("Invalid student ID format")
            
            # Validate type
            type_rules = self.rules["essay"]["type"]
            if not data.get("type"):
                if type_rules["required"]:
                    errors.append("Essay type is required")
            else:
                if data["type"] not in type_rules["allowed_values"]:
                    errors.append(f"Essay type must be one of: {', '.join(type_rules['allowed_values'])}")
            
            # Validate metrics if present
            if "metrics" in data and data["metrics"]:
                metric_errors = self.validate_metrics(data["metrics"])
                errors.extend(metric_errors)
            
            # Log validation results
            if errors:
                self.logger.log(
                    "warning",
                    f"Essay validation failed with {len(errors)} errors",
                    "validation",
                    {"errors": errors}
                )
            
            return errors
        except Exception as e:
            self.logger.error("Error validating essay", e)
            return ["Internal validation error"]

    def validate_metrics(self, metrics: Dict) -> List[str]:
        """Validate essay metrics."""
        try:
            errors = []
            
            for metric, value in metrics.items():
                if metric in self.rules["metrics"]:
                    rules = self.rules["metrics"][metric]
                    
                    if value is None:
                        if rules["required"]:
                            errors.append(f"Metric '{metric}' is required")
                        continue
                    
                    if "min" in rules and value < rules["min"]:
                        errors.append(f"Metric '{metric}' must be at least {rules['min']}")
                    
                    if "max" in rules and value > rules["max"]:
                        errors.append(f"Metric '{metric}' cannot exceed {rules['max']}")
            
            return errors
        except Exception as e:
            self.logger.error("Error validating metrics", e)
            return ["Internal metrics validation error"]

    def sanitize_text(self, text: str) -> str:
        """Sanitize text input."""
        try:
            # Remove control characters
            text = "".join(char for char in text if ord(char) >= 32)
            
            # Normalize whitespace
            text = " ".join(text.split())
            
            # Remove potentially dangerous HTML
            text = re.sub(r"<[^>]*>", "", text)
            
            return text
        except Exception as e:
            self.logger.error("Error sanitizing text", e)
            return ""

    def validate_pattern(self, value: str, pattern_name: str) -> bool:
        """Validate string against named pattern."""
        try:
            if pattern_name not in self.patterns:
                raise ValueError(f"Unknown pattern: {pattern_name}")
            
            pattern = self.patterns[pattern_name]
            return bool(re.match(pattern, value))
        except Exception as e:
            self.logger.error("Error validating pattern", e)
            return False

    def validate_date(self, date_str: str) -> bool:
        """Validate date string format."""
        try:
            datetime.strptime(date_str, "%Y-%m-%d")
            return True
        except ValueError:
            return False

    def add_validation_rule(self, category: str, field: str, rules: Dict) -> bool:
        """Add new validation rule."""
        try:
            if category not in self.rules:
                self.rules[category] = {}
            
            self.rules[category][field] = rules
            return True
        except Exception as e:
            self.logger.error("Error adding validation rule", e)
            return False

    def add_pattern(self, name: str, pattern: str) -> bool:
        """Add new validation pattern."""
        try:
            # Verify pattern is valid
            re.compile(pattern)
            
            self.patterns[name] = pattern
            return True
        except Exception as e:
            self.logger.error("Error adding pattern", e)
            return False
