import pytest
import time
from plAIgiarized.cache.service import CacheService

def test_cache_service_init():
    service = CacheService()
    assert service.base_path.endswith("cache")
    assert "default_ttl" in service.settings

def test_cache_set_get():
    service = CacheService()
    
    # Set cache item
    success = service.set("test_cache", "test_key", "test_value")
    assert success == True
    
    # Get cache item
    value = service.get("test_cache", "test_key")
    assert value == "test_value"

def test_cache_expiration():
    service = CacheService()
    
    # Set cache item with 1 second TTL
    service.set("test_cache", "test_key", "test_value", expire_in=1)
    
    # Verify item exists
    assert service.get("test_cache", "test_key") == "test_value"
    
    # Wait for expiration
    time.sleep(1.1)
    
    # Verify item expired
    assert service.get("test_cache", "test_key") is None

def test_cache_clear():
    service = CacheService()
    
    # Set multiple items
    service.set("test_cache", "key1", "value1")
    service.set("test_cache", "key2", "value2")
    
    # Clear cache
    success = service.clear("test_cache")
    assert success == True
    
    # Verify cache is empty
    assert service.get("test_cache", "key1") is None
    assert service.get("test_cache", "key2") is None
