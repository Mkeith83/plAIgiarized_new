import pytest
import os
from plAIgiarized.reporting.service import ReportingService

def test_reporting_service_init():
    service = ReportingService()
    assert service.base_path.endswith("reports")
    assert "student" in service.templates

def test_generate_student_report():
    service = ReportingService()
    
    # Generate test report
    params = {
        "student_id": "test123",
        "date_range": 30
    }
    
    report_dir = service.generate_report("student", params)
    assert report_dir is not None
    
    # Get generated report using OS-specific path separator
    report_id = os.path.basename(report_dir)  # Get last part of path safely
    report = service.get_report(report_id)
    assert report is not None
    assert report["type"] == "student"
    assert report["student_id"] == "test123"

def test_list_reports():
    service = ReportingService()
    
    # List all reports
    reports = service.list_reports()
    assert isinstance(reports, list)
    
    # List specific type
    student_reports = service.list_reports("student")
    assert all(r["type"] == "student" for r in student_reports)
