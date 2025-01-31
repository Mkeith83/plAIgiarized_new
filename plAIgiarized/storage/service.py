from typing import List, Optional, Tuple, Dict
from datetime import datetime, timedelta
import os
import json
import shutil
import re
from ..models.essay import Essay

class StorageError(Exception):
    """Base class for storage service errors"""
    pass

class ValidationError(StorageError):
    """Raised when essay content validation fails"""
    pass

class StorageService:
    def __init__(self):
        self.base_path = "data"
        self.min_content_length = 50
        self.max_content_length = 10000
        self._ensure_directories()

    def _ensure_directories(self):
        try:
            dirs = ["essays", "baselines", "analysis", "backups"]
            for dir in dirs:
                path = os.path.join(self.base_path, dir)
                os.makedirs(path, exist_ok=True)
        except Exception as e:
            raise StorageError(f"Failed to create directories: {e}")

    def validate_essay_content(self, essay: Essay) -> bool:
        if len(essay.content) < self.min_content_length:
            raise ValidationError(f"Essay content too short. Minimum {self.min_content_length} characters required.")
        if len(essay.content) > self.max_content_length:
            raise ValidationError(f"Essay content too long. Maximum {self.max_content_length} characters allowed.")
        return True

    def save_essay(self, essay: Essay) -> bool:
        if not isinstance(essay, Essay):
            raise ValueError("Input must be an Essay object")
        try:
            self.validate_essay_content(essay)
            path = os.path.join(self.base_path, "essays", f"{essay.id}.json")
            with open(path, "w") as f:
                json.dump(essay.model_dump(), f, indent=2, default=str)
            return True
        except Exception as e:
            raise StorageError(f"Failed to save essay: {e}")

    def get_essay(self, essay_id: str) -> Optional[Essay]:
        try:
            path = os.path.join(self.base_path, "essays", f"{essay_id}.json")
            with open(path, "r") as f:
                data = json.load(f)
                return Essay(**data)
        except Exception as e:
            print(f"Error retrieving essay: {e}")
            return None

    def list_student_essays(self, student_id: str) -> List[Essay]:
        essays = []
        try:
            essay_dir = os.path.join(self.base_path, "essays")
            for filename in os.listdir(essay_dir):
                if filename.endswith(".json"):
                    with open(os.path.join(essay_dir, filename), "r") as f:
                        data = json.load(f)
                        essay = Essay(**data)
                        if essay.student_id == student_id:
                            essays.append(essay)
            return essays
        except Exception as e:
            print(f"Error listing essays: {e}")
            return []

    def create_backup(self) -> bool:
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_dir = os.path.join(self.base_path, "backups", f"backup_{timestamp}")
            os.makedirs(backup_dir)
            essays_backup = os.path.join(backup_dir, "essays")
            shutil.copytree(os.path.join(self.base_path, "essays"), essays_backup)
            return True
        except Exception as e:
            print(f"Error creating backup: {e}")
            return False

    def list_backups(self) -> List[str]:
        try:
            backup_dir = os.path.join(self.base_path, "backups")
            return sorted([d for d in os.listdir(backup_dir) if d.startswith("backup_")])
        except Exception as e:
            print(f"Error listing backups: {e}")
            return []

    def restore_backup(self, backup_name: str) -> bool:
        try:
            backup_path = os.path.join(self.base_path, "backups", backup_name)
            if not os.path.exists(backup_path):
                print(f"Backup {backup_name} does not exist")
                return False
            
            # Create a backup of current state before restore
            self.create_backup()
            
            # Restore from backup
            essays_path = os.path.join(self.base_path, "essays")
            backup_essays = os.path.join(backup_path, "essays")
            
            # Remove current essays
            shutil.rmtree(essays_path)
            
            # Restore from backup
            shutil.copytree(backup_essays, essays_path)
            
            return True
        except Exception as e:
            print(f"Error restoring backup: {e}")
            return False

    def analyze_essay_metrics(self, essay: Essay) -> Dict[str, float]:
        """Calculate various metrics for the essay content."""
        try:
            content = essay.content
            words = re.findall(r'\w+', content)
            sentences = re.split(r'[.!?]+', content)
            
            metrics = {
                "word_count": len(words),
                "avg_word_length": sum(len(word) for word in words) / len(words) if words else 0,
                "sentence_count": len([s for s in sentences if s.strip()]),
                "avg_words_per_sentence": len(words) / len([s for s in sentences if s.strip()]) if sentences else 0
            }
            
            # Update essay with metrics
            essay.metrics = metrics
            self.save_essay(essay)
            
            return metrics
        except Exception as e:
            print(f"Error analyzing essay metrics: {e}")
            return {}
