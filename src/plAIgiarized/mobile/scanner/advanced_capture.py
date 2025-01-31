from typing import Dict, Optional
import cv2
import numpy as np
from PIL import Image
import io
from plAIgiarized.logging.service import LoggingService

class AdvancedDocumentScanner:
    def __init__(self):
        self.logger = LoggingService()
        
        # Scanner settings
        self.settings = {
            "min_doc_area": 0.25,      # Minimum document area ratio
            "focus_threshold": 100.0,   # Laplacian variance threshold
            "brightness_threshold": 0.4, # Minimum brightness
            "stability_frames": 10,     # Frames to confirm stability
            "edge_sensitivity": 0.8     # Edge detection sensitivity
        }
        
        # Scanner state
        self.state = {
            "is_focused": False,
            "doc_detected": False,
            "stable_frames": 0,
            "last_corners": None,
            "ready_to_capture": False
        }

    def process_frame(self, frame: np.ndarray) -> Dict:
        """Process camera frame for document detection and focus."""
        try:
            # Convert to grayscale for processing
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Check focus
            focus_score = self._check_focus(gray)
            self.state["is_focused"] = focus_score > self.settings["focus_threshold"]
            
            # Detect document
            corners = self._detect_document(gray)
            if corners is not None:
                self.state["doc_detected"] = True
                
                # Check stability
                if self._check_stability(corners):
                    self.state["stable_frames"] += 1
                else:
                    self.state["stable_frames"] = 0
                
                self.state["last_corners"] = corners
            else:
                self.state["doc_detected"] = False
                self.state["stable_frames"] = 0
            
            # Update capture readiness
            self.state["ready_to_capture"] = (
                self.state["is_focused"] and 
                self.state["doc_detected"] and
                self.state["stable_frames"] >= self.settings["stability_frames"]
            )
            
            # Draw feedback
            annotated_frame = self._draw_feedback(frame.copy())
            
            return {
                "frame": annotated_frame,
                "state": self.state,
                "corners": corners if self.state["doc_detected"] else None
            }

        except Exception as e:
            self.logger.error("Error processing frame", e)
            return {"frame": frame, "state": self.state, "corners": None}

    def _check_focus(self, gray: np.ndarray) -> float:
        """Check image focus using Laplacian variance."""
        try:
            laplacian = cv2.Laplacian(gray, cv2.CV_64F)
            return laplacian.var()
            
        except Exception as e:
            self.logger.error("Error checking focus", e)
            return 0.0

    def _detect_document(self, gray: np.ndarray) -> Optional[np.ndarray]:
        """Detect document corners in frame."""
        try:
            # Apply edge detection
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            edges = cv2.Canny(
                blurred,
                50,
                150 * self.settings["edge_sensitivity"]
            )
            
            # Find contours
            contours, _ = cv2.findContours(
                edges,
                cv2.RETR_EXTERNAL,
                cv2.CHAIN_APPROX_SIMPLE
            )
            
            if not contours:
                return None
            
            # Find largest contour
            largest_contour = max(contours, key=cv2.contourArea)
            
            # Check minimum area
            image_area = gray.shape[0] * gray.shape[1]
            if cv2.contourArea(largest_contour) < image_area * self.settings["min_doc_area"]:
                return None
            
            # Approximate polygon
            epsilon = 0.02 * cv2.arcLength(largest_contour, True)
            approx = cv2.approxPolyDP(largest_contour, epsilon, True)
            
            # Check if it's a quadrilateral
            if len(approx) == 4:
                return approx.reshape(4, 2)
            
            return None

        except Exception as e:
            self.logger.error("Error detecting document", e)
            return None

    def _check_stability(self, corners: np.ndarray) -> bool:
        """Check if detected corners are stable."""
        try:
            if self.state["last_corners"] is None:
                return False
            
            # Calculate corner movement
            movement = np.linalg.norm(
                corners - self.state["last_corners"]
            )
            
            return movement < 10.0  # Pixels threshold
            
        except Exception as e:
            self.logger.error("Error checking stability", e)
            return False

    def _draw_feedback(self, frame: np.ndarray) -> np.ndarray:
        """Draw visual feedback on frame."""
        try:
            # Draw document outline
            if self.state["doc_detected"] and self.state["last_corners"] is not None:
                cv2.polylines(
                    frame,
                    [self.state["last_corners"].reshape((-1, 1, 2))],
                    True,
                    (0, 255, 0) if self.state["ready_to_capture"] else (0, 255, 255),
                    2
                )
            
            # Draw focus indicator
            focus_color = (0, 255, 0) if self.state["is_focused"] else (0, 0, 255)
            cv2.circle(frame, (30, 30), 10, focus_color, -1)
            
            # Draw stability progress
            if self.state["stable_frames"] > 0:
                progress = min(
                    self.state["stable_frames"] / self.settings["stability_frames"],
                    1.0
                )
                cv2.rectangle(
                    frame,
                    (10, 50),
                    (10 + int(100 * progress), 60),
                    (0, 255, 0),
                    -1
                )
            
            return frame

        except Exception as e:
            self.logger.error("Error drawing feedback", e)
            return frame

    def capture_document(self, frame: np.ndarray) -> Optional[Image.Image]:
        """Capture and process document when ready."""
        try:
            if not self.state["ready_to_capture"]:
                return None
            
            # Get perspective transform
            corners = self.state["last_corners"]
            target_size = (800, 1000)  # A4 aspect ratio
            target_corners = np.array([
                [0, 0],
                [target_size[0], 0],
                [target_size[0], target_size[1]],
                [0, target_size[1]]
            ], dtype=np.float32)
            
            # Order corners
            corners = self._order_corners(corners)
            
            # Apply perspective transform
            matrix = cv2.getPerspectiveTransform(
                corners.astype(np.float32),
                target_corners
            )
            warped = cv2.warpPerspective(frame, matrix, target_size)
            
            # Convert to PIL Image
            return Image.fromarray(cv2.cvtColor(warped, cv2.COLOR_BGR2RGB))

        except Exception as e:
            self.logger.error("Error capturing document", e)
            return None

    def _order_corners(self, corners: np.ndarray) -> np.ndarray:
        """Order corners [top-left, top-right, bottom-right, bottom-left]."""
        try:
            # Calculate center
            center = corners.mean(axis=0)
            
            # Get angles
            angles = np.arctan2(
                corners[:, 1] - center[1],
                corners[:, 0] - center[0]
            )
            
            # Sort by angle
            sorted_indices = np.argsort(angles)
            return corners[sorted_indices]

        except Exception as e:
            self.logger.error("Error ordering corners", e)
            return corners 