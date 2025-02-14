import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { text } = await request.json()
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Store the submission
    const submission = await prisma.submission.create({
      data: {
        text,
        userId: 'anonymous' // We'll add auth later
      }
    })

    // Mock analysis for now
    const analysis = {
      complexity: Math.random(),
      consistency: Math.random(),
      originality: Math.random(),
      style: {
        sentenceVariety: Math.random(),
        toneConsistency: Math.random()
      },
      syntax: {
        grammarScore: Math.random(),
        structureScore: Math.random()
      },
      vocabulary: {
        uniqueWords: text.split(' ').length,
        sophisticationScore: Math.random()
      }
    }

    // Store the results
    const result = await prisma.analysisResult.create({
      data: {
        submissionId: submission.id,
        complexityScore: analysis.complexity,
        consistencyScore: analysis.consistency,
        originalityScore: analysis.originality,
        styleMetrics: analysis.style,
        syntaxMetrics: analysis.syntax,
        vocabularyMetrics: analysis.vocabulary,
        ai_score: (analysis.consistency + analysis.originality) / 2,
        document_id: submission.id
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 