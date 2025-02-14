'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BatchService } from '@/lib/services/batchService';
import { useAnalysis } from '@/app/hooks/useAnalysis';

interface BatchItem {
    id: string;
    text: string;
    studentId?: string;
    status: 'queued' | 'processing' | 'complete' | 'error';
    progress: number;
    result?: {
        aiScore: number;
        styleMatch: number;
        gradeLevel: number;
        improvement: number;
    };
    error?: string;
}

interface BatchStats {
    total: number;
    completed: number;
    failed: number;
    averageProgress: number;
}

export default function BatchProcessor() {
    const router = useRouter();
    const { analyzeBatch } = useAnalysis();
    const [items, setItems] = useState<BatchItem[]>([]);
    const [stats, setStats] = useState<BatchStats>({
        total: 0,
        completed: 0,
        failed: 0,
        averageProgress: 0
    });
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadBatchItems();
    }, []);

    useEffect(() => {
        updateStats();
    }, [items]);

    const loadBatchItems = async () => {
        try {
            const storedItems = sessionStorage.getItem('batchItems');
            if (storedItems) {
                const parsedItems = JSON.parse(storedItems);
                setItems(parsedItems);
                if (parsedItems.some(item => item.status === 'queued')) {
                    startProcessing(parsedItems);
                }
            }
        } catch (err) {
            setError('Failed to load batch items');
            console.error('Load error:', err);
        }
    };

    const startProcessing = async (batchItems: BatchItem[]) => {
        setProcessing(true);
        try {
            const batchService = new BatchService();
            const chunks = createChunks(batchItems, 5); // Process 5 at a time

            for (const chunk of chunks) {
                await processChunk(chunk, batchService);
            }

        } catch (err) {
            setError('Batch processing failed');
            console.error('Processing error:', err);
        } finally {
            setProcessing(false);
        }
    };

    const processChunk = async (chunk: BatchItem[], service: BatchService) => {
        const promises = chunk.map(async (item) => {
            if (item.status !== 'queued') return item;

            try {
                setItems(current => current.map(i => 
                    i.id === item.id ? { ...i, status: 'processing' } : i
                ));

                const result = await service.processItem(item, (progress) => {
                    setItems(current => current.map(i =>
                        i.id === item.id ? { ...i, progress } : i
                    ));
                });

                return {
                    ...item,
                    status: 'complete',
                    progress: 100,
                    result
                };

            } catch (err) {
                return {
                    ...item,
                    status: 'error',
                    progress: 0,
                    error: 'Processing failed'
                };
            }
        });

        const results = await Promise.all(promises);
        setItems(current => 
            current.map(item => {
                const updated = results.find(r => r.id === item.id);
                return updated || item;
            })
        );
    };

    const updateStats = () => {
        const completed = items.filter(i => i.status === 'complete').length;
        const failed = items.filter(i => i.status === 'error').length;
        const totalProgress = items.reduce((sum, item) => sum + item.progress, 0);

        setStats({
            total: items.length,
            completed,
            failed,
            averageProgress: items.length ? totalProgress / items.length : 0
        });
    };

    const createChunks = <T,>(array: T[], size: number): T[][] => {
        return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
            array.slice(i * size, (i + 1) * size)
        );
    };

    const handleComplete = () => {
        sessionStorage.removeItem('batchItems');
        router.push('/mobile/batch-results');
    };

    const handleRetry = () => {
        const failedItems = items.filter(item => item.status === 'error');
        startProcessing(failedItems);
    };

    return (
        <div className="p-4">
            <div className="max-w-2xl mx-auto">
                {/* Overall Progress */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-gray-600">
                            {stats.completed} / {stats.total} Complete
                        </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${stats.averageProgress}%` }}
                        />
                    </div>
                </div>

                {/* Item List */}
                <div className="space-y-4">
                    {items.map((item) => (
                        <div 
                            key={item.id}
                            className="bg-white rounded-lg shadow p-4"
                        >
                            <div className="flex justify-between mb-2">
                                <span className="font-medium">Document {item.id}</span>
                                <span className={`text-sm ${
                                    item.status === 'complete' ? 'text-green-600' :
                                    item.status === 'error' ? 'text-red-600' :
                                    'text-blue-600'
                                }`}>
                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </span>
                            </div>
                            <div className="h-1 bg-gray-200 rounded">
                                <div
                                    className={`h-full rounded transition-all duration-300 ${
                                        item.status === 'complete' ? 'bg-green-500' :
                                        item.status === 'error' ? 'bg-red-500' :
                                        'bg-blue-500'
                                    }`}
                                    style={{ width: `${item.progress}%` }}
                                />
                            </div>
                            {item.error && (
                                <p className="mt-2 text-sm text-red-600">{item.error}</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-4">
                    {stats.failed > 0 && (
                        <button
                            onClick={handleRetry}
                            disabled={processing}
                            className="flex-1 border border-blue-500 text-blue-500 py-2 rounded-lg hover:bg-blue-50"
                        >
                            Retry Failed ({stats.failed})
                        </button>
                    )}
                    <button
                        onClick={handleComplete}
                        disabled={processing || stats.completed < stats.total}
                        className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                    >
                        Complete
                    </button>
                </div>
            </div>
        </div>
    );
}
