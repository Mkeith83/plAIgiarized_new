import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Logger } from '@/lib/services/logger';

const logger = new Logger();

export async function POST(request: Request) {
  try {
    const { email, password, role, name } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role
        }
      }
    });

    if (authError) {
      logger.error('Signup error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authData.user!.id,
        email,
        name,
        role,
        permissions: getDefaultPermissions(role)
      });

    if (profileError) {
      logger.error('Profile creation error:', profileError);
      // Attempt to clean up auth user
      await supabase.auth.admin.deleteUser(authData.user!.id);
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'User created successfully',
      userId: authData.user!.id
    });

  } catch (error) {
    logger.error('Unexpected error during signup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getDefaultPermissions(role: string) {
  switch (role) {
    case 'teacher':
      return ['view_dashboard', 'manage_students', 'view_reports', 'manage_assignments'];
    case 'student':
      return ['view_dashboard', 'submit_assignments', 'view_feedback'];
    default:
      return ['view_dashboard'];
  }
} 