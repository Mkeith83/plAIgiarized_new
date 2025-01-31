import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple
from datetime import datetime, timedelta
from ..logging.service import LoggingService

class ChartService:
    def __init__(self):
        self.logger = LoggingService()
        
        # Set style for all charts
        plt.style.use('seaborn')
        sns.set_palette("husl")
        
        # Chart settings
        self.settings = {
            "figure_size": (10, 6),
            "dpi": 100,
            "title_size": 14,
            "label_size": 10,
            "legend_size": 9,
            "line_width": 2,
            "marker_size": 6,
            "grid_alpha": 0.3,
            "colors": {
                "primary": "#2196F3",
                "secondary": "#FF9800",
                "alert": "#F44336",
                "success": "#4CAF50",
                "neutral": "#9E9E9E"
            }
        }

    def create_progress_chart(self, data: Dict, metric: str) -> plt.Figure:
        """Create student/class progress line chart."""
        try:
            fig, ax = plt.subplots(figsize=self.settings["figure_size"], dpi=self.settings["dpi"])
            
            dates = [datetime.fromisoformat(d) for d in data["dates"]]
            values = data[metric]
            baseline = data.get("baseline", {}).get(metric)
            
            # Plot progress line
            ax.plot(dates, values, 
                   color=self.settings["colors"]["primary"],
                   linewidth=self.settings["line_width"],
                   marker='o',
                   markersize=self.settings["marker_size"],
                   label='Progress')
            
            # Add baseline if available
            if baseline is not None:
                ax.axhline(y=baseline, 
                          color=self.settings["colors"]["secondary"],
                          linestyle='--',
                          label='Baseline')
            
            # Customize chart
            ax.set_title(f"{metric.replace('_', ' ').title()} Progress",
                        fontsize=self.settings["title_size"])
            ax.grid(alpha=self.settings["grid_alpha"])
            ax.legend(fontsize=self.settings["legend_size"])
            
            # Format dates
            fig.autofmt_xdate()
            
            return fig

        except Exception as e:
            self.logger.error(f"Error creating progress chart for {metric}", e)
            return None

    def create_class_distribution(self, data: List[float], metric: str) -> plt.Figure:
        """Create class distribution histogram."""
        try:
            fig, ax = plt.subplots(figsize=self.settings["figure_size"], dpi=self.settings["dpi"])
            
            # Create histogram with KDE
            sns.histplot(data=data, kde=True, ax=ax, color=self.settings["colors"]["primary"])
            
            # Add mean and median lines
            mean_val = np.mean(data)
            median_val = np.median(data)
            
            ax.axvline(mean_val, color=self.settings["colors"]["success"], 
                      linestyle='--', label=f'Mean: {mean_val:.2f}')
            ax.axvline(median_val, color=self.settings["colors"]["secondary"], 
                      linestyle=':', label=f'Median: {median_val:.2f}')
            
            # Customize chart
            ax.set_title(f"Class Distribution - {metric.replace('_', ' ').title()}",
                        fontsize=self.settings["title_size"])
            ax.grid(alpha=self.settings["grid_alpha"])
            ax.legend(fontsize=self.settings["legend_size"])
            
            return fig

        except Exception as e:
            self.logger.error(f"Error creating distribution chart for {metric}", e)
            return None

    def create_ai_detection_chart(self, data: Dict) -> plt.Figure:
        """Create AI detection analysis chart."""
        try:
            fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6), dpi=self.settings["dpi"])
            
            # Probability distribution
            sns.histplot(data=data["probabilities"], ax=ax1, 
                        color=self.settings["colors"]["primary"])
            ax1.set_title("AI Detection Probability Distribution",
                         fontsize=self.settings["title_size"])
            ax1.set_xlabel("AI Probability")
            ax1.set_ylabel("Count")
            
            # Metrics comparison
            metrics = data["metrics"]
            x = np.arange(len(metrics))
            ax2.bar(x, list(metrics.values()), color=self.settings["colors"]["secondary"])
            ax2.set_xticks(x)
            ax2.set_xticklabels(metrics.keys(), rotation=45)
            ax2.set_title("AI Detection Metrics",
                         fontsize=self.settings["title_size"])
            
            fig.tight_layout()
            return fig

        except Exception as e:
            self.logger.error("Error creating AI detection chart", e)
            return None

    def create_writing_analysis_radar(self, current: Dict, baseline: Dict) -> plt.Figure:
        """Create radar chart comparing current vs baseline metrics."""
        try:
            metrics = ['vocabulary', 'syntax', 'coherence', 'style', 'grade_level']
            
            # Prepare data
            current_values = [current.get(m, 0) for m in metrics]
            baseline_values = [baseline.get(m, 0) for m in metrics]
            
            # Create radar chart
            angles = np.linspace(0, 2*np.pi, len(metrics), endpoint=False)
            
            # Close the plot
            current_values += [current_values[0]]
            baseline_values += [baseline_values[0]]
            angles = np.concatenate((angles, [angles[0]]))
            
            fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(projection='polar'))
            
            # Plot data
            ax.plot(angles, current_values, 'o-', 
                   linewidth=self.settings["line_width"],
                   label='Current',
                   color=self.settings["colors"]["primary"])
            ax.fill(angles, current_values, alpha=0.25,
                   color=self.settings["colors"]["primary"])
            
            ax.plot(angles, baseline_values, 'o-',
                   linewidth=self.settings["line_width"],
                   label='Baseline',
                   color=self.settings["colors"]["secondary"])
            ax.fill(angles, baseline_values, alpha=0.25,
                   color=self.settings["colors"]["secondary"])
            
            # Set chart properties
            ax.set_xticks(angles[:-1])
            ax.set_xticklabels(metrics)
            ax.set_title("Writing Analysis Comparison",
                        fontsize=self.settings["title_size"])
            ax.legend(loc='upper right',
                     bbox_to_anchor=(0.1, 0.1))
            
            return fig

        except Exception as e:
            self.logger.error("Error creating writing analysis radar chart", e)
            return None

    def create_improvement_heatmap(self, data: pd.DataFrame) -> plt.Figure:
        """Create heatmap showing improvement across different metrics."""
        try:
            fig, ax = plt.subplots(figsize=self.settings["figure_size"], 
                                 dpi=self.settings["dpi"])
            
            # Create heatmap
            sns.heatmap(data, annot=True, cmap='RdYlGn', center=0,
                       ax=ax, fmt='.2f', cbar_kws={'label': 'Improvement %'})
            
            # Customize chart
            ax.set_title("Improvement Heatmap",
                        fontsize=self.settings["title_size"])
            plt.xticks(rotation=45)
            plt.yticks(rotation=0)
            
            fig.tight_layout()
            return fig

        except Exception as e:
            self.logger.error("Error creating improvement heatmap", e)
            return None

    def create_anomaly_chart(self, data: Dict) -> plt.Figure:
        """Create chart highlighting anomalies in writing patterns."""
        try:
            fig, ax = plt.subplots(figsize=self.settings["figure_size"],
                                 dpi=self.settings["dpi"])
            
            dates = [datetime.fromisoformat(d) for d in data["dates"]]
            values = data["values"]
            anomalies = data["anomalies"]
            
            # Plot regular data
            ax.plot(dates, values,
                   color=self.settings["colors"]["primary"],
                   linewidth=self.settings["line_width"],
                   label='Writing Pattern')
            
            # Highlight anomalies
            anomaly_dates = [dates[i] for i in anomalies]
            anomaly_values = [values[i] for i in anomalies]
            ax.scatter(anomaly_dates, anomaly_values,
                      color=self.settings["colors"]["alert"],
                      s=100, label='Anomalies')
            
            # Customize chart
            ax.set_title("Writing Pattern Anomalies",
                        fontsize=self.settings["title_size"])
            ax.grid(alpha=self.settings["grid_alpha"])
            ax.legend(fontsize=self.settings["legend_size"])
            
            fig.autofmt_xdate()
            return fig

        except Exception as e:
            self.logger.error("Error creating anomaly chart", e)
            return None 