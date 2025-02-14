'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StudentMatcher } from '@/lib/services/studentMatcher';
import { useStudents } from '@/app/hooks/useStudents';

interface BatchDocument {
    id: string;
    text: string;
    confidence: number;
    predictedStudent?: {
        id: string;
        name: string;
        confidence: number;
    };
    assignedStudent?: {
        id: string;
        name: string;
    };
    status: 'unassigned' | 'predicted' | 'assigned' | 'error';
}

interface Student {
    id: string;
    name: string;
    baselineText?: string;
}

export default function BatchAssignment() {
    const router = useRouter();
    const { students, isLoading: loadingStudents } = useStudents();
    const [documents, setDocuments] = useState<BatchDocument[]>([]);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadBatchDocuments();
    }, []);

    const loadBatchDocuments = async () => {
        try {
            // Load documents from session storage or API
            const storedDocs = sessionStorage.getItem('batchDocuments');
            if (storedDocs) {
                setDocuments(JSON.parse(storedDocs));
                await predictStudents(JSON.parse(storedDocs));
            }
        } catch (err) {
            setError('Failed to load documents');
            console.error('Load error:', err);
        }
    };

    const predictStudents = async (docs: BatchDocument[]) => {
        setProcessing(true);
        try {
            const matcher = new StudentMatcher();
            
            const updatedDocs = await Promise.all(docs.map(async (doc) => {
                if (doc.status !== 'unassigned') return doc;

                try {
                    const prediction = await matcher.findMatch(doc.text, students);
                    return {
                        ...doc,
                        predictedStudent: prediction,
                        status: 'predicted'
                    };
                } catch (err) {
                    return {
                        ...doc,
                        status: 'error'
                    };
                }
            }));

            setDocuments(updatedDocs);
            sessionStorage.setItem('batchDocuments', JSON.stringify(updatedDocs));

        } catch (err) {
            setError('Failed to predict student assignments');
            console.error('Prediction error:', err);
        } finally {
            setProcessing(false);
        }
    };

    const handleAssignment = async (docId: string, studentId: string) => {
        setDocuments(docs => docs.map(doc => {
            if (doc.id !== docId) return doc;

            const student = students?.find(s => s.id === studentId);
            return {
                ...doc,
                assignedStudent: student ? {
                    id: student.id,
                    name: student.name
                } : undefined,
                status: 'assigned'
            };
        }));
    };

    const handleConfirmAll = async () => {
        try {
            const assignments = documents
                .filter(doc => doc.status === 'assigned')
                .map(doc => ({
                    documentId: doc.id,
                    studentId: doc.assignedStudent!.id,
                    text: doc.text
                }));

            // Submit assignments to backend
            await submitAssignments(assignments);
            
            // Clear session storage and redirect
            sessionStorage.removeItem('batchDocuments');
            router.push('/mobile/batch-complete');

        } catch (err) {
            setError('Failed to submit assignments');
            console.error('Submit error:', err);
        }
    };

    const submitAssignments = async (assignments: any[]) => {
        // Implementation for submitting assignments
    };

    if (loadingStudents) {
        return <div>Loading students...</div>;
    }

    return (
        <div className="p-4">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-xl font-semibold mb-4">Assign Documents</h2>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Document List */}
                <div className="space-y-4">
                    {documents.map((doc) => (
                        <div 
                            key={doc.id} 
                            className="bg-white rounded-lg shadow p-4"
                        >
                            {/* Preview */}
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 line-clamp-2">
                                    {doc.text}
                                </p>
                            </div>

                            {/* Student Selection */}
                            <div className="flex items-center gap-4">
                                <select
                                    className="flex-1 border rounded-lg p-2"
                                    value={doc.assignedStudent?.id || ''}
                                    onChange={(e) => handleAssignment(doc.id, e.target.value)}
                                >
                                    <option value="">Select Student</option>
                                    {students?.map((student) => (
                                        <option 
                                            key={student.id} 
                                            value={student.id}
                                            className={
                                                doc.predictedStudent?.id === student.id 
                                                ? 'font-semibold' 
                                                : ''
                                            }
                                        >
                                            {student.name}
                                            {doc.predictedStudent?.id === student.id 
                                                ? ` (${(doc.predictedStudent.confidence * 100).toFixed(1)}% match)`
                                                : ''
                                            }
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-4">
                    <button
                        onClick={handleConfirmAll}
                        disabled={processing || documents.some(d => d.status !== 'assigned')}
                        className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                    >
                        Confirm All Assignments
                    </button>
                </div>
            </div>
        </div>
    );
} 