import tkinter as tk
from typing import Dict, List, Optional
from datetime import datetime
from ..learning.workflow_optimizer import WorkflowOptimizer
from ..learning.dashboard_learning import DashboardLearningService
from ..learning.teacher_preferences import TeacherPreferencesService
from ..interface.adaptive_dashboard import AdaptiveDashboard
from ..interface.teacher_assistant_bot import TeacherAssistantBot
from ..interface.enhanced_assistant import EnhancedSmartAssistant
from ..logging.service import LoggingService

class SmartOrchestrator:
    def __init__(self, teacher_id: str):
        self.logger = LoggingService()
        self.teacher_id = teacher_id
        
        # Initialize all components
        self.preferences = TeacherPreferencesService()
        self.workflow = WorkflowOptimizer(teacher_id)
        self.dashboard = None
        self.bot = None
        self.assistant = None
        self.dashboard_learning = None
        
        # Shared state
        self.state = {
            "current_class": None,
            "current_assignment": None,
            "active_tasks": [],
            "recent_actions": [],
            "notifications": [],
            "suggestions": []
        }
        
        # Integration settings
        self.settings = {
            "sync_interval": 5000,  # 5 seconds
            "suggestion_limit": 3,
            "notification_timeout": 10000,  # 10 seconds
            "learning_batch_size": 10
        }
        
        self._initialize_system()

    def _initialize_system(self):
        """Initialize and connect all system components."""
        try:
            # Create main window
            self.root = tk.Tk()
            self.root.title("plAIgiarized Teaching Assistant")
            self.root.geometry("1400x900")
            
            # Initialize components
            self._initialize_components()
            self._connect_components()
            self._start_sync_cycle()
            
            # Load teacher preferences
            self._load_preferences()

        except Exception as e:
            self.logger.error("Error initializing system", e)
            raise

    def _initialize_components(self):
        """Initialize individual components."""
        try:
            # Create dashboard
            self.dashboard = AdaptiveDashboard(self.root, self.teacher_id)
            
            # Create bot
            self.bot = TeacherAssistantBot(self.root)
            
            # Create smart assistant
            self.assistant = EnhancedSmartAssistant(self.root)
            
            # Initialize dashboard learning
            self.dashboard_learning = DashboardLearningService(self.teacher_id)
            self.dashboard_learning.connect_dashboard(self.dashboard)

        except Exception as e:
            self.logger.error("Error initializing components", e)
            raise

    def _connect_components(self):
        """Connect components for seamless interaction."""
        try:
            # Connect event handlers
            self.dashboard.on_action = self._handle_dashboard_action
            self.bot.on_message = self._handle_bot_message
            self.assistant.on_action = self._handle_assistant_action
            
            # Share context
            self._sync_context()
            
            # Connect workflow optimizer
            self.workflow.connect_dashboard(self.dashboard)
            self.workflow.connect_bot(self.bot)
            self.workflow.connect_assistant(self.assistant)

        except Exception as e:
            self.logger.error("Error connecting components", e)
            raise

    def _start_sync_cycle(self):
        """Start continuous sync cycle."""
        def sync_cycle():
            try:
                # Sync state across components
                self._sync_state()
                
                # Process pending actions
                self._process_pending_actions()
                
                # Update suggestions
                self._update_suggestions()
                
                # Schedule next sync
                self.root.after(self.settings["sync_interval"], sync_cycle)

            except Exception as e:
                self.logger.error("Error in sync cycle", e)

        # Start initial cycle
        self.root.after(1000, sync_cycle)

    def _sync_state(self):
        """Sync state across all components."""
        try:
            # Gather state from all components
            dashboard_state = self.dashboard.get_state()
            bot_state = self.bot.get_state()
            assistant_state = self.assistant.get_state()
            
            # Merge states
            self.state.update(dashboard_state)
            self.state.update(bot_state)
            self.state.update(assistant_state)
            
            # Distribute updated state
            self.dashboard.update_state(self.state)
            self.bot.update_state(self.state)
            self.assistant.update_state(self.state)

        except Exception as e:
            self.logger.error("Error syncing state", e)

    def _process_pending_actions(self):
        """Process any pending actions."""
        try:
            # Get pending actions from components
            dashboard_actions = self.dashboard.get_pending_actions()
            bot_actions = self.bot.get_pending_actions()
            assistant_actions = self.assistant.get_pending_actions()
            
            # Process all actions
            all_actions = dashboard_actions + bot_actions + assistant_actions
            for action in all_actions:
                self._handle_action(action)

        except Exception as e:
            self.logger.error("Error processing actions", e)

    def _update_suggestions(self):
        """Update and distribute suggestions."""
        try:
            # Get suggestions from workflow optimizer
            workflow_suggestions = self.workflow.optimize_current_workflow(self.state)
            
            # Get suggestions from components
            dashboard_suggestions = self.dashboard_learning.get_suggestions()
            preference_suggestions = self.preferences.get_suggestions(
                self.teacher_id,
                self.state
            )
            
            # Merge and prioritize suggestions
            all_suggestions = (workflow_suggestions + 
                             dashboard_suggestions + 
                             preference_suggestions)
            
            # Sort by confidence and limit
            all_suggestions.sort(key=lambda x: x["confidence"], reverse=True)
            top_suggestions = all_suggestions[:self.settings["suggestion_limit"]]
            
            # Distribute suggestions
            self.state["suggestions"] = top_suggestions
            self._distribute_suggestions(top_suggestions)

        except Exception as e:
            self.logger.error("Error updating suggestions", e)

    def _handle_action(self, action: Dict):
        """Handle any system action."""
        try:
            action_type = action.get("type")
            
            if action_type == "interface_change":
                self._handle_interface_change(action)
            
            elif action_type == "workflow_update":
                self._handle_workflow_update(action)
            
            elif action_type == "learning_update":
                self._handle_learning_update(action)
            
            elif action_type == "notification":
                self._handle_notification(action)
            
            # Add to recent actions
            self.state["recent_actions"].append(action)
            self.state["recent_actions"] = self.state["recent_actions"][-10:]

        except Exception as e:
            self.logger.error("Error handling action", e)

    def _distribute_suggestions(self, suggestions: List[Dict]):
        """Distribute suggestions to appropriate components."""
        try:
            for suggestion in suggestions:
                target = suggestion.get("target", "all")
                
                if target in ["all", "dashboard"]:
                    self.dashboard.add_suggestion(suggestion)
                
                if target in ["all", "bot"]:
                    self.bot.add_suggestion(suggestion)
                
                if target in ["all", "assistant"]:
                    self.assistant.add_suggestion(suggestion)

        except Exception as e:
            self.logger.error("Error distributing suggestions", e)

    def run(self):
        """Start the orchestrated system."""
        try:
            self.root.mainloop()

        except Exception as e:
            self.logger.error("Error running system", e)
            raise

    def destroy(self):
        """Clean up all resources."""
        try:
            # Save final state
            self._save_state()
            
            # Clean up components
            self.dashboard.destroy()
            self.bot.destroy()
            self.assistant.destroy()
            
            # Destroy main window
            self.root.destroy()

        except Exception as e:
            self.logger.error("Error destroying system", e)
            raise

    def _save_state(self):
        """Save current state and preferences."""
        try:
            # Save to teacher preferences
            self.preferences.learn_from_interaction(
                self.teacher_id,
                {
                    "type": "system_state",
                    "state": self.state,
                    "timestamp": datetime.now().isoformat()
                }
            )

        except Exception as e:
            self.logger.error("Error saving state", e) 