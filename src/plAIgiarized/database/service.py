from typing import Dict, List, Optional, Union, Any
import os
import json
from pathlib import Path
from datetime import datetime
from ..logging.service import LoggingService
import sqlite3
import logging

class DatabaseError(Exception):
    """Base class for database-related errors."""
    pass

class DatabaseService:
    def __init__(self, base_path: str = "database"):
        self.base_path = Path(base_path)
        self._ensure_directories()
        self.logger = logging.getLogger("plAIgiarized")
        
        # Database settings
        self.settings = {
            "auto_backup": True,
            "backup_interval": 24,  # hours
            "max_backups": 5,
            "compression": True
        }
        
        # Initialize database connections/files
        self._initialize_database()

    def _ensure_directories(self):
        """Create necessary database directories if they don't exist."""
        directories = [
            "essays",
            "students",
            "analysis",
            "cache",
            "logs"
        ]
        
        # Create base directory if it doesn't exist
        self.base_path.mkdir(exist_ok=True)
        
        # Create subdirectories
        for dir_name in directories:
            (self.base_path / dir_name).mkdir(exist_ok=True)

    def _initialize_database(self) -> None:
        """Initialize database with all required tables."""
        try:
            with sqlite3.connect(self.base_path / "plaigiarized.db") as conn:
                cursor = conn.cursor()

                # Users table (teachers, admins)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id TEXT PRIMARY KEY,
                        email TEXT UNIQUE NOT NULL,
                        password_hash TEXT NOT NULL,
                        role TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        last_login TIMESTAMP
                    )
                """)

                # Classes table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS classes (
                        id TEXT PRIMARY KEY,
                        teacher_id TEXT NOT NULL,
                        name TEXT NOT NULL,
                        grade_level INTEGER,
                        academic_year TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        metadata TEXT,
                        FOREIGN KEY (teacher_id) REFERENCES users(id)
                    )
                """)

                # Students table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS students (
                        id TEXT PRIMARY KEY,
                        first_name TEXT NOT NULL,
                        last_name TEXT NOT NULL,
                        email TEXT UNIQUE,
                        grade_level INTEGER,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        metadata TEXT
                    )
                """)

                # Class enrollments table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS class_enrollments (
                        class_id TEXT,
                        student_id TEXT,
                        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        status TEXT DEFAULT 'active',
                        PRIMARY KEY (class_id, student_id),
                        FOREIGN KEY (class_id) REFERENCES classes(id),
                        FOREIGN KEY (student_id) REFERENCES students(id)
                    )
                """)

                # Student baselines table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS student_baselines (
                        id TEXT PRIMARY KEY,
                        student_id TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        metrics TEXT NOT NULL,
                        samples TEXT NOT NULL,
                        metadata TEXT,
                        FOREIGN KEY (student_id) REFERENCES students(id)
                    )
                """)

                # Essays table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS essays (
                        id TEXT PRIMARY KEY,
                        student_id TEXT NOT NULL,
                        class_id TEXT NOT NULL,
                        title TEXT,
                        content TEXT NOT NULL,
                        original_text TEXT,  -- For handwritten submissions
                        is_handwritten BOOLEAN DEFAULT FALSE,
                        word_count INTEGER,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        submitted_at TIMESTAMP,
                        file_path TEXT,
                        metadata TEXT,
                        FOREIGN KEY (student_id) REFERENCES students(id),
                        FOREIGN KEY (class_id) REFERENCES classes(id)
                    )
                """)

                # Essay analyses table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS essay_analyses (
                        id TEXT PRIMARY KEY,
                        essay_id TEXT NOT NULL,
                        analysis_type TEXT NOT NULL,
                        metrics TEXT NOT NULL,
                        ai_detection_results TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        metadata TEXT,
                        FOREIGN KEY (essay_id) REFERENCES essays(id)
                    )
                """)

                # Student progress table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS student_progress (
                        id TEXT PRIMARY KEY,
                        student_id TEXT NOT NULL,
                        class_id TEXT NOT NULL,
                        metrics TEXT NOT NULL,
                        period_start TIMESTAMP,
                        period_end TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        metadata TEXT,
                        FOREIGN KEY (student_id) REFERENCES students(id),
                        FOREIGN KEY (class_id) REFERENCES classes(id)
                    )
                """)

                # Class progress table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS class_progress (
                        id TEXT PRIMARY KEY,
                        class_id TEXT NOT NULL,
                        metrics TEXT NOT NULL,
                        period_start TIMESTAMP,
                        period_end TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        metadata TEXT,
                        FOREIGN KEY (class_id) REFERENCES classes(id)
                    )
                """)

                # Handwriting samples table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS handwriting_samples (
                        id TEXT PRIMARY KEY,
                        student_id TEXT NOT NULL,
                        essay_id TEXT NOT NULL,
                        original_image_path TEXT NOT NULL,
                        processed_image_path TEXT,
                        confidence_score REAL,
                        ocr_results TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        metadata TEXT,
                        FOREIGN KEY (student_id) REFERENCES students(id),
                        FOREIGN KEY (essay_id) REFERENCES essays(id)
                    )
                """)

                # Batch uploads table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS batch_uploads (
                        id TEXT PRIMARY KEY,
                        class_id TEXT NOT NULL,
                        uploaded_by TEXT NOT NULL,
                        status TEXT NOT NULL,
                        total_files INTEGER,
                        processed_files INTEGER,
                        failed_files INTEGER,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        completed_at TIMESTAMP,
                        metadata TEXT,
                        FOREIGN KEY (class_id) REFERENCES classes(id),
                        FOREIGN KEY (uploaded_by) REFERENCES users(id)
                    )
                """)

                conn.commit()

        except Exception as e:
            self.logger.error("Error initializing database", e)
            raise

    def store_essay(self, essay_data: Dict) -> bool:
        """Store essay and its analysis."""
        try:
            with sqlite3.connect(self.base_path / "plaigiarized.db") as conn:
                cursor = conn.cursor()
                
                # Store essay
                cursor.execute("""
                    INSERT INTO essays (
                        id, student_id, class_id, title, content, 
                        original_text, is_handwritten, word_count,
                        submitted_at, file_path, metadata
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    essay_data["id"],
                    essay_data["student_id"],
                    essay_data["class_id"],
                    essay_data.get("title"),
                    essay_data["content"],
                    essay_data.get("original_text"),
                    essay_data.get("is_handwritten", False),
                    essay_data.get("word_count"),
                    essay_data.get("submitted_at", datetime.now().isoformat()),
                    essay_data.get("file_path"),
                    json.dumps(essay_data.get("metadata", {}))
                ))
                
                return True

        except Exception as e:
            self.logger.error(f"Error storing essay {essay_data.get('id')}", e)
            return False

    def update_student_baseline(self, student_id: str, baseline_data: Dict) -> bool:
        """Update student's baseline data."""
        try:
            with sqlite3.connect(self.base_path / "plaigiarized.db") as conn:
                cursor = conn.cursor()
                
                # Check if baseline exists
                cursor.execute(
                    "SELECT id FROM student_baselines WHERE student_id = ?",
                    (student_id,)
                )
                existing = cursor.fetchone()
                
                if existing:
                    # Update existing baseline
                    cursor.execute("""
                        UPDATE student_baselines 
                        SET metrics = ?, samples = ?, updated_at = ?, metadata = ?
                        WHERE student_id = ?
                    """, (
                        json.dumps(baseline_data.get("metrics", {})),
                        json.dumps(baseline_data["samples"]),
                        datetime.now().isoformat(),
                        json.dumps(baseline_data.get("metadata", {})),
                        student_id
                    ))
                else:
                    # Create new baseline
                    cursor.execute("""
                        INSERT INTO student_baselines (
                            id, student_id, metrics, samples, metadata
                        ) VALUES (?, ?, ?, ?, ?)
                    """, (
                        f"baseline_{student_id}",
                        student_id,
                        json.dumps(baseline_data.get("metrics", {})),
                        json.dumps(baseline_data["samples"]),
                        json.dumps(baseline_data.get("metadata", {}))
                    ))
                
                return True

        except Exception as e:
            self.logger.error(f"Error updating baseline for student {student_id}", e)
            return False

    def _load_collection(self, collection: str) -> List[Dict]:
        """Load collection from file."""
        try:
            collection_path = self.base_path / f"{collection}.json"
            if not collection_path.exists():
                return []
            return json.loads(collection_path.read_text())
        except Exception as e:
            self.logger.error(f"Error loading collection {collection}", e)
            return []

    def _save_collection(self, collection: str, data: List[Dict]) -> bool:
        """Save collection to file."""
        try:
            collection_path = self.base_path / f"{collection}.json"
            collection_path.write_text(json.dumps(data, indent=2))
            return True
        except Exception as e:
            self.logger.error(f"Error saving collection {collection}", e)
            return False

    # Essay methods
    def get_essay(self, essay_id: str) -> Optional[Dict]:
        """Get essay by ID."""
        try:
            essay_path = self.base_path / "essays" / f"{essay_id}.json"
            if not essay_path.exists():
                return None
            with open(essay_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            self.logger.error(f"Error getting essay {essay_id}: {str(e)}")
            return None

    def insert_essay(self, essay: Dict) -> bool:
        """Insert essay into database."""
        try:
            essay_path = self.base_path / "essays" / f"{essay['id']}.json"
            with open(essay_path, 'w') as f:
                json.dump(essay, f, indent=2)
            return True
        except Exception as e:
            self.logger.error(f"Error inserting essay {essay.get('id', 'unknown')}: {str(e)}")
            return False

    def update_essay(self, essay_data: Dict) -> bool:
        """Update existing essay."""
        try:
            essays = self._load_collection("essays")
            for i, essay in enumerate(essays):
                if essay["id"] == essay_data["id"]:
                    essays[i] = essay_data
                    return self._save_collection("essays", essays)
            return False
        except Exception as e:
            self.logger.error(f"Error updating essay {essay_data.get('id')}", e)
            return False

    def delete_essay(self, essay_id: str) -> bool:
        """Delete essay."""
        try:
            essays = self._load_collection("essays")
            essays = [essay for essay in essays if essay["id"] != essay_id]
            return self._save_collection("essays", essays)
        except Exception as e:
            self.logger.error(f"Error deleting essay {essay_id}", e)
            return False

    # Analysis methods
    def get_analysis(self, analysis_id: str) -> Optional[Dict]:
        """Get analysis by ID."""
        try:
            analysis_path = self.base_path / "analysis" / f"{analysis_id}.json"
            if not analysis_path.exists():
                return None
            with open(analysis_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            self.logger.error(f"Error getting analysis {analysis_id}: {str(e)}")
            return None

    def get_analysis_by_essay(self, essay_id: str) -> Optional[Dict]:
        """Get analysis by essay ID."""
        try:
            analyses = self._load_collection("analyses")
            return next((analysis for analysis in analyses if analysis["essay_id"] == essay_id), None)
        except Exception as e:
            self.logger.error(f"Error getting analysis for essay {essay_id}", e)
            return None

    def insert_analysis(self, analysis: Dict) -> bool:
        """Insert analysis into database."""
        try:
            analysis_path = self.base_path / "analysis" / f"{analysis['id']}.json"
            with open(analysis_path, 'w') as f:
                json.dump(analysis, f, indent=2)
            return True
        except Exception as e:
            self.logger.error(f"Error inserting analysis {analysis.get('id', 'unknown')}: {str(e)}")
            return False

    def update_analysis(self, analysis_data: Dict) -> bool:
        """Update existing analysis."""
        try:
            analyses = self._load_collection("analyses")
            for i, analysis in enumerate(analyses):
                if analysis["id"] == analysis_data["id"]:
                    analyses[i] = analysis_data
                    return self._save_collection("analyses", analyses)
            return False
        except Exception as e:
            self.logger.error(f"Error updating analysis {analysis_data.get('id')}", e)
            return False

    def delete_analysis(self, analysis_id: str) -> bool:
        """Delete analysis."""
        try:
            analyses = self._load_collection("analyses")
            analyses = [a for a in analyses if a["id"] != analysis_id]
            return self._save_collection("analyses", analyses)
        except Exception as e:
            self.logger.error(f"Error deleting analysis {analysis_id}", e)
            return False

    # Report methods
    def get_report(self, report_id: str) -> Optional[Dict]:
        """Get report by ID."""
        try:
            reports = self._load_collection("reports")
            return next((report for report in reports if report["id"] == report_id), None)
        except Exception as e:
            self.logger.error(f"Error getting report {report_id}", e)
            return None

    def insert_report(self, report_data: Dict) -> bool:
        """Insert new report."""
        try:
            reports = self._load_collection("reports")
            reports.append(report_data)
            return self._save_collection("reports", reports)
        except Exception as e:
            self.logger.error("Error inserting report", e)
            return False

    # User methods
    def get_user(self, username: str) -> Optional[Dict]:
        """Get user by username."""
        try:
            users = self._load_collection("users")
            return next((user for user in users if user["username"] == username), None)
        except Exception as e:
            self.logger.error(f"Error getting user {username}", e)
            return None

    def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """Get user by ID."""
        try:
            users = self._load_collection("users")
            return next((user for user in users if user["id"] == user_id), None)
        except Exception as e:
            self.logger.error(f"Error getting user by ID {user_id}", e)
            return None

    def insert_user(self, user_data: Dict) -> bool:
        """Insert new user."""
        try:
            users = self._load_collection("users")
            users.append(user_data)
            self._save_collection("users", users)
            return True
        except Exception as e:
            self.logger.error("Error inserting user", e)
            return False

    def update_user(self, user_data: Dict) -> bool:
        """Update existing user."""
        try:
            users = self._load_collection("users")
            for i, user in enumerate(users):
                if user["id"] == user_data["id"]:
                    users[i] = user_data
                    self._save_collection("users", users)
                    return True
            return False
        except Exception as e:
            self.logger.error(f"Error updating user {user_data.get('id')}", e)
            return False

    def delete_user(self, user_id: str) -> bool:
        """Delete user."""
        try:
            users = self._load_collection("users")
            users = [user for user in users if user["id"] != user_id]
            self._save_collection("users", users)
            return True
        except Exception as e:
            self.logger.error(f"Error deleting user {user_id}", e)
            return False

    def update_settings(self, settings: Dict) -> bool:
        """Update database settings."""
        try:
            self.settings.update(settings)
            return True
        except Exception as e:
            self.logger.error("Error updating settings", e)
            return False

    def _clear_database(self) -> None:
        """Clear all collections (for testing purposes)."""
        try:
            for collection in ["essays", "analyses", "reports", "users", "settings", "backups", "metadata"]:
                self._save_collection(collection, [])
        except Exception as e:
            self.logger.error("Error clearing database", e)

    def _get_connection(self):
        # Logic to get a database connection
        pass

    def insert_student(self, student_data: Dict) -> bool:
        """Insert new student."""
        try:
            students = self._load_collection("students")
            students.append(student_data)
            return self._save_collection("students", students)
        except Exception as e:
            self.logger.error("Error inserting student", e)
            return False

    def get_student(self, student_id: str) -> Optional[Dict]:
        """Get student by ID."""
        try:
            students = self._load_collection("students")
            return next((student for student in students if student["id"] == student_id), None)
        except Exception as e:
            self.logger.error(f"Error getting student {student_id}", e)
            return None

    def update_student(self, student_data: Dict) -> bool:
        """Update existing student."""
        try:
            students = self._load_collection("students")
            for i, student in enumerate(students):
                if student["id"] == student_data["id"]:
                    students[i] = student_data
                    return self._save_collection("students", students)
            return False
        except Exception as e:
            self.logger.error(f"Error updating student {student_data.get('id')}", e)
            return False

    def delete_student(self, student_id: str) -> bool:
        """Delete student."""
        try:
            students = self._load_collection("students")
            students = [student for student in students if student["id"] != student_id]
            return self._save_collection("students", students)
        except Exception as e:
            self.logger.error(f"Error deleting student {student_id}", e)
            return False

    def store_analysis(self, essay_id: str, analysis: Dict) -> bool:
        """Store analysis results."""
        try:
            analysis_path = self.base_path / "analysis" / f"{essay_id}.json"
            with open(analysis_path, 'w') as f:
                json.dump(analysis, f)
            return True
        except Exception as e:
            self.logger.error(f"Error storing analysis for {essay_id}", e)
            return False

    def get_analysis(self, essay_id: str) -> Optional[Dict]:
        """Retrieve analysis results."""
        try:
            analysis_path = self.base_path / "analysis" / f"{essay_id}.json"
            if analysis_path.exists():
                with open(analysis_path, 'r') as f:
                    return json.load(f)
            return None
        except Exception as e:
            self.logger.error(f"Error retrieving analysis for {essay_id}", e)
            return None