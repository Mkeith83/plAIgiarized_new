interface PreprocessConfig {
    removeFormatting: boolean;
    normalizeText: boolean;
    tokenize: boolean;
    removeStopwords: boolean;
    language: string;
}

interface ProcessedText {
    original: string;
    processed: string;
    tokens: string[];
    metadata: {
        wordCount: number;
        sentenceCount: number;
        averageWordLength: number;
        complexity: number;
    };
}

export class TextPreprocessor {
    private config: PreprocessConfig;
    private stopwords: Set<string>;

    constructor(config: Partial<PreprocessConfig> = {}) {
        this.config = {
            removeFormatting: true,
            normalizeText: true,
            tokenize: true,
            removeStopwords: true,
            language: 'en',
            ...config
        };
        this.stopwords = new Set(this.loadStopwords(this.config.language));
    }

    async process(text: string): Promise<ProcessedText> {
        let processed = text;

        if (this.config.removeFormatting) {
            processed = this.removeFormatting(processed);
        }

        if (this.config.normalizeText) {
            processed = this.normalizeText(processed);
        }

        const tokens = this.config.tokenize ? this.tokenize(processed) : [];
        
        if (this.config.removeStopwords) {
            tokens.filter(token => !this.stopwords.has(token.toLowerCase()));
        }

        return {
            original: text,
            processed,
            tokens,
            metadata: this.calculateMetadata(processed, tokens)
        };
    }

    private removeFormatting(text: string): string {
        return text
            .replace(/\r?\n/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/[^\w\s.,!?-]/g, '')
            .trim();
    }

    private normalizeText(text: string): string {
        return text
            .toLowerCase()
            .replace(/[.,!?-]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    private tokenize(text: string): string[] {
        return text.split(/\s+/).filter(Boolean);
    }

    private calculateMetadata(text: string, tokens: string[]): ProcessedText['metadata'] {
        const sentences = text.split(/[.!?]+/).filter(Boolean);
        const totalCharacters = tokens.reduce((sum, token) => sum + token.length, 0);

        return {
            wordCount: tokens.length,
            sentenceCount: sentences.length,
            averageWordLength: tokens.length ? totalCharacters / tokens.length : 0,
            complexity: this.calculateComplexity(text, tokens, sentences)
        };
    }

    private calculateComplexity(text: string, tokens: string[], sentences: string[]): number {
        // Basic implementation of text complexity calculation
        const avgWordsPerSentence = tokens.length / sentences.length;
        const avgWordLength = tokens.reduce((sum, token) => sum + token.length, 0) / tokens.length;
        return (avgWordsPerSentence * 0.5 + avgWordLength * 0.5);
    }

    private loadStopwords(language: string): string[] {
        // Implementation for loading language-specific stopwords
        return [];
    }
} 