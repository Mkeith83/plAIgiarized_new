from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from typing import Dict, List
from ..models.essay import Essay
from ..dashboard.service import DashboardService
from ..progress.service import ProgressService

class WebService:
    def __init__(self):
        self.app = FastAPI()
        self.templates = Jinja2Templates(directory="src/plAIgiarized/web/templates")
        self.dashboard_service = DashboardService()
        self.progress_service = ProgressService()
        
        # Mount static files
        self.app.mount("/static", StaticFiles(directory="src/plAIgiarized/web/static"), name="static")
        
        # Register routes
        self.register_routes()

    def register_routes(self):
        @self.app.get("/")
        async def home(request: Request):
            stats = {
                "total_students": 0,
                "total_essays": 0,
                "ai_detection_rate": 0.0
            }
            # Fixed order: request first, then template name
            return self.templates.TemplateResponse(request, "home.html", {"stats": stats})
