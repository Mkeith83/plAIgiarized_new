'use client';

import { useState } from 'react';
import { DocumentScanner } from '@/lib/services/scanner';
import { DatabaseService } from '@/lib/services/database';

interface Props {
  onSuccess: (essayId: string) => void;
}

export function BaselineUpload({ onSuccess }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const scanner = new DocumentScanner();
      const result = await scanner.scanDocument(file);
      
      const db = new DatabaseService();
      const essayId = await db.storeEssay({
        content: result.text,
        isBaseline: true,
        // Add other required fields
      });
      
      onSuccess(essayId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
        Upload Baseline Essay
      </label>
      <input
        id="file-upload"
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        aria-label="Upload baseline essay"
        placeholder="Choose a file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
        disabled={uploading}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
}
