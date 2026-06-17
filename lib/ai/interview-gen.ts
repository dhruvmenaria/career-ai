import { callClaude } from "@/lib/ai/claude";
import { parseJSONWithRetry } from "@/lib/ai/json";
import { clampScore, makeId } from "@/lib/utils";
import type { AnswerScoreResult, InterviewGenerateResult, InterviewQuestion, PrepTopic, Seniority } from "@/types/interview";

export const INTERVIEW_GEN_PROMPT = `
You are a senior hiring manager and interview coach. Given a job title and description, generate comprehensive interview preparation material.

Return ONLY valid JSON - no markdown, no explanation.

Return this exact structure:
{
  "topics": [
    {
      "topic": string,
      "priority": "high" | "medium" | "low",
      "whyImportant": string,
      "subtopics": string[],
      "resources": [{ "title": string, "type": "article" | "video" | "docs", "url": string }]
    }
  ],
  "questions": [
    {
      "id": string,
      "question": string,
      "category": "technical" | "behavioral" | "situational" | "culture",
      "difficulty": "easy" | "medium" | "hard",
      "whyAsked": string,
      "modelAnswer": string,
      "starFramework": {
        "situation": string,
        "task": string,
        "action": string,
        "result": string
      } | null
    }
  ]
}

Rules:
- Generate exactly 8 topics (ranked by relevance)
- Generate exactly 20 questions (mix: 8 technical, 6 behavioral, 4 situational, 2 culture)
- Model answers should be 3-5 sentences, specific to this role
- STAR framework only for behavioral and situational questions
- Resources should be real, well-known URLs (MDN, official docs, YouTube channels, etc.)

Job title: {JOB_TITLE}
Seniority level: {SENIORITY}
Job description: {JD_TEXT}
`;

export const ANSWER_SCORE_PROMPT = `
You are an expert interview coach. Score the candidate's answer to this interview question.

Return ONLY valid JSON:
{
  "score": number (0-100),
  "scoreBreakdown": {
    "relevance": number (0-25),
    "structure": number (0-25),
    "specificity": number (0-25),
    "impact": number (0-25)
  },
  "feedback": string,
  "improvedAnswer": string,
  "missingElements": string[]
}

Question: {QUESTION}
Model answer for reference: {MODEL_ANSWER}
Candidate's answer: {USER_ANSWER}
`;

export async function generateInterviewPrep(jobTitle: string, seniority: Seniority, jobDescription: string) {
  const prompt = INTERVIEW_GEN_PROMPT
    .replace("{JOB_TITLE}", jobTitle)
    .replace("{SENIORITY}", seniority)
    .replace("{JD_TEXT}", jobDescription);
  return parseJSONWithRetry<InterviewGenerateResult>(() => callClaude(prompt, 8000));
}

export async function scoreInterviewAnswer(question: string, modelAnswer: string, userAnswer: string) {
  const prompt = ANSWER_SCORE_PROMPT
    .replace("{QUESTION}", question)
    .replace("{MODEL_ANSWER}", modelAnswer)
    .replace("{USER_ANSWER}", userAnswer);
  return parseJSONWithRetry<AnswerScoreResult>(() => callClaude(prompt));
}

export function createFallbackInterviewPrep(jobTitle: string, seniority: Seniority): InterviewGenerateResult {
  const topicNames = [
    "Role fundamentals",
    "System and product thinking",
    "Execution and prioritization",
    "Communication under ambiguity",
    "Technical tradeoffs",
    "Collaboration patterns",
    "Ownership stories",
    "Company-specific preparation"
  ];
  const categories: InterviewQuestion["category"][] = [
    "technical",
    "technical",
    "technical",
    "technical",
    "technical",
    "technical",
    "technical",
    "technical",
    "behavioral",
    "behavioral",
    "behavioral",
    "behavioral",
    "behavioral",
    "behavioral",
    "situational",
    "situational",
    "situational",
    "situational",
    "culture",
    "culture"
  ];

  const topics: PrepTopic[] = topicNames.map((topic, index) => ({
    topic,
    priority: index < 3 ? "high" : index < 6 ? "medium" : "low",
    whyImportant: `This helps demonstrate ${seniority} readiness for ${jobTitle}.`,
    subtopics: ["Signals interviewers look for", "Mistakes to avoid", "Evidence to prepare"],
    resources: [{ title: "Google Interview Guide", type: "article", url: "https://careers.google.com/how-we-hire/interview/" }]
  }));

  const questions = categories.map((category, index): InterviewQuestion => ({
    id: makeId("q"),
    question: `Tell me about a ${category} challenge you would expect in a ${jobTitle} role.`,
    category,
    difficulty: index % 3 === 0 ? "hard" : index % 2 === 0 ? "medium" : "easy",
    whyAsked: "Interviewers use this to test relevance, judgment, and clarity.",
    modelAnswer: "A strong answer should frame the context, name a clear decision, explain tradeoffs, and end with a measurable result or learning.",
    starFramework:
      category === "behavioral" || category === "situational"
        ? {
            situation: "Set the context briefly.",
            task: "Clarify your responsibility.",
            action: "Describe the most important actions and tradeoffs.",
            result: "Close with evidence of impact."
          }
        : null
  }));

  return { topics, questions };
}

export function createFallbackScore(userAnswer: string): AnswerScoreResult {
  const wordCount = userAnswer.trim().split(/\s+/).filter(Boolean).length;
  const relevance = clampScore(Math.min(25, Math.max(8, wordCount / 5)));
  const structure = userAnswer.match(/because|first|then|result|impact/i) ? 20 : 12;
  const specificity = userAnswer.match(/\d|%|users|revenue|latency|time|team/i) ? 21 : 11;
  const impact = userAnswer.match(/improved|reduced|increased|launched|saved|learned/i) ? 21 : 12;

  return {
    score: clampScore(relevance + structure + specificity + impact),
    scoreBreakdown: { relevance, structure, specificity, impact },
    feedback: "Live AI scoring is wired but needs ANTHROPIC_API_KEY. This heuristic score rewards structure, specificity, and impact.",
    improvedAnswer: "Use a concise STAR structure, add one concrete metric, and finish by explaining why the result mattered.",
    missingElements: ["Specific metric", "Clear result", "Role-specific detail"]
  };
}
