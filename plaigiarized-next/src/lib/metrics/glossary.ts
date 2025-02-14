import { Logger } from '../services/logger';

interface WordEntry {
  word: string;
  frequency: number;
  complexity: number;
  contexts: string[];
}

interface VocabularyStats {
  totalWords: number;
  uniqueWords: number;
  averageComplexity: number;
  frequentWords: WordEntry[];
  rareWords: WordEntry[];
}

export class VocabularyAnalyzer {
  private logger: Logger;
  private vocabulary: Map<string, WordEntry>;
  private readonly complexityThreshold = 0.7;

  constructor() {
    this.logger = new Logger();
    this.vocabulary = new Map();
  }

  public analyzeText(text: string): VocabularyStats {
    try {
      const words = this.tokenizeText(text);
      this.updateVocabulary(words, text);

      return {
        totalWords: words.length,
        uniqueWords: this.vocabulary.size,
        averageComplexity: this.calculateAverageComplexity(),
        frequentWords: this.getFrequentWords(),
        rareWords: this.getRareWords()
      };
    } catch (error) {
      this.logger.error('Error analyzing vocabulary:', error);
      throw error;
    }
  }

  private tokenizeText(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);
  }

  private updateVocabulary(words: string[], context: string): void {
    words.forEach(word => {
      const entry = this.vocabulary.get(word) || {
        word,
        frequency: 0,
        complexity: this.calculateWordComplexity(word),
        contexts: []
      };

      entry.frequency++;
      if (!entry.contexts.includes(context)) {
        entry.contexts.push(context);
      }

      this.vocabulary.set(word, entry);
    });
  }

  private calculateWordComplexity(word: string): number {
    const syllables = this.countSyllables(word);
    const length = word.length;
    return (syllables * 0.5 + length * 0.5) / 10;
  }

  private countSyllables(word: string): number {
    return word.toLowerCase()
      .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
      .match(/[aeiouy]{1,2}/g)?.length || 0;
  }

  private calculateAverageComplexity(): number {
    const entries = Array.from(this.vocabulary.values());
    return entries.reduce((sum, entry) => sum + entry.complexity, 0) / entries.length;
  }

  private getFrequentWords(): WordEntry[] {
    return Array.from(this.vocabulary.values())
      .filter(entry => entry.frequency > 3)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }

  private getRareWords(): WordEntry[] {
    return Array.from(this.vocabulary.values())
      .filter(entry => entry.frequency === 1 && entry.complexity > this.complexityThreshold)
      .sort((a, b) => b.complexity - a.complexity)
      .slice(0, 10);
  }
}
