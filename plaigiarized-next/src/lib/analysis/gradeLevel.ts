import { StyleMetrics } from '../interfaces/metrics';
import { StudentBaseline } from '../interfaces/baseline';

interface GradeLevelResult {
    overallLevel: number;          // Grade level (e.g., 9.3 for 9th grade)
    components: GradeComponents;
    progress: ProgressMetrics;
    explanation: string;           // Plain English explanation
    recommendations: string[];
}

interface GradeComponents {
    vocabulary: number;
    sentenceComplexity: number;
    grammarUsage: number;
    topicHandling: number;
    organizationLevel: number;
}

interface ProgressMetrics {
    improvement: number;           // Relative to baseline
    consistentGrowth: boolean;     // Is progress natural?
    areas: {
        name: string;
        change: number;
        isNatural: boolean;
    }[];
}

export class GradeLevelAnalyzer {
    private readonly gradeRanges = {
        vocabulary: new Map<number, Set<string>>(),
        grammar: new Map<number, Set<string>>(),
        structures: new Map<number, string[]>()
    };

    constructor() {
        this.initializeGradeRanges();
    }

    async analyzeGradeLevel(
        text: string,
        baseline?: StudentBaseline
    ): Promise<GradeLevelResult> {
        const components = await this.analyzeComponents(text);
        const overallLevel = this.calculateOverallLevel(components);
        const progress = await this.analyzeProgress(components, baseline);

        return {
            overallLevel,
            components,
            progress,
            explanation: this.createExplanation(components, progress),
            recommendations: this.generateRecommendations(components, progress)
        };
    }

    private async analyzeComponents(text: string): Promise<GradeComponents> {
        return {
            vocabulary: await this.analyzeVocabularyLevel(text),
            sentenceComplexity: await this.analyzeSentenceComplexity(text),
            grammarUsage: await this.analyzeGrammarUsage(text),
            topicHandling: await this.analyzeTopicHandling(text),
            organizationLevel: await this.analyzeOrganization(text)
        };
    }

    private async analyzeVocabularyLevel(text: string): Promise<number> {
        // Analyze vocabulary against grade-level word lists
        // Consider word frequency, complexity, and context
        return 0;
    }

    private async analyzeSentenceComplexity(text: string): Promise<number> {
        // Analyze sentence structure complexity
        // Consider clause usage, transitions, etc.
        return 0;
    }

    private async analyzeGrammarUsage(text: string): Promise<number> {
        // Analyze grammar sophistication
        // Consider tense usage, voice, etc.
        return 0;
    }

    private async analyzeTopicHandling(text: string): Promise<number> {
        // Analyze topic development and depth
        // Consider argument complexity, evidence usage
        return 0;
    }

    private async analyzeOrganization(text: string): Promise<number> {
        // Analyze organizational sophistication
        // Consider structure, transitions, flow
        return 0;
    }

    private calculateOverallLevel(components: GradeComponents): number {
        // Weight and combine component scores
        const weights = {
            vocabulary: 0.25,
            sentenceComplexity: 0.25,
            grammarUsage: 0.2,
            topicHandling: 0.15,
            organizationLevel: 0.15
        };

        return Object.entries(components).reduce(
            (sum, [key, value]) => sum + value * weights[key as keyof GradeComponents],
            0
        );
    }

    private async analyzeProgress(
        current: GradeComponents,
        baseline?: StudentBaseline
    ): Promise<ProgressMetrics> {
        if (!baseline) {
            return {
                improvement: 0,
                consistentGrowth: true,
                areas: []
            };
        }

        const areas = await this.calculateAreaProgress(current, baseline);
        
        return {
            improvement: this.calculateOverallImprovement(areas),
            consistentGrowth: this.isGrowthNatural(areas),
            areas
        };
    }

    private createExplanation(
        components: GradeComponents,
        progress: ProgressMetrics
    ): string {
        const gradeLevel = Math.floor(this.calculateOverallLevel(components));
        const decimal = (this.calculateOverallLevel(components) % 1).toFixed(1);

        let explanation = `This writing sample shows characteristics of ${gradeLevel}th grade level `;
        explanation += `(${decimal} to be exact). `;

        if (progress.improvement > 0) {
            explanation += `There has been a ${(progress.improvement * 100).toFixed(1)}% improvement `;
            explanation += `from the baseline, which is ${progress.consistentGrowth ? 'consistent' : 'unusually rapid'} `;
            explanation += `for this time period.`;
        }

        return explanation;
    }

    private generateRecommendations(
        components: GradeComponents,
        progress: ProgressMetrics
    ): string[] {
        const recommendations: string[] = [];

        // Add specific recommendations based on components and progress
        Object.entries(components).forEach(([area, score]) => {
            if (score < this.calculateOverallLevel(components)) {
                recommendations.push(
                    this.getRecommendationForArea(area as keyof GradeComponents, score)
                );
            }
        });

        return recommendations;
    }

    private getRecommendationForArea(area: keyof GradeComponents, score: number): string {
        const recommendations = {
            vocabulary: "Try incorporating more varied and sophisticated vocabulary appropriate for your grade level.",
            sentenceComplexity: "Practice combining sentences and using different sentence structures.",
            grammarUsage: "Focus on mastering more complex grammar patterns and tenses.",
            topicHandling: "Work on developing your ideas more thoroughly with specific examples.",
            organizationLevel: "Pay attention to how your paragraphs flow together and use clear transitions."
        };

        return recommendations[area];
    }

    private initializeGradeRanges(): void {
        // Initialize grade-appropriate vocabulary, grammar, and structure ranges
        // This would be populated with comprehensive grade-level data
    }
} 