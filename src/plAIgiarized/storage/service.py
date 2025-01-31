from typing import Dict, List, Optional, Any, BinaryIO
import os
import json
import shutil
import hashlib
import magic
import mimetypes
from datetime import datetime
from pathlib import Path
from ..logging.service import LoggingService
from ..database.service import DatabaseService

class StorageError(Exception):
    """Base class for storage-related errors."""
    pass

class ValidationError(StorageError):
    """Raised when file validation fails."""
    pass

class StorageService:
    def __init__(self):
        self.base_path = Path("data/storage")
        self.base_path.mkdir(parents=True, exist_ok=True)
        
        self.logger = LoggingService()
        self.db = DatabaseService()
        
        # Storage settings
        self.settings = {
            "max_file_size": 1024 * 1024 * 50,  # 50MB
            "allowed_extensions": [
                ".txt", ".doc", ".docx", ".pdf", 
                ".rtf", ".odt", ".md", ".html"
            ],
            "allowed_mime_types": [
                "text/plain", "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/pdf", "text/rtf", "application/vnd.oasis.opendocument.text",
                "text/markdown", "text/html"
            ],
            "storage_structure": "year/month/day",
            "duplicate_handling": "version",  # or "replace", "reject"
            "compression_enabled": True,
            "backup_enabled": True
        }
        
        # Initialize storage structure
        self._init_storage()

    def _init_storage(self) -> None:
        """Initialize storage directory structure."""
        try:
            # Create main directories
            (self.base_path / "documents").mkdir(exist_ok=True)
            (self.base_path / "temp").mkdir(exist_ok=True)
            (self.base_path / "backup").mkdir(exist_ok=True)
            
            # Create metadata file if not exists
            metadata_file = self.base_path / "metadata.json"
            if not metadata_file.exists():
                metadata_file.write_text("{}")
        except Exception as e:
            self.logger.error("Error initializing storage", e)
            raise StorageError(f"Failed to initialize storage: {str(e)}")

    def store_file(self, file_path: str, metadata: Dict = None) -> Optional[str]:
        """Store a file in the system."""
        try:
            source_path = Path(file_path)
            if not source_path.exists():
                raise FileNotFoundError(f"File not found: {file_path}")
            
            # Validate file
            if not self._validate_file(source_path):
                raise ValidationError("Invalid file")
            
            # Generate file ID and path
            file_id = self._generate_file_id(source_path)
            dest_path = self._get_storage_path(source_path.name, file_id)
            
            # Store file
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source_path, dest_path)
            
            # Store metadata
            if metadata:
                self._store_metadata(file_id, {
                    "original_name": source_path.name,
                    "size": source_path.stat().st_size,
                    "mime_type": self._get_mime_type(source_path),
                    "created_at": datetime.now().isoformat(),
                    "custom": metadata
                })
            
            return file_id
        except Exception as e:
            self.logger.error(f"Error storing file {file_path}", e)
            return None

    def retrieve_file(self, file_id: str) -> Optional[Path]:
        """Retrieve a file by ID."""
        try:
            file_path = self._get_file_path(file_id)
            if not file_path or not file_path.exists():
                return None
            return file_path
        except Exception as e:
            self.logger.error(f"Error retrieving file {file_id}", e)
            return None

    def delete_file(self, file_id: str) -> bool:
        """Delete a file by ID."""
        try:
            file_path = self._get_file_path(file_id)
            if not file_path or not file_path.exists():
                return False
            
            # Backup if enabled
            if self.settings["backup_enabled"]:
                self._backup_file(file_path, file_id)
            
            # Delete file and metadata
            file_path.unlink()
            self._delete_metadata(file_id)
            
            return True
        except Exception as e:
            self.logger.error(f"Error deleting file {file_id}", e)
            return False

    def get_file_info(self, file_id: str) -> Optional[Dict]:
        """Get file information."""
        try:
            metadata = self._get_metadata(file_id)
            if not metadata:
                return None
            
            file_path = self._get_file_path(file_id)
            if not file_path or not file_path.exists():
                return None
            
            return {
                "id": file_id,
                "path": str(file_path),
                "exists": True,
                "metadata": metadata
            }
        except Exception as e:
            self.logger.error(f"Error getting file info {file_id}", e)
            return None

    def _validate_file(self, file_path: Path) -> bool:
        """Validate file size, type, and content."""
        try:
            # Check file size
            if file_path.stat().st_size > self.settings["max_file_size"]:
                raise ValidationError(f"File size exceeds maximum allowed size of {self.settings['max_file_size']} bytes")
            
            # Check extension
            if file_path.suffix.lower() not in self.settings["allowed_extensions"]:
                raise ValidationError(f"File extension {file_path.suffix} not allowed")
            
            # Check mime type
            mime_type = self._get_mime_type(file_path)
            if mime_type not in self.settings["allowed_mime_types"]:
                raise ValidationError(f"File type {mime_type} not allowed")
            
            return True
        except ValidationError:
            raise
        except Exception as e:
            raise StorageError(f"Error validating file: {str(e)}")

    def _get_mime_type(self, file_path: Path) -> str:
        """Get file MIME type."""
        try:
            return magic.from_file(str(file_path), mime=True)
        except Exception:
            return mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"

    def _generate_file_id(self, file_path: Path) -> str:
        """Generate unique file ID."""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        file_hash = hashlib.md5(file_path.read_bytes()).hexdigest()[:8]
        return f"{timestamp}_{file_hash}"

    def _get_storage_path(self, filename: str, file_id: str) -> Path:
        """Get storage path for file."""
        date_path = datetime.now().strftime(self.settings["storage_structure"].replace("/", os.sep))
        return self.base_path / "documents" / date_path / f"{file_id}_{filename}"

    def _get_file_path(self, file_id: str) -> Optional[Path]:
        """Get file path from ID."""
        try:
            # Search in documents directory
            for path in (self.base_path / "documents").rglob(f"{file_id}_*"):
                return path
            return None
        except Exception:
            return None

    def _store_metadata(self, file_id: str, metadata: Dict) -> None:
        """Store file metadata."""
        try:
            metadata_file = self.base_path / "metadata.json"
            current_metadata = json.loads(metadata_file.read_text())
            current_metadata[file_id] = metadata
            metadata_file.write_text(json.dumps(current_metadata, indent=2))
        except Exception as e:
            self.logger.error(f"Error storing metadata for {file_id}", e)
            raise StorageError(f"Failed to store metadata: {str(e)}")

    def _get_metadata(self, file_id: str) -> Optional[Dict]:
        """Get file metadata."""
        try:
            metadata_file = self.base_path / "metadata.json"
            metadata = json.loads(metadata_file.read_text())
            return metadata.get(file_id)
        except Exception:
            return None

    def _delete_metadata(self, file_id: str) -> None:
        """Delete file metadata."""
        try:
            metadata_file = self.base_path / "metadata.json"
            metadata = json.loads(metadata_file.read_text())
            if file_id in metadata:
                del metadata[file_id]
                metadata_file.write_text(json.dumps(metadata, indent=2))
        except Exception as e:
            self.logger.error(f"Error deleting metadata for {file_id}", e)

    def _backup_file(self, file_path: Path, file_id: str) -> None:
        """Backup file before deletion."""
        try:
            backup_path = self.base_path / "backup" / f"{file_id}_{file_path.name}"
            shutil.copy2(file_path, backup_path)
        except Exception as e:
            self.logger.error(f"Error backing up file {file_id}", e)
            raise StorageError(f"Failed to backup file: {str(e)}")

    def update_settings(self, settings: Dict) -> bool:
        """Update storage settings."""
        try:
            self.settings.update(settings)
            return True
        except Exception as e:
            self.logger.error("Error updating settings", e)
            return False