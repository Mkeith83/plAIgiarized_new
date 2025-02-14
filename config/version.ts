export interface Version {
  major: number;
  minor: number;
  patch: number;
  build: string;
  timestamp: string;
}

export const version: Version = {
  major: 1,
  minor: 0,
  patch: 0,
  build: process.env.BUILD_ID || 'dev',
  timestamp: new Date().toISOString()
};

export const features = {
  aiDetection: true,
  baselineComparison: true,
  batchProcessing: true,
  mobileScanning: true,
  plagiarismCheck: true
};

export const limits = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxBatchSize: 50,
  maxBaselines: 5,
  requestTimeout: 30000 // 30 seconds
};
