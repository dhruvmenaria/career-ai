import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const job = await prisma.job.findFirst({ where: { id: params.id, userId: user.id } });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.job.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json({ job: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const job = await prisma.job.findFirst({ where: { id: params.id, userId: user.id } });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.job.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
