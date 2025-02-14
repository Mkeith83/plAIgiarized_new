interface TextStats {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    averageWordLength: number;
    averageSentenceLength: number;
    readabilityScore: number;
}

interface TokenizationResult {
    words: string[];
    sentences: string[];
    paragraphs: string[];
    ngrams: Map<number, string[]>;
}

export class TextProcessor {
    private readonly SENTENCE_DELIMITERS = /[.!?]+/;
    private readonly WORD_PATTERN = /\b\w+\b/g;
    private readonly MIN_WORD_LENGTH = 2;
    private readonly MAX_NGRAM_SIZE = 5;

    async analyze(text: string): Promise<TextStats> {
        const tokens = await this.tokenize(text);
        
        return {
            wordCount: tokens.words.length,
            sentenceCount: tokens.sentences.length,
            paragraphCount: tokens.paragraphs.length,
            averageWordLength: this.calculateAverageWordLength(tokens.words),
            averageSentenceLength: this.calculateAverageSentenceLength(tokens.sentences),
            readabilityScore: await this.calculateReadabilityScore(text)
        };
    }

    async tokenize(text: string): Promise<TokenizationResult> {
        const words = this.extractWords(text);
        const sentences = this.extractSentences(text);
        const paragraphs = this.extractParagraphs(text);
        const ngrams = this.generateNgrams(words);

        return {
            words,
            sentences,
            paragraphs,
            ngrams
        };
    }

    async findPatterns(text: string): Promise<Map<string, number>> {
        const patterns = new Map<string, number>();
        const tokens = await this.tokenize(text);

        // Analyze word patterns
        tokens.ngrams.forEach((ngrams, size) => {
            ngrams.forEach(ngram => {
                const count = patterns.get(ngram) || 0;
                patterns.set(ngram, count + 1);
            });
        });

        return patterns;
    }

    async compareTexts(text1: string, text2: string): Promise<number> {
        const tokens1 = await this.tokenize(text1);
        const tokens2 = await this.tokenize(text2);

        const similarity = this.calculateJaccardSimilarity(
            new Set(tokens1.words),
            new Set(tokens2.words)
        );

        return similarity;
    }

    private extractWords(text: string): string[] {
        return text.toLowerCase()
            .match(this.WORD_PATTERN)
            ?.filter(word => word.length >= this.MIN_WORD_LENGTH) || [];
    }

    private extractSentences(text: string): string[] {
        return text
            .split(this.SENTENCE_DELIMITERS)
            .map(s => s.trim())
            .filter(Boolean);
    }

    private extractParagraphs(text: string): string[] {
        return text
            .split(/\n\s*\n/)
            .map(p => p.trim())
            .filter(Boolean);
    }

    private generateNgrams(words: string[]): Map<number, string[]> {
        const ngrams = new Map<number, string[]>();

        for (let n = 1; n <= this.MAX_NGRAM_SIZE; n++) {
            const ngramList: string[] = [];
            for (let i = 0; i <= words.length - n; i++) {
                ngramList.push(words.slice(i, i + n).join(' '));
            }
            ngrams.set(n, ngramList);
        }

        return ngrams;
    }

    private calculateAverageWordLength(words: string[]): number {
        if (words.length === 0) return 0;
        const totalLength = words.reduce((sum, word) => sum + word.length, 0);
        return totalLength / words.length;
    }

    private calculateAverageSentenceLength(sentences: string[]): number {
        if (sentences.length === 0) return 0;
        const totalWords = sentences.reduce(
            (sum, sentence) => sum + this.extractWords(sentence).length,
            0
        );
        return totalWords / sentences.length;
    }

    private async calculateReadabilityScore(text: string): Promise<number> {
        // Implement readability scoring (e.g., Flesch-Kincaid)
        return 0;
    }

    private calculateJaccardSimilarity(set1: Set<string>, set2: Set<string>): number {
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        return intersection.size / union.size;
    }
} 