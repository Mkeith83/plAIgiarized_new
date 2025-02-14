interface CacheConfig {
    maxSize: number;
    ttl: number;  // Time to live in milliseconds
}

interface CacheEntry<T> {
    value: T;
    timestamp: number;
}

export class CacheService<T> {
    private cache: Map<string, CacheEntry<T>>;
    private config: CacheConfig;

    constructor(config: Partial<CacheConfig> = {}) {
        this.config = {
            maxSize: 1000,
            ttl: 1000 * 60 * 60, // 1 hour default
            ...config
        };
        this.cache = new Map();
    }

    async set(key: string, value: T): Promise<void> {
        this.cleanup();

        if (this.cache.size >= this.config.maxSize) {
            const oldestKey = this.findOldestEntry();
            if (oldestKey) this.cache.delete(oldestKey);
        }

        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }

    async get(key: string): Promise<T | null> {
        const entry = this.cache.get(key);
        
        if (!entry) return null;

        if (this.isExpired(entry)) {
            this.cache.delete(key);
            return null;
        }

        return entry.value;
    }

    async delete(key: string): Promise<boolean> {
        return this.cache.delete(key);
    }

    async clear(): Promise<void> {
        this.cache.clear();
    }

    private isExpired(entry: CacheEntry<T>): boolean {
        return Date.now() - entry.timestamp > this.config.ttl;
    }

    private cleanup(): void {
        for (const [key, entry] of this.cache.entries()) {
            if (this.isExpired(entry)) {
                this.cache.delete(key);
            }
        }
    }

    private findOldestEntry(): string | null {
        let oldestKey: string | null = null;
        let oldestTime = Infinity;

        for (const [key, entry] of this.cache.entries()) {
            if (entry.timestamp < oldestTime) {
                oldestTime = entry.timestamp;
                oldestKey = key;
            }
        }

        return oldestKey;
    }

    getSize(): number {
        return this.cache.size;
    }

    getStats(): Record<string, number> {
        return {
            size: this.cache.size,
            maxSize: this.config.maxSize,
            ttl: this.config.ttl,
            utilization: this.cache.size / this.config.maxSize
        };
    }
} 