import pytest
from pathlib import Path
from plAIgiarized.config.service import ConfigService

def test_config_service_init():
    service = ConfigService()
    assert isinstance(service.base_path, Path)
    assert "api" in service.config

def test_get_config():
    service = ConfigService()
    
    # Test getting existing value
    timeout = service.get("api.timeout")
    assert timeout == 30
    
    # Test getting nested value
    max_size = service.get("storage.max_size")
    assert max_size == 1024 * 1024 * 100
    
    # Test getting non-existent value
    value = service.get("nonexistent", "default")
    assert value == "default"

def test_set_config():
    service = ConfigService()
    
    # Test setting value
    success = service.set("api.timeout", 60)
    assert success == True
    assert service.get("api.timeout") == 60
    
    # Test setting nested value
    success = service.set("new.nested.value", 42)
    assert success == True
    assert service.get("new.nested.value") == 42

def test_reset_config():
    service = ConfigService()
    
    # Print initial value
    print(f"Initial value: {service.get('api.timeout')}")
    
    # Modify value
    service.set("api.timeout", 60)
    print(f"After set: {service.get('api.timeout')}")
    
    # Reset specific value
    success = service.reset("api.timeout")
    print(f"After reset: {service.get('api.timeout')}")
    print(f"Default value: {service.defaults['api']['timeout']}")
    
    assert success == True
    assert service.get("api.timeout") == 30