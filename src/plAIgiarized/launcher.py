import tkinter as tk
from tkinter import ttk, messagebox
import json
from pathlib import Path
from typing import Optional
from .core.smart_orchestrator import SmartOrchestrator
from .logging.service import LoggingService

class SystemLauncher:
    def __init__(self):
        self.logger = LoggingService()
        
        # Create launcher window
        self.root = tk.Tk()
        self.root.title("plAIgiarized")
        self.root.geometry("400x600")
        
        # Load saved profiles
        self.profiles_path = Path("data/profiles")
        self.profiles_path.mkdir(parents=True, exist_ok=True)
        self.profiles = self._load_profiles()
        
        self._create_interface()

    def _create_interface(self):
        """Create simple launcher interface."""
        # Main container
        main = ttk.Frame(self.root, padding="20")
        main.pack(fill=tk.BOTH, expand=True)

        # Welcome message
        ttk.Label(
            main,
            text="Welcome to plAIgiarized",
            font=("Arial", 16, "bold")
        ).pack(pady=(0, 20))

        ttk.Label(
            main,
            text="Your AI-powered teaching assistant",
            font=("Arial", 10)
        ).pack(pady=(0, 30))

        # Profile selection
        if self.profiles:
            ttk.Label(
                main,
                text="Select your profile:",
                font=("Arial", 10, "bold")
            ).pack(pady=(0, 5))

            self.profile_var = tk.StringVar()
            profile_combo = ttk.Combobox(
                main,
                textvariable=self.profile_var,
                values=list(self.profiles.keys()),
                state="readonly",
                width=30
            )
            profile_combo.pack(pady=(0, 20))
            
            # Quick start button
            ttk.Button(
                main,
                text="🚀 Start Teaching",
                command=self._quick_start,
                style="Accent.TButton"
            ).pack(pady=(0, 10))

        # New profile button
        ttk.Button(
            main,
            text="📝 Create New Profile",
            command=self._create_profile
        ).pack(pady=(0, 20))

        # Quick tips
        tips_frame = ttk.LabelFrame(main, text="Quick Tips", padding="10")
        tips_frame.pack(fill=tk.X, pady=(0, 20))

        tips = [
            "💡 The system learns from your teaching style",
            "🎨 Dashboard adapts to your workflow",
            "🤖 Ask the bot for help anytime",
            "📊 Track student progress easily",
            "⚡ Quick actions for common tasks"
        ]

        for tip in tips:
            ttk.Label(
                tips_frame,
                text=tip,
                wraplength=300
            ).pack(anchor=tk.W, pady=2)

        # Settings
        settings_frame = ttk.LabelFrame(main, text="Settings", padding="10")
        settings_frame.pack(fill=tk.X)

        # Auto-start preference
        self.autostart_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(
            settings_frame,
            text="Remember my profile",
            variable=self.autostart_var
        ).pack(anchor=tk.W)

        # Status bar
        self.status_var = tk.StringVar(value="Ready to start")
        ttk.Label(
            main,
            textvariable=self.status_var,
            font=("Arial", 9)
        ).pack(side=tk.BOTTOM, pady=(10, 0))

    def _quick_start(self):
        """Start system with selected profile."""
        try:
            profile_name = self.profile_var.get()
            if not profile_name:
                messagebox.showwarning(
                    "Profile Required",
                    "Please select or create a profile first."
                )
                return

            profile = self.profiles[profile_name]
            
            # Save auto-start preference
            if self.autostart_var.get():
                self._save_autostart_profile(profile_name)

            # Start the system
            self.status_var.set("Starting system...")
            self.root.update()
            
            orchestrator = SmartOrchestrator(profile["id"])
            
            # Hide launcher
            self.root.withdraw()
            
            # Run system
            orchestrator.run()
            
            # Clean up
            self.root.destroy()

        except Exception as e:
            self.logger.error("Error starting system", e)
            messagebox.showerror(
                "Start Error",
                "Could not start the system. Please try again."
            )

    def _create_profile(self):
        """Show profile creation dialog."""
        dialog = tk.Toplevel(self.root)
        dialog.title("Create Profile")
        dialog.geometry("300x400")
        dialog.transient(self.root)
        dialog.grab_set()

        # Profile form
        form = ttk.Frame(dialog, padding="20")
        form.pack(fill=tk.BOTH, expand=True)

        ttk.Label(
            form,
            text="Create Your Profile",
            font=("Arial", 12, "bold")
        ).pack(pady=(0, 20))

        # Name
        ttk.Label(
            form,
            text="Name:"
        ).pack(anchor=tk.W)
        
        name_entry = ttk.Entry(form, width=30)
        name_entry.pack(fill=tk.X, pady=(0, 10))

        # School/Institution
        ttk.Label(
            form,
            text="School/Institution:"
        ).pack(anchor=tk.W)
        
        school_entry = ttk.Entry(form, width=30)
        school_entry.pack(fill=tk.X, pady=(0, 10))

        # Subjects
        ttk.Label(
            form,
            text="Subjects (comma-separated):"
        ).pack(anchor=tk.W)
        
        subjects_entry = ttk.Entry(form, width=30)
        subjects_entry.pack(fill=tk.X, pady=(0, 10))

        # Create button
        def save_profile():
            name = name_entry.get().strip()
            school = school_entry.get().strip()
            subjects = [s.strip() for s in subjects_entry.get().split(",")]

            if not name:
                messagebox.showwarning(
                    "Required Field",
                    "Please enter your name."
                )
                return

            # Create profile
            profile = {
                "id": f"teacher_{len(self.profiles) + 1}",
                "name": name,
                "school": school,
                "subjects": subjects,
                "created": datetime.now().isoformat()
            }

            # Save profile
            self.profiles[name] = profile
            self._save_profiles()

            # Update interface
            if hasattr(self, 'profile_var'):
                self.profile_var.set(name)

            # Close dialog
            dialog.destroy()
            
            # Show success
            self.status_var.set(f"Welcome, {name}!")

        ttk.Button(
            form,
            text="Create Profile",
            command=save_profile,
            style="Accent.TButton"
        ).pack(pady=20)

    def _load_profiles(self) -> dict:
        """Load saved profiles."""
        try:
            profile_file = self.profiles_path / "profiles.json"
            if profile_file.exists():
                with open(profile_file, 'r') as f:
                    return json.load(f)
            return {}

        except Exception as e:
            self.logger.error("Error loading profiles", e)
            return {}

    def _save_profiles(self):
        """Save profiles to file."""
        try:
            profile_file = self.profiles_path / "profiles.json"
            with open(profile_file, 'w') as f:
                json.dump(self.profiles, f, indent=2)

        except Exception as e:
            self.logger.error("Error saving profiles", e)

    def _save_autostart_profile(self, profile_name: str):
        """Save auto-start profile preference."""
        try:
            prefs_file = self.profiles_path / "preferences.json"
            prefs = {"autostart_profile": profile_name}
            
            with open(prefs_file, 'w') as f:
                json.dump(prefs, f, indent=2)

        except Exception as e:
            self.logger.error("Error saving preferences", e)

    def run(self):
        """Start the launcher."""
        try:
            # Check for auto-start profile
            prefs_file = self.profiles_path / "preferences.json"
            if prefs_file.exists():
                with open(prefs_file, 'r') as f:
                    prefs = json.load(f)
                    auto_profile = prefs.get("autostart_profile")
                    
                    if auto_profile and auto_profile in self.profiles:
                        self.profile_var.set(auto_profile)
                        self._quick_start()
                        return

            # Show launcher
            self.root.mainloop()

        except Exception as e:
            self.logger.error("Error running launcher", e)
            raise 