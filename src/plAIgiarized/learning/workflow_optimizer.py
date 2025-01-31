import tkinter as tk
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import numpy as np
from ..learning.teacher_preferences import TeacherPreferencesService
from ..learning.dashboard_learning import DashboardLearningService
from ..logging.service import LoggingService

class WorkflowOptimizer:
    def __init__(self, teacher_id: str):
        self.logger = LoggingService()
        self.teacher_id = teacher_id
        self.preferences = TeacherPreferencesService()
        self.dashboard_learning = DashboardLearningService(teacher_id)
        
        # Optimization settings
        self.settings = {
            "learning_rate": 0.1,
            "prediction_window": timedelta(hours=2),
            "confidence_threshold": 0.75,
            "max_suggestions": 3,
            "adaptation_cooldown": timedelta(minutes=30)
        }
        
        # Workflow patterns
        self.patterns = {
            "task_chains": {},      # Common sequences of tasks
            "time_blocks": {},      # Optimal time blocks for tasks
            "context_flows": {},    # Context-specific workflows
            "efficiency_scores": {} # Task completion efficiency
        }
        
        self.last_adaptation = datetime.min
        self._initialize_optimizer()

    def _initialize_optimizer(self):
        """Initialize the workflow optimizer."""
        try:
            # Load historical data
            historical_data = self.preferences.get_suggestions(
                self.teacher_id,
                {"context": "workflow_history"}
            )
            
            if historical_data:
                self._analyze_historical_data(historical_data)
            
            # Start optimization cycle
            self._start_optimization_cycle()

        except Exception as e:
            self.logger.error("Error initializing workflow optimizer", e)

    def optimize_current_workflow(self, context: Dict) -> List[Dict]:
        """Optimize current workflow based on context."""
        try:
            current_time = datetime.now()
            
            # Check cooldown period
            if (current_time - self.last_adaptation) < self.settings["adaptation_cooldown"]:
                return []

            # Analyze current context
            context_key = self._get_context_key(context)
            time_block = self._get_time_block(current_time)
            
            suggestions = []
            
            # Get task chain suggestions
            chain_suggestions = self._get_task_chain_suggestions(context_key)
            suggestions.extend(chain_suggestions)
            
            # Get time block suggestions
            time_suggestions = self._get_time_block_suggestions(time_block)
            suggestions.extend(time_suggestions)
            
            # Get efficiency suggestions
            efficiency_suggestions = self._get_efficiency_suggestions(context)
            suggestions.extend(efficiency_suggestions)
            
            # Sort and filter suggestions
            suggestions.sort(key=lambda x: x["confidence"], reverse=True)
            top_suggestions = suggestions[:self.settings["max_suggestions"]]
            
            # Update last adaptation time
            if top_suggestions:
                self.last_adaptation = current_time
            
            return top_suggestions

        except Exception as e:
            self.logger.error("Error optimizing workflow", e)
            return []

    def learn_from_workflow(self, workflow_data: Dict):
        """Learn from completed workflow."""
        try:
            # Extract workflow information
            context_key = self._get_context_key(workflow_data["context"])
            time_block = self._get_time_block(workflow_data["timestamp"])
            tasks = workflow_data["tasks"]
            duration = workflow_data["duration"]
            
            # Update task chains
            self._update_task_chains(context_key, tasks)
            
            # Update time blocks
            self._update_time_blocks(time_block, tasks)
            
            # Update efficiency scores
            self._update_efficiency_scores(tasks, duration)
            
            # Save updated patterns
            self._save_patterns()

        except Exception as e:
            self.logger.error("Error learning from workflow", e)

    def _update_task_chains(self, context_key: str, tasks: List[str]):
        """Update task chain patterns."""
        if len(tasks) < 2:
            return
            
        for i in range(len(tasks) - 1):
            current_task = tasks[i]
            next_task = tasks[i + 1]
            
            if context_key not in self.patterns["task_chains"]:
                self.patterns["task_chains"][context_key] = {}
                
            if current_task not in self.patterns["task_chains"][context_key]:
                self.patterns["task_chains"][context_key][current_task] = {}
                
            if next_task not in self.patterns["task_chains"][context_key][current_task]:
                self.patterns["task_chains"][context_key][current_task][next_task] = 0
                
            self.patterns["task_chains"][context_key][current_task][next_task] += 1

    def _update_time_blocks(self, time_block: str, tasks: List[str]):
        """Update time block patterns."""
        if time_block not in self.patterns["time_blocks"]:
            self.patterns["time_blocks"][time_block] = {}
            
        for task in tasks:
            if task not in self.patterns["time_blocks"][time_block]:
                self.patterns["time_blocks"][time_block][task] = {
                    "count": 0,
                    "success_rate": 0.0
                }
            
            self.patterns["time_blocks"][time_block][task]["count"] += 1

    def _update_efficiency_scores(self, tasks: List[str], duration: float):
        """Update task efficiency scores."""
        for task in tasks:
            if task not in self.patterns["efficiency_scores"]:
                self.patterns["efficiency_scores"][task] = {
                    "durations": [],
                    "average": 0.0,
                    "optimal_time": None
                }
            
            scores = self.patterns["efficiency_scores"][task]
            scores["durations"].append(duration)
            
            # Update average and optimal time
            scores["average"] = np.mean(scores["durations"])
            scores["optimal_time"] = np.percentile(scores["durations"], 25)  # Use 25th percentile as optimal

    def _get_task_chain_suggestions(self, context_key: str) -> List[Dict]:
        """Get task chain suggestions."""
        suggestions = []
        
        if context_key in self.patterns["task_chains"]:
            chains = self.patterns["task_chains"][context_key]
            
            for current_task, next_tasks in chains.items():
                total = sum(next_tasks.values())
                for next_task, count in next_tasks.items():
                    confidence = count / total
                    if confidence >= self.settings["confidence_threshold"]:
                        suggestions.append({
                            "type": "task_chain",
                            "current_task": current_task,
                            "suggested_task": next_task,
                            "confidence": confidence,
                            "message": f"Consider {next_task} after {current_task}"
                        })
        
        return suggestions

    def _get_time_block_suggestions(self, time_block: str) -> List[Dict]:
        """Get time block suggestions."""
        suggestions = []
        
        if time_block in self.patterns["time_blocks"]:
            blocks = self.patterns["time_blocks"][time_block]
            
            for task, data in blocks.items():
                if data["count"] >= 5:  # Minimum occurrences
                    suggestions.append({
                        "type": "time_block",
                        "task": task,
                        "confidence": min(data["count"] / 10, 1.0),
                        "message": f"{task} is often successful during this time"
                    })
        
        return suggestions

    def _get_efficiency_suggestions(self, context: Dict) -> List[Dict]:
        """Get efficiency-based suggestions."""
        suggestions = []
        
        for task, scores in self.patterns["efficiency_scores"].items():
            if len(scores["durations"]) >= 5:  # Minimum samples
                current_average = scores["average"]
                optimal_time = scores["optimal_time"]
                
                if optimal_time and current_average > optimal_time * 1.5:
                    suggestions.append({
                        "type": "efficiency",
                        "task": task,
                        "confidence": 0.8,
                        "message": f"Consider optimizing {task} - currently taking longer than usual"
                    })
        
        return suggestions

    def _get_context_key(self, context: Dict) -> str:
        """Generate context key."""
        return f"{context.get('class_id')}:{context.get('assignment_type')}:{context.get('subject')}"

    def _get_time_block(self, timestamp: datetime) -> str:
        """Get time block for timestamp."""
        hour = timestamp.hour
        if 5 <= hour < 12:
            return "morning"
        elif 12 <= hour < 17:
            return "afternoon"
        elif 17 <= hour < 22:
            return "evening"
        else:
            return "night"

    def _start_optimization_cycle(self):
        """Start continuous optimization cycle."""
        def optimize_cycle():
            try:
                # Get current context
                context = {
                    "timestamp": datetime.now(),
                    "class_id": self.dashboard_learning.dashboard.current_class,
                    "assignment_type": self.dashboard_learning.dashboard.current_assignment_type
                }
                
                # Get optimization suggestions
                suggestions = self.optimize_current_workflow(context)
                
                # Apply suggestions if any
                if suggestions:
                    self._apply_suggestions(suggestions)
                
                # Schedule next optimization
                self.dashboard_learning.dashboard.window.after(
                    300000,  # 5 minutes
                    optimize_cycle
                )

            except Exception as e:
                self.logger.error("Error in optimization cycle", e)

        # Start initial cycle
        optimize_cycle()

    def _apply_suggestions(self, suggestions: List[Dict]):
        """Apply workflow suggestions."""
        try:
            for suggestion in suggestions:
                if suggestion["type"] == "task_chain":
                    # Prepare next task
                    self.dashboard_learning.dashboard._prepare_task(
                        suggestion["suggested_task"]
                    )
                
                elif suggestion["type"] == "time_block":
                    # Highlight optimal tasks
                    self.dashboard_learning.dashboard._highlight_task(
                        suggestion["task"]
                    )
                
                elif suggestion["type"] == "efficiency":
                    # Show efficiency tip
                    self.dashboard_learning.dashboard._show_efficiency_tip(
                        suggestion["message"]
                    )

        except Exception as e:
            self.logger.error("Error applying suggestions", e)

    def _save_patterns(self):
        """Save current patterns."""
        try:
            self.preferences.learn_from_interaction(
                self.teacher_id,
                {
                    "type": "workflow_patterns",
                    "patterns": self.patterns,
                    "timestamp": datetime.now().isoformat()
                }
            )

        except Exception as e:
            self.logger.error("Error saving patterns", e) 