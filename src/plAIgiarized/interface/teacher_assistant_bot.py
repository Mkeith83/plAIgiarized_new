import tkinter as tk
from tkinter import ttk, scrolledtext
from typing import Dict, List, Optional
import json
from datetime import datetime
from ..logging.service import LoggingService
from ..analysis.service import AnalysisService
from ..student.service import StudentProgressService
from ..class.service import ClassProgressService

class TeacherAssistantBot:
    def __init__(self, parent=None):
        self.logger = LoggingService()
        self.analysis = AnalysisService()
        self.student_service = StudentProgressService()
        self.class_service = ClassProgressService()
        
        # Create bot window
        self.window = tk.Toplevel(parent) if parent else tk.Tk()
        self.window.title("Teaching Assistant Bot")
        self.window.geometry("400x700")
        
        # Knowledge base for common queries
        self.knowledge_base = {
            "upload": {
                "keywords": ["upload", "submit", "add", "essays", "papers", "assignments"],
                "response": "To upload essays:\n1. Click '📄 Upload Essays'\n2. Drag files or click to select\n3. The system will automatically sort them to the right students!"
            },
            "handwriting": {
                "keywords": ["handwriting", "scan", "written", "paper", "image"],
                "response": "To process handwritten work:\n1. Click '📸 Scan Handwritten Work'\n2. Upload images or use camera\n3. I'll convert it to text and analyze it!"
            },
            "ai_detection": {
                "keywords": ["ai", "chatgpt", "detection", "artificial", "generated"],
                "response": "I can help check for AI usage by:\n1. Analyzing writing patterns\n2. Comparing to student baselines\n3. Checking against multiple AI detectors\nWould you like me to check some essays?"
            },
            "reports": {
                "keywords": ["report", "progress", "improvement", "trends", "analysis"],
                "response": "I can generate several reports:\n1. Individual student progress\n2. Class-wide trends\n3. Writing improvement metrics\nWhich would you like to see?"
            },
            "help": {
                "keywords": ["help", "how", "what", "guide", "tutorial"],
                "response": "I can help with:\n1. Essay uploads and processing\n2. AI detection\n3. Progress tracking\n4. Report generation\n5. Writing analysis\nWhat would you like to know more about?"
            }
        }
        
        self._create_interface()

    def _create_interface(self):
        """Create chat interface."""
        # Main container
        main = ttk.Frame(self.window, padding="10")
        main.pack(fill=tk.BOTH, expand=True)

        # Chat history
        self.chat_history = scrolledtext.ScrolledText(
            main,
            wrap=tk.WORD,
            height=20,
            font=("Arial", 10)
        )
        self.chat_history.pack(fill=tk.BOTH, expand=True, pady=(0, 10))
        self.chat_history.config(state=tk.DISABLED)

        # Quick questions
        questions_frame = ttk.LabelFrame(main, text="Quick Questions", padding="5")
        questions_frame.pack(fill=tk.X, pady=(0, 10))

        quick_questions = [
            "How do I upload essays?",
            "Check for AI usage",
            "Show student progress",
            "Generate reports",
            "Help with grading"
        ]

        for question in quick_questions:
            ttk.Button(
                questions_frame,
                text=question,
                command=lambda q=question: self._handle_quick_question(q)
            ).pack(fill=tk.X, pady=1)

        # Input area
        input_frame = ttk.Frame(main)
        input_frame.pack(fill=tk.X)

        self.input_field = ttk.Entry(
            input_frame,
            font=("Arial", 10)
        )
        self.input_field.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 5))
        self.input_field.bind("<Return>", lambda e: self._handle_input())

        ttk.Button(
            input_frame,
            text="Send",
            command=self._handle_input
        ).pack(side=tk.RIGHT)

        # Start with welcome message
        self._add_bot_message(
            "Hello! I'm your teaching assistant. I can help you with:\n"
            "• Uploading and processing essays\n"
            "• Checking for AI usage\n"
            "• Tracking student progress\n"
            "• Generating reports\n"
            "• And much more!\n\n"
            "What can I help you with today?"
        )

    def _handle_input(self):
        """Process user input."""
        user_input = self.input_field.get().strip()
        if not user_input:
            return

        # Add user message to chat
        self._add_user_message(user_input)
        self.input_field.delete(0, tk.END)

        # Generate and add response
        response = self._generate_response(user_input)
        self._add_bot_message(response)

    def _generate_response(self, user_input: str) -> str:
        """Generate contextual response."""
        try:
            # Check knowledge base first
            for topic, data in self.knowledge_base.items():
                if any(keyword in user_input.lower() for keyword in data["keywords"]):
                    return data["response"]

            # Handle specific queries
            if "grade" in user_input.lower():
                return self._handle_grading_query(user_input)
            elif "compare" in user_input.lower():
                return self._handle_comparison_query(user_input)
            elif "improve" in user_input.lower():
                return self._handle_improvement_query(user_input)
            elif "explain" in user_input.lower():
                return self._handle_explanation_query(user_input)
            
            # Default response with suggestion
            return (
                "I'm not sure about that specific query. Would you like to:\n"
                "1. Upload and analyze essays?\n"
                "2. Check student progress?\n"
                "3. Generate reports?\n"
                "4. Get help with something else?\n\n"
                "Just let me know what you'd like to do!"
            )

        except Exception as e:
            self.logger.error("Error generating response", e)
            return "I apologize, but I encountered an error. Please try rephrasing your question."

    def _handle_grading_query(self, query: str) -> str:
        """Handle grading-related queries."""
        return (
            "I can help with grading by:\n"
            "1. Analyzing writing quality\n"
            "2. Comparing to previous work\n"
            "3. Suggesting grade ranges\n"
            "4. Highlighting key points\n\n"
            "Would you like me to help grade some essays?"
        )

    def _handle_comparison_query(self, query: str) -> str:
        """Handle comparison-related queries."""
        return (
            "I can compare:\n"
            "1. Current vs. previous essays\n"
            "2. Student vs. class average\n"
            "3. Writing style changes\n"
            "4. Progress over time\n\n"
            "What would you like to compare?"
        )

    def _handle_improvement_query(self, query: str) -> str:
        """Handle improvement-related queries."""
        return (
            "I can help track improvement in:\n"
            "1. Writing quality\n"
            "2. Vocabulary usage\n"
            "3. Grammar and syntax\n"
            "4. Overall grade level\n\n"
            "Which area would you like to focus on?"
        )

    def _handle_explanation_query(self, query: str) -> str:
        """Handle explanation-related queries."""
        return (
            "I can explain:\n"
            "1. AI detection results\n"
            "2. Writing analysis metrics\n"
            "3. Progress reports\n"
            "4. System features\n\n"
            "What would you like me to explain?"
        )

    def _add_user_message(self, message: str):
        """Add user message to chat history."""
        self.chat_history.config(state=tk.NORMAL)
        self.chat_history.insert(tk.END, "\nYou: ", "user")
        self.chat_history.insert(tk.END, f"{message}\n")
        self.chat_history.see(tk.END)
        self.chat_history.config(state=tk.DISABLED)

    def _add_bot_message(self, message: str):
        """Add bot message to chat history."""
        self.chat_history.config(state=tk.NORMAL)
        self.chat_history.insert(tk.END, "\nAssistant: ", "bot")
        self.chat_history.insert(tk.END, f"{message}\n")
        self.chat_history.see(tk.END)
        self.chat_history.config(state=tk.DISABLED)

    def _handle_quick_question(self, question: str):
        """Handle quick question button clicks."""
        self._add_user_message(question)
        response = self._generate_response(question)
        self._add_bot_message(response)

    def run(self):
        """Start the bot interface."""
        self.window.mainloop()

    def destroy(self):
        """Clean up resources."""
        self.window.destroy() 