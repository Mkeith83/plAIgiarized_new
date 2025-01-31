from fastapi.testclient import TestClient
from fastapi import FastAPI
from pydantic import BaseModel

# Create request model
class AnalyzeRequest(BaseModel):
    text: str

# Create a simple test app
app = FastAPI()

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/analyze")
async def analyze(request: AnalyzeRequest):
    return {
        "ai_detection": {
            "is_ai_generated": False,
            "confidence_score": 0.3
        }
    }

# Create test client
client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_analyze():
    response = client.post(
        "/analyze",
        json={"text": "test"}
    )
    assert response.status_code == 200
    assert "ai_detection" in response.json()

