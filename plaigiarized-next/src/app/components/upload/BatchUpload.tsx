'use client';

import React, { useState, useCallback } from 'react';
import { 
  Box, 
  VStack, 
  Button, 
  Text, 
  useToast, 
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiCheck, FiX } from 'react-icons/fi';

interface UploadStatus {
  fileName: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  studentId?: string;
  message?: string;
}

export const BatchUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const toast = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    setUploadStatus(prev => [
      ...prev,
      ...acceptedFiles.map(file => ({
        fileName: file.name,
        status: 'pending'
      }))
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: true
  });

  const handleUpload = async () => {
    setIsUploading(true);
    setProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update status to processing
        setUploadStatus(prev => prev.map((status, idx) => 
          idx === i ? { ...status, status: 'processing' } : status
        ));

        // Create form data
        const formData = new FormData();
        formData.append('file', file);

        // Upload file
        const response = await fetch('/api/upload/batch', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        // Update status based on response
        setUploadStatus(prev => prev.map((status, idx) => 
          idx === i ? {
            ...status,
            status: response.ok ? 'success' : 'error',
            studentId: result.studentId,
            message: response.ok ? 'Successfully uploaded' : result.error
          } : status
        ));

        // Update progress
        setProgress(((i + 1) / files.length) * 100);
      }

      toast({
        title: 'Upload Complete',
        description: `Successfully processed ${files.length} files`,
        status: 'success',
        duration: 5000,
        isClosable: true
      });

    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'There was an error uploading the files',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Drop Zone */}
      <Box
        {...getRootProps()}
        p={10}
        border="2px dashed"
        borderColor={isDragActive ? 'blue.400' : 'gray.200'}
        borderRadius="md"
        bg={isDragActive ? 'blue.50' : 'white'}
        cursor="pointer"
        transition="all 0.2s"
        _hover={{ borderColor: 'blue.400' }}
      >
        <input {...getInputProps()} />
        <VStack spacing={2}>
          <FiUpload size={24} />
          <Text align="center">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag & drop files here, or click to select files'}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Supports PDF, DOC, DOCX, and TXT files
          </Text>
        </VStack>
      </Box>

      {/* Upload Progress */}
      {isUploading && (
        <Box>
          <Text mb={2}>Uploading... {progress.toFixed(0)}%</Text>
          <Progress value={progress} size="sm" colorScheme="blue" />
        </Box>
      )}

      {/* File List */}
      {uploadStatus.length > 0 && (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>File Name</Th>
              <Th>Status</Th>
              <Th>Student ID</Th>
              <Th>Message</Th>
            </Tr>
          </Thead>
          <Tbody>
            {uploadStatus.map((status, index) => (
              <Tr key={index}>
                <Td>
                  <Flex align="center" gap={2}>
                    <FiFile />
                    <Text>{status.fileName}</Text>
                  </Flex>
                </Td>
                <Td>
                  <Badge
                    colorScheme={
                      status.status === 'success' ? 'green' :
                      status.status === 'error' ? 'red' :
                      status.status === 'processing' ? 'blue' :
                      'gray'
                    }
                  >
                    {status.status}
                  </Badge>
                </Td>
                <Td>{status.studentId || '-'}</Td>
                <Td>{status.message || '-'}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {/* Upload Button */}
      <Button
        colorScheme="blue"
        isLoading={isUploading}
        onClick={handleUpload}
        isDisabled={files.length === 0}
        leftIcon={<FiUpload />}
      >
        Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
      </Button>
    </VStack>
  );
}; 