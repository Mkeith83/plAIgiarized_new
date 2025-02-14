import { DocumentScanner } from '@/lib/mobile/scanner';
import { DocumentUploader } from '@/lib/mobile/documentUpload';

describe('Mobile Integration', () => {
  let scanner: DocumentScanner;
  let uploader: DocumentUploader;

  beforeEach(() => {
    scanner = new DocumentScanner();
    uploader = new DocumentUploader();
  });

  describe('DocumentScanner', () => {
    it('should scan document and extract text', async () => {
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const result = await scanner.scanDocument(file);

      expect(result.text).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.metadata).toBeDefined();
    });

    it('should handle invalid file type', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      await expect(scanner.scanDocument(file)).rejects.toThrow();
    });
  });

  describe('DocumentUploader', () => {
    it('should upload document with auto-scan', async () => {
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });
      const result = await uploader.uploadDocument(file, { autoScan: true });

      expect(result.text).toBeDefined();
      expect(result.metadata.scanQuality).toBeDefined();
    });

    it('should validate file size', async () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg');
      await expect(uploader.uploadDocument(largeFile)).rejects.toThrow();
    });
  });
});
