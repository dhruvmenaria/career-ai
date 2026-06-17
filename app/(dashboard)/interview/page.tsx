import Link from "next/link";
import { Plus, MessagesSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";
import { getOrCreateUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: "Interview Prep" };

function readinessColor(score: number) {
  if (score >= 70) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 40) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

export default async function InterviewListPage() {
  const user = await getOrCreateUser();
  if (!user) redirect('/sign-in');

  const sessions = await prisma.interviewSession.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { job: { select: { title: true, company: true } } },
  });

  return (
    <div className="space-y-6 animate-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interview Prep</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your saved prep sessions and practice progress.</p>
        </div>
        <Button asChild>
          <Link href="/interview/new">
            <Plus className="mr-1.5 h-4 w-4" />
            New Prep Session
          </Link>
        </Button>
      </div>

      {sessions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <MessagesSquare className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">No prep sessions yet</p>
              <p className="text-sm text-muted-foreground">Generate topics and questions for your next interview.</p>
            </div>
            <Button asChild>
              <Link href="/interview/new">Get Started</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => {
            const qs = (session.questions as any[]) || [];
            const questionsAnswered = qs.filter((q: any) => q.userAnswer).length;
            const totalQuestions = qs.length || 20;

            // Extract seniority if stored, otherwise use empty
            const seniority = 'Role'; 

            return (
              <Link key={session.id} href={`/interview/${session.id}`} className="group block">
                <Card className="card-hover h-full">
                  <CardContent className="flex flex-col gap-4 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <MessagesSquare className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="secondary" className="capitalize text-[10px]">{seniority}</Badge>
                    </div>
                    <div>
                      <p className="font-semibold leading-snug group-hover:text-primary transition-colors">
                        {session.jobTitle}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {questionsAnswered}/{totalQuestions} questions practiced
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {session.createdAt.toLocaleDateString()}
                      </div>
                      <span className={`text-sm font-bold ${readinessColor(session.readiness)}`}>
                        {session.readiness}%
                      </span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${session.readiness}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {/* Add new */}
          <Link href="/interview/new" className="group block">
            <Card className="card-hover h-full border-dashed hover:border-primary/50">
              <CardContent className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                  <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  New Prep Session
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}
    </div>
  );
}
