import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if needed
  const { data: { session }, error } = await supabase.auth.getSession();

  // Protected routes pattern
  const protectedRoutes = [
    '/dashboard',
    '/analysis',
    '/settings',
  ];

  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Role-based access control
  if (session) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    const teacherRoutes = ['/dashboard/teacher', '/analysis/class'];
    const studentRoutes = ['/dashboard/student', '/submissions'];

    const isTeacherRoute = teacherRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    );
    const isStudentRoute = studentRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    );

    if (isTeacherRoute && profile?.role !== 'teacher') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if (isStudentRoute && profile?.role !== 'student') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/analysis/:path*',
    '/settings/:path*',
    '/auth/:path*'
  ],
};
