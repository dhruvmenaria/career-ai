import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CreateJobSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  description: z.string().default(''),
  status: z.enum(['SAVED', 'APPLIED', 'INTERVIEWING', 'OFFERED', 'REJECTED']).default('SAVED'),
});

export async function GET() {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const jobs = await prisma.job.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ jobs });
}

export async function POST(req: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = CreateJobSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const job = await prisma.job.create({
    data: { ...parsed.data, userId: user.id },
  });

  return NextResponse.json({ job }, { status: 201 });
}
