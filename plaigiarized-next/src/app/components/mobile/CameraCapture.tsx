'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Camera } from '@/lib/interfaces/camera';

interface CaptureResult {
    imageData: string;
    timestamp: Date;
    metadata: {
        resolution: string;
        format: string;
        deviceInfo: string;
    };
}

export default function CameraCapture() {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsCameraActive(true);
                setError(null);
            }
        } catch (err) {
            setError('Failed to access camera. Please check permissions.');
            console.error('Camera access error:', err);
        }
    };

    const captureImage = useCallback(async () => {
        if (!videoRef.current || !isCameraActive) return;

        setIsProcessing(true);
        try {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Failed to get canvas context');

            ctx.drawImage(videoRef.current, 0, 0);
            
            const imageData = canvas.toDataURL('image/jpeg', 0.8);
            const result: CaptureResult = {
                imageData,
                timestamp: new Date(),
                metadata: {
                    resolution: `${canvas.width}x${canvas.height}`,
                    format: 'jpeg',
                    deviceInfo: navigator.userAgent
                }
            };

            await processCapture(result);
            
        } catch (err) {
            setError('Failed to capture image. Please try again.');
            console.error('Capture error:', err);
        } finally {
            setIsProcessing(false);
        }
    }, [isCameraActive]);

    const processCapture = async (result: CaptureResult) => {
        try {
            // Send to image processor
            router.push(`/mobile/process?image=${encodeURIComponent(result.imageData)}`);
        } catch (err) {
            setError('Failed to process image. Please try again.');
            console.error('Processing error:', err);
        }
    };

    return (
        <div className="flex flex-col items-center w-full h-full">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                </div>
            )}

            <div className="relative w-full aspect-[3/4] bg-black rounded-lg overflow-hidden">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />
                
                {!isCameraActive && (
                    <button
                        onClick={startCamera}
                        className="absolute inset-0 flex items-center justify-center bg-gray-900/50 text-white"
                    >
                        Start Camera
                    </button>
                )}

                {isCameraActive && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                        <button
                            onClick={captureImage}
                            disabled={isProcessing}
                            className={`
                                rounded-full w-16 h-16 
                                ${isProcessing ? 'bg-gray-400' : 'bg-white'}
                                flex items-center justify-center
                                shadow-lg
                            `}
                        >
                            {isProcessing ? (
                                <div className="w-8 h-8 border-4 border-gray-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <div className="w-12 h-12 rounded-full border-4 border-blue-500" />
                            )}
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-4 text-center text-sm text-gray-600">
                Position the document within the frame and ensure good lighting
            </div>
        </div>
    );
} 