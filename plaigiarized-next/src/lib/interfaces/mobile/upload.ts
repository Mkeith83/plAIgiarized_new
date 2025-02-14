export interface UploadConfig {
  maxSize: number;
  allowedTypes: string[];
  compression: {
    enabled: boolean;
    quality: number;
    maxDimension: number;
  };
  batch: {
    enabled: boolean;
    maxFiles: number;
    totalSizeLimit: number;
  };
}

export interface UploadProgress {
  bytesUploaded: number;
  bytesTotal: number;
  percentage: number;
  fileName: string;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  timeRemaining?: number;
}

export interface UploadResult {
  fileId: string;
  originalName: string;
  storagePath: string;
  mimeType: string;
  size: number;
  metadata: {
    uploadedAt: string;
    processedAt: string;
    userId: string;
    context: {
      type: 'essay' | 'baseline' | 'document';
      studentId?: string;
      classId?: string;
      assignmentId?: string;
    };
  };
  processingResults?: {
    textExtracted: boolean;
    confidence: number;
    pageCount: number;
    wordCount: number;
  };
}

export interface BatchUploadResult {
  successful: UploadResult[];
  failed: Array<{
    fileName: string;
    error: {
      code: string;
      message: string;
      details?: Record<string, unknown>;
    };
  }>;
  summary: {
    totalFiles: number;
    successCount: number;
    failureCount: number;
    totalSize: number;
    processingTime: number;
  };
} 