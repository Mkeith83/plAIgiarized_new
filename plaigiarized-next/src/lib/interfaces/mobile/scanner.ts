export interface ScannerConfig {
  resolution: number;
  format: 'jpeg' | 'png';
  quality: number;
  autoRotate: boolean;
  textEnhancement: boolean;
}

export interface ScanResult {
  imageData: {
    url: string;
    width: number;
    height: number;
    format: string;
    size: number;
  };
  textContent: {
    raw: string;
    confidence: number;
    words: Array<{
      text: string;
      confidence: number;
      bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }>;
  };
  metadata: {
    timestamp: string;
    deviceInfo: string;
    scannerConfig: ScannerConfig;
    processingTime: number;
  };
}

export interface ScanError {
  code: string;
  message: string;
  details?: {
    type: 'hardware' | 'permission' | 'processing' | 'network';
    context: Record<string, unknown>;
  };
} 