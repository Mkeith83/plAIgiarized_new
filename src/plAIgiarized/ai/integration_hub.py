from typing import Dict, List, Optional, Union
import torch
from transformers import pipeline
import numpy as np
from concurrent.futures import ThreadPoolExecutor
from ..logging.service import LoggingService
from .advanced_text_analyzer import AdvancedTextAnalyzer

class AIIntegrationHub:
    def __init__(self):
        self.logger = LoggingService()
        
        # Initialize components
        self.text_analyzer = AdvancedTextAnalyzer()
        
        # AI Models configuration
        self.models = {
            "summarization": "facebook/bart-large-cnn",
            "translation": "facebook/mbart-large-50-many-to-many-mmt",
            "question_answering": "deepset/roberta-base-squad2",
            "zero_shot": "facebook/bart-large-mnli",
            "image_analysis": "google/vit-base-patch16-224",
            "handwriting": "microsoft/trocr-base-handwritten"
        }
        
        # Processing settings
        self.settings = {
            "max_workers": 4,
            "batch_size": 16,
            "use_gpu": torch.cuda.is_available(),
            "cache_results": True,
            "async_processing": True
        }
        
        self._initialize_pipelines()
        self._initialize_cache()

    def _initialize_pipelines(self):
        """Initialize AI pipelines."""
        try:
            device = 0 if self.settings["use_gpu"] else -1
            
            self.pipelines = {
                "summarization": pipeline(
                    "summarization",
                    model=self.models["summarization"],
                    device=device
                ),
                "translation": pipeline(
                    "translation",
                    model=self.models["translation"],
                    device=device
                ),
                "qa": pipeline(
                    "question-answering",
                    model=self.models["question_answering"],
                    device=device
                ),
                "zero_shot": pipeline(
                    "zero-shot-classification",
                    model=self.models["zero_shot"],
                    device=device
                ),
                "image": pipeline(
                    "image-classification",
                    model=self.models["image_analysis"],
                    device=device
                ),
                "ocr": pipeline(
                    "image-to-text",
                    model=self.models["handwriting"],
                    device=device
                )
            }
            
            # Initialize thread pool
            self.executor = ThreadPoolExecutor(
                max_workers=self.settings["max_workers"]
            )

        except Exception as e:
            self.logger.error("Error initializing pipelines", e)
            raise

    def _initialize_cache(self):
        """Initialize result caching."""
        self.cache = {
            "text_analysis": {},
            "translations": {},
            "summaries": {},
            "qa_results": {},
            "classifications": {},
            "image_analysis": {}
        }

    async def process_document(
        self,
        document: Dict,
        tasks: List[str] = None
    ) -> Dict:
        """Process document with multiple AI tasks."""
        try:
            if tasks is None:
                tasks = ["analyze", "summarize", "classify"]
            
            results = {
                "document_id": document.get("id"),
                "timestamp": document.get("timestamp"),
                "results": {}
            }
            
            # Process tasks concurrently
            futures = []
            
            for task in tasks:
                if task == "analyze":
                    futures.append(
                        self.executor.submit(
                            self._analyze_text,
                            document.get("text", "")
                        )
                    )
                elif task == "summarize":
                    futures.append(
                        self.executor.submit(
                            self._generate_summary,
                            document.get("text", "")
                        )
                    )
                elif task == "classify":
                    futures.append(
                        self.executor.submit(
                            self._classify_content,
                            document.get("text", ""),
                            document.get("labels", [])
                        )
                    )
                elif task == "translate":
                    futures.append(
                        self.executor.submit(
                            self._translate_text,
                            document.get("text", ""),
                            document.get("target_lang", "en")
                        )
                    )
                elif task == "qa":
                    futures.append(
                        self.executor.submit(
                            self._answer_questions,
                            document.get("text", ""),
                            document.get("questions", [])
                        )
                    )
                elif task == "image":
                    futures.append(
                        self.executor.submit(
                            self._analyze_image,
                            document.get("image", None)
                        )
                    )
            
            # Collect results
            for task, future in zip(tasks, futures):
                results["results"][task] = future.result()
            
            return results

        except Exception as e:
            self.logger.error("Error processing document", e)
            return {"error": str(e)}

    def _analyze_text(self, text: str) -> Dict:
        """Analyze text using advanced text analyzer."""
        try:
            cache_key = hash(text)
            
            if self.settings["cache_results"] and cache_key in self.cache["text_analysis"]:
                return self.cache["text_analysis"][cache_key]
            
            results = self.text_analyzer.analyze_text(text)
            
            if self.settings["cache_results"]:
                self.cache["text_analysis"][cache_key] = results
            
            return results

        except Exception as e:
            self.logger.error("Error analyzing text", e)
            return {"error": str(e)}

    def _generate_summary(self, text: str, max_length: int = 130) -> Dict:
        """Generate text summary."""
        try:
            cache_key = hash(f"{text}_{max_length}")
            
            if self.settings["cache_results"] and cache_key in self.cache["summaries"]:
                return self.cache["summaries"][cache_key]
            
            summary = self.pipelines["summarization"](
                text,
                max_length=max_length,
                min_length=30,
                do_sample=False
            )
            
            result = {
                "summary": summary[0]["summary_text"],
                "length": len(summary[0]["summary_text"].split())
            }
            
            if self.settings["cache_results"]:
                self.cache["summaries"][cache_key] = result
            
            return result

        except Exception as e:
            self.logger.error("Error generating summary", e)
            return {"error": str(e)}

    def _classify_content(self, text: str, labels: List[str]) -> Dict:
        """Classify text content."""
        try:
            cache_key = hash(f"{text}_{','.join(sorted(labels))}")
            
            if self.settings["cache_results"] and cache_key in self.cache["classifications"]:
                return self.cache["classifications"][cache_key]
            
            results = self.pipelines["zero_shot"](
                text,
                labels,
                multi_label=True
            )
            
            result = {
                "labels": list(zip(results["labels"], results["scores"])),
                "confidence": max(results["scores"])
            }
            
            if self.settings["cache_results"]:
                self.cache["classifications"][cache_key] = result
            
            return result

        except Exception as e:
            self.logger.error("Error classifying content", e)
            return {"error": str(e)}

    def _translate_text(self, text: str, target_lang: str) -> Dict:
        """Translate text to target language."""
        try:
            cache_key = hash(f"{text}_{target_lang}")
            
            if self.settings["cache_results"] and cache_key in self.cache["translations"]:
                return self.cache["translations"][cache_key]
            
            translation = self.pipelines["translation"](
                text,
                src_lang="auto",
                tgt_lang=target_lang
            )
            
            result = {
                "translated_text": translation[0]["translation_text"],
                "source_lang": translation[0].get("src_lang", "unknown"),
                "target_lang": target_lang
            }
            
            if self.settings["cache_results"]:
                self.cache["translations"][cache_key] = result
            
            return result

        except Exception as e:
            self.logger.error("Error translating text", e)
            return {"error": str(e)}

    def _answer_questions(self, text: str, questions: List[str]) -> Dict:
        """Answer questions about the text."""
        try:
            cache_key = hash(f"{text}_{','.join(questions)}")
            
            if self.settings["cache_results"] and cache_key in self.cache["qa_results"]:
                return self.cache["qa_results"][cache_key]
            
            answers = []
            for question in questions:
                result = self.pipelines["qa"](
                    question=question,
                    context=text
                )
                answers.append({
                    "question": question,
                    "answer": result["answer"],
                    "confidence": result["score"]
                })
            
            result = {
                "answers": answers,
                "average_confidence": np.mean([a["confidence"] for a in answers])
            }
            
            if self.settings["cache_results"]:
                self.cache["qa_results"][cache_key] = result
            
            return result

        except Exception as e:
            self.logger.error("Error answering questions", e)
            return {"error": str(e)}

    def _analyze_image(self, image) -> Dict:
        """Analyze image content."""
        try:
            if image is None:
                return {"error": "No image provided"}
            
            cache_key = hash(str(image))
            
            if self.settings["cache_results"] and cache_key in self.cache["image_analysis"]:
                return self.cache["image_analysis"][cache_key]
            
            # Image classification
            classification = self.pipelines["image"](image)
            
            # OCR if needed
            ocr_text = self.pipelines["ocr"](image)[0]["generated_text"]
            
            result = {
                "classifications": classification,
                "ocr_text": ocr_text,
                "confidence": max(c["score"] for c in classification)
            }
            
            if self.settings["cache_results"]:
                self.cache["image_analysis"][cache_key] = result
            
            return result

        except Exception as e:
            self.logger.error("Error analyzing image", e)
            return {"error": str(e)}

    def clear_cache(self, cache_type: str = None):
        """Clear result cache."""
        try:
            if cache_type is None:
                self._initialize_cache()
            elif cache_type in self.cache:
                self.cache[cache_type] = {}

        except Exception as e:
            self.logger.error("Error clearing cache", e) 