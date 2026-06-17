export type JobStatus = "SAVED" | "APPLIED" | "INTERVIEWING" | "OFFERED" | "REJECTED";

export type JobSummary = {
  id: string;
  title: string;
  company: string;
  status: JobStatus;
  readiness: number;
  atsScore: number;
};
