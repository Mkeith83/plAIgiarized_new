import tkinter as tk
from tkinter import ttk, messagebox
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import pandas as pd
from typing import Dict, List
from datetime import datetime, timedelta
from ..student.service import StudentProgressService
from ..class.service import ClassProgressService
from ..analysis.service import AnalysisService

class DashboardInterface:
    def __init__(self, root=None):
        self.student_service = StudentProgressService()
        self.class_service = ClassProgressService()
        self.analysis_service = AnalysisService()
        
        # Create main window if not provided
        if root is None:
            self.root = tk.Tk()
            self.root.title("plAIgiarized - Teacher Dashboard")
            self.root.geometry("1200x800")
        else:
            self.root = root

        # Create main container
        self.main_frame = ttk.Frame(self.root, padding="10")
        self.main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

        # Configure styles
        self._configure_styles()
        
        # Create dashboard components
        self._create_header()
        self._create_navigation()
        self._create_content_area()

    def _configure_styles(self):
        """Configure custom styles for the dashboard."""
        style = ttk.Style()
        style.configure("Dashboard.TFrame", background="#f0f0f0")
        style.configure("Header.TLabel", font=("Arial", 16, "bold"))
        style.configure("Navigation.TButton", font=("Arial", 10))
        style.configure("Alert.TLabel", foreground="red", font=("Arial", 10, "bold"))

    def _create_header(self):
        """Create dashboard header with class selection and date range."""
        header_frame = ttk.Frame(self.main_frame, style="Dashboard.TFrame")
        header_frame.grid(row=0, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))

        # Class selection
        ttk.Label(header_frame, text="Class:", style="Header.TLabel").pack(side=tk.LEFT, padx=(0, 10))
        self.class_var = tk.StringVar()
        self.class_combo = ttk.Combobox(header_frame, textvariable=self.class_var, width=30)
        self.class_combo.pack(side=tk.LEFT, padx=(0, 20))
        self.class_combo.bind('<<ComboboxSelected>>', self._on_class_change)

        # Date range
        ttk.Label(header_frame, text="Period:", style="Header.TLabel").pack(side=tk.LEFT, padx=(0, 10))
        self.period_var = tk.StringVar(value="Last 30 Days")
        period_combo = ttk.Combobox(header_frame, textvariable=self.period_var, 
                                  values=["Last 30 Days", "This Semester", "This Year", "Custom"])
        period_combo.pack(side=tk.LEFT)
        period_combo.bind('<<ComboboxSelected>>', self._on_period_change)

        # Refresh button
        ttk.Button(header_frame, text="Refresh", command=self._refresh_dashboard).pack(side=tk.RIGHT)

    def _create_navigation(self):
        """Create navigation sidebar."""
        nav_frame = ttk.Frame(self.main_frame, style="Dashboard.TFrame", width=200)
        nav_frame.grid(row=1, column=0, sticky=(tk.N, tk.S, tk.W), padx=(0, 10))

        # Navigation buttons
        ttk.Button(nav_frame, text="Class Overview", 
                  command=lambda: self._show_view("overview")).pack(fill=tk.X, pady=2)
        ttk.Button(nav_frame, text="Student Progress", 
                  command=lambda: self._show_view("students")).pack(fill=tk.X, pady=2)
        ttk.Button(nav_frame, text="Writing Analysis", 
                  command=lambda: self._show_view("analysis")).pack(fill=tk.X, pady=2)
        ttk.Button(nav_frame, text="AI Detection", 
                  command=lambda: self._show_view("ai_detection")).pack(fill=tk.X, pady=2)
        ttk.Button(nav_frame, text="Alerts", 
                  command=lambda: self._show_view("alerts")).pack(fill=tk.X, pady=2)

    def _create_content_area(self):
        """Create main content area with tabs."""
        self.content_frame = ttk.Frame(self.main_frame)
        self.content_frame.grid(row=1, column=1, sticky=(tk.N, tk.S, tk.E, tk.W))

        # Create notebook for different views
        self.notebook = ttk.Notebook(self.content_frame)
        self.notebook.pack(fill=tk.BOTH, expand=True)

        # Create different view frames
        self.overview_frame = ttk.Frame(self.notebook)
        self.students_frame = ttk.Frame(self.notebook)
        self.analysis_frame = ttk.Frame(self.notebook)
        self.ai_detection_frame = ttk.Frame(self.notebook)
        self.alerts_frame = ttk.Frame(self.notebook)

        # Add frames to notebook
        self.notebook.add(self.overview_frame, text="Class Overview")
        self.notebook.add(self.students_frame, text="Student Progress")
        self.notebook.add(self.analysis_frame, text="Writing Analysis")
        self.notebook.add(self.ai_detection_frame, text="AI Detection")
        self.notebook.add(self.alerts_frame, text="Alerts")

        # Initialize views
        self._initialize_overview()
        self._initialize_student_progress()
        self._initialize_writing_analysis()
        self._initialize_ai_detection()
        self._initialize_alerts()

    def _initialize_overview(self):
        """Initialize class overview tab."""
        # Class metrics
        metrics_frame = ttk.LabelFrame(self.overview_frame, text="Class Metrics", padding="10")
        metrics_frame.pack(fill=tk.X, pady=5)

        # Progress charts
        charts_frame = ttk.Frame(self.overview_frame)
        charts_frame.pack(fill=tk.BOTH, expand=True, pady=5)

        # Create figure for charts
        self.overview_fig = plt.Figure(figsize=(10, 6))
        canvas = FigureCanvasTkAgg(self.overview_fig, charts_frame)
        canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)

    def _initialize_student_progress(self):
        """Initialize student progress tab."""
        # Student selection
        selection_frame = ttk.Frame(self.students_frame)
        selection_frame.pack(fill=tk.X, pady=5)

        ttk.Label(selection_frame, text="Student:").pack(side=tk.LEFT, padx=5)
        self.student_var = tk.StringVar()
        self.student_combo = ttk.Combobox(selection_frame, textvariable=self.student_var, width=40)
        self.student_combo.pack(side=tk.LEFT, padx=5)
        self.student_combo.bind('<<ComboboxSelected>>', self._on_student_change)

        # Progress visualization
        self.student_fig = plt.Figure(figsize=(10, 6))
        canvas = FigureCanvasTkAgg(self.student_fig, self.students_frame)
        canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)

    def _initialize_writing_analysis(self):
        """Initialize writing analysis tab."""
        # Analysis metrics
        metrics_frame = ttk.LabelFrame(self.analysis_frame, text="Writing Metrics", padding="10")
        metrics_frame.pack(fill=tk.X, pady=5)

        # Trend visualization
        self.analysis_fig = plt.Figure(figsize=(10, 6))
        canvas = FigureCanvasTkAgg(self.analysis_fig, self.analysis_frame)
        canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)

    def _initialize_ai_detection(self):
        """Initialize AI detection tab."""
        # AI detection stats
        stats_frame = ttk.LabelFrame(self.ai_detection_frame, text="AI Detection Statistics", padding="10")
        stats_frame.pack(fill=tk.X, pady=5)

        # Detection visualization
        self.ai_fig = plt.Figure(figsize=(10, 6))
        canvas = FigureCanvasTkAgg(self.ai_fig, self.ai_detection_frame)
        canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)

    def _initialize_alerts(self):
        """Initialize alerts tab."""
        # Alerts list
        alerts_frame = ttk.Frame(self.alerts_frame)
        alerts_frame.pack(fill=tk.BOTH, expand=True, pady=5)

        # Create treeview for alerts
        columns = ("Date", "Student", "Type", "Description")
        self.alerts_tree = ttk.Treeview(alerts_frame, columns=columns, show="headings")
        
        # Configure columns
        for col in columns:
            self.alerts_tree.heading(col, text=col)
            self.alerts_tree.column(col, width=100)

        self.alerts_tree.pack(fill=tk.BOTH, expand=True)

    def _show_view(self, view_name: str):
        """Switch to specified view."""
        view_index = {
            "overview": 0,
            "students": 1,
            "analysis": 2,
            "ai_detection": 3,
            "alerts": 4
        }
        self.notebook.select(view_index.get(view_name, 0))

    def _refresh_dashboard(self):
        """Refresh all dashboard data."""
        try:
            class_id = self.class_var.get()
            if not class_id:
                return

            # Update class data
            class_data = self.class_service.analyze_class_progress(class_id)
            
            # Update visualizations
            self._update_overview_charts(class_data)
            self._update_student_progress()
            self._update_writing_analysis()
            self._update_ai_detection()
            self._update_alerts()

        except Exception as e:
            messagebox.showerror("Error", f"Failed to refresh dashboard: {str(e)}")

    def run(self):
        """Start the dashboard interface."""
        if isinstance(self.root, tk.Tk):
            self.root.mainloop()

    def destroy(self):
        """Clean up resources."""
        if isinstance(self.root, tk.Tk):
            self.root.destroy() 