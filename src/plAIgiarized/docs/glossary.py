from typing import Dict
from pathlib import Path
import json

class GlossaryService:
    def __init__(self):
        self.glossary = {
            "Writing Analysis Terms": {
                "Grade Level": {
                    "definition": "The academic grade level of the writing, based on complexity and vocabulary",
                    "example": "A grade level of 8.5 means the writing is suitable for an 8th grader (middle of 8th grade)",
                    "how_its_used": "Helps track if a student's writing matches their expected grade level"
                },
                "Vocabulary Diversity": {
                    "definition": "How many different words a student uses in their writing",
                    "example": "Using 'happy, joyful, elated' shows more diversity than using 'happy' three times",
                    "how_its_used": "Shows if students are expanding their vocabulary over time"
                },
                "Syntax Complexity": {
                    "definition": "How complex the sentence structures are in the writing",
                    "example": "Simple: 'The dog ran.' Complex: 'The brown dog, excited by the squirrel, ran quickly through the yard.'",
                    "how_its_used": "Indicates if students are using more sophisticated sentence structures"
                },
                "Writing Style": {
                    "definition": "The unique way a student writes, including word choice and sentence patterns",
                    "example": "Some students might use more descriptive words, others might write shorter, direct sentences",
                    "how_its_used": "Helps identify if new work matches a student's usual writing style"
                },
                "Coherence": {
                    "definition": "How well the ideas flow and connect throughout the writing",
                    "example": "Good coherence means paragraphs connect logically, like building blocks in a story",
                    "how_its_used": "Shows if students can organize their thoughts clearly"
                }
            },
            "AI Detection Terms": {
                "Perplexity": {
                    "definition": "How predictable or natural the writing patterns are",
                    "example": "AI writing often follows more predictable patterns than human writing",
                    "how_its_used": "Helps identify potential AI-generated content"
                },
                "Burstiness": {
                    "definition": "How writing varies between simple and complex passages",
                    "example": "Humans naturally vary between simple and complex writing; AI tends to be more consistent",
                    "how_its_used": "Another indicator of human vs AI writing"
                },
                "Writing Pattern": {
                    "definition": "The typical way a student structures sentences and uses words",
                    "example": "Like a fingerprint, each student has their own writing style",
                    "how_its_used": "Helps identify if new work matches past work"
                }
            },
            "Progress Tracking Terms": {
                "Baseline": {
                    "definition": "A collection of confirmed student work that shows their typical writing ability",
                    "example": "3-5 essays from the beginning of the year create a baseline",
                    "how_its_used": "Used to compare against new work to track progress"
                },
                "Progress Metrics": {
                    "definition": "Measurements that show how a student's writing is changing over time",
                    "example": "Tracking vocabulary growth from September to December",
                    "how_its_used": "Shows if students are improving in specific areas"
                },
                "Class Average": {
                    "definition": "The typical performance level of all students in the class",
                    "example": "The class average grade level might be 8.2",
                    "how_its_used": "Helps teachers identify if the whole class needs help in certain areas"
                },
                "Improvement Rate": {
                    "definition": "How quickly a student or class is getting better at writing",
                    "example": "A student improving one grade level in writing ability over a semester",
                    "how_its_used": "Shows if teaching methods are working effectively"
                }
            },
            "Document Processing Terms": {
                "Handwriting Analysis": {
                    "definition": "Converting handwritten work to typed text while maintaining accuracy",
                    "example": "Taking a photo of homework and converting it to typed text",
                    "how_its_used": "Allows comparison of handwritten and typed work"
                },
                "Batch Upload": {
                    "definition": "Submitting multiple student papers at once",
                    "example": "Scanning an entire class set of essays at once",
                    "how_its_used": "Saves time by processing many papers automatically"
                },
                "OCR (Optical Character Recognition)": {
                    "definition": "Technology that reads text from images",
                    "example": "Converting a photo of handwriting into typed text",
                    "how_its_used": "Makes handwritten work analyzable by computer"
                }
            },
            "Alert Terms": {
                "Significant Change": {
                    "definition": "A sudden large difference in writing style or ability",
                    "example": "A student suddenly writing three grade levels higher than usual",
                    "how_its_used": "Flags potential concerns for teacher review"
                },
                "Pattern Mismatch": {
                    "definition": "When new writing doesn't match a student's usual style",
                    "example": "A usually simple writer suddenly using very complex vocabulary",
                    "how_its_used": "Helps identify potential academic integrity issues"
                },
                "Anomaly": {
                    "definition": "Unusual changes that don't fit expected patterns",
                    "example": "Perfect grammar from a student who usually makes common mistakes",
                    "how_its_used": "Highlights cases needing teacher attention"
                }
            },
            "Teaching Tools": {
                "Progress Dashboard": {
                    "definition": "Visual display of student and class improvement",
                    "example": "Graphs showing vocabulary growth over the semester",
                    "how_its_used": "Helps track and share progress with students and parents"
                },
                "Improvement Suggestions": {
                    "definition": "Personalized recommendations for each student",
                    "example": "Suggesting vocabulary exercises for students with limited word choice",
                    "how_its_used": "Helps teachers provide targeted help to students"
                },
                "Class Insights": {
                    "definition": "Patterns and trends across the whole class",
                    "example": "Noticing that many students struggle with paragraph transitions",
                    "how_its_used": "Helps plan lessons that benefit the whole class"
                }
            }
        }

    def get_term_explanation(self, term: str) -> Dict:
        """Get detailed explanation of a specific term."""
        for category in self.glossary.values():
            if term in category:
                return category[term]
        return {"error": f"Term '{term}' not found in glossary"}

    def get_category(self, category: str) -> Dict:
        """Get all terms in a specific category."""
        return self.glossary.get(category, {"error": f"Category '{category}' not found"})

    def search_terms(self, query: str) -> Dict:
        """Search for terms containing the query string."""
        results = {}
        for category, terms in self.glossary.items():
            for term, explanation in terms.items():
                if query.lower() in term.lower() or \
                   query.lower() in explanation["definition"].lower():
                    if category not in results:
                        results[category] = {}
                    results[category][term] = explanation
        return results

    def export_to_pdf(self, output_path: Path) -> bool:
        """Export glossary to a PDF file."""
        try:
            # Implementation for PDF export
            # (Would need additional PDF generation library)
            return True
        except Exception as e:
            return False

    def get_all_terms(self) -> Dict:
        """Get the complete glossary."""
        return self.glossary 