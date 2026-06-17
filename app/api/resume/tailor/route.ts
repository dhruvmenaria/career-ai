import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import { callAI, safeParseJSON } from '@/lib/ai/client';
import { JD_ANALYSIS_PROMPT, RESUME_PARSE_PROMPT, RESUME_TAILOR_PROMPT } from '@/lib/ai/prompts';
import { checkResumeLimit } from '@/lib/usage';
import { checkRateLimit } from '@/lib/ratelimit';
import type { TailoredResumeResult, ResumeJSON, JDAnalysis } from '@/types/resume';

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
    const { allowed, used, limit } = await checkResumeLimit(user.id);
    if (!allowed) {
      return NextResponse.json(
        {
          error: `Monthly limit reached (${used}/${limit} resumes). Upgrade to Pro for unlimited access.`,
        },
        { status: 402 }
      );
    }

    const body = await req.json();
    const { resumeText, jobDescription, jobTitle, sessionTitle, jobId } = body as {
      resumeText: string;
      jobDescription: string;
      jobTitle?: string;
      sessionTitle?: string;
      jobId?: string;
    };

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: 'resumeText and jobDescription are required.' },
        { status: 400 }
      );
    }

    // Input size limits
    if (resumeText.length > 15000) {
      return NextResponse.json({ error: 'Resume too long. Max 15,000 characters.' }, { status: 400 });
    }
    if (jobDescription.length > 10000) {
      return NextResponse.json({ error: 'Job description too long. Max 10,000 characters.' }, { status: 400 });
    }

    // Run JD analysis and resume parse in parallel
    const [jdRaw, resumeRaw] = await Promise.all([
      callAI(JD_ANALYSIS_PROMPT(jobDescription)),
      callAI(RESUME_PARSE_PROMPT(resumeText)),
    ]);

    const jdAnalysis = safeParseJSON<JDAnalysis>(jdRaw);
    const parsedResume = safeParseJSON<ResumeJSON>(resumeRaw);

    // Tailor resume against JD
    const tailorRaw = await callAI(
      RESUME_TAILOR_PROMPT(JSON.stringify(parsedResume), JSON.stringify(jdAnalysis)),
      6000
    );
    const result = safeParseJSON<TailoredResumeResult>(tailorRaw);

    // Persist session to DB
    const session = await prisma.resumeSession.create({
      data: {
        userId: user.id,
        jobId: jobId ?? null,
        title: sessionTitle ?? jobTitle ?? jdAnalysis.jobTitle ?? 'Untitled Session',
        originalResume: resumeText,
        tailoredResume: JSON.stringify(result.tailoredResume),
        atsScoreBefore: result.atsScoreBefore,
        atsScoreAfter: result.atsScoreAfter,
        keywordMatches: result.keywordMatches,
      },
    });

    return NextResponse.json({ ...result, sessionId: session.id });
  } catch (err) {
    console.error('[/api/resume/tailor]', err);
    return NextResponse.json({ error: 'AI tailoring failed. Please try again.' }, { status: 502 });
  }
}
