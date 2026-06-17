import Link from "next/link";
import { ArrowUpRight, FileText, MessagesSquare, Target, Workflow, Plus, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";
import { getOrCreateUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: "Dashboard" };

const typeColors: Record<string, string> = {
  resume: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  interview: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  job: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
};

export default async function DashboardPage() {
  let user: Awaited<ReturnType<typeof getOrCreateUser>>;
  try {
    user = await getOrCreateUser();
  } catch (error) {
    console.error('[Dashboard] getOrCreateUser error:', error);
    return (
      <div className="p-8 text-white">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Loading your data…</p>
      </div>
    );
  }
  if (!user) redirect('/sign-in');

  let resumeSessions: Awaited<ReturnType<typeof prisma.resumeSession.findMany>>,
    interviewSessions: Awaited<ReturnType<typeof prisma.interviewSession.findMany>>,
    jobs: Awaited<ReturnType<typeof prisma.job.findMany>>;
  try {
    [resumeSessions, interviewSessions, jobs] = await Promise.all([
      prisma.resumeSession.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.interviewSession.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.job.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
  } catch (error) {
    console.error('[Dashboard] Prisma query error:', error);
    return (
      <div className="p-8 text-white">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Loading your data…</p>
      </div>
    );
  }

  const avgATS =
    resumeSessions.length > 0
      ? Math.round(
          resumeSessions
            .filter((s) => s.atsScoreAfter !== null)
            .reduce((sum, s) => sum + (s.atsScoreAfter ?? 0), 0) /
            (resumeSessions.filter((s) => s.atsScoreAfter !== null).length || 1)
        )
      : 0;

  const questionsPracticed = interviewSessions.reduce((sum, s) => {
    const qs = (s.questions as any[]) || [];
    return sum + qs.filter((q: any) => q.userAnswer).length;
  }, 0);

  const stats = [
    { label: "Total Applications", value: jobs.length.toString(), icon: Workflow, trend: "Active tracker", color: "text-blue-500" },
    { label: "Resumes Tailored", value: resumeSessions.length.toString(), icon: FileText, trend: `${avgATS} avg ATS`, color: "text-violet-500" },
    { label: "Questions Practiced", value: questionsPracticed.toString(), icon: MessagesSquare, trend: "Across sessions", color: "text-teal-500" },
    { label: "Avg ATS Score", value: `${avgATS}%`, icon: Target, trend: "After tailoring", color: "text-emerald-500" },
  ];

  const recentActivity = [
    ...resumeSessions.map((s) => ({
      type: 'resume' as const,
      label: `Tailored resume: ${s.title}`,
      time: s.createdAt.toLocaleDateString(),
      date: s.createdAt,
      id: s.id,
    })),
    ...interviewSessions.map((s) => ({
      type: 'interview' as const,
      label: `Interview prep: ${s.jobTitle}`,
      time: s.createdAt.toLocaleDateString(),
      date: s.createdAt,
      id: s.id,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  const pipeline = [
    { label: "Saved", count: jobs.filter(j => j.status === 'SAVED').length, color: "bg-slate-500" },
    { label: "Applied", count: jobs.filter(j => j.status === 'APPLIED').length, color: "bg-blue-500" },
    { label: "Interviewing", count: jobs.filter(j => j.status === 'INTERVIEWING').length, color: "bg-violet-500" },
    { label: "Offered", count: jobs.filter(j => j.status === 'OFFERED').length, color: "bg-emerald-500" },
    { label: "Rejected", count: jobs.filter(j => j.status === 'REJECTED').length, color: "bg-rose-500" },
  ];

  const totalPipelineJobs = jobs.length || 1;

  return (
    <div className="space-y-8 animate-in-up">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Good morning 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here&apos;s your career progress at a glance.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link href="/resume/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Tailor Resume
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/interview/new">
              <MessagesSquare className="mr-1.5 h-3.5 w-3.5" />
              Interview Prep
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="card-hover">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">{stat.label}</CardTitle>
                <div className={`rounded-md p-1.5 bg-accent`}>
                  <Icon className={`h-3.5 w-3.5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                <p className="mt-1.5 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" />
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Content row */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Activity */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <Link href="/jobs" className="flex items-center gap-1 text-xs text-primary hover:underline">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No recent activity found.</p>
            ) : (
              recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors">
                  <Badge className={`mt-0.5 shrink-0 text-[10px] ${typeColors[item.type]}`} variant="secondary">
                    {item.type}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Job Pipeline */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Job Pipeline</CardTitle>
            <Link href="/jobs" className="flex items-center gap-1 text-xs text-primary hover:underline">
              Manage <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {pipeline.map((stage) => (
              <div key={stage.label} className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${stage.color}`} />
                <div className="flex flex-1 items-center justify-between">
                  <span className="text-sm">{stage.label}</span>
                  <span className="text-sm font-semibold">{stage.count}</span>
                </div>
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${stage.color}`}
                    style={{ width: `${(stage.count / totalPipelineJobs) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-border/50">
              <Button asChild variant="outline" size="sm" className="w-full text-xs">
                <Link href="/jobs">
                  <Plus className="mr-1.5 h-3 w-3" />
                  Add Job Application
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/resume/new" className="group block">
          <Card className="card-hover border-primary/20 bg-gradient-to-br from-violet-500/5 to-purple-500/5">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-primary shadow-md">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Tailor Your Resume</h3>
                <p className="text-sm text-muted-foreground">Upload + paste JD → AI rewrites for ATS</p>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/interview/new" className="group block">
          <Card className="card-hover border-primary/20 bg-gradient-to-br from-teal-500/5 to-cyan-500/5">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-md">
                <MessagesSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Interview Prep</h3>
                <p className="text-sm text-muted-foreground">AI generates topics, questions & model answers</p>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </section>
    </div>
  );
}
