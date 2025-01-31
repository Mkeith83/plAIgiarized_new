from typing import Dict, List, Optional
import os
import shutil
import json
from datetime import datetime
import zipfile
from threading import Lock

class BackupService:
    def __init__(self):
        self.base_path = "data/backups"
        os.makedirs(self.base_path, exist_ok=True)
        
        # Backup settings
        self.settings = {
            "max_backups": 10,
            "compress": True,
            "include_metrics": True,
            "backup_frequency": "daily"
        }
        
        # Track backup operations
        self.backup_lock = Lock()
        self.backup_history: List[Dict] = self._load_backup_history()

    def create_backup(self, backup_type: str = "full") -> Optional[str]:
        """Create a new backup of specified type."""
        try:
            with self.backup_lock:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                backup_id = f"{backup_type}_{timestamp}"
                backup_dir = os.path.join(self.base_path, backup_id)
                
                # Create backup directory
                os.makedirs(backup_dir, exist_ok=True)
                
                # Determine source paths based on backup type
                if backup_type == "full":
                    self._backup_full(backup_dir)
                elif backup_type == "config":
                    self._backup_config(backup_dir)
                elif backup_type == "essays":
                    self._backup_essays(backup_dir)
                else:
                    raise ValueError(f"Invalid backup type: {backup_type}")
                
                # Record backup
                backup_info = {
                    "id": backup_id,
                    "type": backup_type,
                    "timestamp": timestamp,
                    "size": self._get_dir_size(backup_dir)
                }
                self.backup_history.append(backup_info)
                self._save_backup_history()
                
                return backup_id
        except Exception as e:
            print(f"Error creating backup: {e}")
            if os.path.exists(backup_dir):
                shutil.rmtree(backup_dir)
            return None

    def _backup_full(self, backup_dir: str) -> None:
        """Perform full backup."""
        data_dir = "data"
        if os.path.exists(data_dir):
            for item in os.listdir(data_dir):
                if item != "backups":  # Skip backup directory
                    src = os.path.join(data_dir, item)
                    dst = os.path.join(backup_dir, item)
                    if os.path.isdir(src):
                        shutil.copytree(src, dst)
                    else:
                        shutil.copy2(src, dst)

    def _backup_config(self, backup_dir: str) -> None:
        """Backup configuration files."""
        config_dir = "data/config"
        if os.path.exists(config_dir):
            dst = os.path.join(backup_dir, "config")
            shutil.copytree(config_dir, dst)

    def _backup_essays(self, backup_dir: str) -> None:
        """Backup essay files."""
        essays_dir = "data/essays"
        if os.path.exists(essays_dir):
            dst = os.path.join(backup_dir, "essays")
            shutil.copytree(essays_dir, dst)

    def list_backups(self) -> List[Dict]:
        """List all available backups."""
        return sorted(self.backup_history, 
                     key=lambda x: x["timestamp"], 
                     reverse=True)

    def restore_backup(self, backup_id: str) -> bool:
        """Restore from specified backup."""
        try:
            backup_dir = os.path.join(self.base_path, backup_id)
            if not os.path.exists(backup_dir):
                return False
            
            # Determine backup type from ID
            backup_type = backup_id.split("_")[0]
            
            # Restore based on type
            if backup_type == "full":
                self._restore_full(backup_dir)
            elif backup_type == "config":
                self._restore_config(backup_dir)
            elif backup_type == "essays":
                self._restore_essays(backup_dir)
            else:
                return False
            
            return True
        except Exception as e:
            print(f"Error restoring backup: {e}")
            return False

    def _restore_full(self, backup_dir: str) -> None:
        """Restore full backup."""
        data_dir = "data"
        for item in os.listdir(backup_dir):
            src = os.path.join(backup_dir, item)
            dst = os.path.join(data_dir, item)
            if os.path.exists(dst):
                if os.path.isdir(dst):
                    shutil.rmtree(dst)
                else:
                    os.remove(dst)
            if os.path.isdir(src):
                shutil.copytree(src, dst)
            else:
                shutil.copy2(src, dst)

    def _restore_config(self, backup_dir: str) -> None:
        """Restore configuration backup."""
        src = os.path.join(backup_dir, "config")
        dst = "data/config"
        if os.path.exists(dst):
            shutil.rmtree(dst)
        shutil.copytree(src, dst)

    def _restore_essays(self, backup_dir: str) -> None:
        """Restore essays backup."""
        src = os.path.join(backup_dir, "essays")
        dst = "data/essays"
        if os.path.exists(dst):
            shutil.rmtree(dst)
        shutil.copytree(src, dst)

    def _get_dir_size(self, path: str) -> int:
        """Calculate directory size in bytes."""
        total = 0
        for dirpath, dirnames, filenames in os.walk(path):
            for f in filenames:
                fp = os.path.join(dirpath, f)
                total += os.path.getsize(fp)
        return total

    def _load_backup_history(self) -> List[Dict]:
        """Load backup history from file."""
        history_file = os.path.join(self.base_path, "backup_history.json")
        if os.path.exists(history_file):
            with open(history_file, "r") as f:
                return json.load(f)
        return []

    def _save_backup_history(self) -> None:
        """Save backup history to file."""
        history_file = os.path.join(self.base_path, "backup_history.json")
        with open(history_file, "w") as f:
            json.dump(self.backup_history, f, indent=2)

    def delete_backup(self, backup_id: str) -> bool:
        """Delete specified backup."""
        try:
            backup_dir = os.path.join(self.base_path, backup_id)
            if not os.path.exists(backup_dir):
                return False
            
            shutil.rmtree(backup_dir)
            
            # Update history
            self.backup_history = [b for b in self.backup_history 
                                 if b["id"] != backup_id]
            self._save_backup_history()
            
            return True
        except Exception as e:
            print(f"Error deleting backup: {e}")
            return False
