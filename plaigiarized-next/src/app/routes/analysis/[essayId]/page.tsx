import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { EssayAnalysis } from '@/app/components/analysis/EssayAnalysis';

interface Props {
  params: {
    essayId: string;
  };
}

export default async function AnalysisPage({ params }: Props) {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <main>
      <EssayAnalysis essayId={params.essayId} />
    </main>
  );
}
