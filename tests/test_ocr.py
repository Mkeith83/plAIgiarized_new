import pytest
import os
from plAIgiarized.ocr.service import OCRService

def test_ocr_service_init():
    service = OCRService()
    assert service.base_path.endswith("ocr")
    assert os.path.exists(service.base_path)
