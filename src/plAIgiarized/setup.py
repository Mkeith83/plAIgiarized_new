import nltk
import os
import json
from pathlib import Path
from typing import Dict, Optional
from .logging.service import LoggingService

logger = LoggingService()

class SetupManager:
    def __init__(self):
        self.logger = LoggingService()
        self.config_path = Path("config")
        self.data_path = Path("data")
        self.resources_path = Path("resources")
        
        # Ensure directories exist
        self.config_path.mkdir(exist_ok=True)
        self.data_path.mkdir(exist_ok=True)
        self.resources_path.mkdir(exist_ok=True)
        
        # Default configuration
        self.default_config = {
            "nltk_resources": [
                'averaged_perceptron_tagger',
                'punkt',
                'stopwords',
                'wordnet',
                'maxent_ne_chunker',
                'words'
            ],
            "data_paths": {
                "models": str(self.data_path / "models"),
                "cache": str(self.data_path / "cache"),
                "temp": str(self.data_path / "temp")
            },
            "logging": {
                "level": "INFO",
                "file": str(self.data_path / "logs" / "app.log"),
                "max_size": 10485760,  # 10MB
                "backup_count": 5
            }
        }
        
        self._initialize()

    def _initialize(self):
        """Initialize all required components."""
        try:
            # Create necessary directories
            self._create_directories()
            
            # Load or create configuration
            self.config = self._load_config()
            
            # Setup NLTK resources
            self._setup_nltk()
            
            # Initialize data directories
            self._initialize_data_dirs()
            
            logger.info("Setup completed successfully")

        except Exception as e:
            logger.error("Error during initialization", e)
            raise

    def _create_directories(self):
        """Create all required directories."""
        try:
            for path in self.default_config["data_paths"].values():
                Path(path).mkdir(parents=True, exist_ok=True)
            
            # Create logs directory
            Path(self.default_config["logging"]["file"]).parent.mkdir(
                parents=True,
                exist_ok=True
            )

        except Exception as e:
            logger.error("Error creating directories", e)
            raise

    def _load_config(self) -> Dict:
        """Load or create configuration file."""
        config_file = self.config_path / "config.json"
        try:
            if config_file.exists():
                with open(config_file, 'r') as f:
                    config = json.load(f)
                # Update with any new default values
                self._update_config(config)
            else:
                config = self.default_config
                with open(config_file, 'w') as f:
                    json.dump(config, f, indent=4)
            return config

        except Exception as e:
            logger.error("Error loading configuration", e)
            return self.default_config

    def _update_config(self, config: Dict):
        """Update existing config with new default values."""
        updated = False
        for key, value in self.default_config.items():
            if key not in config:
                config[key] = value
                updated = True
            elif isinstance(value, dict):
                for sub_key, sub_value in value.items():
                    if sub_key not in config[key]:
                        config[key][sub_key] = sub_value
                        updated = True
        
        if updated:
            with open(self.config_path / "config.json", 'w') as f:
                json.dump(config, f, indent=4)

    def _setup_nltk(self):
        """Download required NLTK resources."""
        try:
            for resource in self.config["nltk_resources"]:
                try:
                    nltk.download(resource, quiet=True)
                    logger.debug(f"Downloaded NLTK resource: {resource}")
                except Exception as e:
                    logger.error(f"Error downloading NLTK resource {resource}", e)

        except Exception as e:
            logger.error("Error setting up NLTK", e)
            raise

    def _initialize_data_dirs(self):
        """Initialize data directories with required files."""
        try:
            # Create .gitkeep files to preserve directory structure
            for path in self.config["data_paths"].values():
                gitkeep = Path(path) / ".gitkeep"
                if not gitkeep.exists():
                    gitkeep.touch()
            
            # Initialize any required data files
            self._initialize_required_files()

        except Exception as e:
            logger.error("Error initializing data directories", e)
            raise

    def _initialize_required_files(self):
        """Initialize any required data files."""
        try:
            # Add any required file initialization here
            pass

        except Exception as e:
            logger.error("Error initializing required files", e)
            raise

# Create global setup manager instance
setup_manager = SetupManager() 