import pytest
from plAIgiarized.notification.service import NotificationService

def test_notification_service_init():
    service = NotificationService()
    assert service.base_path.endswith("notifications")
    assert "email" in service.settings

def test_system_notification():
    service = NotificationService()
    
    # Send system notification
    data = {
        "alert_type": "test",
        "timestamp": "2024-01-01 12:00:00",
        "details": "Test notification"
    }
    
    success = service.send_notification("system", data)
    assert success == True
    
    # Check notification was stored
    notifications = service.get_notifications()
    assert len(notifications) > 0
    assert notifications[0]["type"] == "system"

def test_mark_notifications_read():
    service = NotificationService()
    
    # Send test notification
    data = {"alert_type": "test", "timestamp": "2024-01-01", "details": "Test"}
    service.send_notification("system", data)
    
    # Get notification ID
    notifications = service.get_notifications()
    notification_id = notifications[0]["id"]
    
    # Mark as read
    success = service.mark_as_read([notification_id])
    assert success == True
    
    # Verify marked as read
    updated = service.get_notifications()
    assert updated[0]["read"] == True
