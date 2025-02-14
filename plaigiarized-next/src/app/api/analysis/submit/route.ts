import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Logger } from '@/lib/services/logger';
import { checkPermissions } from '@/lib/utils/auth';

const logger = new Logger();

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions
    const hasPermission = await checkPermissions(
      session.user.id,
      ['submit_assignments'],
      supabase
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { essayText, courseId } = await request.json();

    // Process submission
    const { data, error } = await supabase
      .from('submissions')
      .insert({
        user_id: session.user.id,
        course_id: courseId,
        content: essayText,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      logger.error('Submission error:', error);
      return NextResponse.json(
        { error: 'Failed to submit essay' },
        { status: 500 }
      );
    }

    // Trigger analysis
    await fetch(`${process.env.ANALYSIS_SERVICE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ANALYSIS_SERVICE_KEY}`
      },
      body: JSON.stringify({
        submissionId: data.id,
        content: essayText
      })
    });

    return NextResponse.json({
      message: 'Submission received',
      submissionId: data.id
    });

  } catch (error) {
    logger.error('Unexpected error during submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 