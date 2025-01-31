from typing import Dict, List, Optional
import json
from datetime import datetime, timedelta
from pathlib import Path
import numpy as np
from ..logging.service import LoggingService

class TeacherPreferencesService:
    def __init__(self):
        self.logger = LoggingService()
        self.data_path = Path("data/preferences")
        self.data_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize learning patterns
        self.patterns = {
            "interface_preferences": {},
            "common_tasks": {},
            "workflow_patterns": {},
            "time_patterns": {},
            "feature_usage": {},
            "alert_preferences": {},
            "report_preferences": {}
        }
        
        # Learning settings
        self.settings = {
            "min_pattern_confidence": 0.75,
            "learning_rate": 0.1,
            "max_suggestions": 5,
            "update_interval": timedelta(minutes=30)
        }

    def learn_from_interaction(self, teacher_id: str, interaction: Dict):
        """Learn from teacher interactions."""
        try:
            # Load existing patterns
            teacher_patterns = self._load_patterns(teacher_id)
            
            # Update patterns based on new interaction
            timestamp = datetime.now()
            interaction_type = interaction.get("type")
            
            if interaction_type == "interface_choice":
                self._update_interface_preference(
                    teacher_patterns, 
                    interaction["choice"],
                    timestamp
                )
            
            elif interaction_type == "task_execution":
                self._update_task_pattern(
                    teacher_patterns,
                    interaction["task"],
                    interaction["context"],
                    timestamp
                )
            
            elif interaction_type == "workflow_sequence":
                self._update_workflow_pattern(
                    teacher_patterns,
                    interaction["sequence"],
                    timestamp
                )
            
            # Save updated patterns
            self._save_patterns(teacher_id, teacher_patterns)

        except Exception as e:
            self.logger.error(f"Error learning from interaction for teacher {teacher_id}", e)

    def get_suggestions(self, teacher_id: str, context: Dict) -> List[Dict]:
        """Get personalized suggestions based on learned patterns."""
        try:
            patterns = self._load_patterns(teacher_id)
            current_time = datetime.now()
            
            suggestions = []
            
            # Check time-based patterns
            time_suggestions = self._get_time_based_suggestions(
                patterns, current_time
            )
            suggestions.extend(time_suggestions)
            
            # Check workflow patterns
            if context.get("last_action"):
                workflow_suggestions = self._get_workflow_suggestions(
                    patterns, context["last_action"]
                )
                suggestions.extend(workflow_suggestions)
            
            # Check common tasks
            task_suggestions = self._get_task_suggestions(
                patterns, context
            )
            suggestions.extend(task_suggestions)
            
            # Sort by confidence and limit
            suggestions.sort(key=lambda x: x["confidence"], reverse=True)
            return suggestions[:self.settings["max_suggestions"]]

        except Exception as e:
            self.logger.error(f"Error getting suggestions for teacher {teacher_id}", e)
            return []

    def _update_interface_preference(self, patterns: Dict, choice: str, timestamp: datetime):
        """Update interface preference patterns."""
        if "interface_preferences" not in patterns:
            patterns["interface_preferences"] = {"counts": {}, "last_updated": None}
            
        prefs = patterns["interface_preferences"]
        
        if choice not in prefs["counts"]:
            prefs["counts"][choice] = 0
        
        prefs["counts"][choice] += 1
        prefs["last_updated"] = timestamp.isoformat()

    def _update_task_pattern(self, patterns: Dict, task: str, context: Dict, timestamp: datetime):
        """Update task execution patterns."""
        if "task_patterns" not in patterns:
            patterns["task_patterns"] = {"sequences": [], "last_updated": None}
            
        task_patterns = patterns["task_patterns"]
        
        # Add new task sequence
        task_patterns["sequences"].append({
            "task": task,
            "context": context,
            "timestamp": timestamp.isoformat()
        })
        
        # Keep only recent sequences
        task_patterns["sequences"] = [
            seq for seq in task_patterns["sequences"]
            if datetime.fromisoformat(seq["timestamp"]) > timestamp - timedelta(days=30)
        ]
        
        task_patterns["last_updated"] = timestamp.isoformat()

    def _update_workflow_pattern(self, patterns: Dict, sequence: List[str], timestamp: datetime):
        """Update workflow sequence patterns."""
        if "workflow_patterns" not in patterns:
            patterns["workflow_patterns"] = {"sequences": {}, "last_updated": None}
            
        workflow = patterns["workflow_patterns"]
        
        # Convert sequence to tuple for hashing
        seq_key = tuple(sequence)
        
        if seq_key not in workflow["sequences"]:
            workflow["sequences"][seq_key] = 0
            
        workflow["sequences"][seq_key] += 1
        workflow["last_updated"] = timestamp.isoformat()

    def _get_time_based_suggestions(self, patterns: Dict, current_time: datetime) -> List[Dict]:
        """Get suggestions based on time patterns."""
        suggestions = []
        
        if "task_patterns" in patterns:
            hour = current_time.hour
            day = current_time.weekday()
            
            # Analyze time patterns
            time_tasks = {}
            for seq in patterns["task_patterns"]["sequences"]:
                task_time = datetime.fromisoformat(seq["timestamp"])
                task_key = (task_time.hour, task_time.weekday())
                
                if task_key not in time_tasks:
                    time_tasks[task_key] = []
                    
                time_tasks[task_key].append(seq["task"])
            
            # Find common tasks for current time
            current_key = (hour, day)
            if current_key in time_tasks:
                tasks = time_tasks[current_key]
                for task in set(tasks):
                    confidence = tasks.count(task) / len(tasks)
                    if confidence >= self.settings["min_pattern_confidence"]:
                        suggestions.append({
                            "type": "time_based",
                            "action": task,
                            "confidence": confidence,
                            "reason": f"You often do this at {hour:02d}:00"
                        })
        
        return suggestions

    def _get_workflow_suggestions(self, patterns: Dict, last_action: str) -> List[Dict]:
        """Get suggestions based on workflow patterns."""
        suggestions = []
        
        if "workflow_patterns" in patterns:
            sequences = patterns["workflow_patterns"]["sequences"]
            
            # Find sequences that start with last action
            matching_sequences = [
                (seq, count) for seq, count in sequences.items()
                if seq[0] == last_action
            ]
            
            # Calculate confidence for each next action
            next_actions = {}
            total_matches = sum(count for _, count in matching_sequences)
            
            for seq, count in matching_sequences:
                if len(seq) > 1:
                    next_action = seq[1]
                    if next_action not in next_actions:
                        next_actions[next_action] = 0
                    next_actions[next_action] += count
            
            # Add suggestions for likely next actions
            for action, count in next_actions.items():
                confidence = count / total_matches
                if confidence >= self.settings["min_pattern_confidence"]:
                    suggestions.append({
                        "type": "workflow",
                        "action": action,
                        "confidence": confidence,
                        "reason": "This usually follows your last action"
                    })
        
        return suggestions

    def _get_task_suggestions(self, patterns: Dict, context: Dict) -> List[Dict]:
        """Get suggestions based on common tasks and context."""
        suggestions = []
        
        if "task_patterns" in patterns:
            # Analyze task patterns in similar contexts
            context_tasks = {}
            total_matches = 0
            
            for seq in patterns["task_patterns"]["sequences"]:
                if self._context_matches(seq["context"], context):
                    task = seq["task"]
                    if task not in context_tasks:
                        context_tasks[task] = 0
                    context_tasks[task] += 1
                    total_matches += 1
            
            # Add suggestions for common tasks in this context
            if total_matches > 0:
                for task, count in context_tasks.items():
                    confidence = count / total_matches
                    if confidence >= self.settings["min_pattern_confidence"]:
                        suggestions.append({
                            "type": "context",
                            "action": task,
                            "confidence": confidence,
                            "reason": "You often do this in similar situations"
                        })
        
        return suggestions

    def _context_matches(self, pattern_context: Dict, current_context: Dict) -> bool:
        """Check if contexts match for pattern matching."""
        # Define matching criteria
        required_matches = ["class_id", "assignment_type"]
        optional_matches = ["student_id", "subject"]
        
        # Check required matches
        for key in required_matches:
            if key in pattern_context and key in current_context:
                if pattern_context[key] != current_context[key]:
                    return False
            else:
                return False
        
        # Check optional matches (if present)
        match_score = 0
        possible_matches = 0
        
        for key in optional_matches:
            if key in pattern_context and key in current_context:
                possible_matches += 1
                if pattern_context[key] == current_context[key]:
                    match_score += 1
        
        # Require at least 50% of optional matches if any exist
        return possible_matches == 0 or (match_score / possible_matches) >= 0.5

    def _load_patterns(self, teacher_id: str) -> Dict:
        """Load teacher patterns from storage."""
        try:
            pattern_file = self.data_path / f"{teacher_id}_patterns.json"
            if pattern_file.exists():
                with open(pattern_file, 'r') as f:
                    return json.load(f)
            return self.patterns.copy()

        except Exception as e:
            self.logger.error(f"Error loading patterns for teacher {teacher_id}", e)
            return self.patterns.copy()

    def _save_patterns(self, teacher_id: str, patterns: Dict):
        """Save teacher patterns to storage."""
        try:
            pattern_file = self.data_path / f"{teacher_id}_patterns.json"
            with open(pattern_file, 'w') as f:
                json.dump(patterns, f, indent=2)

        except Exception as e:
            self.logger.error(f"Error saving patterns for teacher {teacher_id}", e) 