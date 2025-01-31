import pytest
from datetime import datetime, timedelta
from plAIgiarized.metrics.service import MetricsService

def test_metrics_service_init():
    service = MetricsService()
    assert service.base_path.endswith("metrics")
    assert "api" in service.metrics

def test_record_api_metric():
    service = MetricsService()
    
    # Record API metric
    success = service.record_api_metric(
        endpoint="/test",
        response_time=0.5,
        status_code=200,
        success=True
    )
    
    assert success == True
    
    # Verify metric was recorded
    metrics = service.get_metrics("api")
    assert len(metrics) > 0
    assert metrics[-1]["endpoint"] == "/test"

def test_get_aggregated_metrics():
    service = MetricsService()
    
    # Record multiple metrics
    for i in range(5):
        service.record_api_metric(
            endpoint="/test",
            response_time=0.1 * i,
            status_code=200,
            success=True
        )
    
    # Get aggregated metrics
    aggregated = service.get_aggregated_metrics("api")
    assert len(aggregated) > 0
    assert "total_calls" in aggregated[0]
    assert "avg_response_time" in aggregated[0]
