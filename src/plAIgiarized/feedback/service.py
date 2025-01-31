from typing import Dict, List, Optional
import os
from datetime import datetime
import json
from ..models.essay import Essay

class FeedbackService:
    def __init__(self):
        self.base_path = "data/feedback"
        os.makedirs(self.base_path, exist_ok=True)
        
        # Feedback templates
        self.templates = {
            "ai_suspected": [
                "The writing style shows significant changes from previous work.",
                "The complexity level appears unusually advanced.",
                "Please discuss the writing process with the student."
            ],
            "improvement_needed": [
                "Focus on developing more complex sentence structures.",
                "Work on expanding vocabulary usage.",
                "Consider adding more detailed examples."
            ],
            "positive_progress": [
                "Shows consistent improvement in writing style.",
                "Demonstrates good use of vocabulary.",
                "Maintains clear and coherent structure."
            ]
        }

    def generate_feedback(self, essay: Essay, analysis_results: Dict) -> Dict[str, any]:
        """Generate structured feedback for an essay."""
        try:
            feedback = {
                "essay_id": essay.id,
                "student_id": essay.student_id,
                "generated_at": datetime.now().isoformat(),
                "comments": self._generate_comments(essay, analysis_results),
                "suggestions": self._generate_suggestions(essay, analysis_results),
                "improvement_areas": self._identify_improvement_areas(essay),
                "strengths": self._identify_strengths(essay)
            }
            
            # Save feedback
            self._save_feedback(feedback)
            
            return feedback
        except Exception as e:
            print(f"Error generating feedback: {e}")
            return {}

    def track_student_response(self, feedback_id: str, response: Dict) -> bool:
        """Track student's response to feedback."""
        try:
            response_data = {
                "feedback_id": feedback_id,
                "response_date": datetime.now().isoformat(),
                "acknowledgment": response.get("acknowledged", False),
                "action_items": response.get("action_items", []),
                "questions": response.get("questions", []),
                "comments": response.get("comments", "")
            }
            
            # Save response
            self._save_response(response_data)
            
            return True
        except Exception as e:
            print(f"Error tracking response: {e}")
            return False

    def get_feedback_history(self, student_id: str) -> List[Dict]:
        """Get feedback history for a student."""
        try:
            history = []
            feedback_dir = os.path.join(self.base_path, student_id)
            
            if not os.path.exists(feedback_dir):
                return history
                
            for filename in os.listdir(feedback_dir):
                if filename.endswith(".json"):
                    with open(os.path.join(feedback_dir, filename)) as f:
                        history.append(json.load(f))
            
            return sorted(history, key=lambda x: x["generated_at"], reverse=True)
        except Exception as e:
            print(f"Error getting feedback history: {e}")
            return []

    def _generate_comments(self, essay: Essay, analysis: Dict) -> List[str]:
        """Generate specific comments based on essay analysis."""
        comments = []
        
        # Check for AI usage
        if analysis.get("ai_probability", 0) > 0.7:
            comments.extend(self.templates["ai_suspected"])
        
        # Check grade level
        if essay.metrics["grade_level"] < analysis.get("expected_grade_level", 0):
            comments.extend(self.templates["improvement_needed"])
        
        # Check progress
        if analysis.get("showing_improvement", False):
            comments.extend(self.templates["positive_progress"])
        
        return comments

    def _generate_suggestions(self, essay: Essay, analysis: Dict) -> List[str]:
        """Generate improvement suggestions."""
        suggestions = []
        
        # Vocabulary suggestions
        if essay.metrics["vocabulary_size"] < 1000:
            suggestions.append("Consider using more varied vocabulary")
            
        # Complexity suggestions
        if essay.metrics["sentence_complexity"] < 5.0:
            suggestions.append("Try incorporating more complex sentence structures")
            
        # Style suggestions
        if essay.metrics["style_fingerprint"] < 7.0:
            suggestions.append("Work on developing a more consistent writing style")
        
        return suggestions

    def _identify_improvement_areas(self, essay: Essay) -> List[Dict]:
        """Identify specific areas needing improvement."""
        areas = []
        
        metrics = essay.metrics
        if metrics["grade_level"] < 8.0:
            areas.append({
                "area": "Grade Level",
                "current": metrics["grade_level"],
                "target": 8.0,
                "priority": "high"
            })
            
        if metrics["vocabulary_size"] < 1000:
            areas.append({
                "area": "Vocabulary",
                "current": metrics["vocabulary_size"],
                "target": 1000,
                "priority": "medium"
            })
            
        if metrics["sentence_complexity"] < 5.0:
            areas.append({
                "area": "Sentence Structure",
                "current": metrics["sentence_complexity"],
                "target": 5.0,
                "priority": "medium"
            })
        
        return areas

    def _identify_strengths(self, essay: Essay) -> List[str]:
        """Identify areas where the student is performing well."""
        strengths = []
        
        metrics = essay.metrics
        if metrics["grade_level"] >= 8.0:
            strengths.append("Strong grade-level writing")
            
        if metrics["vocabulary_size"] >= 1000:
            strengths.append("Good vocabulary usage")
            
        if metrics["sentence_complexity"] >= 5.0:
            strengths.append("Effective sentence structure")
            
        if metrics["style_fingerprint"] >= 7.0:
            strengths.append("Consistent writing style")
        
        return strengths

    def _save_feedback(self, feedback: Dict) -> None:
        """Save feedback to file."""
        try:
            student_id = feedback["student_id"]
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # Create student directory if it doesn't exist
            student_dir = os.path.join(self.base_path, student_id)
            os.makedirs(student_dir, exist_ok=True)
            
            # Save feedback
            filename = f"feedback_{timestamp}.json"
            path = os.path.join(student_dir, filename)
            
            with open(path, "w") as f:
                json.dump(feedback, f, indent=2, default=str)
        except Exception as e:
            print(f"Error saving feedback: {e}")

    def _save_response(self, response: Dict) -> None:
        """Save student response to file."""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"response_{timestamp}.json"
            path = os.path.join(self.base_path, "responses", filename)
            
            os.makedirs(os.path.join(self.base_path, "responses"), exist_ok=True)
            
            with open(path, "w") as f:
                json.dump(response, f, indent=2, default=str)
        except Exception as e:
            print(f"Error saving response: {e}")
