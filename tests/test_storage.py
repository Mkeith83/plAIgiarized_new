import pytest
from pathlib import Path
import shutil
from plAIgiarized.storage.service import StorageService

@pytest.fixture
def sample_file(tmp_path):
    """Create a sample text file."""
    file_path = tmp_path / "test.txt"
    file_path.write_text("This is a test file.")
    return file_path

@pytest.fixture
def storage_service():
    """Create storage service instance."""
    service = StorageService()
    yield service
    # Cleanup after tests
    shutil.rmtree(service.base_path)

def test_storage_service_init(storage_service):
    assert storage_service.base_path.name == "storage"
    assert storage_service.settings["max_file_size"] > 0
    assert len(storage_service.settings["allowed_extensions"]) > 0

def test_store_file(storage_service, sample_file):
    file_id = storage_service.store_file(str(sample_file))
    assert file_id is not None
    
    stored_path = storage_service.retrieve_file(file_id)
    assert stored_path is not None
    assert stored_path.exists()
    assert stored_path.read_text() == "This is a test file."

def test_file_info(storage_service, sample_file):
    file_id = storage_service.store_file(str(sample_file), {"note": "test file"})
    assert file_id is not None
    
    info = storage_service.get_file_info(file_id)
    assert info is not None
    assert info["exists"] == True
    assert info["metadata"]["custom"]["note"] == "test file"

def test_delete_file(storage_service, sample_file):
    file_id = storage_service.store_file(str(sample_file))
    assert file_id is not None
    
    success = storage_service.delete_file(file_id)
    assert success == True
    
    stored_path = storage_service.retrieve_file(file_id)
    assert stored_path is None