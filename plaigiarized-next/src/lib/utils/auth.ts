import { SupabaseClient } from '@supabase/supabase-js';

export async function checkPermissions(
  userId: string,
  requiredPermissions: string[],
  supabase: SupabaseClient
): Promise<boolean> {
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('permissions')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      return false;
    }

    return requiredPermissions.every(permission =>
      profile.permissions.includes(permission)
    );
  } catch {
    return false;
  }
}

export function hasRequiredRole(
  userRole: string | undefined,
  requiredRoles: string[]
): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

export function getRedirectPath(role: string): string {
  switch (role) {
    case 'teacher':
      return '/dashboard/teacher';
    case 'student':
      return '/dashboard/student';
    default:
      return '/dashboard';
  }
}

export function sanitizeRedirectTo(redirectTo: string | null): string {
  if (!redirectTo) return '/dashboard';

  // Ensure redirectTo is internal
  const allowedPaths = ['/dashboard', '/analysis', '/settings'];
  return allowedPaths.some(path => redirectTo.startsWith(path))
    ? redirectTo
    : '/dashboard';
} 