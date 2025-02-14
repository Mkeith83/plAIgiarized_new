'use client';

import React, { useState, useRef } from 'react';
import { Box, Button, VStack, Text, useToast, Image } from '@chakra-ui/react';
import { FiCamera, FiRotateCw, FiUpload } from 'react-icons/fi';
import { useOCR } from '@/lib/hooks/useOCR';

interface ScannedDocument {
  imageUrl: string;
  text: string;
  confidence: number;
}

export const MobileScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedDocs, setScannedDocs] = useState<ScannedDocument[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { processImage, isProcessing } = useOCR();
  const toast = useToast();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (error) {
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera',
        status: 'error',
        duration: 3000
      });
    }
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0);

    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob(blob => blob ? resolve(blob) : null, 'image/jpeg', 0.95)
      );

      // Process image with OCR
      const result = await processImage(blob);

      if (result.confidence < 0.6) {
        toast({
          title: 'Low Quality Scan',
          description: 'Please try scanning again with better lighting',
          status: 'warning',
          duration: 3000
        });
        return;
      }

      setScannedDocs(prev => [...prev, {
        imageUrl: URL.createObjectURL(blob),
        text: result.text,
        confidence: result.confidence
      }]);

    } catch (error) {
      toast({
        title: 'Processing Error',
        description: 'Failed to process the image',
        status: 'error',
        duration: 3000
      });
    }
  };

  const uploadScannedDocs = async () => {
    try {
      const response = await fetch('/api/upload/scanned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: scannedDocs })
      });

      if (!response.ok) throw new Error('Upload failed');

      toast({
        title: 'Upload Successful',
        description: `Uploaded ${scannedDocs.length} documents`,
        status: 'success',
        duration: 3000
      });

      setScannedDocs([]);
      setIsScanning(false);

    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload scanned documents',
        status: 'error',
        duration: 3000
      });
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      {/* Camera Preview */}
      <Box position="relative" width="100%" height="60vh" bg="gray.900" borderRadius="md">
        {isScanning ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '0.375rem'
            }}
          />
        ) : (
          <Box
            width="100%"
            height="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Button
              leftIcon={<FiCamera />}
              onClick={startCamera}
              size="lg"
            >
              Start Scanner
            </Button>
          </Box>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </Box>

      {/* Controls */}
      {isScanning && (
        <Button
          leftIcon={<FiCamera />}
          onClick={captureImage}
          isLoading={isProcessing}
          loadingText="Processing..."
          size="lg"
          width="100%"
        >
          Capture
        </Button>
      )}

      {/* Scanned Documents Preview */}
      {scannedDocs.length > 0 && (
        <VStack spacing={4} align="stretch">
          <Text fontWeight="medium">Scanned Documents ({scannedDocs.length})</Text>
          {scannedDocs.map((doc, index) => (
            <Box
              key={index}
              p={4}
              borderWidth={1}
              borderRadius="md"
              position="relative"
            >
              <Image
                src={doc.imageUrl}
                alt={`Scanned document ${index + 1}`}
                maxH="200px"
                objectFit="contain"
                mb={2}
              />
              <Text fontSize="sm" color="gray.600">
                Confidence: {(doc.confidence * 100).toFixed(1)}%
              </Text>
            </Box>
          ))}
          <Button
            leftIcon={<FiUpload />}
            onClick={uploadScannedDocs}
            colorScheme="blue"
          >
            Upload {scannedDocs.length} Documents
          </Button>
        </VStack>
      )}
    </VStack>
  );
}; 