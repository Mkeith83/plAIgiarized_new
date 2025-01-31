from pydantic import BaseModel
from datetime import datetime
from typing import Dict, Optional

class Essay(BaseModel):
    id: str
    student_id: str
    content: str
    type: str
    created_at: datetime
    metrics: Optional[Dict] = None
