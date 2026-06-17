export type Seniority = "junior" | "mid" | "senior" | "lead";

export type PrepTopic = {
  topic: string;
  priority: "high" | "medium" | "low";
  whyImportant: string;
  subtopics: string[];
  resources: {
    title: string;
    type: "article" | "video" | "docs";
    url: string;
  }[];
};

export type InterviewCategory = "technical" | "behavioral" | "situational" | "culture";

export type InterviewQuestion = {
  id: string;
  question: string;
  category: InterviewCategory;
  difficulty: "easy" | "medium" | "hard";
  whyAsked: string;
  modelAnswer: string;
  starFramework: {
    situation: string;
    task: string;
    action: string;
    result: string;
  } | null;
  userAnswer?: string;
  score?: number;
};

export type InterviewGenerateResult = {
  topics: PrepTopic[];
  questions: InterviewQuestion[];
};

export type AnswerScoreResult = {
  score: number;
  scoreBreakdown: {
    relevance: number;
    structure: number;
    specificity: number;
    impact: number;
  };
  feedback: string;
  improvedAnswer: string;
  missingElements: string[];
};
