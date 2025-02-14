import { Logger } from './logger';

interface CacheOptions {
  expirationTime?: number; // in milliseconds
  maxSize?: number; // maximum number of items
}

export class AnalysisCache {
  private cache: Map<string, {
    data: any;
    timestamp: number;
  }>;
  private logger: Logger;
  private options: Required<CacheOptions>;

  constructor(options?: CacheOptions) {
    this.cache = new Map();
    this.logger = new Logger();
    this.options = {
      expirationTime: options?.expirationTime || 1000 * 60 * 5, // 5 minutes
      maxSize: options?.maxSize || 100
    };
  }

  public set(key: string, data: any): void {
    try {
      if (this.cache.size >= this.options.maxSize) {
        this.evictOldest();
      }

      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
    } catch (error) {
      this.logger.error('Error setting cache:', error);
    }
  }

  public get<T>(key: string): T | null {
    try {
      const cached = this.cache.get(key);
      
      if (!cached) return null;
      
      if (this.isExpired(cached.timestamp)) {
        this.cache.delete(key);
        return null;
      }

      return cached.data as T;
    } catch (error) {
      this.logger.error('Error getting from cache:', error);
      return null;
    }
  }

  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.options.expirationTime;
  }

  private evictOldest(): void {
    const oldest = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0];
    
    if (oldest) {
      this.cache.delete(oldest[0]);
    }
  }

  public clear(): void {
    this.cache.clear();
  }
} 