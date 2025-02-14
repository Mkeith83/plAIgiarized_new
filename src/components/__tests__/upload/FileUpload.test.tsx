import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUpload } from '../../upload/FileUpload';
import { DocumentNormalizer } from '@/lib/services/documentNormalizer';
import { ImageProcessor } from '@/lib/services/imageProcessor';
import { OCRService } from '@/lib/services/ocrService';

jest.mock('@/lib/services/documentNormalizer');
jest.mock('@/lib/services/imageProcessor');
jest.mock('@/lib/services/ocrService');

describe('FileUpload', () => {
  const mockOnUploadComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles text file upload correctly', async () => {
    render(<FileUpload onUploadComplete={mockOnUploadComplete} />);
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByRole('button');
    
    fireEvent.drop(input, { dataTransfer: { files: [file] } });
    
    await waitFor(() => {
      expect(mockOnUploadComplete).toHaveBeenCalledWith(expect.any(String));
    });
  });

  // Add more tests...
}); 