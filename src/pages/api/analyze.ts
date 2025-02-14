import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface AnalysisMetrics {
  complexity: number
  consistency: number
  originality: number
  style: any
  syntax: any
  vocabulary: any
}

async function analyzeText(text: string): Promise<AnalysisMetrics> {
  // Basic analysis logic - replace with your actual analysis
  return {
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
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { text } = req.body
    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }

    // Analyze the text
    const analysis = await analyzeText(text)

    // Store the submission
    const submission = await prisma.submission.create({
      data: {
        text,
        userId: req.body.userId || 'anonymous'
      }
    })

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

    return res.status(200).json(result)
  } catch (error) {
    console.error('Analysis error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 