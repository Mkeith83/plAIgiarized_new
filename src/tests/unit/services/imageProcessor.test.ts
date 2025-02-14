import { ImageProcessor } from '@/lib/services/imageProcessor';
import { mockImageBuffer } from '../../utils/mockData';

describe('ImageProcessor', () => {
  let processor: ImageProcessor;

  beforeEach(() => {
    processor = new ImageProcessor();
  });

  it('processes images correctly', async () => {
    const result = await processor.processImage(mockImageBuffer);
    expect(result).toMatchSnapshot({
      width: expect.any(Number),
      height: expect.any(Number),
      format: expect.stringMatching(/^(jpeg|png)$/),
    });
  });

  it('handles corrupt images', async () => {
    const corruptBuffer = Buffer.from('corrupt data');
    await expect(processor.processImage(corruptBuffer))
      .rejects.toThrow('Invalid image data');
  });

  it('optimizes large images', async () => {
    const largeImage = mockImageBuffer; // 4K test image
    const result = await processor.processImage(largeImage);
    expect(result.width).toBeLessThanOrEqual(2048);
    expect(result.height).toBeLessThanOrEqual(2048);
  });
}); 