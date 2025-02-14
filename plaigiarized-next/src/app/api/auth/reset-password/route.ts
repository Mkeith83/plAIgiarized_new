import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Logger } from '@/lib/services/logger';

const logger = new Logger();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/confirm`,
    });

    if (error) {
      logger.error('Password reset error:', error);
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Password reset email sent successfully'
    });

  } catch (error) {
    logger.error('Unexpected error during password reset:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { password } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) {
      logger.error('Password update error:', error);
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Password updated successfully'
    });

  } catch (error) {
    logger.error('Unexpected error during password update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 