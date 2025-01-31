import pytest
import os
import json
from plAIgiarized.backup.service import BackupService

def setup_test_data():
    """Create test data for backup testing"""
    os.makedirs("data/config", exist_ok=True)
    os.makedirs("data/essays", exist_ok=True)
    
    # Create test config
    with open("data/config/test.json", "w") as f:
        json.dump({"test": True}, f)
    
    # Create test essay
    with open("data/essays/test.txt", "w") as f:
        f.write("Test essay content")

def cleanup_test_data():
    """Clean up test data after testing"""
    import shutil
    if os.path.exists("data/backups"):
        shutil.rmtree("data/backups")

def test_backup_service_init():
    service = BackupService()
    assert service.base_path.endswith("backups")
    assert "max_backups" in service.settings

def test_create_backup():
    # Setup
    setup_test_data()
    service = BackupService()
    
    try:
        # Create backup
        backup_id = service.create_backup("config")
        assert backup_id is not None
        
        # Verify backup exists
        backup_path = os.path.join(service.base_path, backup_id)
        assert os.path.exists(backup_path)
        
        # Verify backup contains config
        backup_config_path = os.path.join(backup_path, "config", "test.json")
        assert os.path.exists(backup_config_path)
        
        # Verify backup content
        with open(backup_config_path, "r") as f:
            content = json.load(f)
            assert content == {"test": True}
    finally:
        # Cleanup
        cleanup_test_data()

def test_list_backups():
    service = BackupService()
    setup_test_data()
    
    try:
        # Create test backup
        service.create_backup("config")
        
        # List backups
        backups = service.list_backups()
        assert isinstance(backups, list)
        assert len(backups) > 0
        
        # Verify backup info
        backup = backups[0]
        assert "id" in backup
        assert "type" in backup
        assert "timestamp" in backup
    finally:
        cleanup_test_data()

def test_restore_backup():
    service = BackupService()
    setup_test_data()
    
    try:
        # Create backup
        backup_id = service.create_backup("config")
        
        # Modify original file
        with open("data/config/test.json", "w") as f:
            json.dump({"modified": True}, f)
        
        # Restore backup
        success = service.restore_backup(backup_id)
        assert success == True
        
        # Verify restored content
        with open("data/config/test.json", "r") as f:
            content = json.load(f)
            assert content == {"test": True}
    finally:
        cleanup_test_data()
