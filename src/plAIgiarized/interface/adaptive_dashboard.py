import tkinter as tk
from tkinter import ttk, messagebox
from typing import Dict, List, Optional
import json
from datetime import datetime, timedelta
from ..learning.teacher_preferences import TeacherPreferencesService
from ..logging.service import LoggingService

class AdaptiveDashboard:
    def __init__(self, parent=None, teacher_id: str = None):
        self.logger = LoggingService()
        self.preferences = TeacherPreferencesService()
        self.teacher_id = teacher_id
        
        # Create dashboard window
        self.window = tk.Toplevel(parent) if parent else tk.Tk()
        self.window.title("My Teaching Dashboard")
        self.window.geometry("1200x800")
        
        # Widget tracking
        self.widgets = {
            "grade_essays": {"uses": 0, "last_used": None, "position": None},
            "ai_detection": {"uses": 0, "last_used": None, "position": None},
            "student_progress": {"uses": 0, "last_used": None, "position": None},
            "class_overview": {"uses": 0, "last_used": None, "position": None},
            "recent_alerts": {"uses": 0, "last_used": None, "position": None},
            "quick_actions": {"uses": 0, "last_used": None, "position": None},
            "reports": {"uses": 0, "last_used": None, "position": None},
            "handwriting_scan": {"uses": 0, "last_used": None, "position": None}
        }
        
        # Layout settings
        self.layout = {
            "columns": 3,
            "padding": 10,
            "widget_height": 200,
            "min_uses": 5  # Minimum uses before adapting
        }
        
        self._create_interface()
        self._load_preferences()
        self._start_learning()

    def _create_interface(self):
        """Create adaptive dashboard interface."""
        # Main container with grid
        self.main = ttk.Frame(self.window, padding="10")
        self.main.pack(fill=tk.BOTH, expand=True)

        # Customization button
        customize_frame = ttk.Frame(self.main)
        customize_frame.pack(fill=tk.X, pady=(0, 10))

        ttk.Button(
            customize_frame,
            text="🎨 Customize Dashboard",
            command=self._show_customization
        ).pack(side=tk.LEFT)

        ttk.Button(
            customize_frame,
            text="↺ Reset Layout",
            command=self._reset_layout
        ).pack(side=tk.LEFT, padx=5)

        # Auto-adapt toggle
        self.adapt_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(
            customize_frame,
            text="Auto-adapt to my usage",
            variable=self.adapt_var,
            command=self._toggle_adaptation
        ).pack(side=tk.LEFT, padx=5)

        # Create grid for widgets
        self.grid_frame = ttk.Frame(self.main)
        self.grid_frame.pack(fill=tk.BOTH, expand=True)

        # Initialize widgets in default positions
        self._create_widgets()

    def _create_widgets(self):
        """Create all dashboard widgets."""
        # Clear existing widgets
        for widget in self.grid_frame.winfo_children():
            widget.destroy()

        # Create and position widgets based on current layout
        self._create_grade_essays_widget()
        self._create_ai_detection_widget()
        self._create_student_progress_widget()
        self._create_class_overview_widget()
        self._create_alerts_widget()
        self._create_quick_actions_widget()
        self._create_reports_widget()
        self._create_handwriting_widget()

        # Apply current layout
        self._apply_layout()

    def _create_grade_essays_widget(self):
        """Create grade essays widget."""
        frame = ttk.LabelFrame(self.grid_frame, text="Grade Essays", padding="10")
        
        # Quick upload button
        ttk.Button(
            frame,
            text="📝 Upload Essays",
            command=lambda: self._track_usage("grade_essays")
        ).pack(fill=tk.X, pady=2)

        # Recent essays list
        recent_frame = ttk.Frame(frame)
        recent_frame.pack(fill=tk.BOTH, expand=True, pady=(5, 0))

        ttk.Label(
            recent_frame,
            text="Recent Uploads:"
        ).pack(anchor=tk.W)

        listbox = tk.Listbox(recent_frame, height=5)
        listbox.pack(fill=tk.BOTH, expand=True)

        self.widgets["grade_essays"]["widget"] = frame

    def _create_ai_detection_widget(self):
        """Create AI detection widget."""
        frame = ttk.LabelFrame(self.grid_frame, text="AI Detection", padding="10")
        
        # Status overview
        ttk.Label(
            frame,
            text="Recent AI Detection Results"
        ).pack(anchor=tk.W)

        # Results chart placeholder
        chart_frame = ttk.Frame(frame, height=100)
        chart_frame.pack(fill=tk.X, pady=5)
        chart_frame.pack_propagate(False)

        # Quick scan button
        ttk.Button(
            frame,
            text="🔍 Scan New Essays",
            command=lambda: self._track_usage("ai_detection")
        ).pack(fill=tk.X)

        self.widgets["ai_detection"]["widget"] = frame

    def _create_student_progress_widget(self):
        """Create student progress widget."""
        frame = ttk.LabelFrame(self.grid_frame, text="Student Progress", padding="10")
        
        # Student selection
        select_frame = ttk.Frame(frame)
        select_frame.pack(fill=tk.X, pady=(0, 5))

        ttk.Label(
            select_frame,
            text="Student:"
        ).pack(side=tk.LEFT)

        ttk.Combobox(
            select_frame,
            width=30
        ).pack(side=tk.LEFT, padx=5)

        # Progress chart placeholder
        chart_frame = ttk.Frame(frame, height=100)
        chart_frame.pack(fill=tk.BOTH, expand=True)
        chart_frame.pack_propagate(False)

        self.widgets["student_progress"]["widget"] = frame

    def _apply_layout(self):
        """Apply current layout to widgets."""
        # Sort widgets by usage if auto-adapt is on
        if self.adapt_var.get():
            sorted_widgets = sorted(
                self.widgets.items(),
                key=lambda x: (x[1]["uses"], x[1]["last_used"] or datetime.min),
                reverse=True
            )
        else:
            # Use saved positions or default order
            sorted_widgets = sorted(
                self.widgets.items(),
                key=lambda x: x[1]["position"] or float('inf')
            )

        # Position widgets in grid
        row = 0
        col = 0
        for name, data in sorted_widgets:
            if "widget" in data:
                data["widget"].grid(
                    row=row,
                    column=col,
                    padx=self.layout["padding"],
                    pady=self.layout["padding"],
                    sticky="nsew"
                )
                
                # Configure grid weights
                self.grid_frame.grid_columnconfigure(col, weight=1)
                self.grid_frame.grid_rowconfigure(row, weight=1)

                # Update position
                col += 1
                if col >= self.layout["columns"]:
                    col = 0
                    row += 1

    def _track_usage(self, widget_name: str):
        """Track widget usage for adaptation."""
        if widget_name in self.widgets:
            self.widgets[widget_name]["uses"] += 1
            self.widgets[widget_name]["last_used"] = datetime.now()
            
            # Save to preferences
            self._save_preferences()
            
            # Adapt layout if enabled and minimum uses reached
            if self.adapt_var.get() and \
               self.widgets[widget_name]["uses"] >= self.layout["min_uses"]:
                self._adapt_layout()

    def _adapt_layout(self):
        """Adapt layout based on usage patterns."""
        if not self.adapt_var.get():
            return

        # Reapply layout with current usage data
        self._apply_layout()
        
        # Notify teacher of adaptation
        self.status_var.set("Dashboard adapted to your usage patterns")

    def _show_customization(self):
        """Show customization dialog."""
        dialog = tk.Toplevel(self.window)
        dialog.title("Customize Dashboard")
        dialog.geometry("400x600")

        # Create draggable widget list
        ttk.Label(
            dialog,
            text="Drag widgets to reorder:",
            font=("Arial", 10, "bold")
        ).pack(pady=10)

        listbox = tk.Listbox(dialog, selectmode=tk.SINGLE)
        listbox.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)

        for name in self.widgets:
            listbox.insert(tk.END, name.replace("_", " ").title())

        # Add move buttons
        btn_frame = ttk.Frame(dialog)
        btn_frame.pack(fill=tk.X, padx=10, pady=5)

        ttk.Button(
            btn_frame,
            text="Move Up",
            command=lambda: self._move_widget(listbox, -1)
        ).pack(side=tk.LEFT, padx=5)

        ttk.Button(
            btn_frame,
            text="Move Down",
            command=lambda: self._move_widget(listbox, 1)
        ).pack(side=tk.LEFT)

        # Apply button
        ttk.Button(
            dialog,
            text="Apply Changes",
            command=lambda: self._apply_customization(listbox, dialog)
        ).pack(pady=10)

    def _move_widget(self, listbox: tk.Listbox, direction: int):
        """Move widget in customization list."""
        selection = listbox.curselection()
        if not selection:
            return

        index = selection[0]
        if direction == -1 and index > 0:
            # Move up
            text = listbox.get(index)
            listbox.delete(index)
            listbox.insert(index-1, text)
            listbox.selection_set(index-1)
        elif direction == 1 and index < listbox.size()-1:
            # Move down
            text = listbox.get(index)
            listbox.delete(index)
            listbox.insert(index+1, text)
            listbox.selection_set(index+1)

    def _apply_customization(self, listbox: tk.Listbox, dialog: tk.Toplevel):
        """Apply customization changes."""
        # Update widget positions
        for i in range(listbox.size()):
            name = listbox.get(i).lower().replace(" ", "_")
            if name in self.widgets:
                self.widgets[name]["position"] = i

        # Save preferences
        self._save_preferences()

        # Reapply layout
        self._apply_layout()

        # Close dialog
        dialog.destroy()

    def _save_preferences(self):
        """Save current preferences."""
        if not self.teacher_id:
            return

        preferences = {
            "widgets": self.widgets,
            "layout": self.layout,
            "auto_adapt": self.adapt_var.get()
        }

        self.preferences.learn_from_interaction(
            self.teacher_id,
            {
                "type": "dashboard_update",
                "preferences": preferences
            }
        )

    def _load_preferences(self):
        """Load saved preferences."""
        if not self.teacher_id:
            return

        try:
            suggestions = self.preferences.get_suggestions(
                self.teacher_id,
                {"context": "dashboard_layout"}
            )

            if suggestions:
                # Apply most confident suggestion
                suggestion = suggestions[0]
                if "preferences" in suggestion:
                    saved_prefs = suggestion["preferences"]
                    self.widgets.update(saved_prefs.get("widgets", {}))
                    self.layout.update(saved_prefs.get("layout", {}))
                    self.adapt_var.set(saved_prefs.get("auto_adapt", True))

        except Exception as e:
            self.logger.error("Error loading preferences", e)

    def _start_learning(self):
        """Start dashboard learning process."""
        def check_patterns():
            if self.adapt_var.get():
                current_time = datetime.now()
                
                # Check for usage patterns
                for name, data in self.widgets.items():
                    if data["last_used"]:
                        time_diff = current_time - data["last_used"]
                        if time_diff < timedelta(minutes=30):
                            # Recent usage, might need adaptation
                            self._adapt_layout()
                            break

            # Schedule next check
            self.window.after(60000, check_patterns)  # Check every minute

        # Start initial check
        self.window.after(1000, check_patterns)

    def run(self):
        """Start the dashboard."""
        self.window.mainloop()

    def destroy(self):
        """Clean up resources."""
        self._save_preferences()
        self.window.destroy() 