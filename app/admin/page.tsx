import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export default async function AdminPage() {
  await requireAdmin();

  const [
    totalUsers,
    totalResumes,
    totalInterviews,
    totalJobs,
    proUsers,
    recentUsers,
    topUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.resumeSession.count(),
    prisma.interviewSession.count(),
    prisma.job.count(),
    prisma.user.count({ where: { subStatus: 'active' } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        _count: {
          select: {
            resumeSessions: true,
            interviewSessions: true,
            jobs: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      orderBy: { resumeSessions: { _count: 'desc' } },
      take: 5,
      include: {
        _count: {
          select: { resumeSessions: true, interviewSessions: true },
        },
      },
    }),
  ]);

  const freeUsers = totalUsers - proUsers;

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">CareerAI platform overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: totalUsers, color: 'text-violet-400' },
          { label: 'Resumes Tailored', value: totalResumes, color: 'text-green-400' },
          { label: 'Interview Preps', value: totalInterviews, color: 'text-blue-400' },
          { label: 'Jobs Tracked', value: totalJobs, color: 'text-amber-400' },
          { label: 'Pro Users', value: proUsers, color: 'text-emerald-400' },
          { label: 'Free Users', value: freeUsers, color: 'text-slate-400' },
          {
            label: 'Avg Resumes/User',
            value: totalUsers > 0 ? (totalResumes / totalUsers).toFixed(1) : 0,
            color: 'text-pink-400',
          },
          {
            label: 'Avg Interviews/User',
            value: totalUsers > 0 ? (totalInterviews / totalUsers).toFixed(1) : 0,
            color: 'text-cyan-400',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-white">All Users</h2>
          <p className="text-sm text-muted-foreground">Most recent signups first</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 text-muted-foreground font-medium">User</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Plan</th>
                <th className="text-center p-3 text-muted-foreground font-medium">Resumes</th>
                <th className="text-center p-3 text-muted-foreground font-medium">Interviews</th>
                <th className="text-center p-3 text-muted-foreground font-medium">Jobs</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                >
                  <td className="p-3">
                    <p className="text-white font-medium">{user.name || 'No name'}</p>
                    <p className="text-muted-foreground text-xs">{user.email}</p>
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        user.subStatus === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}
                    >
                      {user.subStatus === 'active' ? 'Pro' : 'Free'}
                    </span>
                  </td>
                  <td className="p-3 text-center text-white">{user._count.resumeSessions}</td>
                  <td className="p-3 text-center text-white">{user._count.interviewSessions}</td>
                  <td className="p-3 text-center text-white">{user._count.jobs}</td>
                  <td className="p-3 text-muted-foreground text-xs">
                    {new Date(user.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
              {recentUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No users yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Back link */}
      <div className="mt-6">
        <a
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-white transition-colors"
        >
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}
