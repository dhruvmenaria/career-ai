import Link from "next/link";
import { Plus, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";
import { getOrCreateUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: "Resume Vault" };

export default async function ResumePage() {
  const user = await getOrCreateUser();
  if (!user) redirect('/sign-in');

  const sessions = await prisma.resumeSession.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { job: { select: { title: true, company: true } } },
  });

  return (
    <div className="space-y-6 animate-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resume Vault</h1>
          <p className="mt-1 text-sm text-muted-foreground">All your AI-tailored resume versions in one place.</p>
        </div>
        <Button asChild>
          <Link href="/resume/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Tailor New Resume
          </Link>
        </Button>
      </div>

      {sessions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">No resumes tailored yet</p>
              <p className="text-sm text-muted-foreground">Upload your resume and a job description to get started.</p>
            </div>
            <Button asChild>
              <Link href="/resume/new">Get Started</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => {
            const improvement = (session.atsScoreAfter ?? 0) - (session.atsScoreBefore ?? 0);
            return (
              <Link key={session.id} href={`/resume/${session.id}`} className="group block">
                <Card className="card-hover h-full">
                  <CardContent className="flex flex-col gap-4 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        +{improvement} pts
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold leading-snug group-hover:text-primary transition-colors">
                        {session.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        ATS {session.atsScoreBefore ?? 0} → {session.atsScoreAfter ?? 0}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-auto">
                      <Clock className="h-3 w-3" />
                      {session.createdAt.toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {/* Add new card */}
          <Link href="/resume/new" className="group block">
            <Card className="card-hover h-full border-dashed hover:border-primary/50">
              <CardContent className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                  <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  Tailor New Resume
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}
    </div>
  );
}
