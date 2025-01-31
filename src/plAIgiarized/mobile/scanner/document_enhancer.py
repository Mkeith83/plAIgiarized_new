from typing import Dict, Optional, Tuple
import cv2
import numpy as np
from PIL import Image
import io
from plAIgiarized.logging.service import LoggingService

class DocumentEnhancer:
    def __init__(self):
        self.logger = LoggingService()
        
        # Enhancement settings
        self.settings = {
            "sharpness": 1.5,          # Sharpness enhancement factor
            "contrast": 1.2,           # Contrast enhancement factor
            "brightness": 1.1,         # Brightness enhancement factor
            "denoise_strength": 10,    # Denoising strength
            "auto_rotate": True,       # Auto-rotate documents
            "text_enhance": True,      # Enhance text readability
            "color_balance": True,     # Auto color balance
            "shadow_remove": True      # Remove shadows
        }
        
        # Initialize enhancement kernels
        self._initialize_kernels()

    def _initialize_kernels(self):
        """Initialize enhancement kernels."""
        # Sharpening kernel
        self.sharpen_kernel = np.array([
            [-1, -1, -1],
            [-1,  9, -1],
            [-1, -1, -1]
        ])
        
        # Text enhancement kernel
        self.text_kernel = np.array([
            [0, -1, 0],
            [-1, 5, -1],
            [0, -1, 0]
        ])

    def enhance_document(self, image: np.ndarray) -> Dict:
        """Enhance scanned document."""
        try:
            # Create copy for processing
            enhanced = image.copy()
            
            # Apply enhancements in optimal order
            if self.settings["shadow_remove"]:
                enhanced = self._remove_shadows(enhanced)
            
            if self.settings["color_balance"]:
                enhanced = self._balance_colors(enhanced)
            
            if self.settings["auto_rotate"]:
                enhanced, angle = self._auto_rotate(enhanced)
            else:
                angle = 0
            
            # Basic enhancements
            enhanced = self._enhance_basic(enhanced)
            
            if self.settings["text_enhance"]:
                enhanced = self._enhance_text(enhanced)
            
            # Final denoising
            enhanced = cv2.fastNlMeansDenoisingColored(
                enhanced,
                None,
                self.settings["denoise_strength"],
                self.settings["denoise_strength"],
                7,
                21
            )
            
            return {
                "enhanced_image": enhanced,
                "rotation_angle": angle,
                "settings_used": self.settings.copy()
            }

        except Exception as e:
            self.logger.error("Error enhancing document", e)
            return {
                "enhanced_image": image,
                "rotation_angle": 0,
                "settings_used": self.settings.copy(),
                "error": str(e)
            }

    def _remove_shadows(self, image: np.ndarray) -> np.ndarray:
        """Remove shadows from document."""
        try:
            rgb_planes = cv2.split(image)
            result_planes = []
            
            for plane in rgb_planes:
                dilated = cv2.dilate(plane, np.ones((7,7), np.uint8))
                bg_img = cv2.medianBlur(dilated, 21)
                diff_img = 255 - cv2.absdiff(plane, bg_img)
                result_planes.append(diff_img)
                
            return cv2.merge(result_planes)

        except Exception as e:
            self.logger.error("Error removing shadows", e)
            return image

    def _balance_colors(self, image: np.ndarray) -> np.ndarray:
        """Auto balance colors."""
        try:
            lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            
            # Apply CLAHE to L channel
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
            cl = clahe.apply(l)
            
            # Merge channels
            balanced = cv2.merge((cl,a,b))
            return cv2.cvtColor(balanced, cv2.COLOR_LAB2BGR)

        except Exception as e:
            self.logger.error("Error balancing colors", e)
            return image

    def _auto_rotate(self, image: np.ndarray) -> Tuple[np.ndarray, float]:
        """Auto-rotate document based on text orientation."""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 50, 150, apertureSize=3)
            
            # Find lines using Hough transform
            lines = cv2.HoughLines(edges, 1, np.pi/180, 200)
            
            if lines is not None:
                # Calculate dominant angle
                angles = []
                for rho, theta in lines[:, 0]:
                    angle = np.degrees(theta)
                    if angle < 45:
                        angles.append(angle)
                    elif angle > 135:
                        angles.append(angle - 180)
                
                if angles:
                    median_angle = np.median(angles)
                    if abs(median_angle) > 0.5:  # Only rotate if angle is significant
                        # Get rotation matrix
                        height, width = image.shape[:2]
                        center = (width//2, height//2)
                        matrix = cv2.getRotationMatrix2D(center, median_angle, 1.0)
                        
                        # Rotate image
                        rotated = cv2.warpAffine(
                            image,
                            matrix,
                            (width, height),
                            flags=cv2.INTER_CUBIC,
                            borderMode=cv2.BORDER_REPLICATE
                        )
                        return rotated, median_angle
            
            return image, 0.0

        except Exception as e:
            self.logger.error("Error auto-rotating", e)
            return image, 0.0

    def _enhance_basic(self, image: np.ndarray) -> np.ndarray:
        """Apply basic enhancements."""
        try:
            # Convert to float for processing
            image_float = image.astype(float)
            
            # Apply contrast
            image_float = image_float * self.settings["contrast"]
            
            # Apply brightness
            image_float = image_float * self.settings["brightness"]
            
            # Clip values
            image_float = np.clip(image_float, 0, 255)
            
            # Convert back to uint8
            enhanced = image_float.astype(np.uint8)
            
            # Apply sharpening
            enhanced = cv2.filter2D(
                enhanced,
                -1,
                self.sharpen_kernel * self.settings["sharpness"]
            )
            
            return enhanced

        except Exception as e:
            self.logger.error("Error applying basic enhancements", e)
            return image

    def _enhance_text(self, image: np.ndarray) -> np.ndarray:
        """Enhance text readability."""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply text enhancement kernel
            enhanced_gray = cv2.filter2D(gray, -1, self.text_kernel)
            
            # Adaptive thresholding
            binary = cv2.adaptiveThreshold(
                enhanced_gray,
                255,
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY,
                11,
                2
            )
            
            # Convert back to color
            result = cv2.cvtColor(binary, cv2.COLOR_GRAY2BGR)
            
            # Blend with original
            return cv2.addWeighted(image, 0.7, result, 0.3, 0)

        except Exception as e:
            self.logger.error("Error enhancing text", e)
            return image 