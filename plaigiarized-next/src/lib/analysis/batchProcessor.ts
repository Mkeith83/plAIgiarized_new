import { StyleMetrics } from '../interfaces/metrics';
import { AnalyticsEngine } from './analyticsEngine';
import { Logger } from '../services/logger';

interface BatchConfig {
    maxBatchSize: number;
    concurrentBatches: number;
    retryAttempts: number;
    retryDelay: number;
}

interface BatchJob {
    id: string;
    items: BatchItem[];
    status: BatchStatus;
    progress: number;
    startTime?: Date;
    endTime?: Date;
    error?: Error;
}

interface BatchItem {
    id: string;
    text: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    result?: StyleMetrics;
    error?: Error;
}

type BatchStatus = 'queued' | 'processing' | 'completed' | 'failed';

export class BatchProcessor {
    private config: BatchConfig;
    private analytics: AnalyticsEngine;
    private logger: Logger;
    private activeJobs: Map<string, BatchJob>;
    private processingQueue: BatchJob[];

    constructor(config: Partial<BatchConfig> = {}) {
        this.config = {
            maxBatchSize: 100,
            concurrentBatches: 3,
            retryAttempts: 3,
            retryDelay: 1000,
            ...config
        };
        this.analytics = new AnalyticsEngine();
        this.logger = new Logger();
        this.activeJobs = new Map();
        this.processingQueue = [];
    }

    async submitBatch(items: { id: string; text: string }[]): Promise<string> {
        const batchId = this.generateBatchId();
        const batchJob: BatchJob = {
            id: batchId,
            items: items.map(item => ({
                ...item,
                status: 'pending'
            })),
            status: 'queued',
            progress: 0
        };

        this.processingQueue.push(batchJob);
        this.activeJobs.set(batchId, batchJob);
        
        this.processQueue();
        
        return batchId;
    }

    async getBatchStatus(batchId: string): Promise<BatchJob | null> {
        return this.activeJobs.get(batchId) || null;
    }

    async cancelBatch(batchId: string): Promise<boolean> {
        const job = this.activeJobs.get(batchId);
        if (!job || job.status === 'completed') return false;

        job.status = 'failed';
        job.error = new Error('Batch cancelled by user');
        
        return true;
    }

    private async processQueue(): Promise<void> {
        const activeBatches = Array.from(this.activeJobs.values())
            .filter(job => job.status === 'processing')
            .length;

        if (activeBatches >= this.config.concurrentBatches) return;

        const nextBatch = this.processingQueue.shift();
        if (!nextBatch) return;

        this.processBatch(nextBatch);
    }

    private async processBatch(job: BatchJob): Promise<void> {
        job.status = 'processing';
        job.startTime = new Date();

        try {
            const batches = this.createBatches(job.items, this.config.maxBatchSize);
            
            for (const batch of batches) {
                await this.processBatchItems(batch, job);
                this.updateJobProgress(job);
            }

            job.status = 'completed';
            job.endTime = new Date();
            
        } catch (error) {
            job.status = 'failed';
            job.error = error as Error;
            this.logger.error(`Batch ${job.id} failed:`, error);
        }

        this.processQueue();
    }

    private async processBatchItems(items: BatchItem[], job: BatchJob): Promise<void> {
        const promises = items.map(async item => {
            item.status = 'processing';
            
            try {
                const result = await this.processWithRetry(item);
                item.status = 'completed';
                item.result = result;
            } catch (error) {
                item.status = 'failed';
                item.error = error as Error;
            }
        });

        await Promise.all(promises);
    }

    private async processWithRetry(item: BatchItem, attempt = 1): Promise<StyleMetrics> {
        try {
            const result = await this.analytics.analyzeEssay(item.id, item.text);
            return result.metrics;
        } catch (error) {
            if (attempt >= this.config.retryAttempts) throw error;
            
            await this.delay(this.config.retryDelay * attempt);
            return this.processWithRetry(item, attempt + 1);
        }
    }

    private createBatches<T>(items: T[], size: number): T[][] {
        return Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
            items.slice(i * size, (i + 1) * size)
        );
    }

    private updateJobProgress(job: BatchJob): void {
        const completed = job.items.filter(item => 
            item.status === 'completed' || item.status === 'failed'
        ).length;
        
        job.progress = (completed / job.items.length) * 100;
    }

    private generateBatchId(): string {
        return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
} 