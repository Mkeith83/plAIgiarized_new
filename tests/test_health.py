import pytest
from plAIgiarized.health.service import HealthService

def test_health_service_init():
    service = HealthService()
    assert service.base_path.endswith("health")
    assert "cpu_warning_threshold" in service.settings

def test_start_stop_monitoring():
    service = HealthService()
    
    # Start monitoring
    assert service.start_monitoring() == True
    assert service.monitoring == True
    
    # Stop monitoring
    assert service.stop_monitoring() == True
    assert service.monitoring == False

def test_get_system_health():
    service = HealthService()
    health = service.get_system_health()
    
    assert "system" in health
    assert "cpu" in health["system"]
    assert "memory" in health["system"]
    assert "disk" in health["system"]
