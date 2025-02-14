import { Logger } from './logger';

export interface ScanResult {
  text: string;
  confidence: number;
  metadata: {
    timestamp: string;
    deviceInfo: string;
    imageQuality: number;
  };
}

interface ScanResponse {
  text: string;
  confidence: number;
  quality?: number;
}

export class DocumentScanner {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  public async scanDocument(imageData: Blob): Promise<ScanResult> {
    try {
      // Call OCR service (e.g., Tesseract.js or cloud OCR)
      const formData = new FormData();
      formData.append('image', imageData);

      const response = await fetch('/api/scan', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Document scanning failed');
      
      const result = await response.json();
      return this.processScanResult(result);
    } catch (error) {
      this.logger.error('Error scanning document', error);
      throw error;
    }
  }

  private processScanResult(result: ScanResponse): ScanResult {
    return {
      text: result.text,
      confidence: result.confidence,
      metadata: {
        timestamp: new Date().toISOString(),
        deviceInfo: navigator.userAgent,
        imageQuality: result.quality || 0
      }
    };
  }

  public async batchScan(images: Blob[]): Promise<ScanResult[]> {
    return Promise.all(images.map(img => this.scanDocument(img)));
  }
} 