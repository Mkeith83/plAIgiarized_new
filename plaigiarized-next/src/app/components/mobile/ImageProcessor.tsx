'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OCRService } from '@/lib/services/ocr';
import { DocumentNormalizer } from '@/lib/document/documentNormalizer';

interface ProcessingState {
    stage: 'initializing' | 'preprocessing' | 'ocr' | 'normalizing' | 'complete' | 'error';
    progress: number;
    message: string;
}

interface ProcessedResult {
    text: string;
    confidence: number;
    metadata: {
        wordCount: number;
        pageCount: number;
        quality: number;
    };
}

export default function ImageProcessor() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [state, setState] = useState<ProcessingState>({
        stage: 'initializing',
        progress: 0,
        message: 'Initializing...'
    });
    const [result, setResult] = useState<ProcessedResult | null>(null);

    useEffect(() => {
        const imageData = searchParams.get('image');
        if (!imageData) {
            setState({
                stage: 'error',
                progress: 0,
                message: 'No image data provided'
            });
            return;
        }

        processImage(imageData);
    }, [searchParams]);

    const processImage = async (imageData: string) => {
        try {
            // Preprocessing
            setState({
                stage: 'preprocessing',
                progress: 20,
                message: 'Enhancing image quality...'
            });

            const enhancedImage = await enhanceImage(imageData);

            // OCR
            setState({
                stage: 'ocr',
                progress: 40,
                message: 'Extracting text...'
            });

            const ocrService = new OCRService();
            const ocrResult = await ocrService.processImage(enhancedImage, {
                onProgress: (progress) => {
                    setState(prev => ({
                        ...prev,
                        progress: 40 + (progress * 0.4)
                    }));
                }
            });

            // Normalization
            setState({
                stage: 'normalizing',
                progress: 80,
                message: 'Normalizing text...'
            });

            const normalizer = new DocumentNormalizer();
            const normalizedText = await normalizer.normalize(ocrResult.text);

            // Complete
            const processedResult: ProcessedResult = {
                text: normalizedText,
                confidence: ocrResult.confidence,
                metadata: {
                    wordCount: normalizedText.split(/\s+/).length,
                    pageCount: 1,
                    quality: ocrResult.quality
                }
            };

            setResult(processedResult);
            setState({
                stage: 'complete',
                progress: 100,
                message: 'Processing complete'
            });

        } catch (error) {
            console.error('Processing error:', error);
            setState({
                stage: 'error',
                progress: 0,
                message: 'Failed to process image'
            });
        }
    };

    const enhanceImage = async (imageData: string): Promise<string> => {
        // Image enhancement implementation
        return imageData;
    };

    const handleConfirm = () => {
        if (result) {
            router.push(`/mobile/assign?text=${encodeURIComponent(result.text)}`);
        }
    };

    const handleRetry = () => {
        router.back();
    };

    return (
        <div className="p-4">
            <div className="max-w-md mx-auto">
                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${state.progress}%` }}
                        />
                    </div>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {state.message}
                    </p>
                </div>

                {/* Results */}
                {state.stage === 'complete' && result && (
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-lg font-semibold mb-4">Extracted Text</h3>
                        <div className="max-h-60 overflow-y-auto mb-4 p-2 bg-gray-50 rounded">
                            <p className="whitespace-pre-wrap">{result.text}</p>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mb-4">
                            <span>Confidence: {(result.confidence * 100).toFixed(1)}%</span>
                            <span>Words: {result.metadata.wordCount}</span>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={handleConfirm}
                                className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={handleRetry}
                                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {state.stage === 'error' && (
                    <div className="text-center">
                        <p className="text-red-600 mb-4">{state.message}</p>
                        <button
                            onClick={handleRetry}
                            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
} 