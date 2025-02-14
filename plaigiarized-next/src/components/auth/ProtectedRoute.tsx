'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { hasRequiredRole } from '@/lib/utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
}

export function ProtectedRoute({
  children,
  requiredRoles = [],
  requiredPermissions = []
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && requiredRoles.length > 0) {
      const hasRole = hasRequiredRole(user.role, requiredRoles);
      if (!hasRole) {
        router.push('/dashboard');
        return;
      }
    }

    if (user && requiredPermissions.length > 0) {
      const hasPermissions = requiredPermissions.every(permission =>
        user.permissions?.includes(permission)
      );
      if (!hasPermissions) {
        router.push('/dashboard');
        return;
      }
    }
  }, [user, isLoading, router, requiredRoles, requiredPermissions]);

  if (isLoading) {
    return null; // or loading spinner
  }

  return <>{children}</>;
} 