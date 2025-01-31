from typing import Dict, List, Optional, Tuple, BinaryIO
from pathlib import Path
import os
import re
from datetime import datetime
import pytesseract
from pdf2image import convert_from_path
import cv2
import numpy as np
from PIL import Image
import docx
import fitz  # PyMuPDF
import pandas as pd
from fuzzywuzzy import fuzz
from ..logging.service import LoggingService
from ..database.service import DatabaseService
from ..student.service import StudentProgressService
from ..class.service import ClassProgressService
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
import torch
from scipy import ndimage
import math
from skimage.filters import threshold_local
from deskew import determine_skew
import easyocr

class DocumentProcessingService:
    def __init__(self):
        self.logger = LoggingService()
        self.db = DatabaseService()
        self.student_service = StudentProgressService()
        self.class_service = ClassProgressService()
        
        # Initialize OCR engines
        self.reader = easyocr.Reader(['en'])  # For general handwriting
        self.processor = TrOCRProcessor.from_pretrained('microsoft/trocr-large-handwritten')
        self.model = VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-large-handwritten')
        
        if torch.cuda.is_available():
            self.model.to('cuda')
        
        # Document processing settings
        self.settings = {
            "allowed_extensions": [".pdf", ".docx", ".doc", ".txt", ".jpg", ".jpeg", ".png"],
            "min_confidence": 0.85,  # Minimum confidence for OCR
            "max_file_size": 10 * 1024 * 1024,  # 10MB
            "student_match_threshold": 85,  # Fuzzy matching threshold
            "batch_size": 50,  # Maximum files to process in one batch
            "ocr_settings": {
                "lang": "eng",
                "config": "--oem 3 --psm 3",
                "dpi": 300
            },
            "handwriting": {
                "min_confidence": 0.65,
                "preprocessing": {
                    "denoise_strength": 10,
                    "contrast_limit": 2.0,
                    "binarization_threshold": 0.3,
                    "deskew_angle_threshold": 0.1
                },
                "validation": {
                    "min_word_length": 2,
                    "max_word_length": 45,
                    "language_check": True
                }
            },
            "baseline": {
                "min_samples": 3,
                "max_samples": 10,
                "required_confidence": 0.75
            }
        }
        
        # Initialize OCR and document paths
        self.upload_dir = Path("data/uploads")
        self.processed_dir = Path("data/processed")
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.processed_dir.mkdir(parents=True, exist_ok=True)

    def process_batch(self, class_id: str, files: List[Dict], 
                     student_roster: Optional[Dict] = None) -> Dict:
        """Process a batch of documents and route to appropriate students."""
        try:
            if len(files) > self.settings["batch_size"]:
                raise ValueError(f"Batch size exceeds maximum of {self.settings['batch_size']}")

            results = {
                "class_id": class_id,
                "timestamp": datetime.now().isoformat(),
                "processed": [],
                "failed": [],
                "student_matches": {},
                "class_analysis": None
            }

            # Get class roster if not provided
            if not student_roster:
                student_roster = self.db.get_class_roster(class_id)

            # Process each file
            for file_info in files:
                try:
                    # Extract text and student info
                    text = self._extract_text(file_info["path"])
                    student_info = self._identify_student(text, student_roster)
                    
                    if student_info and student_info["confidence"] >= self.settings["student_match_threshold"]:
                        # Create essay record
                        essay_id = f"essay_{int(datetime.now().timestamp())}_{student_info['student_id']}"
                        essay_data = {
                            "id": essay_id,
                            "student_id": student_info["student_id"],
                            "class_id": class_id,
                            "content": text,
                            "filename": file_info["filename"],
                            "timestamp": datetime.now().isoformat(),
                            "metadata": {
                                "source": file_info.get("source", "batch_upload"),
                                "original_path": str(file_info["path"]),
                                "word_count": len(text.split())
                            }
                        }
                        
                        # Store essay
                        if self.db.store_essay(essay_data):
                            # Analyze student progress
                            progress = self.student_service.analyze_progress(
                                student_info["student_id"], 
                                essay_id
                            )
                            
                            results["processed"].append({
                                "filename": file_info["filename"],
                                "student_id": student_info["student_id"],
                                "student_name": student_info["name"],
                                "confidence": student_info["confidence"],
                                "essay_id": essay_id,
                                "progress": progress
                            })
                            
                            # Track student matches
                            results["student_matches"][student_info["student_id"]] = {
                                "name": student_info["name"],
                                "essays_processed": results["student_matches"].get(
                                    student_info["student_id"], {"essays_processed": 0}
                                )["essays_processed"] + 1
                            }
                    else:
                        results["failed"].append({
                            "filename": file_info["filename"],
                            "error": "Could not confidently match to a student",
                            "best_match": student_info if student_info else None
                        })

                except Exception as e:
                    self.logger.error(f"Error processing file {file_info['filename']}", e)
                    results["failed"].append({
                        "filename": file_info["filename"],
                        "error": str(e)
                    })

            # Update class analysis
            if results["processed"]:
                results["class_analysis"] = self.class_service.analyze_class_progress(class_id)

            return results

        except Exception as e:
            self.logger.error(f"Error processing batch for class {class_id}", e)
            return {"error": str(e)}

    def _extract_text(self, file_path: Path) -> str:
        """Extract text from various document formats."""
        try:
            suffix = file_path.suffix.lower()
            
            if suffix in [".jpg", ".jpeg", ".png"]:
                return self._process_image(file_path)
                
            elif suffix == ".pdf":
                return self._process_pdf(file_path)
                
            elif suffix in [".docx", ".doc"]:
                return self._process_word(file_path)
                
            elif suffix == ".txt":
                return file_path.read_text(encoding='utf-8')
                
            else:
                raise ValueError(f"Unsupported file type: {suffix}")

        except Exception as e:
            self.logger.error(f"Error extracting text from {file_path}", e)
            raise

    def _process_image(self, file_path: Path) -> str:
        """Process image files using OCR."""
        try:
            # Read image
            image = cv2.imread(str(file_path))
            
            # Preprocess image
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            denoised = cv2.fastNlMeansDenoising(gray)
            
            # Improve contrast
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            enhanced = clahe.apply(denoised)
            
            # Convert to PIL Image
            pil_image = Image.fromarray(enhanced)
            
            # Perform OCR
            text = pytesseract.image_to_string(
                pil_image,
                lang=self.settings["ocr_settings"]["lang"],
                config=self.settings["ocr_settings"]["config"]
            )
            
            return text.strip()

        except Exception as e:
            self.logger.error(f"Error processing image {file_path}", e)
            raise

    def _process_pdf(self, file_path: Path) -> str:
        """Process PDF files."""
        try:
            text_parts = []
            
            # Try text extraction first
            doc = fitz.open(file_path)
            for page in doc:
                text = page.get_text()
                if text.strip():
                    text_parts.append(text)
                else:
                    # If page has no text, try OCR
                    pix = page.get_pixmap(matrix=fitz.Matrix(
                        self.settings["ocr_settings"]["dpi"]/72.0,
                        self.settings["ocr_settings"]["dpi"]/72.0
                    ))
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    ocr_text = pytesseract.image_to_string(
                        img,
                        lang=self.settings["ocr_settings"]["lang"],
                        config=self.settings["ocr_settings"]["config"]
                    )
                    text_parts.append(ocr_text)
            
            return "\n".join(text_parts).strip()

        except Exception as e:
            self.logger.error(f"Error processing PDF {file_path}", e)
            raise

    def _process_word(self, file_path: Path) -> str:
        """Process Word documents."""
        try:
            doc = docx.Document(file_path)
            return "\n".join(paragraph.text for paragraph in doc.paragraphs).strip()

        except Exception as e:
            self.logger.error(f"Error processing Word document {file_path}", e)
            raise

    def _identify_student(self, text: str, student_roster: Dict) -> Optional[Dict]:
        """Identify student from document content using fuzzy matching."""
        try:
            best_match = None
            best_score = 0
            
            # Extract potential name from first few lines
            first_lines = "\n".join(text.split("\n")[:5])
            
            for student_id, student_info in student_roster.items():
                # Try different name formats
                name_formats = [
                    f"{student_info['first_name']} {student_info['last_name']}",
                    f"{student_info['last_name']}, {student_info['first_name']}",
                    f"{student_info['last_name']},{student_info['first_name']}",
                    f"{student_info['first_name']}{student_info['last_name']}"
                ]
                
                # Get best score across formats
                scores = [fuzz.partial_ratio(name_format, first_lines) 
                         for name_format in name_formats]
                max_score = max(scores)
                
                if max_score > best_score:
                    best_score = max_score
                    best_match = {
                        "student_id": student_id,
                        "name": name_formats[0],  # Standard format
                        "confidence": max_score / 100.0
                    }
            
            return best_match

        except Exception as e:
            self.logger.error("Error identifying student", e)
            return None

    def validate_file(self, file_path: Path) -> Tuple[bool, str]:
        """Validate file before processing."""
        try:
            if not file_path.exists():
                return False, "File does not exist"
                
            if file_path.suffix.lower() not in self.settings["allowed_extensions"]:
                return False, f"Unsupported file type: {file_path.suffix}"
                
            if file_path.stat().st_size > self.settings["max_file_size"]:
                return False, f"File too large (max {self.settings['max_file_size']/1024/1024}MB)"
                
            return True, "File is valid"

        except Exception as e:
            self.logger.error(f"Error validating file {file_path}", e)
            return False, str(e)

    def process_handwritten_document(self, image_path: Path) -> Dict:
        """Process handwritten document with advanced recognition."""
        try:
            # Read and preprocess image
            image = self._preprocess_handwritten_image(image_path)
            
            # Multi-engine OCR approach
            results = {
                "easyocr": self._process_with_easyocr(image),
                "trocr": self._process_with_trocr(image),
                "tesseract": self._process_with_tesseract(image)
            }
            
            # Combine and validate results
            final_text = self._combine_ocr_results(results)
            
            # Convert to typed format
            typed_version = self._format_as_typed_document(final_text)
            
            return {
                "original_text": final_text,
                "typed_version": typed_version,
                "confidence": results["confidence"],
                "word_count": len(final_text.split()),
                "metadata": {
                    "processing_method": "multi_engine_ocr",
                    "engines_used": list(results.keys()),
                    "average_confidence": np.mean([r.get("confidence", 0) for r in results.values()])
                }
            }

        except Exception as e:
            self.logger.error(f"Error processing handwritten document {image_path}", e)
            raise

    def _preprocess_handwritten_image(self, image_path: Path) -> np.ndarray:
        """Advanced preprocessing for handwritten documents."""
        try:
            # Read image
            image = cv2.imread(str(image_path))
            
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Determine and correct skew
            angle = determine_skew(gray)
            if abs(angle) > self.settings["handwriting"]["preprocessing"]["deskew_angle_threshold"]:
                rotated = ndimage.rotate(gray, angle, reshape=True, mode='constant')
            else:
                rotated = gray
            
            # Remove noise
            denoised = cv2.fastNlMeansDenoising(
                rotated,
                None,
                h=self.settings["handwriting"]["preprocessing"]["denoise_strength"]
            )
            
            # Enhance contrast
            clahe = cv2.createCLAHE(
                clipLimit=self.settings["handwriting"]["preprocessing"]["contrast_limit"],
                tileGridSize=(8,8)
            )
            enhanced = clahe.apply(denoised)
            
            # Adaptive thresholding
            binary = cv2.adaptiveThreshold(
                enhanced,
                255,
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY,
                11,
                2
            )
            
            return binary

        except Exception as e:
            self.logger.error(f"Error preprocessing image {image_path}", e)
            raise

    def _process_with_easyocr(self, image: np.ndarray) -> Dict:
        """Process image with EasyOCR for handwriting recognition."""
        try:
            # Get horizontal and vertical lines
            results = self.reader.readtext(image)
            
            # Sort results by vertical position
            sorted_results = sorted(results, key=lambda x: (x[0][0][1], x[0][0][0]))
            
            text_blocks = []
            confidences = []
            
            for bbox, text, conf in sorted_results:
                if conf >= self.settings["handwriting"]["min_confidence"]:
                    text_blocks.append(text)
                    confidences.append(conf)
            
            return {
                "text": "\n".join(text_blocks),
                "confidence": np.mean(confidences) if confidences else 0
            }

        except Exception as e:
            self.logger.error("Error processing with EasyOCR", e)
            return {"text": "", "confidence": 0}

    def _process_with_trocr(self, image: np.ndarray) -> Dict:
        """Process image with TrOCR for handwriting recognition."""
        try:
            # Convert to PIL Image
            pil_image = Image.fromarray(image)
            
            # Prepare image for model
            pixel_values = self.processor(pil_image, return_tensors="pt").pixel_values
            if torch.cuda.is_available():
                pixel_values = pixel_values.to('cuda')
            
            # Generate text
            generated_ids = self.model.generate(pixel_values)
            generated_text = self.processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
            
            return {
                "text": generated_text,
                "confidence": 0.8  # TrOCR doesn't provide confidence scores
            }

        except Exception as e:
            self.logger.error("Error processing with TrOCR", e)
            return {"text": "", "confidence": 0}

    def add_to_baseline(self, student_id: str, document_path: Path, 
                       is_handwritten: bool = True) -> Dict:
        """Add document to student's baseline samples."""
        try:
            # Process document
            if is_handwritten:
                result = self.process_handwritten_document(document_path)
                text = result["typed_version"]
                confidence = result["confidence"]
            else:
                text = self._extract_text(document_path)
                confidence = 1.0
            
            if confidence < self.settings["baseline"]["required_confidence"]:
                raise ValueError(f"Document confidence {confidence} below required threshold")
            
            # Get existing baseline
            baseline = self.db.get_student_baseline(student_id)
            
            # Create or update baseline
            if not baseline:
                baseline = {
                    "student_id": student_id,
                    "samples": [],
                    "created_at": datetime.now().isoformat()
                }
            
            # Add new sample
            sample = {
                "text": text,
                "source": str(document_path),
                "is_handwritten": is_handwritten,
                "confidence": confidence,
                "added_at": datetime.now().isoformat()
            }
            
            # Maintain sample limit
            baseline["samples"].append(sample)
            if len(baseline["samples"]) > self.settings["baseline"]["max_samples"]:
                # Remove oldest sample
                baseline["samples"].sort(key=lambda x: x["added_at"])
                baseline["samples"] = baseline["samples"][-self.settings["baseline"]["max_samples"]:]
            
            # Update baseline in database
            success = self.db.update_student_baseline(student_id, baseline)
            
            return {
                "success": success,
                "baseline_samples": len(baseline["samples"]),
                "latest_sample": sample
            }

        except Exception as e:
            self.logger.error(f"Error adding to baseline for student {student_id}", e)
            raise

    def _combine_ocr_results(self, results: Dict) -> str:
        """Combine results from multiple OCR engines."""
        try:
            # Weight the results based on confidence
            weighted_texts = []
            
            for engine, result in results.items():
                if result["text"] and result["confidence"] > self.settings["handwriting"]["min_confidence"]:
                    weighted_texts.append((result["text"], result["confidence"]))
            
            if not weighted_texts:
                return ""
            
            # Use the highest confidence result as base
            weighted_texts.sort(key=lambda x: x[1], reverse=True)
            return weighted_texts[0][0]

        except Exception as e:
            self.logger.error("Error combining OCR results", e)
            return ""

    def _format_as_typed_document(self, text: str) -> str:
        """Format handwritten text as a typed document."""
        try:
            # Basic formatting
            lines = text.split('\n')
            formatted_lines = []
            
            for line in lines:
                # Remove extra spaces
                line = ' '.join(line.split())
                
                # Capitalize first letter of sentences
                if line and line[0].isalpha():
                    line = line[0].upper() + line[1:]
                
                formatted_lines.append(line)
            
            # Join with proper spacing
            return '\n\n'.join(formatted_lines)

        except Exception as e:
            self.logger.error("Error formatting document", e)
            return text 