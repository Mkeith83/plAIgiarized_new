import tkinter as tk
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from ..learning.teacher_preferences import TeacherPreferencesService
from ..interface.adaptive_dashboard import AdaptiveDashboard
from ..logging.service import LoggingService

class DashboardLearningService:
    def __init__(self, teacher_id: str):
        self.logger = LoggingService()
        self.teacher_id = teacher_id
        self.preferences = TeacherPreferencesService()
        
        # Initialize learning patterns
        self.patterns = {
            "time_of_day": {},      # When teacher uses specific features
            "task_sequences": [],    # Common sequences of actions
            "widget_groups": {},     # Which widgets are used together
            "context_actions": {},   # Actions based on class/assignment context
            "peak_usage_times": {},  # Busiest times for different tasks
        }
        
        # Dashboard optimization settings
        self.settings = {
            "adaptation_threshold": 0.7,    # Confidence needed to adapt
            "learning_window": 14,          # Days of history to consider
            "min_pattern_occurrences": 3,   # Minimum times to establish pattern
            "max_suggestions": 3,           # Max simultaneous adaptations
        }

    def connect_dashboard(self, dashboard: AdaptiveDashboard):
        """Connect to dashboard and start learning."""
        self.dashboard = dashboard
        
        # Enhance dashboard tracking
        self._enhance_widget_tracking()
        self._enhance_layout_learning()
        self._start_pattern_detection()

    def _enhance_widget_tracking(self):
        """Enhance dashboard widget tracking with context."""
        original_track = self.dashboard._track_usage

        def enhanced_track(widget_name: str):
            # Get current context
            context = self._get_current_context()
            
            # Track in dashboard
            original_track(widget_name)
            
            # Learn from interaction
            self.learn_interaction({
                "type": "widget_use",
                "widget": widget_name,
                "context": context,
                "timestamp": datetime.now().isoformat()
            })

        self.dashboard._track_usage = enhanced_track

    def _enhance_layout_learning(self):
        """Enhance dashboard layout learning."""
        original_adapt = self.dashboard._adapt_layout

        def enhanced_adapt():
            # Get current patterns
            patterns = self._analyze_patterns()
            
            # Apply layout suggestions
            if patterns:
                self._apply_pattern_suggestions(patterns)
            
            # Call original adaptation
            original_adapt()

        self.dashboard._adapt_layout = enhanced_adapt

    def learn_interaction(self, interaction: Dict):
        """Learn from dashboard interaction."""
        try:
            # Update local patterns
            self._update_patterns(interaction)
            
            # Send to teacher preferences
            self.preferences.learn_from_interaction(
                self.teacher_id,
                interaction
            )

        except Exception as e:
            self.logger.error("Error learning interaction", e)

    def _update_patterns(self, interaction: Dict):
        """Update learning patterns."""
        try:
            timestamp = datetime.fromisoformat(interaction["timestamp"])
            
            # Update time of day patterns
            hour = timestamp.hour
            if hour not in self.patterns["time_of_day"]:
                self.patterns["time_of_day"][hour] = {}
            
            widget = interaction["widget"]
            if widget not in self.patterns["time_of_day"][hour]:
                self.patterns["time_of_day"][hour][widget] = 0
            self.patterns["time_of_day"][hour][widget] += 1

            # Update task sequences
            self.patterns["task_sequences"].append({
                "widget": widget,
                "context": interaction["context"],
                "timestamp": timestamp
            })
            
            # Maintain sequence window
            cutoff = datetime.now() - timedelta(days=self.settings["learning_window"])
            self.patterns["task_sequences"] = [
                seq for seq in self.patterns["task_sequences"]
                if seq["timestamp"] > cutoff
            ]

            # Update widget groups
            self._update_widget_groups(widget, timestamp)
            
            # Update context actions
            context_key = self._get_context_key(interaction["context"])
            if context_key not in self.patterns["context_actions"]:
                self.patterns["context_actions"][context_key] = {}
            if widget not in self.patterns["context_actions"][context_key]:
                self.patterns["context_actions"][context_key][widget] = 0
            self.patterns["context_actions"][context_key][widget] += 1

        except Exception as e:
            self.logger.error("Error updating patterns", e)

    def _update_widget_groups(self, current_widget: str, timestamp: datetime):
        """Update widget group patterns."""
        try:
            # Look for widgets used within 5 minutes
            recent_sequences = [
                seq for seq in self.patterns["task_sequences"]
                if abs((seq["timestamp"] - timestamp).total_seconds()) <= 300
                and seq["widget"] != current_widget
            ]
            
            for seq in recent_sequences:
                group_key = tuple(sorted([current_widget, seq["widget"]]))
                if group_key not in self.patterns["widget_groups"]:
                    self.patterns["widget_groups"][group_key] = 0
                self.patterns["widget_groups"][group_key] += 1

        except Exception as e:
            self.logger.error("Error updating widget groups", e)

    def _analyze_patterns(self) -> List[Dict]:
        """Analyze patterns for layout suggestions."""
        suggestions = []
        current_hour = datetime.now().hour
        current_context = self._get_current_context()
        
        try:
            # Check time-based patterns
            if current_hour in self.patterns["time_of_day"]:
                time_patterns = self.patterns["time_of_day"][current_hour]
                for widget, count in time_patterns.items():
                    if count >= self.settings["min_pattern_occurrences"]:
                        suggestions.append({
                            "type": "time_based",
                            "widget": widget,
                            "confidence": min(count / 10, 1.0),  # Cap at 1.0
                            "reason": "frequently used at this time"
                        })

            # Check context patterns
            context_key = self._get_context_key(current_context)
            if context_key in self.patterns["context_actions"]:
                context_patterns = self.patterns["context_actions"][context_key]
                for widget, count in context_patterns.items():
                    if count >= self.settings["min_pattern_occurrences"]:
                        suggestions.append({
                            "type": "context_based",
                            "widget": widget,
                            "confidence": min(count / 5, 1.0),
                            "reason": "commonly used in this context"
                        })

            # Check widget groups
            for (widget1, widget2), count in self.patterns["widget_groups"].items():
                if count >= self.settings["min_pattern_occurrences"]:
                    suggestions.append({
                        "type": "group_based",
                        "widgets": [widget1, widget2],
                        "confidence": min(count / 5, 1.0),
                        "reason": "often used together"
                    })

            # Sort by confidence and limit
            suggestions.sort(key=lambda x: x["confidence"], reverse=True)
            return suggestions[:self.settings["max_suggestions"]]

        except Exception as e:
            self.logger.error("Error analyzing patterns", e)
            return []

    def _apply_pattern_suggestions(self, patterns: List[Dict]):
        """Apply pattern-based suggestions to dashboard."""
        try:
            layout_changes = []
            
            for pattern in patterns:
                if pattern["confidence"] >= self.settings["adaptation_threshold"]:
                    if pattern["type"] == "time_based":
                        # Promote widget to more prominent position
                        layout_changes.append({
                            "widget": pattern["widget"],
                            "action": "promote",
                            "reason": pattern["reason"]
                        })
                    
                    elif pattern["type"] == "group_based":
                        # Keep widgets together
                        layout_changes.append({
                            "widgets": pattern["widgets"],
                            "action": "group",
                            "reason": pattern["reason"]
                        })
                    
                    elif pattern["type"] == "context_based":
                        # Highlight widget
                        layout_changes.append({
                            "widget": pattern["widget"],
                            "action": "highlight",
                            "reason": pattern["reason"]
                        })

            # Apply changes if any
            if layout_changes:
                self.dashboard._apply_layout_changes(layout_changes)

        except Exception as e:
            self.logger.error("Error applying pattern suggestions", e)

    def _get_current_context(self) -> Dict:
        """Get current dashboard context."""
        return {
            "class_id": self.dashboard.current_class,
            "assignment_type": self.dashboard.current_assignment_type,
            "time_of_day": datetime.now().hour,
            "day_of_week": datetime.now().weekday()
        }

    def _get_context_key(self, context: Dict) -> str:
        """Generate consistent key for context."""
        return f"{context.get('class_id')}:{context.get('assignment_type')}"

    def _start_pattern_detection(self):
        """Start background pattern detection."""
        def check_patterns():
            try:
                # Analyze current patterns
                patterns = self._analyze_patterns()
                
                # Apply if significant changes found
                if patterns:
                    self._apply_pattern_suggestions(patterns)
                
                # Schedule next check
                self.dashboard.window.after(300000, check_patterns)  # Every 5 minutes

            except Exception as e:
                self.logger.error("Error in pattern detection", e)

        # Start initial check
        self.dashboard.window.after(1000, check_patterns) 