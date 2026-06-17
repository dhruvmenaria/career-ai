import { prisma } from './prisma';
import { PLANS, getUserPlan } from './stripe';
import { startOfMonth } from 'date-fns';

export async function checkResumeLimit(
  userId: string
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const plan = getUserPlan(user?.subStatus);
  const limit = PLANS[plan].resumeLimit;

  const used = await prisma.resumeSession.count({
    where: {
      userId,
      createdAt: { gte: startOfMonth(new Date()) },
    },
  });

  return { allowed: limit === Infinity || used < limit, used, limit };
}

export async function checkInterviewLimit(
  userId: string
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const plan = getUserPlan(user?.subStatus);
  const limit = PLANS[plan].interviewLimit;

  const used = await prisma.interviewSession.count({
    where: {
      userId,
      createdAt: { gte: startOfMonth(new Date()) },
    },
  });

  return { allowed: limit === Infinity || used < limit, used, limit };
}
