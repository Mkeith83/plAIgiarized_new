from typing import List, Optional
from datetime import datetime
import os
import json
import shutil
from models.essay import Essay

class StorageService:
    def __init__(self):
        self.base_path = "data"
        self._ensure_directories()

    def _ensure_directories(self):
        dirs = ["essays", "baselines", "analysis", "backups"]
        for dir in dirs:
            path = os.path.join(self.base_path, dir)
            os.makedirs(path, exist_ok=True)