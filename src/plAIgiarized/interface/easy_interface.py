import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from pathlib import Path
from typing import Dict, List
import threading
from ..document.service import DocumentProcessingService
from ..analysis.service import AnalysisService
from ..student.service import StudentProgressService
from ..class.service import ClassProgressService

class EasyTeacherInterface:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("plAIgiarized - Teacher Assistant")
        self.root.geometry("1000x700")
        
        # Initialize services
        self.doc_service = DocumentProcessingService()
        self.analysis_service = AnalysisService()
        
        # Create main interface
        self._create_interface()

    def _create_interface(self):
        """Create simple, intuitive interface."""
        # Main container with padding
        main = ttk.Frame(self.root, padding="20")
        main.pack(fill=tk.BOTH, expand=True)

        # Welcome message
        welcome = ttk.Label(
            main,
            text="Welcome! What would you like to do?",
            font=("Arial", 14, "bold")
        )
        welcome.pack(pady=(0, 20))

        # Quick Action Buttons
        actions_frame = ttk.LabelFrame(main, text="Quick Actions", padding="10")
        actions_frame.pack(fill=tk.X, pady=(0, 20))

        # Upload Essays Button
        upload_btn = ttk.Button(
            actions_frame,
            text="📄 Upload Essays\n(Single or Batch)",
            command=self._upload_essays,
            width=30
        )
        upload_btn.pack(side=tk.LEFT, padx=10)

        # Scan Handwritten Work Button
        scan_btn = ttk.Button(
            actions_frame,
            text="📸 Scan Handwritten Work\n(Single or Batch)",
            command=self._scan_handwritten,
            width=30
        )
        scan_btn.pack(side=tk.LEFT, padx=10)

        # View Reports Button
        reports_btn = ttk.Button(
            actions_frame,
            text="📊 View Reports\n(Student or Class)",
            command=self._view_reports,
            width=30
        )
        reports_btn.pack(side=tk.LEFT, padx=10)

        # Progress Overview
        progress_frame = ttk.LabelFrame(main, text="Quick Overview", padding="10")
        progress_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 20))

        # Class Selection
        class_frame = ttk.Frame(progress_frame)
        class_frame.pack(fill=tk.X, pady=(0, 10))
        
        ttk.Label(class_frame, text="Class:").pack(side=tk.LEFT, padx=(0, 10))
        self.class_combo = ttk.Combobox(class_frame, width=40)
        self.class_combo.pack(side=tk.LEFT)
        self.class_combo.bind('<<ComboboxSelected>>', self._update_overview)

        # Overview Tabs
        self.overview_tabs = ttk.Notebook(progress_frame)
        self.overview_tabs.pack(fill=tk.BOTH, expand=True)

        # Class Progress Tab
        class_tab = ttk.Frame(self.overview_tabs)
        self.overview_tabs.add(class_tab, text="Class Progress")

        # Alerts Tab
        alerts_tab = ttk.Frame(self.overview_tabs)
        self.overview_tabs.add(alerts_tab, text="Important Alerts")

        # Status bar
        self.status_var = tk.StringVar()
        status_bar = ttk.Label(
            main,
            textvariable=self.status_var,
            font=("Arial", 10)
        )
        status_bar.pack(fill=tk.X)

    def _upload_essays(self):
        """Handle essay uploads with simple workflow."""
        upload_window = tk.Toplevel(self.root)
        upload_window.title("Upload Essays")
        upload_window.geometry("600x400")
        
        frame = ttk.Frame(upload_window, padding="20")
        frame.pack(fill=tk.BOTH, expand=True)

        # Instructions
        ttk.Label(
            frame,
            text="Drop files here or click to select",
            font=("Arial", 12)
        ).pack(pady=(0, 10))

        # Drop zone
        drop_frame = ttk.LabelFrame(frame, padding="30")
        drop_frame.pack(fill=tk.BOTH, expand=True)

        # File list
        self.file_list = tk.Listbox(drop_frame)
        self.file_list.pack(fill=tk.BOTH, expand=True)

        # Buttons
        btn_frame = ttk.Frame(frame)
        btn_frame.pack(fill=tk.X, pady=(10, 0))

        ttk.Button(
            btn_frame,
            text="Select Files",
            command=self._select_files
        ).pack(side=tk.LEFT, padx=5)

        ttk.Button(
            btn_frame,
            text="Upload",
            command=lambda: self._process_uploads(upload_window)
        ).pack(side=tk.RIGHT, padx=5)

    def _scan_handwritten(self):
        """Handle scanning handwritten work."""
        scan_window = tk.Toplevel(self.root)
        scan_window.title("Scan Handwritten Work")
        scan_window.geometry("600x400")

        frame = ttk.Frame(scan_window, padding="20")
        frame.pack(fill=tk.BOTH, expand=True)

        # Instructions
        ttk.Label(
            frame,
            text="Select scanned images or use camera",
            font=("Arial", 12)
        ).pack(pady=(0, 10))

        # Buttons
        btn_frame = ttk.Frame(frame)
        btn_frame.pack(fill=tk.X)

        ttk.Button(
            btn_frame,
            text="Select Images",
            command=self._select_scans
        ).pack(side=tk.LEFT, padx=5)

        ttk.Button(
            btn_frame,
            text="Use Camera",
            command=self._use_camera
        ).pack(side=tk.LEFT, padx=5)

        # Preview area
        preview_frame = ttk.LabelFrame(frame, text="Preview", padding="10")
        preview_frame.pack(fill=tk.BOTH, expand=True, pady=(10, 0))

    def _view_reports(self):
        """Show simplified reports interface."""
        reports_window = tk.Toplevel(self.root)
        reports_window.title("View Reports")
        reports_window.geometry("800x600")

        frame = ttk.Frame(reports_window, padding="20")
        frame.pack(fill=tk.BOTH, expand=True)

        # Report type selection
        type_frame = ttk.Frame(frame)
        type_frame.pack(fill=tk.X, pady=(0, 20))

        ttk.Label(
            type_frame,
            text="Select Report Type:"
        ).pack(side=tk.LEFT, padx=(0, 10))

        report_types = ["Class Overview", "Student Progress", "AI Detection Summary"]
        report_var = tk.StringVar(value=report_types[0])
        
        for report in report_types:
            ttk.Radiobutton(
                type_frame,
                text=report,
                variable=report_var,
                value=report,
                command=lambda: self._load_report(report_var.get())
            ).pack(side=tk.LEFT, padx=10)

        # Report content area
        self.report_frame = ttk.Frame(frame)
        self.report_frame.pack(fill=tk.BOTH, expand=True)

    def _process_uploads(self, window):
        """Process uploaded files with progress feedback."""
        try:
            # Show progress
            progress = ttk.Progressbar(window, mode='indeterminate')
            progress.pack(fill=tk.X, pady=10)
            progress.start()

            # Process files in background
            threading.Thread(
                target=self._process_files_background,
                args=(progress, window)
            ).start()

        except Exception as e:
            messagebox.showerror("Error", f"Upload failed: {str(e)}")

    def run(self):
        """Start the interface."""
        self.root.mainloop()

    def _show_success(self, message: str):
        """Show success message."""
        self.status_var.set(f"✅ {message}")
        
    def _show_error(self, message: str):
        """Show error message."""
        self.status_var.set(f"❌ {message}") 