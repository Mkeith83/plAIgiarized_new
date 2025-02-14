// Teacher Dashboard Page
'use client';

import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { TeacherDashboard } from '@/app/components/dashboard/TeacherDashboard';

export default async function DashboardPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <main>
      <TeacherDashboard teacherId={session.user.id} />
    </main>
  );
}
