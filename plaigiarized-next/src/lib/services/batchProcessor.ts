import { Logger } from './logger';
import { Essay } from '../interfaces/database/models';
import { DocumentScanner } from './scanner';
import { AIDetector } from '../ai/detector';
import { DatabaseService } from './database';

interface BatchProcessResult {
  studentId: string;
  essays: Array<{
    id: string;
    content: string;
    analysis: {
      aiScore: number;
      baselineComparison: number;
      improvements: {
        vocabulary: number;
        style: number;
        gradeLevel: number;
      };
    };
    status: 'processed' | 'failed';
    error?: string;
  }>;
}

export class BatchProcessor {
  private logger: Logger;
  private scanner: DocumentScanner;
  private detector: AIDetector;
  private db: DatabaseService;

  constructor() {
    this.logger = new Logger();
    this.scanner = new DocumentScanner();
    this.detector = new AIDetector();
    this.db = new DatabaseService();
  }

  public async processBatch(
    files: Array<{ studentId: string; content: Blob | string }>
  ): Promise<Record<string, BatchProcessResult>> {
    const results: Record<string, BatchProcessResult> = {};

    for (const file of files) {
      try {
        const content = typeof file.content === 'string' 
          ? file.content 
          : (await this.scanner.scanDocument(file.content)).text;

        const baselineEssays = await this.db.getStudentBaselines(file.studentId);
        const analysis = await this.detector.analyzeAgainstBaseline(
          { id: '', studentId: file.studentId, content } as Essay,
          baselineEssays
        );

        if (!results[file.studentId]) {
          results[file.studentId] = {
            studentId: file.studentId,
            essays: []
          };
        }

        results[file.studentId].essays.push({
          id: `essay_${Date.now()}`,
          content,
          analysis: {
            aiScore: analysis.score,
            baselineComparison: analysis.baselineComparison.consistencyScore,
            improvements: {
              vocabulary: 0, // Calculate from analysis
              style: 0,     // Calculate from analysis
              gradeLevel: 0 // Calculate from analysis
            }
          },
          status: 'processed'
        });
      } catch (error: unknown) {
        this.logger.error(`Error processing file for student ${file.studentId}`, error);
        if (!results[file.studentId]) {
          results[file.studentId] = {
            studentId: file.studentId,
            essays: []
          };
        }
        results[file.studentId].essays.push({
          id: `essay_${Date.now()}`,
          content: '',
          analysis: {
            aiScore: 0,
            baselineComparison: 0,
            improvements: {
              vocabulary: 0,
              style: 0,
              gradeLevel: 0
            }
          },
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }
    }

    return results;
  }
} 