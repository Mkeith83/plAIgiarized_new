import { StudentMatcher } from '../services/studentMatcher';
import { DocumentNormalizer } from './documentNormalizer';

interface BatchAssignmentResult {
    successful: Assignment[];
    failed: FailedAssignment[];
    summary: {
        total: number;
        assigned: number;
        failed: number;
        confidence: number;
    };
}

interface Assignment {
    documentId: string;
    studentId: string;
    confidence: number;
    metadata: {
        matchReason: string;
        alternativeMatches: string[];
    };
}

interface FailedAssignment {
    documentId: string;
    reason: string;
    possibleMatches: {
        studentId: string;
        confidence: number;
    }[];
}

export class BatchAssignmentService {
    private matcher: StudentMatcher;
    private normalizer: DocumentNormalizer;

    constructor() {
        this.matcher = new StudentMatcher();
        this.normalizer = new DocumentNormalizer();
    }

    async assignDocuments(
        documents: Array<{ id: string; content: string }>,
        classId: string,
        options: {
            autoAssignThreshold?: number;
            requireConfirmation?: boolean;
            onProgress?: (progress: number) => void;
        } = {}
    ): Promise<BatchAssignmentResult> {
        const successful: Assignment[] = [];
        const failed: FailedAssignment[] = [];
        const threshold = options.autoAssignThreshold ?? 0.85;

        try {
            // Load class data
            const students = await this.matcher.getClassStudents(classId);
            options.onProgress?.(0.1);

            // Process documents
            for (let i = 0; i < documents.length; i++) {
                const doc = documents[i];
                try {
                    // Normalize document
                    const normalized = await this.normalizer.normalize(doc.content);
                    
                    // Find matching student
                    const matches = await this.matcher.findPotentialMatches(
                        normalized.text,
                        students
                    );

                    if (matches.length > 0 && matches[0].confidence >= threshold) {
                        successful.push({
                            documentId: doc.id,
                            studentId: matches[0].studentId,
                            confidence: matches[0].confidence,
                            metadata: {
                                matchReason: matches[0].reason,
                                alternativeMatches: matches
                                    .slice(1, 4)
                                    .map(m => m.studentId)
                            }
                        });
                    } else {
                        failed.push({
                            documentId: doc.id,
                            reason: matches.length === 0 
                                ? 'No matches found' 
                                : 'Low confidence match',
                            possibleMatches: matches.slice(0, 3)
                        });
                    }

                    options.onProgress?.(0.1 + (0.9 * (i + 1) / documents.length));

                } catch (error) {
                    failed.push({
                        documentId: doc.id,
                        reason: `Processing error: ${error.message}`,
                        possibleMatches: []
                    });
                }
            }

            return {
                successful,
                failed,
                summary: {
                    total: documents.length,
                    assigned: successful.length,
                    failed: failed.length,
                    confidence: this.calculateAverageConfidence(successful)
                }
            };

        } catch (error) {
            throw new Error(`Batch assignment failed: ${error.message}`);
        }
    }

    private calculateAverageConfidence(assignments: Assignment[]): number {
        if (assignments.length === 0) return 0;
        return assignments.reduce((sum, a) => sum + a.confidence, 0) / assignments.length;
    }
} 