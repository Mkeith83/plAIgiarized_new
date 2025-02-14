'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  VStack,
  Text,
  Progress,
  Icon,
  useToast,
  Button
} from '@chakra-ui/react';
import { FiUpload, FiFile, FiImage, FiCheck, FiX } from 'react-icons/fi';
import { DocumentNormalizer } from '@/lib/services/documentNormalizer';
import { ImageProcessor } from '@/lib/services/imageProcessor';
import { OCRService } from '@/lib/services/ocrService';
import { AnalysisErrorBoundary } from '../error/AnalysisErrorBoundary';

interface FileUploadProps {
  onUploadComplete: (text: string) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['application/pdf', 'image/*', 'text/plain']
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const toast = useToast();

  const normalizer = new DocumentNormalizer();
  const imageProcessor = new ImageProcessor();
  const ocrService = new OCRService();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsProcessing(true);
    setProgress(0);

    try {
      let text = '';

      if (file.type.startsWith('image/')) {
        setCurrentStep('Processing image...');
        const imageBuffer = await file.arrayBuffer();
        const processedImage = await imageProcessor.processImage(
          new Uint8Array(imageBuffer)
        );
        setProgress(33);

        setCurrentStep('Performing OCR...');
        text = await ocrService.extractText(processedImage.data);
        setProgress(66);

      } else {
        setCurrentStep('Extracting text...');
        text = await normalizer.extractText(file);
        setProgress(50);
      }

      setCurrentStep('Normalizing content...');
      const normalizedText = await normalizer.normalize(text);
      setProgress(100);

      onUploadComplete(normalizedText);
      
      toast({
        title: 'Upload complete',
        status: 'success',
        duration: 3000
      });

    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error.message,
        status: 'error'
      });
    } finally {
      setIsProcessing(false);
      setCurrentStep('');
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: maxFileSize,
    accept: allowedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    multiple: false
  });

  return (
    <AnalysisErrorBoundary>
      <VStack spacing={4} w="100%">
        <Box
          {...getRootProps()}
          w="100%"
          p={8}
          border="2px dashed"
          borderColor={isDragActive ? 'blue.400' : 'gray.200'}
          borderRadius="lg"
          bg={isDragActive ? 'blue.50' : 'white'}
          cursor="pointer"
          transition="all 0.2s"
          _hover={{ borderColor: 'blue.400' }}
        >
          <input {...getInputProps()} />
          <VStack spacing={2}>
            <Icon
              as={FiUpload}
              boxSize={8}
              color={isDragActive ? 'blue.400' : 'gray.400'}
            />
            <Text color="gray.600">
              {isDragActive
                ? 'Drop the file here'
                : 'Drag and drop a file, or click to select'}
            </Text>
            <Text fontSize="sm" color="gray.500">
              Supports PDF, images, and text files up to {maxFileSize / 1024 / 1024}MB
            </Text>
          </VStack>
        </Box>

        {isProcessing && (
          <Box w="100%">
            <Text fontSize="sm" color="gray.600" mb={2}>
              {currentStep}
            </Text>
            <Progress
              value={progress}
              size="sm"
              colorScheme="blue"
              hasStripe
              isAnimated
            />
          </Box>
        )}
      </VStack>
    </AnalysisErrorBoundary>
  );
}; 