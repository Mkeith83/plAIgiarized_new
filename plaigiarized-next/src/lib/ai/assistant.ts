import type { Message, AssistantResponse } from '../interfaces/ai/assistantInterface';
import { Logger } from '../services/logger';
import { AIIntegration } from './integration';
import { DetectionService } from './detector';
import { BaselineService } from '../analysis/baselineAnalyzer';

export interface FeedbackRequest {
  text: string;
  type: 'grammar' | 'style' | 'content' | 'suggestions';
  context?: {
    gradeLevel?: number;
    subject?: string;
    previousFeedback?: string[];
  };
}

interface AnalysisResult {
    aiProbability: number;
    confidence: number;
    baselineMatch: number;
    styleDifferences: string[];
}

interface ValidationResult {
    isValid: boolean;
    matchScore: number;
    differences: string[];
    confidence: number;
}

export class AIAssistant {
  private logger: Logger;
  private integration: AIIntegration;
  private detector: DetectionService;
  private baseline: BaselineService;

  constructor() {
    this.logger = new Logger();
    this.integration = new AIIntegration();
    this.detector = new DetectionService();
    this.baseline = new BaselineService();
  }

  public async generateFeedback(request: FeedbackRequest): Promise<AssistantResponse> {
    try {
      const response = await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: request.text,
          type: request.type,
          context: request.context,
          model: this.integration.name
        })
      });

      if (!response.ok) throw new Error('Feedback generation failed');
      
      return await response.json();
    } catch (error) {
      this.logger.error('Error generating feedback', error);
      throw error;
    }
  }

  public async suggestImprovements(text: string): Promise<AssistantResponse> {
    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          model: this.integration.name
        })
      });

      if (!response.ok) throw new Error('Suggestion generation failed');
      
      return await response.json();
    } catch (error) {
      this.logger.error('Error generating suggestions', error);
      throw error;
    }
  }

  public async processMessage(message: Message): Promise<AssistantResponse> {
    try {
      // Implementation
      return {} as AssistantResponse;
    } catch (error) {
      this.logger.error('Error processing message:', error);
      throw error;
    }
  }

  async analyzeEssay(text: string): Promise<AnalysisResult> {
    const detectionScore = await this.detector.analyze(text);
    const baselineComparison = await this.baseline.compare(text);
    
    return {
        aiProbability: detectionScore.probability,
        confidence: detectionScore.confidence,
        baselineMatch: baselineComparison.matchScore,
        styleDifferences: baselineComparison.differences
    };
  }

  async validateAgainstBaseline(text: string, studentId: string): Promise<ValidationResult> {
    const baseline = await this.baseline.getStudentBaseline(studentId);
    const comparison = await this.baseline.compareWithBaseline(text, baseline);
    
    return {
        isValid: comparison.matchScore > 0.7,
        matchScore: comparison.matchScore,
        differences: comparison.styleDifferences,
        confidence: comparison.confidence
    };
  }
}
