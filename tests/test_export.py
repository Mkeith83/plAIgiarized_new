import pytest
from datetime import datetime
from plAIgiarized.export.service import ExportService

def test_export_service_init():
    service = ExportService()
    assert service.base_path.endswith("exports")

def test_generate_visualizations():
    service = ExportService()
    
    # Test data
    data = {
        "timeline": [
            {
                "date": datetime.now().isoformat(),
                "grade_level": 8.0
            }
        ]
    }
    
    # Generate plot and check result
    plot_path = service.generate_visualizations(data, "progress")
    assert isinstance(plot_path, str)  # Just check it returns a string
