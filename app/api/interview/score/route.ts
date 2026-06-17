import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import { callAI, safeParseJSON } from '@/lib/ai/client';
import { ANSWER_SCORE_PROMPT } from '@/lib/ai/prompts';
import type { AnswerScoreResult, InterviewQuestion } from '@/types/interview';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { sessionId, questionId, question, modelAnswer, userAnswer } = body as {
      sessionId: string;
      questionId: string;
      question: string;
      modelAnswer?: string;
      userAnswer: string;
    };

    if (!sessionId || !questionId || !question || !userAnswer) {
      return NextResponse.json(
        { error: 'sessionId, questionId, question, userAnswer are required.' },
        { status: 400 }
      );
    }

    // Score the answer with AI
    const raw = await callAI(ANSWER_SCORE_PROMPT(question, modelAnswer ?? '', userAnswer));
    const result = safeParseJSON<AnswerScoreResult>(raw);

    // Fetch session and verify ownership
    const session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId: user.id },
    });
    if (!session) {
      return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
    }

    // Persist the user's answer and score on the matching question
    const questions = session.questions as InterviewQuestion[];
    const updatedQuestions = questions.map((q) =>
      q.id === questionId ? { ...q, userAnswer, score: result.score } : q
    );

    // Recalculate readiness = average score across all answered questions
    const answered = updatedQuestions.filter((q) => q.score !== undefined);
    const readiness =
      answered.length > 0
        ? Math.round(answered.reduce((sum, q) => sum + (q.score ?? 0), 0) / answered.length)
        : 0;

    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { questions: updatedQuestions, readiness },
    });

    return NextResponse.json({ ...result, readiness });
  } catch (err) {
    console.error('[/api/interview/score]', err);
    return NextResponse.json(
      { error: 'Failed to score answer. Please try again.' },
      { status: 502 }
    );
  }
}
