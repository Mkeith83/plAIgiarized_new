// Student Dashboard Page
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { StudentDashboard } from '@/lib/interfaces/dashboard/studentInterface';
import { StudentDashboardManager } from '@/lib/dashboard/student';
import { MetricsDisplay } from '@/app/components/dashboard/MetricsDisplay';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { StudentDashboard as StudentDashboardComponent } from '@/components/dashboard/StudentDashboard';

interface Props {
  params: {
    studentId: string;
  };
}

export default async function StudentDashboardPage({ params }: Props) {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <main>
      <StudentDashboardComponent studentId={params.studentId} />
    </main>
  );
}
