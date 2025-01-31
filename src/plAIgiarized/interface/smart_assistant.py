import tkinter as tk
from tkinter import ttk, messagebox
from typing import Dict, List, Optional
import threading
from datetime import datetime, timedelta
from ..logging.service import LoggingService
from ..analysis.service import AnalysisService
from ..student.service import StudentProgressService
from ..class.service import ClassProgressService

class SmartAssistant:
    def __init__(self, parent=None):
        self.logger = LoggingService()
        self.analysis = AnalysisService()
        self.student_service = StudentProgressService()
        self.class_service = ClassProgressService()
        
        # Create assistant window
        self.window = tk.Toplevel(parent) if parent else tk.Tk()
        self.window.title("plAIgiarized Assistant")
        self.window.geometry("400x600")
        
        # Assistant settings
        self.settings = {
            "alert_threshold": 0.85,  # High confidence for alerts
            "check_interval": 300,  # 5 minutes
            "max_suggestions": 5
        }
        
        self._create_interface()
        self._start_monitoring()

    def _create_interface(self):
        """Create smart assistant interface."""
        # Main container
        main = ttk.Frame(self.window, padding="10")
        main.pack(fill=tk.BOTH, expand=True)

        # Quick Actions
        actions = ttk.LabelFrame(main, text="I can help you...", padding="10")
        actions.pack(fill=tk.X, pady=(0, 10))

        quick_actions = [
            ("📝 Grade Essays", self._assist_grading),
            ("🔍 Check for AI Usage", self._check_ai),
            ("📊 Generate Progress Report", self._generate_report),
            ("📈 Show Class Trends", self._show_trends),
            ("⚠️ View Important Alerts", self._show_alerts)
        ]

        for text, command in quick_actions:
            ttk.Button(
                actions,
                text=text,
                command=command,
                width=30
            ).pack(pady=2)

        # Smart Suggestions
        suggestions = ttk.LabelFrame(main, text="Suggestions", padding="10")
        suggestions.pack(fill=tk.BOTH, expand=True, pady=(0, 10))

        self.suggestion_text = tk.Text(
            suggestions,
            wrap=tk.WORD,
            height=10,
            font=("Arial", 10)
        )
        self.suggestion_text.pack(fill=tk.BOTH, expand=True)
        self.suggestion_text.config(state=tk.DISABLED)

        # Status
        self.status_var = tk.StringVar(value="Ready to help!")
        status = ttk.Label(
            main,
            textvariable=self.status_var,
            font=("Arial", 9)
        )
        status.pack(fill=tk.X)

    def _assist_grading(self):
        """Smart grading assistance."""
        try:
            self.status_var.set("Analyzing essays...")
            
            def process():
                # Get ungraded essays
                ungraded = self._get_ungraded_essays()
                
                if not ungraded:
                    self._update_suggestions("All essays are graded! 🎉")
                    return

                # Analyze and suggest grades
                suggestions = []
                for essay in ungraded:
                    analysis = self.analysis._analyze_text(essay["content"])
                    baseline = self.student_service._get_student_baseline(essay["student_id"])
                    
                    suggestion = self._generate_grading_suggestion(
                        essay, analysis, baseline
                    )
                    suggestions.append(suggestion)

                self._update_suggestions("\n\n".join(suggestions))
                self.status_var.set("Grading suggestions ready!")

            threading.Thread(target=process).start()

        except Exception as e:
            self.logger.error("Error in grading assistance", e)
            self.status_var.set("Error generating grading suggestions")

    def _check_ai(self):
        """Smart AI usage detection."""
        try:
            self.status_var.set("Checking for AI usage...")
            
            def process():
                recent_essays = self._get_recent_essays()
                alerts = []

                for essay in recent_essays:
                    analysis = self.analysis._analyze_text(essay["content"])
                    if analysis["ai_probability"] > self.settings["alert_threshold"]:
                        alerts.append(
                            f"⚠️ High AI probability ({analysis['ai_probability']:.1%}) "
                            f"in {essay['student_name']}'s essay"
                        )

                if alerts:
                    self._update_suggestions("\n".join(alerts))
                else:
                    self._update_suggestions("No suspicious AI usage detected! ✅")
                
                self.status_var.set("AI check complete!")

            threading.Thread(target=process).start()

        except Exception as e:
            self.logger.error("Error in AI check", e)
            self.status_var.set("Error checking AI usage")

    def _generate_report(self):
        """Generate smart progress report."""
        try:
            self.status_var.set("Generating report...")
            
            def process():
                # Get class data
                class_data = self.class_service.analyze_class_progress(
                    self.current_class_id
                )
                
                # Generate insights
                insights = [
                    "📊 Class Progress Report",
                    "-------------------",
                    f"Class Average: {class_data['average_grade_level']:.1f}",
                    f"Most Improved: {class_data['most_improved_student']}",
                    f"Areas of Strength: {', '.join(class_data['strengths'])}",
                    f"Areas for Focus: {', '.join(class_data['areas_for_improvement'])}",
                    "\nRecommended Actions:",
                ]
                
                for action in class_data["recommended_actions"][:3]:
                    insights.append(f"• {action}")

                self._update_suggestions("\n".join(insights))
                self.status_var.set("Report ready!")

            threading.Thread(target=process).start()

        except Exception as e:
            self.logger.error("Error generating report", e)
            self.status_var.set("Error generating report")

    def _show_trends(self):
        """Show important class trends."""
        try:
            self.status_var.set("Analyzing trends...")
            
            def process():
                trends = self.class_service._analyze_class_trends(
                    self.current_class_id
                )
                
                insights = [
                    "📈 Recent Trends",
                    "-------------",
                    f"Vocabulary Growth: {trends['vocabulary_trend']}",
                    f"Writing Complexity: {trends['complexity_trend']}",
                    f"Overall Progress: {trends['progress_trend']}",
                    "\nNotable Changes:",
                ]
                
                for change in trends["notable_changes"]:
                    insights.append(f"• {change}")

                self._update_suggestions("\n".join(insights))
                self.status_var.set("Trends analysis complete!")

            threading.Thread(target=process).start()

        except Exception as e:
            self.logger.error("Error showing trends", e)
            self.status_var.set("Error analyzing trends")

    def _show_alerts(self):
        """Show important alerts."""
        try:
            alerts = self._get_important_alerts()
            if alerts:
                self._update_suggestions("\n\n".join(alerts))
            else:
                self._update_suggestions("No important alerts at this time! ✅")
            
            self.status_var.set("Alerts updated!")

        except Exception as e:
            self.logger.error("Error showing alerts", e)
            self.status_var.set("Error showing alerts")

    def _update_suggestions(self, text: str):
        """Update suggestions text safely."""
        self.suggestion_text.config(state=tk.NORMAL)
        self.suggestion_text.delete(1.0, tk.END)
        self.suggestion_text.insert(1.0, text)
        self.suggestion_text.config(state=tk.DISABLED)

    def _start_monitoring(self):
        """Start background monitoring."""
        def check_for_updates():
            try:
                alerts = self._get_important_alerts()
                if alerts:
                    self.window.bell()  # Gentle notification
                    self._show_alerts()
            except Exception as e:
                self.logger.error("Error in background monitoring", e)
            finally:
                self.window.after(
                    self.settings["check_interval"] * 1000,
                    check_for_updates
                )

        self.window.after(1000, check_for_updates)

    def run(self):
        """Start the assistant."""
        self.window.mainloop()

    def destroy(self):
        """Clean up resources."""
        self.window.destroy() 