from typing import Dict, List, Optional, Any
import os
from datetime import datetime
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from fpdf import FPDF
from ..models.essay import Essay

class ExportService:
    def __init__(self):
        self.base_path = "data/exports"
        os.makedirs(self.base_path, exist_ok=True)
        sns.set_theme()

    def generate_visualizations(self, data: Dict[str, Any], plot_type: str) -> str:
        """Generate various types of visualizations."""
        try:
            if plot_type == "progress":
                return self._create_progress_plot(data)
            elif plot_type == "distribution":
                return self._create_distribution_plot(data)
            elif plot_type == "comparison":
                return self._create_comparison_plot(data)
            else:
                raise ValueError(f"Unsupported plot type: {plot_type}")
        except Exception as e:
            print(f"Error generating visualization: {e}")
            return ""

    def _create_progress_plot(self, data: Dict[str, Any]) -> str:
        """Create progress visualization plot."""
        try:
            timeline = data.get("timeline", [])
            if not timeline:
                return ""
                
            dates = [datetime.fromisoformat(entry["date"]) for entry in timeline]
            grade_levels = [entry["grade_level"] for entry in timeline]
            
            plt.figure(figsize=(10, 6))
            plt.plot(dates, grade_levels, marker="o")
            plt.title("Writing Level Progress")
            plt.xlabel("Date")
            plt.ylabel("Grade Level")
            plt.grid(True)
            
            # Save plot
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"progress_plot_{timestamp}.png"
            path = os.path.join(self.base_path, filename)
            plt.savefig(path)
            plt.close()
            
            return path
        except Exception as e:
            print(f"Error creating progress plot: {e}")
            return ""
