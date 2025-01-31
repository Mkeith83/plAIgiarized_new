from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from typing import Dict, Optional
import uvicorn

from plAIgiarized.analysis.service import AnalysisService
from plAIgiarized.logging.service import LoggingService
from plAIgiarized.database.service import DatabaseService
from plAIgiarized.mobile.security.auth_manager import MobileAuthManager

app = FastAPI(
    title="plAIgiarized API",
    description="AI-powered plagiarism and AI content detection",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Services
logger = LoggingService()
analysis_service = AnalysisService()
db_service = DatabaseService()
auth_manager = MobileAuthManager()

# Auth
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.post("/analyze")
async def analyze_text(
    text: str,
    token: str = Depends(oauth2_scheme)
) -> Dict:
    """Analyze text for AI content."""
    try:
        # Store essay
        essay_id = db_service.store_essay({"content": text})
        
        # Analyze
        result = analysis_service.analyze_essay(essay_id)
        
        return result
    except Exception as e:
        logger.error("Error analyzing text", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/file")
async def analyze_file(
    file: UploadFile = File(...),
    token: str = Depends(oauth2_scheme)
) -> Dict:
    """Analyze uploaded file."""
    try:
        content = await file.read()
        text = content.decode()
        
        # Store essay
        essay_id = db_service.store_essay({
            "content": text,
            "filename": file.filename
        })
        
        # Analyze
        result = analysis_service.analyze_essay(essay_id)
        
        return result
    except Exception as e:
        logger.error("Error analyzing file", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/results/{essay_id}")
async def get_results(
    essay_id: str,
    token: str = Depends(oauth2_scheme)
) -> Dict:
    """Get analysis results."""
    try:
        result = analysis_service._get_cached_analysis(essay_id)
        if not result:
            raise HTTPException(status_code=404, detail="Results not found")
        return result
    except Exception as e:
        logger.error(f"Error retrieving results for {essay_id}", e)
        raise HTTPException(status_code=500, detail=str(e))

def start():
    """Start the FastAPI server."""
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    start() 