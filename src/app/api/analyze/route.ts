import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    // Mock analysis for development
    const mockAnalysis = {
      score: Math.floor(Math.random() * 100),
      confidence: Math.floor(Math.random() * 30) + 70,
      textStats: {
        wordCount: text.trim().split(/\s+/).length,
        charCount: text.length,
        sentenceCount: text.split(/[.!?]+/).filter(Boolean).length,
        paragraphCount: text.split(/\n\s*\n/).filter(Boolean).length,
      }
    };

    // Add a small delay to simulate API processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json(mockAnalysis);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze text' },
      { status: 500 }
    );
  }
} 