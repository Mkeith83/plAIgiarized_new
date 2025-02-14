import { Logger } from '../services/logger';
import type { StyleMetrics } from '../interfaces/metrics';
import type { WritingMetrics } from '../interfaces/analysis';

interface StylePattern {
  pattern: string;
  frequency: number;
  examples: string[];
}

interface StyleProfile {
  sentenceStructures: string[];
  transitionUsage: Record<string, number>;
  paragraphFlow: number[];
  syntaxPatterns: StylePattern[];
  complexity: number;
}

export class StyleAnalyzer {
  private logger: Logger;
  private readonly complexityThreshold = 0.7;
  private readonly transitionWords = new Set([
    'however', 'therefore', 'furthermore', 'moreover',
    'consequently', 'meanwhile', 'nevertheless', 'thus'
  ]);

  constructor() {
    this.logger = new Logger();
  }

  public async analyzeStyle(text: string): Promise<StyleMetrics> {
    try {
      const sentences = this.splitIntoSentences(text);
      const paragraphs = this.splitIntoParagraphs(text);

      return {
        sentenceCount: sentences.length,
        averageSentenceLength: this.calculateAverageSentenceLength(sentences),
        paragraphCount: paragraphs.length,
        averageParagraphLength: this.calculateAverageParagraphLength(paragraphs),
        transitionWords: this.findTransitionWords(text),
        punctuationFrequency: this.analyzePunctuation(text)
      };
    } catch (error) {
      this.logger.error('Error analyzing style:', error);
      throw new Error('Failed to analyze text style');
    }
  }

  private splitIntoSentences(text: string): string[] {
    return text.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()) ?? [];
  }

  private splitIntoParagraphs(text: string): string[] {
    return text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  }

  private calculateAverageSentenceLength(sentences: string[]): number {
    if (!sentences.length) return 0;
    const totalWords = sentences.reduce((sum, sentence) => {
      const words = sentence.match(/\b\w+\b/g);
      return sum + (words?.length ?? 0);
    }, 0);
    return totalWords / sentences.length;
  }

  private calculateAverageParagraphLength(paragraphs: string[]): number {
    if (!paragraphs.length) return 0;
    const totalWords = paragraphs.reduce((sum, paragraph) => {
      const words = paragraph.match(/\b\w+\b/g);
      return sum + (words?.length ?? 0);
    }, 0);
    return totalWords / paragraphs.length;
  }

  private findTransitionWords(text: string): string[] {
    return Array.from(this.transitionWords)
      .filter(word => new RegExp(`\\b${word}\\b`, 'i').test(text));
  }

  private analyzePunctuation(text: string): Record<string, number> {
    const punctuation = /[.,!?;:]/g;
    const matches = text.match(punctuation);
    const frequency: Record<string, number> = {};
    
    if (matches) {
      matches.forEach(char => {
        frequency[char] = (frequency[char] || 0) + 1;
      });
    }
    
    return frequency;
  }

  public async createStyleProfile(texts: string[]): Promise<StyleProfile> {
    try {
      if (!texts.length) {
        throw new Error('No texts provided for analysis');
      }

      const allSentences = texts.flatMap(text => this.splitIntoSentences(text));
      const patterns = this.findStylePatterns(texts.join(' '));

      return {
        sentenceStructures: allSentences.map(s => this.getSentenceStructure(s)),
        transitionUsage: this.analyzeTransitionUsage(texts),
        paragraphFlow: this.analyzeParagraphFlow(texts),
        syntaxPatterns: patterns,
        complexity: this.calculateStyleComplexity(patterns)
      };
    } catch (error) {
      this.logger.error('Error creating style profile:', error);
      throw new Error('Failed to create style profile');
    }
  }

  private analyzeTransitionUsage(texts: string[]): Record<string, number> {
    const usage: Record<string, number> = {};
    texts.forEach(text => {
      const transitions = this.findTransitionWords(text);
      transitions.forEach(word => {
        usage[word] = (usage[word] || 0) + 1;
      });
    });
    return usage;
  }

  private analyzeParagraphFlow(texts: string[]): number[] {
    return texts.map(text => {
      const paragraphs = this.splitIntoParagraphs(text);
      return paragraphs.map(p => this.calculateComplexity(p));
    }).flat();
  }

  private calculateComplexity(text: string): number {
    const words = text.match(/\b\w+\b/g) || [];
    const uniqueWords = new Set(words).size;
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    return (uniqueWords / words.length) * (avgWordLength / 10);
  }

  private calculateStyleComplexity(patterns: StylePattern[]): number {
    if (!patterns.length) return 0;
    return patterns.reduce((sum, p) => sum + p.frequency, 0) / patterns.length;
  }

  private getSentenceStructure(sentence: string): string {
    return sentence
      .trim()
      .toLowerCase()
      .replace(/\b\w+\b/g, word => {
        if (this.transitionWords.has(word)) return 'T';
        if (this.isComplexWord(word)) return 'C';
        return 'W';
      });
  }

  private isComplexWord(word: string): boolean {
    return word.length > 8 || this.countSyllables(word) > 3;
  }

  private countSyllables(word: string): number {
    const syllableRegex = /[aeiouy]{1,2}/g;
    const matches = word
      .toLowerCase()
      .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
      .match(syllableRegex);
    return matches?.length ?? 0;
  }

  public findStylePatterns(text: string): StylePattern[] {
    const patterns: StylePattern[] = [];
    const sentences = this.splitIntoSentences(text);

    // Analyze sentence beginnings
    patterns.push(this.analyzeSentenceBeginnings(sentences));

    // Analyze sentence structures
    patterns.push(this.analyzeSentenceStructures(sentences));

    return patterns;
  }

  private analyzeSentenceBeginnings(sentences: string[]): StylePattern {
    const beginnings = sentences.map(s => 
      s.trim().split(' ')[0].toLowerCase()
    );

    return {
      pattern: 'sentence_beginnings',
      frequency: this.calculatePatternFrequency(beginnings),
      examples: this.findMostCommon(beginnings, 5)
    };
  }

  private analyzeSentenceStructures(sentences: string[]): StylePattern {
    const structures = sentences.map(s => 
      this.getSentenceStructure(s)
    );

    return {
      pattern: 'sentence_structures',
      frequency: this.calculatePatternFrequency(structures),
      examples: this.findMostCommon(structures, 5)
    };
  }

  private calculatePatternFrequency(items: string[]): number {
    const uniqueCount = new Set(items).size;
    return 1 - (uniqueCount / items.length);
  }

  private findMostCommon(items: string[], limit: number): string[] {
    const frequency: Record<string, number> = {};
    items.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([item]) => item);
  }
}

export const analyzeWritingStyle = async (submissions: any[]): Promise<WritingMetrics> => {
  // Implement writing style analysis
  // This should analyze vocabulary, syntax, and style patterns
  // Return metrics conforming to WritingMetrics interface
  return {
    vocabulary: {
      complexityScore: 0,
      consistencyScore: 0,
      commonWords: [],
      unusualWords: [],
      transitionPhrases: []
    },
    syntax: {
      averageSentenceLength: 0,
      complexSentences: 0,
      consistencyScore: 0,
      commonStructures: []
    },
    style: {
      punctuationPatterns: [],
      paragraphStructure: '',
      toneMarkers: [],
      consistencyScore: 0
    }
  };
};
