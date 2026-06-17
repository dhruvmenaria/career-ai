export type ResumeExperience = {
  title: string;
  company: string;
  duration: string;
  bullets: string[];
};

export type ResumeEducation = {
  degree: string;
  institution: string;
  year: string;
};

export type ResumeJSON = {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  certifications: string[];
};

export type JDAnalysis = {
  jobTitle: string;
  requiredSkills: string[];
  preferredSkills: string[];
  keyResponsibilities: string[];
  tone: "formal" | "startup" | "technical";
  seniorityLevel: "junior" | "mid" | "senior" | "lead";
  importantKeywords: string[];
};

export type KeywordMatches = {
  matched: string[];
  missing: string[];
};

export type TailoredResumeResult = {
  tailoredResume: ResumeJSON;
  atsScoreBefore: number;
  atsScoreAfter: number;
  keywordMatches: KeywordMatches;
  changesExplanation: string[];
};
