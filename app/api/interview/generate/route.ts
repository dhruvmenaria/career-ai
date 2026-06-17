import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import { callAI, safeParseJSON } from '@/lib/ai/client';
import { INTERVIEW_GEN_PROMPT } from '@/lib/ai/prompts';
import { checkInterviewLimit } from '@/lib/usage';
import { checkRateLimit } from '@/lib/ratelimit';
import type { InterviewGenerateResult } from '@/types/interview';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Rate limit — 10 AI requests per minute per user
    const rateLimitOk = checkRateLimit(user.id, 10, 60000);
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    // Usage gate — checked server-side, never trust client
    const { allowed, used, limit } = await checkInterviewLimit(user.id);
    if (!allowed) {
      return NextResponse.json(
        {
          error: `Monthly limit reached (${used}/${limit} interview preps). Upgrade to Pro for unlimited access.`,
        },
        { status: 402 }
      );
    }

    const body = await req.json();
    const { jobTitle, jobDescription, seniority, jobId } = body as {
      jobTitle: string;
      jobDescription: string;
      seniority?: string;
      jobId?: string;
    };

    if (!jobTitle || !jobDescription) {
      return NextResponse.json(
        { error: 'jobTitle and jobDescription are required.' },
        { status: 400 }
      );
    }

    // Input size limits
    if (jobDescription.length > 10000) {
      return NextResponse.json({ error: 'Job description too long. Max 10,000 characters.' }, { status: 400 });
    }
    if (jobTitle.length > 200) {
      return NextResponse.json({ error: 'Job title too long.' }, { status: 400 });
    }

    const raw = await callAI(
      INTERVIEW_GEN_PROMPT(jobTitle, seniority ?? 'mid', jobDescription),
      6000
    );
    const result = safeParseJSON<InterviewGenerateResult>(raw);

    const session = await prisma.interviewSession.create({
      data: {
        userId: user.id,
        jobId: jobId ?? null,
        jobTitle,
        jobDesc: jobDescription,
        topics: result.topics,
        questions: result.questions,
        readiness: 0,
      },
    });

    return NextResponse.json({ ...result, sessionId: session.id });
  } catch (err) {
    console.error('[/api/interview/generate]', err);
    return NextResponse.json(
      { error: 'Failed to generate interview prep. Please try again.' },
      { status: 502 }
    );
  }
}
