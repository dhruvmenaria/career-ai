import { getOrCreateUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from "next";
import { InterviewSessionClient } from '@/components/interview/InterviewSessionClient';
import type { InterviewGenerateResult } from '@/types/interview';

export const metadata: Metadata = { title: "Interview Session" };

export default async function InterviewSessionDetailPage({ params }: { params: { id: string } }) {
  const user = await getOrCreateUser();
  if (!user) redirect('/sign-in');

  const session = await prisma.interviewSession.findFirst({
    where: { id: params.id, userId: user.id },
    include: { job: true },
  });

  if (!session) notFound();

  const sessionData: InterviewGenerateResult & { id: string } = {
    id: session.id,
    topics: session.topics as any,
    questions: session.questions as any,
  };

  return (
    <InterviewSessionClient 
      session={sessionData} 
      jobTitle={session.jobTitle} 
      seniority={"Role"} 
      readiness={session.readiness} 
    />
  );
}
