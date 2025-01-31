import nltk
from .logging.service import LoggingService

logger = LoggingService()

def setup_nltk():
    """Download required NLTK resources."""
    resources = [
        'averaged_perceptron_tagger',
        'punkt',
        'stopwords'
    ]
    for resource in resources:
        try:
            nltk.download(resource, quiet=True)
        except Exception as e:
            logger.error(f"Error downloading NLTK resource {resource}", e)

# Run setup when module is imported
setup_nltk()
