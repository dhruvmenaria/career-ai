import { NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import { getUserPlan, PLANS, hasStripeConfig } from '@/lib/stripe';
import { checkResumeLimit, checkInterviewLimit } from '@/lib/usage';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await getOrCreateUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    const plan = getUserPlan(dbUser?.subStatus);

    const [resumeUsage, interviewUsage] = await Promise.all([
      checkResumeLimit(user.id),
      checkInterviewLimit(user.id),
    ]);

    return NextResponse.json({
      plan,
      subStatus: dbUser?.subStatus ?? 'free',
      subCurrentPeriodEnd: dbUser?.subCurrentPeriodEnd ?? null,
      billingConfigured: hasStripeConfig(),
      usage: {
        resumes: resumeUsage,
        interviews: interviewUsage,
      },
    });
  } catch (err) {
    console.error('[/api/billing/status]', err);
    return NextResponse.json({ error: 'Failed to fetch billing status.' }, { status: 500 });
  }
}
