from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict

class Essay(BaseModel):
    id: str
    student_id: str
    content: str
    type: str
    created_at: datetime
    metrics: Optional[Dict[str, float]] = None
