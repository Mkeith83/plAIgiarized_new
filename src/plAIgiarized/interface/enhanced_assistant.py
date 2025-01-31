import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
from typing import Dict, List, Optional
import threading
from datetime import datetime, timedelta
from ..logging.service import LoggingService
from ..analysis.service import AnalysisService
from ..student.service import StudentProgressService
from ..class.service import ClassProgressService

class EnhancedSmartAssistant:
    def __init__(self, parent=None):
        self.logger = LoggingService()
        self.analysis = AnalysisService()
        self.student_service = StudentProgressService()
        self.class_service = ClassProgressService()
        
        # Create assistant window
        self.window = tk.Toplevel(parent) if parent else tk.Tk()
        self.window.title("plAIgiarized Smart Assistant")
        self.window.geometry("800x700")
        
        # Assistant settings
        self.settings = {
            "alert_threshold": 0.85,
            "check_interval": 300,
            "max_suggestions": 5
        }
        
        self._create_enhanced_interface()
        self._start_monitoring()

    def _create_enhanced_interface(self):
        """Create enhanced smart assistant interface."""
        # Main container with two columns
        main = ttk.Frame(self.window, padding="10")
        main.pack(fill=tk.BOTH, expand=True)
        
        # Left column - Quick Actions
        left_frame = ttk.Frame(main)
        left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 5))
        
        # Quick Actions
        actions = ttk.LabelFrame(left_frame, text="Quick Actions", padding="10")
        actions.pack(fill=tk.X, pady=(0, 10))

        quick_actions = [
            ("📝 Grade Essays", self._assist_grading),
            ("🔍 Check for AI Usage", self._check_ai),
            ("📊 Generate Progress Report", self._generate_report),
            ("📈 Show Class Trends", self._show_trends),
            ("⚠️ View Important Alerts", self._show_alerts),
            ("❓ Get Help", self._show_help)
        ]

        for text, command in quick_actions:
            ttk.Button(
                actions,
                text=text,
                command=command,
                width=30
            ).pack(pady=2)

        # Context-aware suggestions
        suggestions = ttk.LabelFrame(left_frame, text="Smart Suggestions", padding="10")
        suggestions.pack(fill=tk.BOTH, expand=True, pady=(0, 10))

        self.suggestion_text = scrolledtext.ScrolledText(
            suggestions,
            wrap=tk.WORD,
            height=10,
            font=("Arial", 10)
        )
        self.suggestion_text.pack(fill=tk.BOTH, expand=True)
        self.suggestion_text.config(state=tk.DISABLED)

        # Right column - Help and Interaction
        right_frame = ttk.Frame(main)
        right_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(5, 0))

        # Quick Help Topics
        help_frame = ttk.LabelFrame(right_frame, text="Need Help With...", padding="10")
        help_frame.pack(fill=tk.X, pady=(0, 10))

        help_topics = [
            "How to upload essays",
            "Understanding AI detection",
            "Reading progress reports",
            "Adding to student baseline",
            "Batch processing papers"
        ]

        for topic in help_topics:
            ttk.Button(
                help_frame,
                text=topic,
                command=lambda t=topic: self._show_topic_help(t)
            ).pack(fill=tk.X, pady=1)

        # Interactive Help
        interact_frame = ttk.LabelFrame(right_frame, text="Ask for Help", padding="10")
        interact_frame.pack(fill=tk.BOTH, expand=True)

        self.help_text = scrolledtext.ScrolledText(
            interact_frame,
            wrap=tk.WORD,
            height=10,
            font=("Arial", 10)
        )
        self.help_text.pack(fill=tk.BOTH, expand=True, pady=(0, 5))

        # Help input
        input_frame = ttk.Frame(interact_frame)
        input_frame.pack(fill=tk.X)

        self.help_input = ttk.Entry(input_frame)
        self.help_input.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 5))
        self.help_input.bind("<Return>", lambda e: self._process_help_request())

        ttk.Button(
            input_frame,
            text="Ask",
            command=self._process_help_request
        ).pack(side=tk.RIGHT)

        # Status bar
        self.status_var = tk.StringVar(value="Ready to help!")
        status = ttk.Label(
            main,
            textvariable=self.status_var,
            font=("Arial", 9)
        )
        status.pack(fill=tk.X, pady=(5, 0))

    def _process_help_request(self):
        """Process help requests with context-aware responses."""
        question = self.help_input.get().strip()
        if not question:
            return

        self._add_to_help_text(f"You: {question}\n")
        self.help_input.delete(0, tk.END)

        # Generate contextual response
        response = self._generate_help_response(question)
        self._add_to_help_text(f"Assistant: {response}\n\n")

    def _generate_help_response(self, question: str) -> str:
        """Generate context-aware help response."""
        # Add intelligence to understand and respond to questions
        question_lower = question.lower()
        
        if "upload" in question_lower or "submit" in question_lower:
            return ("To upload essays:\n"
                   "1. Click '📝 Grade Essays'\n"
                   "2. Select files or drag them in\n"
                   "3. The system will automatically process them\n"
                   "Need more details about a specific step?")
                   
        elif "ai" in question_lower or "detect" in question_lower:
            return ("AI detection works by:\n"
                   "1. Analyzing writing patterns\n"
                   "2. Comparing to student baselines\n"
                   "3. Using multiple detection methods\n"
                   "Would you like me to check some essays now?")
                   
        elif "report" in question_lower or "progress" in question_lower:
            return ("I can generate several reports:\n"
                   "1. Individual student progress\n"
                   "2. Class-wide trends\n"
                   "3. Writing improvement metrics\n"
                   "Which would you like to see?")
                   
        elif "baseline" in question_lower:
            return ("To add to a student's baseline:\n"
                   "1. Select verified student work\n"
                   "2. Click 'Add to Baseline'\n"
                   "3. The system will update their profile\n"
                   "Should I help you add some work now?")
                   
        else:
            return ("I can help with:\n"
                   "• Uploading and processing essays\n"
                   "• Checking for AI usage\n"
                   "• Generating reports\n"
                   "• Managing student baselines\n"
                   "What would you like to know more about?")

    def _add_to_help_text(self, text: str):
        """Add text to help area."""
        self.help_text.config(state=tk.NORMAL)
        self.help_text.insert(tk.END, text)
        self.help_text.see(tk.END)
        self.help_text.config(state=tk.DISABLED)

    def _show_topic_help(self, topic: str):
        """Show help for specific topic."""
        response = self._generate_help_response(topic)
        self._add_to_help_text(f"Help for: {topic}\n{response}\n\n")

    # ... (rest of the original SmartAssistant methods remain the same) 