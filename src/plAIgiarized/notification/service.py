from typing import Dict, List, Optional, Any
import os
import json
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..logging.service import LoggingService

class NotificationService:
    def __init__(self):
        self.base_path = "data/notifications"
        os.makedirs(self.base_path, exist_ok=True)
        
        self.logger = LoggingService()
        
        # Notification settings
        self.settings = {
            "email": {
                "enabled": True,
                "smtp_host": os.getenv("SMTP_HOST", "smtp.gmail.com"),
                "smtp_port": int(os.getenv("SMTP_PORT", "587")),
                "smtp_user": os.getenv("SMTP_USER", ""),
                "smtp_password": os.getenv("SMTP_PASSWORD", ""),
                "from_address": os.getenv("FROM_EMAIL", "")
            },
            "slack": {
                "enabled": True,
                "webhook_url": os.getenv("SLACK_WEBHOOK_URL", ""),
                "channel": "#plagiarism-alerts"
            },
            "system": {
                "enabled": True,
                "max_notifications": 100,
                "retention_days": 30
            }
        }
        
        # Notification templates
        self.templates = {
            "ai_detection": {
                "subject": "AI Content Detection Alert",
                "body": """
                    AI content detected in submission:
                    Student: {student_id}
                    Confidence: {confidence}
                    Details: {details}
                """
            },
            "plagiarism": {
                "subject": "Plagiarism Detection Alert",
                "body": """
                    Potential plagiarism detected:
                    Student: {student_id}
                    Match Count: {match_count}
                    Similarity: {similarity}%
                    Sources: {sources}
                """
            },
            "system": {
                "subject": "System Alert: {alert_type}",
                "body": """
                    System Alert:
                    Type: {alert_type}
                    Time: {timestamp}
                    Details: {details}
                """
            }
        }
        
        # Notification history
        self.notifications: List[Dict] = self._load_notifications()

    def send_notification(self, notification_type: str, data: Dict,
                         channels: Optional[List[str]] = None) -> bool:
        """Send notification through specified channels."""
        try:
            if not channels:
                channels = ["system"]
            
            success = True
            template = self.templates.get(notification_type)
            if not template:
                raise ValueError(f"Unknown notification type: {notification_type}")
            
            # Format notification content
            subject = template["subject"].format(**data)
            body = template["body"].format(**data)
            
            # Send through each channel
            for channel in channels:
                if channel == "email" and self.settings["email"]["enabled"]:
                    success &= self._send_email(subject, body, data.get("recipients", []))
                elif channel == "slack" and self.settings["slack"]["enabled"]:
                    success &= self._send_slack(subject, body)
                elif channel == "system" and self.settings["system"]["enabled"]:
                    success &= self._store_notification(notification_type, subject, body, data)
            
            return success
        except Exception as e:
            self.logger.error("Error sending notification", e)
            return False

    def get_notifications(self, user_id: Optional[str] = None,
                         notification_type: Optional[str] = None,
                         limit: int = 50) -> List[Dict]:
        """Get notifications with optional filtering."""
        try:
            filtered = self.notifications
            
            if user_id:
                filtered = [n for n in filtered if n.get("user_id") == user_id]
            
            if notification_type:
                filtered = [n for n in filtered if n["type"] == notification_type]
            
            return sorted(
                filtered,
                key=lambda x: x["timestamp"],
                reverse=True
            )[:limit]
        except Exception as e:
            self.logger.error("Error getting notifications", e)
            return []

    def mark_as_read(self, notification_ids: List[str]) -> bool:
        """Mark notifications as read."""
        try:
            updated = False
            for notification in self.notifications:
                if notification["id"] in notification_ids:
                    notification["read"] = True
                    updated = True
            
            if updated:
                self._save_notifications()
            
            return updated
        except Exception as e:
            self.logger.error("Error marking notifications as read", e)
            return False

    def clear_notifications(self, user_id: Optional[str] = None) -> bool:
        """Clear notifications for user."""
        try:
            if user_id:
                self.notifications = [n for n in self.notifications 
                                    if n.get("user_id") != user_id]
            else:
                self.notifications = []
            
            self._save_notifications()
            return True
        except Exception as e:
            self.logger.error("Error clearing notifications", e)
            return False

    def _send_email(self, subject: str, body: str, recipients: List[str]) -> bool:
        """Send email notification."""
        try:
            if not recipients:
                return False
            
            msg = MIMEMultipart()
            msg["From"] = self.settings["email"]["from_address"]
            msg["To"] = ", ".join(recipients)
            msg["Subject"] = subject
            
            msg.attach(MIMEText(body.strip(), "plain"))
            
            with smtplib.SMTP(
                self.settings["email"]["smtp_host"],
                self.settings["email"]["smtp_port"]
            ) as server:
                server.starttls()
                server.login(
                    self.settings["email"]["smtp_user"],
                    self.settings["email"]["smtp_password"]
                )
                server.send_message(msg)
            
            return True
        except Exception as e:
            self.logger.error("Error sending email", e)
            return False

    def _send_slack(self, subject: str, body: str) -> bool:
        """Send Slack notification."""
        try:
            import requests
            
            message = f"*{subject}*\n{body}"
            payload = {
                "channel": self.settings["slack"]["channel"],
                "text": message
            }
            
            response = requests.post(
                self.settings["slack"]["webhook_url"],
                json=payload
            )
            
            return response.status_code == 200
        except Exception as e:
            self.logger.error("Error sending Slack notification", e)
            return False

    def _store_notification(self, notification_type: str, subject: str,
                          body: str, data: Dict) -> bool:
        """Store system notification."""
        try:
            notification = {
                "id": self._generate_notification_id(),
                "type": notification_type,
                "subject": subject,
                "body": body,
                "data": data,
                "timestamp": datetime.now().isoformat(),
                "read": False
            }
            
            if "user_id" in data:
                notification["user_id"] = data["user_id"]
            
            self.notifications.append(notification)
            
            # Enforce notification limit
            if len(self.notifications) > self.settings["system"]["max_notifications"]:
                self.notifications.sort(key=lambda x: x["timestamp"])
                self.notifications = self.notifications[-self.settings["system"]["max_notifications"]:]
            
            self._save_notifications()
            return True
        except Exception as e:
            self.logger.error("Error storing notification", e)
            return False

    def _generate_notification_id(self) -> str:
        """Generate unique notification ID."""
        import uuid
        return str(uuid.uuid4())

    def _load_notifications(self) -> List[Dict]:
        """Load notifications from storage."""
        try:
            file_path = os.path.join(self.base_path, "notifications.json")
            if os.path.exists(file_path):
                with open(file_path, "r") as f:
                    return json.load(f)
            return []
        except Exception as e:
            self.logger.error("Error loading notifications", e)
            return []

    def _save_notifications(self) -> None:
        """Save notifications to storage."""
        try:
            file_path = os.path.join(self.base_path, "notifications.json")
            with open(file_path, "w") as f:
                json.dump(self.notifications, f, indent=2)
        except Exception as e:
            self.logger.error("Error saving notifications", e)

    def update_template(self, notification_type: str, template: Dict) -> bool:
        """Update notification template."""
        try:
            if notification_type not in self.templates:
                return False
            
            self.templates[notification_type].update(template)
            return True
        except Exception as e:
            self.logger.error("Error updating template", e)
            return False

    def update_settings(self, channel: str, settings: Dict) -> bool:
        """Update notification settings."""
        try:
            if channel not in self.settings:
                return False
            
            self.settings[channel].update(settings)
            return True
        except Exception as e:
            self.logger.error("Error updating settings", e)
            return False
