from typing import Dict, List, Optional, Any, Union
import os
import json
import time
import threading
from datetime import datetime, timedelta
from ..logging.service import LoggingService

class CacheService:
    def __init__(self):
        self.base_path = "data/cache"
        os.makedirs(self.base_path, exist_ok=True)
        
        self.logger = LoggingService()
        
        # Cache settings
        self.settings = {
            "default_ttl": 3600,  # 1 hour
            "max_size": 1000000,  # 1MB per cache
            "cleanup_interval": 300,  # 5 minutes
            "compression": True
        }
        
        # Cache storage
        self.caches: Dict[str, Dict] = {}
        
        # Cache metadata
        self.metadata: Dict[str, Dict] = {}
        
        # Thread safety
        self.cache_lock = threading.Lock()
        
        # Start cleanup thread
        self.cleanup_thread = threading.Thread(target=self._cleanup_loop, daemon=True)
        self.cleanup_thread.start()
        
        # Load existing caches
        self._load_caches()

    def get(self, cache_name: str, key: str) -> Optional[Any]:
        """Get value from cache."""
        try:
            with self.cache_lock:
                if cache_name not in self.caches:
                    return None
                
                cache = self.caches[cache_name]
                if key not in cache:
                    return None
                
                item = cache[key]
                if self._is_expired(item):
                    del cache[key]
                    return None
                
                # Update access time
                item["accessed_at"] = time.time()
                self._save_cache(cache_name)
                
                return item["value"]
        except Exception as e:
            self.logger.error(f"Error getting cache item {cache_name}:{key}", e)
            return None

    def set(self, cache_name: str, key: str, value: Any,
            expire_in: Optional[int] = None) -> bool:
        """Set value in cache."""
        try:
            with self.cache_lock:
                if cache_name not in self.caches:
                    self.caches[cache_name] = {}
                    self.metadata[cache_name] = {
                        "created_at": time.time(),
                        "size": 0,
                        "item_count": 0
                    }
                
                cache = self.caches[cache_name]
                
                # Create cache item
                item = {
                    "value": value,
                    "created_at": time.time(),
                    "accessed_at": time.time(),
                    "expire_at": time.time() + (expire_in or self.settings["default_ttl"])
                }
                
                # Check cache size
                if len(str(value)) > self.settings["max_size"]:
                    return False
                
                cache[key] = item
                self._update_metadata(cache_name)
                self._save_cache(cache_name)
                
                return True
        except Exception as e:
            self.logger.error(f"Error setting cache item {cache_name}:{key}", e)
            return False

    def delete(self, cache_name: str, key: str) -> bool:
        """Delete value from cache."""
        try:
            with self.cache_lock:
                if cache_name not in self.caches:
                    return False
                
                cache = self.caches[cache_name]
                if key not in cache:
                    return False
                
                del cache[key]
                self._update_metadata(cache_name)
                self._save_cache(cache_name)
                
                return True
        except Exception as e:
            self.logger.error(f"Error deleting cache item {cache_name}:{key}", e)
            return False

    def clear(self, cache_name: str) -> bool:
        """Clear entire cache."""
        try:
            with self.cache_lock:
                if cache_name not in self.caches:
                    return False
                
                self.caches[cache_name] = {}
                self._update_metadata(cache_name)
                self._save_cache(cache_name)
                
                return True
        except Exception as e:
            self.logger.error(f"Error clearing cache {cache_name}", e)
            return False

    def clear_pattern(self, cache_name: str, pattern: str) -> bool:
        """Clear cache items matching pattern."""
        try:
            import re
            pattern = re.compile(pattern.replace("*", ".*"))
            
            with self.cache_lock:
                if cache_name not in self.caches:
                    return False
                
                cache = self.caches[cache_name]
                keys_to_delete = [
                    key for key in cache.keys()
                    if pattern.match(key)
                ]
                
                for key in keys_to_delete:
                    del cache[key]
                
                self._update_metadata(cache_name)
                self._save_cache(cache_name)
                
                return True
        except Exception as e:
            self.logger.error(f"Error clearing cache pattern {cache_name}:{pattern}", e)
            return False

    def get_stats(self, cache_name: Optional[str] = None) -> Dict:
        """Get cache statistics."""
        try:
            with self.cache_lock:
                if cache_name:
                    if cache_name not in self.metadata:
                        return {}
                    return self._get_cache_stats(cache_name)
                
                return {
                    name: self._get_cache_stats(name)
                    for name in self.metadata
                }
        except Exception as e:
            self.logger.error("Error getting cache stats", e)
            return {}

    def _get_cache_stats(self, cache_name: str) -> Dict:
        """Get statistics for specific cache."""
        try:
            cache = self.caches[cache_name]
            metadata = self.metadata[cache_name]
            
            # Count expired items
            expired_count = sum(
                1 for item in cache.values()
                if self._is_expired(item)
            )
            
            return {
                "size": metadata["size"],
                "item_count": metadata["item_count"],
                "expired_count": expired_count,
                "created_at": metadata["created_at"],
                "hit_rate": self._calculate_hit_rate(cache_name)
            }
        except Exception as e:
            self.logger.error(f"Error getting cache stats for {cache_name}", e)
            return {}

    def _is_expired(self, item: Dict) -> bool:
        """Check if cache item is expired."""
        return time.time() > item["expire_at"]

    def _update_metadata(self, cache_name: str) -> None:
        """Update cache metadata."""
        try:
            cache = self.caches[cache_name]
            
            self.metadata[cache_name].update({
                "size": sum(len(str(item["value"])) for item in cache.values()),
                "item_count": len(cache),
                "updated_at": time.time()
            })
        except Exception as e:
            self.logger.error(f"Error updating metadata for {cache_name}", e)

    def _calculate_hit_rate(self, cache_name: str) -> float:
        """Calculate cache hit rate."""
        try:
            cache = self.caches[cache_name]
            if not cache:
                return 0.0
            
            total_accesses = sum(
                1 for item in cache.values()
                if item["accessed_at"] > item["created_at"]
            )
            
            if total_accesses == 0:
                return 0.0
            
            return total_accesses / len(cache)
        except Exception as e:
            self.logger.error(f"Error calculating hit rate for {cache_name}", e)
            return 0.0

    def _cleanup_loop(self) -> None:
        """Run periodic cache cleanup."""
        while True:
            try:
                time.sleep(self.settings["cleanup_interval"])
                self._cleanup_expired()
            except Exception as e:
                self.logger.error("Error in cleanup loop", e)
                time.sleep(60)  # Wait longer on error

    def _cleanup_expired(self) -> None:
        """Remove expired cache items."""
        try:
            with self.cache_lock:
                for cache_name, cache in self.caches.items():
                    # Find expired keys
                    expired_keys = [
                        key for key, item in cache.items()
                        if self._is_expired(item)
                    ]
                    
                    # Remove expired items
                    for key in expired_keys:
                        del cache[key]
                    
                    if expired_keys:
                        self._update_metadata(cache_name)
                        self._save_cache(cache_name)
        except Exception as e:
            self.logger.error("Error cleaning up expired items", e)

    def _save_cache(self, cache_name: str) -> None:
        """Save cache to disk."""
        try:
            cache_dir = os.path.join(self.base_path, cache_name)
            os.makedirs(cache_dir, exist_ok=True)
            
            # Save cache data
            cache_file = os.path.join(cache_dir, "data.json")
            with open(cache_file, "w") as f:
                json.dump(self.caches[cache_name], f)
            
            # Save metadata
            meta_file = os.path.join(cache_dir, "metadata.json")
            with open(meta_file, "w") as f:
                json.dump(self.metadata[cache_name], f)
        except Exception as e:
            self.logger.error(f"Error saving cache {cache_name}", e)

    def _load_caches(self) -> None:
        """Load caches from disk."""
        try:
            if not os.path.exists(self.base_path):
                return
            
            for cache_name in os.listdir(self.base_path):
                cache_dir = os.path.join(self.base_path, cache_name)
                if not os.path.isdir(cache_dir):
                    continue
                
                # Load cache data
                cache_file = os.path.join(cache_dir, "data.json")
                if os.path.exists(cache_file):
                    with open(cache_file, "r") as f:
                        self.caches[cache_name] = json.load(f)
                
                # Load metadata
                meta_file = os.path.join(cache_dir, "metadata.json")
                if os.path.exists(meta_file):
                    with open(meta_file, "r") as f:
                        self.metadata[cache_name] = json.load(f)
                else:
                    # Create new metadata if missing
                    self.metadata[cache_name] = {
                        "created_at": time.time(),
                        "size": 0,
                        "item_count": 0
                    }
        except Exception as e:
            self.logger.error("Error loading caches", e)

    def update_settings(self, settings: Dict) -> bool:
        """Update cache settings."""
        try:
            self.settings.update(settings)
            return True
        except Exception as e:
            self.logger.error("Error updating settings", e)
            return False
