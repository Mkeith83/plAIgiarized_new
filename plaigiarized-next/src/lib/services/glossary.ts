import { Logger } from './logger';

interface GlossaryEntry {
  term: string;
  definition: string;
  examples: string[];
  category: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  usage: number;
}

export class GlossaryService {
  private logger: Logger;
  private entries: Map<string, GlossaryEntry>;
  private categories: Set<string>;

  constructor() {
    this.logger = new Logger();
    this.entries = new Map();
    this.categories = new Set();
  }

  public addEntry(entry: GlossaryEntry): void {
    try {
      this.validateEntry(entry);
      this.entries.set(entry.term.toLowerCase(), entry);
      this.categories.add(entry.category);
    } catch (error) {
      this.logger.error('Error adding glossary entry:', error);
      throw error;
    }
  }

  public getEntry(term: string): GlossaryEntry | undefined {
    return this.entries.get(term.toLowerCase());
  }

  public searchEntries(query: string): GlossaryEntry[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.entries.values()).filter(entry =>
      entry.term.toLowerCase().includes(searchTerm) ||
      entry.definition.toLowerCase().includes(searchTerm) ||
      entry.examples.some(ex => ex.toLowerCase().includes(searchTerm))
    );
  }

  public getEntriesByCategory(category: string): GlossaryEntry[] {
    return Array.from(this.entries.values())
      .filter(entry => entry.category === category);
  }

  public getCategories(): string[] {
    return Array.from(this.categories);
  }

  public updateEntry(term: string, updates: Partial<GlossaryEntry>): void {
    const existing = this.entries.get(term.toLowerCase());
    if (!existing) {
      throw new Error(`Entry not found: ${term}`);
    }

    const updated = { ...existing, ...updates };
    this.validateEntry(updated);
    this.entries.set(term.toLowerCase(), updated);
  }

  public removeEntry(term: string): boolean {
    return this.entries.delete(term.toLowerCase());
  }

  public getEntriesByDifficulty(difficulty: GlossaryEntry['difficulty']): GlossaryEntry[] {
    return Array.from(this.entries.values())
      .filter(entry => entry.difficulty === difficulty);
  }

  public getMostUsedTerms(limit = 10): GlossaryEntry[] {
    return Array.from(this.entries.values())
      .sort((a, b) => b.usage - a.usage)
      .slice(0, limit);
  }

  private validateEntry(entry: GlossaryEntry): void {
    if (!entry.term || !entry.definition) {
      throw new Error('Term and definition are required');
    }

    if (!['basic', 'intermediate', 'advanced'].includes(entry.difficulty)) {
      throw new Error('Invalid difficulty level');
    }

    if (entry.examples && !Array.isArray(entry.examples)) {
      throw new Error('Examples must be an array');
    }
  }
} 