'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAnalysis } from '@/app/hooks/useAnalysis';

interface UploadStatus {
    progress: number;
    status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
    message: string;
}

export default function DocumentUpload() {
    const router = useRouter();
    const { uploadDocument } = useAnalysis();
    const [status, setStatus] = useState<UploadStatus>({
        progress: 0,
        status: 'idle',
        message: ''
    });

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setStatus({
                progress: 0,
                status: 'uploading',
                message: 'Starting upload...'
            });

            // Process file upload
            const formData = new FormData();
            formData.append('document', file);

            const response = await uploadDocument(formData, (progress) => {
                setStatus(prev => ({
                    ...prev,
                    progress,
                    message: `Uploading: ${progress}%`
                }));
            });

            setStatus({
                progress: 100,
                status: 'complete',
                message: 'Upload complete!'
            });

            // Redirect to analysis page
            router.push(`/analysis/${response.documentId}`);

        } catch (error) {
            setStatus({
                progress: 0,
                status: 'error',
                message: 'Error uploading document'
            });
        }
    };

    return (
        <div className="p-4">
            <div className="max-w-xl mx-auto">
                <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 10MB)</p>
                        </div>
                        <input 
                            type="file" 
                            className="hidden" 
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                        />
                    </label>
                </div>

                {/* Upload Status */}
                {status.status !== 'idle' && (
                    <div className="mt-4">
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                                        {status.status}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-semibold inline-block text-blue-600">
                                        {status.progress}%
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                                <div 
                                    style={{ width: `${status.progress}%` }}
                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
                                />
                            </div>
                            <p className="text-sm text-gray-600">{status.message}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
