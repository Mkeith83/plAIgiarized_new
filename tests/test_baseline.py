import sys
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

import pytest
from datetime import datetime
from plAIgiarized.models.essay import Essay
from plAIgiarized.baseline.service import BaselineService

def test_baseline_storage():
    service = BaselineService()

    # Create a test baseline essay
    baseline_essay = Essay(
        id="baseline_1",
        student_id="student_1",
        content="""I have a Dream
By Martin Luther King
I have a dream speech and the poems we have read all come together and show us the
rhetorical strategies the authors use to get our attention. Some being logos, ethos and
pathos. Even figurative language like metaphors and reputation. This gets our attention
and makes us want to read the words of his art more.""",
        type="baseline",
        created_at=datetime.now()
    )

    # Store and analyze baseline
    assert service.store_baseline_essay(baseline_essay) == True

    # Verify metrics were calculated
    assert baseline_essay.metrics is not None
    assert "vocabulary_size" in baseline_essay.metrics
    assert "avg_word_length" in baseline_essay.metrics
    assert "avg_sentence_length" in baseline_essay.metrics
    assert "sentence_complexity" in baseline_essay.metrics
    assert "style_fingerprint" in baseline_essay.metrics
    assert "grade_level" in baseline_essay.metrics

    # Verify reasonable values
    metrics = baseline_essay.metrics
    assert 20 <= metrics["vocabulary_size"] <= 200
    assert 3.0 <= metrics["avg_word_length"] <= 8.0
    assert 5.0 <= metrics["avg_sentence_length"] <= 30.0
    assert 0.0 <= metrics["sentence_complexity"] <= 5.0
    assert 0.0 <= metrics["style_fingerprint"] <= 10.0
    assert 0.0 <= metrics["grade_level"] <= 12.0
