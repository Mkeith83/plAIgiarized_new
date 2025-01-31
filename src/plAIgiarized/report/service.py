from typing import Dict, List, Optional, Any
import os
import json
import time
from pathlib import Path
from datetime import datetime
import matplotlib.pyplot as plt
import seaborn as sns
from jinja2 import Environment, FileSystemLoader
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from ..logging.service import LoggingService
from ..database.service import DatabaseService
from ..analysis.service import AnalysisService

class ReportService:
    def __init__(self):
        self.logger = LoggingService()
        self.db = DatabaseService()
        self.analysis = AnalysisService()
        
        # Initialize paths
        self.base_path = Path("data/reports")
        self.base_path.mkdir(parents=True, exist_ok=True)
        self.template_path = Path("src/plAIgiarized/report/templates")
        self.template_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize Jinja2 environment
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(self.template_path)),
            autoescape=True
        )
        
        # Create default templates if they don't exist
        self._create_default_templates()
        
        # Report settings
        self.settings = {
            "formats": ["html", "pdf", "json"],
            "include_visualizations": True,
            "theme": "default",
            "max_cache_age": 3600,  # 1 hour
            "cache_enabled": True
        }

    def _create_default_templates(self) -> None:
        """Create default report templates if they don't exist."""
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Analysis Report: {{ essay.title }}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #333; }
                .section { margin: 20px 0; }
                .visualization { margin: 20px 0; }
            </style>
        </head>
        <body>
            <h1>Analysis Report: {{ essay.title }}</h1>
            <div class="section">
                <h2>Summary</h2>
                <p>AI Likelihood: {{ summary.ai_likelihood }}</p>
                <p>Quality Rating: {{ summary.quality_rating }}</p>
                <p>Readability Level: {{ summary.readability_level }}</p>
            </div>
            {% if visualizations %}
            <div class="section">
                <h2>Visualizations</h2>
                {% for name, path in visualizations.items() %}
                <div class="visualization">
                    <img src="{{ path }}" alt="{{ name }}">
                </div>
                {% endfor %}
            </div>
            {% endif %}
        </body>
        </html>
        """
        
        template_path = self.template_path / "report.html.jinja2"
        if not template_path.exists():
            template_path.write_text(html_template)

    def generate_report(self, essay_id: str, format: str = "pdf") -> Optional[Path]:
        """Generate analysis report for an essay."""
        try:
            # Get essay and analysis data
            essay = self.db.get_essay(essay_id)
            if not essay:
                raise ValueError(f"Essay not found: {essay_id}")
            
            analysis = self.db.get_analysis(essay_id)
            if not analysis:
                analysis = self.analysis.analyze_essay(essay_id)
            
            # Generate report data
            report_data = self._prepare_report_data(essay, analysis)
            
            # Generate visualizations if enabled
            if self.settings["include_visualizations"]:
                report_data["visualizations"] = self._generate_visualizations(analysis)
            
            # Generate report in requested format
            report_path = self._generate_report_file(report_data, format)
            
            # Store report metadata
            if report_path:
                self._store_report_metadata(essay_id, report_path, format)
            
            return report_path
        except Exception as e:
            self.logger.error(f"Error generating report for essay {essay_id}", e)
            return None

    def _prepare_report_data(self, essay: Dict, analysis: Dict) -> Dict:
        """Prepare data for report generation."""
        return {
            "essay": {
                "id": essay["id"],
                "title": essay["title"],
                "content": essay["content"],
                "author": essay["author"],
                "created_at": essay["created_at"]
            },
            "analysis": {
                "ai_detection": analysis.get("ai_detection", {}),
                "writing_quality": analysis.get("writing_quality", {}),
                "readability": analysis.get("readability", {}),
                "structure": analysis.get("structure", {})
            },
            "summary": self._generate_summary(analysis),
            "timestamp": datetime.now().isoformat()
        }

    def _generate_visualizations(self, analysis: Dict) -> Dict[str, str]:
        """Generate visualizations for analysis results."""
        try:
            # Try importing matplotlib with Agg backend (doesn't require Tcl/Tk)
            import matplotlib
            matplotlib.use('Agg')
            import matplotlib.pyplot as plt
            
            visualizations = {}
            
            # Generate readability visualization
            if "readability" in analysis:
                fig, ax = plt.subplots()
                metrics = analysis["readability"]
                ax.bar(list(metrics.keys()), list(metrics.values()))
                ax.set_title("Readability Metrics")
                
                # Save to bytes
                import io
                buf = io.BytesIO()
                fig.savefig(buf, format='png')
                buf.seek(0)
                visualizations["readability"] = buf.getvalue()
                plt.close(fig)
            
            # Generate vocabulary visualization
            if "vocabulary" in analysis and "vocabulary_metrics" in analysis["vocabulary"]:
                fig, ax = plt.subplots()
                metrics = analysis["vocabulary"]["vocabulary_metrics"]
                ax.bar(list(metrics.keys()), list(metrics.values()))
                ax.set_title("Vocabulary Metrics")
                
                # Save to bytes
                buf = io.BytesIO()
                fig.savefig(buf, format='png')
                buf.seek(0)
                visualizations["vocabulary"] = buf.getvalue()
                plt.close(fig)
            
            return visualizations
        except Exception as e:
            self.logger.error("Error generating visualizations", e)
            return {}

    def _generate_summary(self, analysis: Dict) -> Dict:
        """Generate analysis summary."""
        try:
            ai_score = analysis.get("ai_detection", {}).get("confidence_score", 0)
            quality_score = analysis.get("writing_quality", {}).get("grade_level", 0)
            readability_score = analysis.get("readability", {}).get("grade_level", 0)
            
            return {
                "ai_likelihood": "High" if ai_score > 0.7 else "Medium" if ai_score > 0.3 else "Low",
                "quality_rating": "Excellent" if quality_score > 10 else "Good" if quality_score > 7 else "Fair",
                "readability_level": f"Grade {readability_score:.1f}",
                "structure_complete": all(
                    analysis.get("structure", {}).get(k, False)
                    for k in ["has_introduction", "has_conclusion"]
                )
            }
        except Exception as e:
            self.logger.error("Error generating summary", e)
            return {}

    def _generate_report_file(self, data: Dict, format: str) -> Optional[Path]:
        """Generate report file in specified format."""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            report_path = self.base_path / f"report_{data['essay']['id']}_{timestamp}.{format}"
            
            if format == "pdf":
                self._generate_pdf_report(data, report_path)
            elif format == "html":
                template = self.jinja_env.get_template("report.html.jinja2")
                report_path.write_text(template.render(data))
            else:  # json
                report_path.write_text(json.dumps(data, indent=2))
            
            return report_path
        except Exception as e:
            self.logger.error(f"Error generating {format} report", e)
            return None

    def _generate_pdf_report(self, data: Dict, report_path: Path) -> None:
        """Generate PDF report using reportlab."""
        try:
            c = canvas.Canvas(str(report_path), pagesize=letter)
            y = 750  # Starting y position
            
            # Title
            c.setFont("Helvetica-Bold", 16)
            c.drawString(50, y, f"Analysis Report: {data['essay']['title']}")
            y -= 30
            
            # Summary
            c.setFont("Helvetica-Bold", 12)
            c.drawString(50, y, "Summary")
            y -= 20
            c.setFont("Helvetica", 10)
            for key, value in data["summary"].items():
                c.drawString(50, y, f"{key.replace('_', ' ').title()}: {value}")
                y -= 15
            
            # Add visualizations if available
            if "visualizations" in data:
                y -= 20
                for viz_name, viz_path in data["visualizations"].items():
                    if Path(viz_path).exists():
                        c.drawImage(viz_path, 50, y - 200, width=500, height=200)
                        y -= 220
            
            c.save()
        except Exception as e:
            self.logger.error("Error generating PDF report", e)
            raise

    def _store_report_metadata(self, essay_id: str, report_path: Path, format: str) -> None:
        """Store report metadata in database."""
        try:
            self.db.insert_report({
                "id": f"report_{essay_id}_{int(time.time())}",
                "essay_id": essay_id,
                "path": str(report_path),
                "format": format,
                "created_at": datetime.now().isoformat()
            })
        except Exception as e:
            self.logger.error("Error storing report metadata", e)

    def get_report(self, report_id: str) -> Optional[Dict]:
        """Retrieve report information."""
        try:
            return self.db.get_report(report_id)
        except Exception as e:
            self.logger.error(f"Error retrieving report {report_id}", e)
            return None

    def update_settings(self, settings: Dict) -> bool:
        """Update report settings."""
        try:
            self.settings.update(settings)
            return True
        except Exception as e:
            self.logger.error("Error updating settings", e)
            return False