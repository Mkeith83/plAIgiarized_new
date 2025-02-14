import { StyleMetrics } from '../interfaces/metrics';
import { StudentBaseline } from '../interfaces/baseline';
import { GlossaryService } from '../services/glossaryService';

interface StealthResult {
    found: boolean;
    explanation: string;    // Plain English explanation
    techniques: Technique[];
    readabilityScore: number;
    suggestions: string[];
    glossaryTerms: string[];  // Terms to look up in glossary
}

interface Technique {
    name: string;
    description: string;   // Teacher-friendly explanation
    studentExplanation: string;  // Student-friendly explanation
    confidence: number;
    examples: string[];
}

export class StealthDetector {
    private glossary: GlossaryService;

    constructor() {
        this.glossary = new GlossaryService();
    }

    async analyze(text: string, baseline?: StudentBaseline): Promise<StealthResult> {
        const techniques = await this.detectTechniques(text, baseline);
        const readabilityScore = this.calculateReadability(text);
        
        // Create plain English explanation
        const explanation = this.createExplanation(techniques);
        
        // Generate helpful suggestions
        const suggestions = this.generateSuggestions(techniques);

        // Collect relevant glossary terms
        const glossaryTerms = await this.collectGlossaryTerms(techniques);

        return {
            found: techniques.length > 0,
            explanation,
            techniques,
            readabilityScore,
            suggestions,
            glossaryTerms
        };
    }

    private async detectTechniques(text: string, baseline?: StudentBaseline): Promise<Technique[]> {
        const techniques: Technique[] = [];

        // Check for common evasion techniques
        await Promise.all([
            this.checkSynonymReplacement(text, techniques),
            this.checkStyleInconsistencies(text, baseline, techniques),
            this.checkUnusualPatterns(text, baseline, techniques),
            this.checkVocabularyShifts(text, baseline, techniques),
            this.checkSentenceRestructuring(text, techniques)
        ]);

        return techniques;
    }

    private async checkSynonymReplacement(text: string, techniques: Technique[]): Promise<void> {
        // Detect unusual synonym patterns
        // Example: "utilize" instead of "use" consistently
    }

    private async checkStyleInconsistencies(
        text: string, 
        baseline: StudentBaseline | undefined,
        techniques: Technique[]
    ): Promise<void> {
        // Compare with student's baseline style
        // Look for sudden style changes
    }

    private async checkUnusualPatterns(
        text: string,
        baseline: StudentBaseline | undefined,
        techniques: Technique[]
    ): Promise<void> {
        // Detect patterns common in AI evasion
        // Compare with natural writing patterns
    }

    private async checkVocabularyShifts(
        text: string,
        baseline: StudentBaseline | undefined,
        techniques: Technique[]
    ): Promise<void> {
        // Track vocabulary complexity changes
        // Compare with student's normal vocabulary range
    }

    private async checkSentenceRestructuring(text: string, techniques: Technique[]): Promise<void> {
        // Detect unusual sentence structure changes
        // Look for patterns in restructuring
    }

    private calculateReadability(text: string): number {
        // Calculate readability score
        // Consider grade level and complexity
        return 0;
    }

    private createExplanation(techniques: Technique[]): string {
        if (techniques.length === 0) {
            return "No unusual writing patterns detected. The writing style appears natural and consistent with typical student work.";
        }

        return techniques.map(t => 
            `${t.description} For example: ${t.examples[0]}`
        ).join('\n\n');
    }

    private generateSuggestions(techniques: Technique[]): string[] {
        const suggestions: string[] = [];

        if (techniques.length === 0) {
            suggestions.push(
                "Keep up the good work! Your writing appears natural and authentic.",
                "Continue developing your unique writing style."
            );
            return suggestions;
        }

        // Add specific suggestions based on detected techniques
        techniques.forEach(technique => {
            suggestions.push(
                `Consider: ${technique.studentExplanation}`,
                `Tip: Focus on expressing ideas in your own words and style.`
            );
        });

        return suggestions;
    }

    private async collectGlossaryTerms(techniques: Technique[]): Promise<string[]> {
        const terms = new Set<string>();

        // Add relevant terms based on detected techniques
        techniques.forEach(technique => {
            // Add technique-specific terms to glossary
            terms.add(technique.name);
        });

        // Add general terms that might be helpful
        terms.add('writing style');
        terms.add('authenticity');
        terms.add('originality');

        return Array.from(terms);
    }
} 