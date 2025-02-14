import { Logger } from '../services/logger';
import { AdvancedTextAnalyzer } from './textAnalyzer';

interface DocumentInput {
  id?: string;
  text: string;
  metadata?: Record<string, unknown>;
}

interface TaskResult {
  type: AITask['type'];
  data: unknown;
  timestamp: string;
}

interface AITask {
  type: 'analyze' | 'summarize' | 'classify' | 'translate' | 'qa';
  input: DocumentInput;
  options?: Record<string, unknown>;
}

interface ProcessingResult {
  documentId?: string;
  timestamp: string;
  results: Record<string, TaskResult>;
}

export class AIIntegrationHub {
  private logger: Logger;
  private textAnalyzer: AdvancedTextAnalyzer;
  private cache: Map<string, TaskResult>;
  private settings: {
    maxWorkers: number;
    batchSize: number;
    useGPU: boolean;
    cacheResults: boolean;
    asyncProcessing: boolean;
  };

  constructor() {
    this.logger = new Logger();
    this.textAnalyzer = new AdvancedTextAnalyzer();
    this.cache = new Map();
    
    this.settings = {
      maxWorkers: 4,
      batchSize: 16,
      useGPU: typeof window !== 'undefined' && 'gpu' in navigator,
      cacheResults: true,
      asyncProcessing: true
    };
  }

  public async processDocument(
    document: DocumentInput, 
    tasks?: string[]
  ): Promise<ProcessingResult> {
    try {
      const defaultTasks = ['analyze', 'summarize', 'classify'];
      const tasksToRun = tasks || defaultTasks;
      
      const results = {
        documentId: document.id,
        timestamp: new Date().toISOString(),
        results: {}
      };

      // Process tasks concurrently
      const taskPromises = tasksToRun.map(task => 
        this.executeTask({
          type: task as AITask['type'],
          input: document
        })
      );

      const taskResults = await Promise.all(taskPromises);
      
      tasksToRun.forEach((task, index) => {
        results.results[task] = taskResults[index];
      });

      return results;

    } catch (error) {
      this.logger.error('Error processing document:', error);
      throw error;
    }
  }

  private async executeTask(task: AITask): Promise<TaskResult> {
    const cacheKey = this.getCacheKey(task);
    
    if (this.settings.cacheResults && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      let result: TaskResult;
      
      switch (task.type) {
        case 'analyze':
          result = await this.textAnalyzer.analyzeText(task.input.text);
          break;
        // Add other task types...
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      if (this.settings.cacheResults) {
        this.cache.set(cacheKey, result);
      }

      return result;

    } catch (error) {
      this.logger.error(`Error executing task ${task.type}:`, error);
      throw error;
    }
  }

  private getCacheKey(task: AITask): string {
    return `${task.type}:${JSON.stringify(task.input)}`;
  }

  public clearCache(type?: string): void {
    if (type) {
      Array.from(this.cache.keys())
        .filter(key => key.startsWith(`${type}:`))
        .forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }
} 