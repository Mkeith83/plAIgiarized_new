from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
from pathlib import Path
import json
from typing import Dict, List, Optional
from ..logging.service import LoggingService
from ..core.smart_orchestrator import SmartOrchestrator
from PIL import Image
import io
import base64

class MobileWebInterface:
    def __init__(self):
        self.logger = LoggingService()
        self.app = Flask(__name__)
        CORS(self.app)  # Enable cross-origin requests
        
        # Template paths
        self.template_dir = Path(__file__).parent / "templates"
        self.static_dir = Path(__file__).parent / "static"
        
        # Active orchestrators
        self.orchestrators: Dict[str, SmartOrchestrator] = {}
        
        self._setup_routes()
        self._setup_templates()

    def _setup_routes(self):
        """Setup Flask routes."""
        
        @self.app.route('/')
        def home():
            """Responsive home page."""
            return render_template('mobile_home.html')

        @self.app.route('/login', methods=['POST'])
        def login():
            """Handle teacher login."""
            data = request.get_json()
            teacher_id = data.get('teacher_id')
            
            if teacher_id not in self.orchestrators:
                self.orchestrators[teacher_id] = SmartOrchestrator(teacher_id)
            
            return jsonify({"status": "success", "token": teacher_id})

        @self.app.route('/dashboard')
        def dashboard():
            """Responsive dashboard."""
            teacher_id = request.args.get('token')
            if teacher_id not in self.orchestrators:
                return redirect('/login')
                
            orchestrator = self.orchestrators[teacher_id]
            return render_template(
                'mobile_dashboard.html',
                state=orchestrator.state
            )

        @self.app.route('/scan', methods=['GET', 'POST'])
        def scan():
            """Handle document scanning."""
            if request.method == 'GET':
                return render_template('mobile_scan.html')
                
            # Handle scan upload
            teacher_id = request.form.get('token')
            if teacher_id not in self.orchestrators:
                return jsonify({"error": "Invalid session"})
                
            try:
                image_file = request.files['scan']
                image = Image.open(image_file)
                
                # Process scan
                result = self._process_scan(image, teacher_id)
                return jsonify(result)
                
            except Exception as e:
                self.logger.error("Scan error", e)
                return jsonify({"error": "Scan processing failed"})

        @self.app.route('/api/state')
        def get_state():
            """Get current state."""
            teacher_id = request.args.get('token')
            if teacher_id not in self.orchestrators:
                return jsonify({"error": "Invalid session"})
                
            orchestrator = self.orchestrators[teacher_id]
            return jsonify(orchestrator.state)

        @self.app.route('/api/action', methods=['POST'])
        def handle_action():
            """Handle mobile actions."""
            teacher_id = request.args.get('token')
            if teacher_id not in self.orchestrators:
                return jsonify({"error": "Invalid session"})
                
            orchestrator = self.orchestrators[teacher_id]
            action = request.get_json()
            
            try:
                orchestrator._handle_action(action)
                return jsonify({"status": "success"})
            except Exception as e:
                self.logger.error("Action error", e)
                return jsonify({"error": "Action failed"})

    def _setup_templates(self):
        """Setup mobile-optimized templates."""
        # Create template directory if needed
        self.template_dir.mkdir(parents=True, exist_ok=True)
        
        # Create mobile-optimized templates
        self._create_home_template()
        self._create_dashboard_template()
        self._create_scan_template()

    def _create_home_template(self):
        """Create mobile-optimized home template."""
        template = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>plAIgiarized Mobile</title>
            <link rel="stylesheet" href="/static/mobile.css">
        </head>
        <body>
            <div class="container">
                <h1>plAIgiarized</h1>
                <div class="login-form">
                    <input type="text" id="teacherId" placeholder="Teacher ID">
                    <button onclick="login()">Login</button>
                </div>
            </div>
            <script src="/static/mobile.js"></script>
        </body>
        </html>
        """
        
        with open(self.template_dir / "mobile_home.html", "w") as f:
            f.write(template)

    def _create_dashboard_template(self):
        """Create mobile-optimized dashboard template."""
        template = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Teaching Dashboard</title>
            <link rel="stylesheet" href="/static/mobile.css">
        </head>
        <body>
            <div class="mobile-dashboard">
                <nav class="nav-bar">
                    <button onclick="showSection('overview')">Overview</button>
                    <button onclick="showSection('tasks')">Tasks</button>
                    <button onclick="showSection('scan')">Scan</button>
                    <button onclick="showSection('reports')">Reports</button>
                </nav>
                
                <div id="overview" class="section">
                    <div class="quick-stats">
                        <!-- Dynamic stats -->
                    </div>
                    <div class="recent-activity">
                        <!-- Dynamic activity -->
                    </div>
                </div>
                
                <div id="tasks" class="section hidden">
                    <div class="task-list">
                        <!-- Dynamic tasks -->
                    </div>
                </div>
                
                <div id="scan" class="section hidden">
                    <div class="scan-options">
                        <button onclick="startScan('camera')">📸 Use Camera</button>
                        <button onclick="startScan('upload')">📁 Upload Image</button>
                    </div>
                    <div id="scan-preview"></div>
                </div>
                
                <div id="reports" class="section hidden">
                    <div class="report-list">
                        <!-- Dynamic reports -->
                    </div>
                </div>
            </div>
            <script src="/static/dashboard.js"></script>
        </body>
        </html>
        """
        
        with open(self.template_dir / "mobile_dashboard.html", "w") as f:
            f.write(template)

    def _create_scan_template(self):
        """Create mobile-optimized scan template."""
        template = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document Scanner</title>
            <link rel="stylesheet" href="/static/mobile.css">
        </head>
        <body>
            <div class="scan-interface">
                <div class="camera-container">
                    <video id="camera" autoplay playsinline></video>
                    <canvas id="preview" class="hidden"></canvas>
                </div>
                
                <div class="scan-controls">
                    <button id="captureBtn" onclick="captureScan()">
                        📸 Capture
                    </button>
                    <button id="retakeBtn" class="hidden" onclick="retakeScan()">
                        ↺ Retake
                    </button>
                    <button id="uploadBtn" class="hidden" onclick="uploadScan()">
                        ✓ Upload
                    </button>
                </div>
                
                <div class="scan-tips">
                    <h3>Tips for best results:</h3>
                    <ul>
                        <li>Ensure good lighting</li>
                        <li>Keep the paper flat</li>
                        <li>Align with guide frame</li>
                        <li>Hold steady when capturing</li>
                    </ul>
                </div>
            </div>
            <script src="/static/scanner.js"></script>
        </body>
        </html>
        """
        
        with open(self.template_dir / "mobile_scan.html", "w") as f:
            f.write(template)

    def _process_scan(self, image: Image, teacher_id: str) -> Dict:
        """Process scanned document."""
        try:
            # Convert to grayscale
            gray = image.convert('L')
            
            # Enhance contrast
            enhanced = Image.fromarray(np.uint8(255 * (np.array(gray) / 255) ** 0.8))
            
            # Convert to bytes
            buffer = io.BytesIO()
            enhanced.save(buffer, format='PNG')
            image_b64 = base64.b64encode(buffer.getvalue()).decode()
            
            # Get orchestrator
            orchestrator = self.orchestrators[teacher_id]
            
            # Process scan
            result = orchestrator._process_document_scan({
                "type": "scan",
                "image": image_b64,
                "timestamp": datetime.now().isoformat()
            })
            
            return {
                "status": "success",
                "preview": image_b64,
                "result": result
            }

        except Exception as e:
            self.logger.error("Scan processing error", e)
            return {"error": "Failed to process scan"}

    def run(self, host: str = "0.0.0.0", port: int = 5000):
        """Run the web interface."""
        self.app.run(host=host, port=port)

    def stop(self):
        """Stop the web interface."""
        # Cleanup orchestrators
        for orchestrator in self.orchestrators.values():
            orchestrator.destroy() 