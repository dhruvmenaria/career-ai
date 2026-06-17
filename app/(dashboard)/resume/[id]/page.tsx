import Link from "next/link";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";
import { getOrCreateUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { ATSScoreCard } from "@/components/resume/ATSScoreCard";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { ResumeDiff } from "@/components/resume/ResumeDiff";

export const metadata: Metadata = { title: "Resume Session" };

export default async function ResumeSessionPage({ params }: { params: { id: string } }) {
  const user = await getOrCreateUser();
  if (!user) redirect('/sign-in');

  const session = await prisma.resumeSession.findFirst({
    where: { id: params.id, userId: user.id },
    include: { job: true },
  });

  if (!session) notFound();

  // If there's no tailored resume data yet, show the placeholder
  if (!session.tailoredResume) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 animate-in-up">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/resume">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to Vault
            </Link>
          </Button>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{session.title}</h1>
            <p className="text-sm text-muted-foreground">ID: {session.id}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 h-3.5 w-3.5" /> DOCX
            </Button>
            <Button size="sm">
              <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
            </Button>
          </div>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <FileText className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              This session was created but no tailored resume was saved.
            </p>
            <Button asChild variant="outline">
              <Link href="/resume/new">Create New Session</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tailoredResume = typeof session.tailoredResume === 'string' ? JSON.parse(session.tailoredResume) : session.tailoredResume;

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in-up">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/resume">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Vault
          </Link>
        </Button>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{session.title}</h1>
          <p className="text-sm text-muted-foreground">
            Created on {session.createdAt.toLocaleDateString()}
            {session.job?.company ? ` • ${session.job.company}` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-1.5 h-3.5 w-3.5" /> DOCX
          </Button>
          <Button size="sm">
            <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
          </Button>
        </div>
      </div>
      
      <ATSScoreCard
        scoreBefore={session.atsScoreBefore ?? 0}
        scoreAfter={session.atsScoreAfter ?? 0}
        keywordMatches={session.keywordMatches as any}
      />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Side-by-Side Comparison
        </h2>
        <ResumeDiff originalText={session.originalResume} tailoredResume={tailoredResume} />
      </div>

      <ResumePreview resume={tailoredResume} />
    </div>
  );
}
