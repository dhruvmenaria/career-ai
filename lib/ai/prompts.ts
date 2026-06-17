export const RESUME_PARSE_PROMPT = (resumeText: string) => `
You are a resume parser. Extract structured data from the resume below and return ONLY valid JSON, no markdown, no explanation.

Return exactly this structure:
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

Resume:
${resumeText}
`;

export const JD_ANALYSIS_PROMPT = (jdText: string) => `
Analyse this job description and return ONLY valid JSON, no markdown, no explanation.

Return exactly this structure:
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
${jdText}
`;

export const RESUME_TAILOR_PROMPT = (resumeJSON: string, jdJSON: string) => `
You are an expert resume writer. Tailor the candidate's resume to match the job description for ATS and recruiters.

STRICT RULES:
1. NEVER fabricate experience, skills, or metrics
2. NEVER add roles or companies not in the original
3. ONLY reframe existing content to highlight relevance
4. If a required skill is missing, do NOT add it
5. Integrate JD keywords naturally into existing bullets where truthful
6. Reorder bullets to surface most relevant experience first

Return ONLY valid JSON, no markdown:
{
  "tailoredResume": { (same structure as input resume) },
  "atsScoreBefore": number between 0 and 100 (integer, e.g. 60),
  "atsScoreAfter": number between 0 and 100 (integer, e.g. 85),
  "keywordMatches": { "matched": string[], "missing": string[] },
  "changesExplanation": string[]
}

Original resume JSON:
${resumeJSON}

JD analysis JSON:
${jdJSON}
`;

export const INTERVIEW_GEN_PROMPT = (jobTitle: string, seniority: string, jdText: string) => `
You are a senior hiring manager. Generate interview preparation material for this role.

Return ONLY valid JSON, no markdown:
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
      "starFramework": { "situation": string, "task": string, "action": string, "result": string } | null
    }
  ]
}

Rules:
- Exactly 8 topics ranked by relevance
- Exactly 20 questions (8 technical, 6 behavioral, 4 situational, 2 culture)
- Model answers 3-5 sentences specific to this role
- STAR framework only for behavioral and situational questions
- Resources should be real well-known URLs

Job title: ${jobTitle}
Seniority: ${seniority}
Job description: ${jdText}
`;

export const ANSWER_SCORE_PROMPT = (question: string, modelAnswer: string, userAnswer: string) => `
You are an expert interview coach. Score this candidate's answer.

Return ONLY valid JSON, no markdown:
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

Question: ${question}
Model answer: ${modelAnswer}
Candidate's answer: ${userAnswer}
`;
