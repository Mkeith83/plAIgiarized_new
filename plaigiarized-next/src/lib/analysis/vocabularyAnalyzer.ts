import { StudentBaseline } from '../interfaces/baseline';

interface VocabularyAnalysis {
    score: number;                 // Overall vocabulary score
    gradeLevel: number;           // Grade-appropriate level
    complexity: ComplexityMetrics;
    usage: UsageMetrics;
    growth: GrowthMetrics;
    explanation: string;          // Plain English explanation
    recommendations: string[];
}

interface ComplexityMetrics {
    averageWordLength: number;
    uniqueWords: number;
    academicWords: number;
    subjectSpecificTerms: number;
    complexityScore: number;
}

interface UsageMetrics {
    varietyScore: number;        // Word variety
    contextScore: number;        // Appropriate usage
    repetitionIndex: number;     // Unnecessary repetition
    transitions: number;         // Use of transition words
}

interface GrowthMetrics {
    improvement: number;         // From baseline
    naturalProgression: boolean; // Is growth natural?
    newWords: string[];         // Newly used vocabulary
    mastery: {                  // Mastery of previous vocab
        maintained: string[];
        dropped: string[];
    };
}

export class VocabularyAnalyzer {
    private academicWordList: Set<string>;
    private gradeWordLists: Map<number, Set<string>>;
    private transitionWords: Set<string>;

    constructor() {
        this.academicWordList = new Set();
        this.gradeWordLists = new Map();
        this.transitionWords = new Set();
        this.initializeWordLists();
    }

    async analyzeVocabulary(
        text: string,
        studentId: string,
        baseline?: StudentBaseline
    ): Promise<VocabularyAnalysis> {
        const words = this.preprocessText(text);
        const complexity = await this.analyzeComplexity(words);
        const usage = await this.analyzeUsage(words, text);
        const growth = await this.analyzeGrowth(words, baseline);
        
        const score = this.calculateOverallScore(complexity, usage);
        const gradeLevel = this.determineGradeLevel(complexity, usage);

        return {
            score,
            gradeLevel,
            complexity,
            usage,
            growth,
            explanation: this.createExplanation(complexity, usage, growth),
            recommendations: this.generateRecommendations(complexity, usage, growth)
        };
    }

    private preprocessText(text: string): string[] {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .split(/\s+/)
            .filter(Boolean);
    }

    private async analyzeComplexity(words: string[]): Promise<ComplexityMetrics> {
        const uniqueWords = new Set(words);
        const academicWords = new Set(
            words.filter(word => this.academicWordList.has(word))
        );

        return {
            averageWordLength: this.calculateAverageWordLength(words),
            uniqueWords: uniqueWords.size,
            academicWords: academicWords.size,
            subjectSpecificTerms: this.countSubjectSpecificTerms(words),
            complexityScore: this.calculateComplexityScore(words)
        };
    }

    private async analyzeUsage(words: string[], fullText: string): Promise<UsageMetrics> {
        return {
            varietyScore: this.calculateVarietyScore(words),
            contextScore: await this.analyzeContextualUsage(words, fullText),
            repetitionIndex: this.calculateRepetitionIndex(words),
            transitions: this.countTransitionWords(words)
        };
    }

    private async analyzeGrowth(
        words: string[],
        baseline?: StudentBaseline
    ): Promise<GrowthMetrics> {
        if (!baseline) {
            return {
                improvement: 0,
                naturalProgression: true,
                newWords: [],
                mastery: { maintained: [], dropped: [] }
            };
        }

        const baselineVocab = new Set(baseline.vocabulary || []);
        const currentVocab = new Set(words);
        
        const newWords = [...currentVocab].filter(word => !baselineVocab.has(word));
        const maintained = [...baselineVocab].filter(word => currentVocab.has(word));
        const dropped = [...baselineVocab].filter(word => !currentVocab.has(word));

        return {
            improvement: this.calculateVocabularyImprovement(baselineVocab, currentVocab),
            naturalProgression: this.isProgressionNatural(newWords, baseline),
            newWords,
            mastery: {
                maintained,
                dropped
            }
        };
    }

    private createExplanation(
        complexity: ComplexityMetrics,
        usage: UsageMetrics,
        growth: GrowthMetrics
    ): string {
        let explanation = `The vocabulary in this writing sample is at a ${this.formatGradeLevel(complexity.complexityScore)} grade level. `;
        
        if (complexity.academicWords > 0) {
            explanation += `It includes ${complexity.academicWords} academic words, `;
            explanation += `showing good use of subject-specific vocabulary. `;
        }

        if (growth.improvement > 0) {
            explanation += `There's a ${(growth.improvement * 100).toFixed(1)}% improvement in vocabulary `;
            explanation += `from the baseline, which is ${growth.naturalProgression ? 'consistent with' : 'faster than'} `;
            explanation += `expected progress. `;
        }

        if (usage.repetitionIndex > 0.3) {
            explanation += `There's some unnecessary repetition that could be improved. `;
        }

        return explanation;
    }

    private generateRecommendations(
        complexity: ComplexityMetrics,
        usage: UsageMetrics,
        growth: GrowthMetrics
    ): string[] {
        const recommendations: string[] = [];

        if (usage.varietyScore < 0.7) {
            recommendations.push(
                "Try using a wider variety of words to express your ideas.",
                "Keep a list of alternative words for commonly used terms."
            );
        }

        if (usage.transitions < 5) {
            recommendations.push(
                "Include more transition words to connect your ideas smoothly.",
                "Practice using words like 'however,' 'therefore,' and 'consequently.'"
            );
        }

        if (growth.mastery.dropped.length > 0) {
            recommendations.push(
                "Continue using vocabulary from your previous writings.",
                "Review and incorporate previously mastered words."
            );
        }

        return recommendations;
    }

    private formatGradeLevel(level: number): string {
        const grade = Math.floor(level);
        const decimal = (level % 1).toFixed(1);
        return `${grade}${decimal === '0.0' ? '' : decimal}`;
    }

    // Helper methods
    private calculateAverageWordLength(words: string[]): number {
        return words.reduce((sum, word) => sum + word.length, 0) / words.length;
    }

    private countSubjectSpecificTerms(words: string[]): number {
        // Implementation for counting subject-specific terms
        return 0;
    }

    private calculateComplexityScore(words: string[]): number {
        // Implementation for calculating complexity score
        return 0;
    }

    private calculateVarietyScore(words: string[]): number {
        // Implementation for calculating variety score
        return 0;
    }

    private async analyzeContextualUsage(words: string[], fullText: string): Promise<number> {
        // Implementation for analyzing contextual usage
        return 0;
    }

    private calculateRepetitionIndex(words: string[]): number {
        // Implementation for calculating repetition index
        return 0;
    }

    private countTransitionWords(words: string[]): number {
        return words.filter(word => this.transitionWords.has(word)).length;
    }

    private calculateVocabularyImprovement(
        baseline: Set<string>,
        current: Set<string>
    ): number {
        // Implementation for calculating vocabulary improvement
        return 0;
    }

    private isProgressionNatural(newWords: string[], baseline?: StudentBaseline): boolean {
        // Implementation for checking natural progression
        return true;
    }

    private initializeWordLists(): void {
        // Initialize academic word list, grade-level lists, and transition words
    }
} 