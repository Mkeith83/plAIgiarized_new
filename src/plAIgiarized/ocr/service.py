from typing import Optional, Dict, List
import os
from PIL import Image
import pytesseract
import cv2
import numpy as np
from ..models.essay import Essay

class OCRService:
    def __init__(self):
        self.base_path = "data/ocr"
        os.makedirs(self.base_path, exist_ok=True)
        
        # Configure Tesseract path (Windows example)
        if os.name == 'nt':  # Windows
            pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

    def process_image(self, image_path: str) -> Optional[str]:
        """Process an image and extract text."""
        try:
            # Read image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not read image at {image_path}")

            # Preprocess image
            processed = self._preprocess_image(image)
            
            # Extract text
            text = pytesseract.image_to_string(processed)
            
            return text.strip()
        except Exception as e:
            print(f"Error processing image: {e}")
            return None

    def scan_handwritten_essay(self, image_path: str, student_id: str) -> Optional[Essay]:
        """Convert handwritten essay to Essay object."""
        try:
            # Process image
            text = self.process_image(image_path)
            if not text:
                return None

            # Create Essay object
            essay = Essay(
                student_id=student_id,
                content=text,
                type="handwritten",
                source_file=image_path
            )

            return essay
        except Exception as e:
            print(f"Error scanning essay: {e}")
            return None

    def _preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """Preprocess image for better OCR results."""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply thresholding to preprocess the image
            gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

            # Apply dilation to connect text components
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3,3))
            gray = cv2.dilate(gray, kernel, iterations=1)

            # Apply median blur to remove noise
            gray = cv2.medianBlur(gray, 3)

            return gray
        except Exception as e:
            print(f"Error preprocessing image: {e}")
            return image

    def enhance_handwriting(self, image: np.ndarray) -> np.ndarray:
        """Enhance handwriting for better recognition."""
        try:
            # Convert to grayscale if not already
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image.copy()

            # Apply adaptive thresholding
            binary = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                cv2.THRESH_BINARY_INV, 11, 2
            )

            # Remove noise
            kernel = np.ones((2,2), np.uint8)
            binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)

            # Thicken text
            binary = cv2.dilate(binary, kernel, iterations=1)

            return binary
        except Exception as e:
            print(f"Error enhancing handwriting: {e}")
            return image

    def detect_text_regions(self, image: np.ndarray) -> List[Dict[str, int]]:
        """Detect regions containing text."""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply thresholding
            _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            
            # Find contours
            contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Get bounding boxes for text regions
            regions = []
            for contour in contours:
                x, y, w, h = cv2.boundingRect(contour)
                if w > 20 and h > 20:  # Filter out small regions
                    regions.append({
                        "x": x,
                        "y": y,
                        "width": w,
                        "height": h
                    })
            
            return regions
        except Exception as e:
            print(f"Error detecting text regions: {e}")
            return []
