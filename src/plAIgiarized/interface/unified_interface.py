import tkinter as tk
from tkinter import ttk, messagebox
from typing import Dict, List, Optional
from .enhanced_assistant import EnhancedSmartAssistant
from .teacher_assistant_bot import TeacherAssistantBot
from ..logging.service import LoggingService

class UnifiedInterface:
    def __init__(self):
        self.logger = LoggingService()
        
        # Create main window
        self.root = tk.Tk()
        self.root.title("plAIgiarized Teaching Assistant")
        self.root.geometry("1200x800")
        
        # Initialize components
        self.smart_assistant = None
        self.teacher_bot = None
        self.current_view = None
        
        # Shared context for both assistants
        self.shared_context = {
            "current_class": None,
            "current_student": None,
            "recent_actions": [],
            "active_tasks": [],
            "preferences": {}
        }
        
        self._create_interface()
        self._load_user_preferences()

    def _create_interface(self):
        """Create unified interface."""
        # Main container
        main = ttk.Frame(self.root, padding="10")
        main.pack(fill=tk.BOTH, expand=True)

        # Top bar with mode selection
        mode_frame = ttk.Frame(main)
        mode_frame.pack(fill=tk.X, pady=(0, 10))

        # Mode toggle
        ttk.Label(
            mode_frame,
            text="Choose Your Assistant:",
            font=("Arial", 12, "bold")
        ).pack(side=tk.LEFT, padx=(0, 10))

        # Smart Assistant button
        self.smart_btn = ttk.Button(
            mode_frame,
            text="📊 Smart Assistant",
            command=self._show_smart_assistant,
            width=20
        )
        self.smart_btn.pack(side=tk.LEFT, padx=5)

        # Bot Assistant button
        self.bot_btn = ttk.Button(
            mode_frame,
            text="💬 Chat Assistant",
            command=self._show_teacher_bot,
            width=20
        )
        self.bot_btn.pack(side=tk.LEFT, padx=5)

        # Use Both button
        self.both_btn = ttk.Button(
            mode_frame,
            text="🔄 Use Both",
            command=self._show_both,
            width=20
        )
        self.both_btn.pack(side=tk.LEFT, padx=5)

        # Quick preferences
        pref_frame = ttk.Frame(mode_frame)
        pref_frame.pack(side=tk.RIGHT)

        # Remember choice checkbox
        self.remember_var = tk.BooleanVar(value=False)
        ttk.Checkbutton(
            pref_frame,
            text="Remember my choice",
            variable=self.remember_var,
            command=self._save_preferences
        ).pack(side=tk.RIGHT)

        # Main content area
        self.content_frame = ttk.Frame(main)
        self.content_frame.pack(fill=tk.BOTH, expand=True)

        # Status bar
        self.status_var = tk.StringVar(value="Welcome! Choose your preferred assistant mode.")
        status = ttk.Label(
            main,
            textvariable=self.status_var,
            font=("Arial", 9)
        )
        status.pack(fill=tk.X, pady=(5, 0))

    def _show_smart_assistant(self):
        """Show only Smart Assistant."""
        self._clear_content()
        if not self.smart_assistant:
            self.smart_assistant = EnhancedSmartAssistant(self.content_frame)
        
        self.current_view = "smart"
        self.status_var.set("Using Smart Assistant mode")
        self._update_buttons()
        self._save_preferences()

    def _show_teacher_bot(self):
        """Show only Teacher Bot."""
        self._clear_content()
        if not self.teacher_bot:
            self.teacher_bot = TeacherAssistantBot(self.content_frame)
        
        self.current_view = "bot"
        self.status_var.set("Using Chat Assistant mode")
        self._update_buttons()
        self._save_preferences()

    def _show_both(self):
        """Show both assistants side by side."""
        self._clear_content()
        
        # Create left and right frames
        left_frame = ttk.Frame(self.content_frame)
        left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 5))
        
        right_frame = ttk.Frame(self.content_frame)
        right_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(5, 0))

        # Initialize both assistants if needed
        if not self.smart_assistant:
            self.smart_assistant = EnhancedSmartAssistant(left_frame)
        if not self.teacher_bot:
            self.teacher_bot = TeacherAssistantBot(right_frame)

        self.current_view = "both"
        self.status_var.set("Using both assistants - They'll work together!")
        self._update_buttons()
        self._save_preferences()

    def _clear_content(self):
        """Clear current content."""
        for widget in self.content_frame.winfo_children():
            widget.destroy()

    def _update_buttons(self):
        """Update button states."""
        buttons = {
            "smart": self.smart_btn,
            "bot": self.bot_btn,
            "both": self.both_btn
        }
        
        for mode, button in buttons.items():
            if mode == self.current_view:
                button.state(['disabled'])
            else:
                button.state(['!disabled'])

    def _save_preferences(self):
        """Save user preferences."""
        if self.remember_var.get() and self.current_view:
            self.shared_context["preferences"]["default_mode"] = self.current_view
            # Save to file or database
            self.logger.info(f"Saved preference: {self.current_view}")

    def _load_user_preferences(self):
        """Load user preferences."""
        try:
            # Load from file or database
            default_mode = self.shared_context["preferences"].get("default_mode")
            if default_mode == "smart":
                self._show_smart_assistant()
            elif default_mode == "bot":
                self._show_teacher_bot()
            elif default_mode == "both":
                self._show_both()
        except Exception as e:
            self.logger.error("Error loading preferences", e)

    def _sync_context(self):
        """Sync context between assistants."""
        if self.smart_assistant and self.teacher_bot:
            # Share relevant context between assistants
            if self.current_view == "both":
                self.smart_assistant.shared_context = self.shared_context
                self.teacher_bot.shared_context = self.shared_context

    def run(self):
        """Start the unified interface."""
        self.root.mainloop()

    def destroy(self):
        """Clean up resources."""
        if self.smart_assistant:
            self.smart_assistant.destroy()
        if self.teacher_bot:
            self.teacher_bot.destroy()
        self.root.destroy() 