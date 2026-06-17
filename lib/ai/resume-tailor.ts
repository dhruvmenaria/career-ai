import { callClaude } from "@/lib/ai/claude";
import { parseJSONWithRetry } from "@/lib/ai/json";
import { clampScore } from "@/lib/utils";
import type { JDAnalysis, ResumeJSON, TailoredResumeResult } from "@/types/resume";

export const RESUME_PARSE_PROMPT = `
You are a resume parser. Extract the following from the resume text and return ONLY valid JSON - no markdown, no explanation.

Return this exact structure:
{
  "name": string,
  "email": string,
  "phone": string,
  "location": string,
  "summary": string,
  "experience": [{ "title": string, "company": string, "duration": string, "bullets": string[] }],
  "education": [{ "degree": string, "institution": string, "year": string }],
  "skills": string[],
  "certifications": string[]
}

Resume text:
{RESUME_TEXT}
`;

export const JD_ANALYSIS_PROMPT = `
Analyse this job description and return ONLY valid JSON - no markdown, no explanation.

Return this exact structure:
{
  "jobTitle": string,
  "requiredSkills": string[],
  "preferredSkills": string[],
  "keyResponsibilities": string[],
  "tone": "formal" | "startup" | "technical",
  "seniorityLevel": "junior" | "mid" | "senior" | "lead",
  "importantKeywords": string[]
}

Job description:
{JD_TEXT}
`;

export const RESUME_TAILOR_PROMPT = `
You are an expert resume writer and career coach. Your job is to tailor the candidate's resume to match the job description perfectly for ATS systems and human recruiters.

STRICT RULES - NEVER BREAK THESE:
1. NEVER fabricate experience, skills, metrics, or achievements the candidate does not have
2. NEVER add companies, projects, or roles that are not in the original resume
3. ONLY reframe, rephrase, and reorder existing content to highlight relevance
4. If a required skill is genuinely missing, do NOT add it - leave a gap
5. Use action verbs that match the JD's tone
6. Integrate JD keywords naturally into existing bullet points where truthfully applicable
7. Prioritise and reorder bullet points to surface the most relevant experience first

TASK:
Given the structured resume JSON and JD analysis JSON below, return a FULLY REWRITTEN resume in the same JSON structure as the input resume. Also return an ATS score (0-100) and keyword analysis.

Return ONLY valid JSON with this structure:
{
  "tailoredResume": { "name": string, "email": string, "phone": string, "location": string, "summary": string, "experience": [{ "title": string, "company": string, "duration": string, "bullets": string[] }], "education": [{ "degree": string, "institution": string, "year": string }], "skills": string[], "certifications": string[] },
  "atsScoreBefore": number,
  "atsScoreAfter": number,
  "keywordMatches": { "matched": string[], "missing": string[] },
  "changesExplanation": string[]
}

Original resume JSON:
{RESUME_JSON}

JD analysis JSON:
{JD_JSON}
`;

export async function parseResumeWithAI(resumeText: string) {
  return parseJSONWithRetry<ResumeJSON>(() =>
    callClaude(RESUME_PARSE_PROMPT.replace("{RESUME_TEXT}", resumeText))
  );
}

export async function analyseJDWithAI(jobDescription: string) {
  return parseJSONWithRetry<JDAnalysis>(() =>
    callClaude(JD_ANALYSIS_PROMPT.replace("{JD_TEXT}", jobDescription))
  );
}

export async function tailorResumeWithAI(resume: ResumeJSON, jd: JDAnalysis) {
  const prompt = RESUME_TAILOR_PROMPT
    .replace("{RESUME_JSON}", JSON.stringify(resume, null, 2))
    .replace("{JD_JSON}", JSON.stringify(jd, null, 2));
  return parseJSONWithRetry<TailoredResumeResult>(() => callClaude(prompt, 6000));
}

export function createFallbackResumeResult(resumeText: string, jobDescription: string): TailoredResumeResult {
  const keywords = Array.from(
    new Set(
      jobDescription
        .toLowerCase()
        .match(/[a-z][a-z+#.-]{2,}/g)
        ?.filter((word) => !["and", "the", "with", "for", "you", "our", "will", "are"].includes(word))
        .slice(0, 18) ?? []
    )
  );
  const resumeLower = resumeText.toLowerCase();
  const matched = keywords.filter((keyword) => resumeLower.includes(keyword));
  const missing = keywords.filter((keyword) => !resumeLower.includes(keyword));
  const before = clampScore(45 + matched.length * 3);
  const after = clampScore(before + Math.min(22, missing.length * 2 + 8));

  return {
    tailoredResume: {
      name: "Candidate",
      email: "",
      phone: "",
      location: "",
      summary: "Tailored summary pending live AI configuration. Add ANTHROPIC_API_KEY to generate a fully rewritten resume.",
      experience: [
        {
          title: "Relevant Experience",
          company: "From uploaded resume",
          duration: "",
          bullets: resumeText
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)
            .slice(0, 6)
        }
      ],
      education: [],
      skills: matched,
      certifications: []
    },
    atsScoreBefore: before,
    atsScoreAfter: after,
    keywordMatches: { matched, missing },
    changesExplanation: [
      "Live AI tailoring is wired but requires ANTHROPIC_API_KEY.",
      "This preview highlights current keyword coverage and likely ATS gaps."
    ]
  };
}
