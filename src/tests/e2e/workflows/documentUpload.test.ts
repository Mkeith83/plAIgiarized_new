import { test, expect } from '@playwright/test';
import { mockFile, setupTestDatabase } from '../../utils/e2eHelpers';

test.describe('Document Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestDatabase();
    await page.goto('/upload');
  });

  test('uploads and processes document successfully', async ({ page }) => {
    // Upload file
    await page.setInputFiles('input[type="file"]', mockFile);
    
    // Wait for processing
    await expect(page.getByText('Processing...')).toBeVisible();
    
    // Check results
    await expect(page.getByText('Analysis Complete')).toBeVisible();
    await expect(page.getByText('Similarity Score:')).toBeVisible();
  });

  test('handles invalid file types', async ({ page }) => {
    await page.setInputFiles('input[type="file"]', 'invalid.xyz');
    await expect(page.getByText('Invalid file type')).toBeVisible();
  });
}); 