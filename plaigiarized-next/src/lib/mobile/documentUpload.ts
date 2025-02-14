import { Logger } from '../services/logger';
import { DocumentScanner } from './scanner';

interface UploadResult {
  text: string;
  metadata: {
    filename: string;
    filesize: number;
    uploadTime: string;
    processingTime: number;
    scanQuality?: number;
  };
}

interface UploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  autoScan?: boolean;
  compressionLevel?: number;
}

export class DocumentUploader {
  private logger: Logger;
  private scanner: DocumentScanner;
  private defaultOptions: Required<UploadOptions>;

  constructor() {
    this.logger = new Logger();
    this.scanner = new DocumentScanner();
    this.defaultOptions = {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.png'],
      autoScan: true,
      compressionLevel: 0.8
    };
  }

  public async uploadDocument(
    file: File, 
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const startTime = Date.now();
    const opts = { ...this.defaultOptions, ...options };

    try {
      await this.validateFile(file, opts);
      const processedFile = await this.processFile(file, opts);
      
      let text = '';
      let scanQuality: number | undefined;

      if (opts.autoScan && this.isImageFile(file.type)) {
        const scanResult = await this.scanner.scanDocument(processedFile);
        text = scanResult.text;
        scanQuality = scanResult.metadata?.imageQuality;
      } else {
        text = await this.extractText(processedFile);
      }

      return {
        text,
        metadata: {
          filename: file.name,
          filesize: file.size,
          uploadTime: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          scanQuality
        }
      };

    } catch (error) {
      this.logger.error('Error uploading document:', error);
      throw error;
    }
  }

  private async validateFile(file: File, options: Required<UploadOptions>): Promise<void> {
    if (file.size > options.maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${options.maxSize} bytes`);
    }

    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!options.allowedTypes.includes(extension)) {
      throw new Error(`File type ${extension} is not supported`);
    }
  }

  private async processFile(file: File, _options: Required<UploadOptions>): Promise<File> {
    // TODO: Implement compression based on _options.compressionLevel
    return file;
  }

  private async extractText(_file: File): Promise<string> {
    // TODO: Implement text extraction based on file type
    return '';
  }

  private isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }
} 