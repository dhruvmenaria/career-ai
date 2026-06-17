import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/user';
import { callAI, safeParseJSON } from '@/lib/ai/client';
import { RESUME_PARSE_PROMPT } from '@/lib/ai/prompts';
import { parsePDF } from '@/lib/parsers/pdf-parser';
import { parseDOCX } from '@/lib/parsers/docx-parser';
import type { ResumeJSON } from '@/types/resume';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const contentType = req.headers.get('content-type') ?? '';
    let rawText = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 413 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'pdf') {
        rawText = await parsePDF(buffer);
      } else if (ext === 'docx') {
        rawText = await parseDOCX(buffer);
      } else if (ext === 'txt') {
        rawText = buffer.toString('utf8');
      } else {
        return NextResponse.json(
          { error: 'Unsupported format. Use PDF, DOCX, or TXT.' },
          { status: 415 }
        );
      }
    } else {
      const body = await req.json();
      rawText = body.text ?? '';
    }

    if (!rawText.trim()) {
      return NextResponse.json({ error: 'Could not extract text from file.' }, { status: 400 });
    }

    const aiResponse = await callAI(RESUME_PARSE_PROMPT(rawText));
    const parsedResume = safeParseJSON<ResumeJSON>(aiResponse);

    return NextResponse.json({ parsedResume, rawText });
  } catch (err) {
    console.error('[/api/resume/parse]', err);
    return NextResponse.json({ error: 'Failed to parse resume. Please try again.' }, { status: 500 });
  }
}
