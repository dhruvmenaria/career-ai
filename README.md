# Career AI

An AI-powered job search companion for tailoring resumes, preparing for interviews, and tracking applications.

**Live demo:** https://career-ai-lovat.vercel.app

## What it does

Career AI brings several job-search tasks into one dashboard:

- **Tailor a resume to a job description:** Upload a PDF, DOCX, or TXT resume, or paste its text. The app analyzes the job description, extracts resume details, and generates a tailored version with an estimated ATS score and matched or missing keywords.
- **Prepare for interviews:** Generate role-specific interview topics and questions, then practice answers and receive AI-generated feedback.
- **Track applications:** Organize opportunities in a kanban board with Saved, Applied, Interviewing, Offered, and Rejected stages.
- **Review past work:** Revisit resume and interview preparation sessions from the dashboard.
- **Export a tailored resume:** Download the generated resume as a PDF.

## Engineering highlights

- Runs resume parsing and job-description analysis in parallel before generating the tailored resume.
- Uses structured JSON responses to pass AI output into the application’s resume and interview interfaces.
- Includes server-side authentication, per-user records, input size limits, and request rate limiting for resume tailoring.
- Uses Prisma models for users, saved jobs, resume sessions, and interview sessions.
- Includes subscription and usage-limit logic for free and Pro plans.

AI-generated resume edits and scores are suggestions, not a guarantee of passing an employer’s ATS. Review every edit and make sure it accurately represents your experience before applying.

## Tech stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js App Router API routes
- **Database:** PostgreSQL with Prisma
- **Authentication:** Clerk
- **AI:** NVIDIA NIM API using `meta/llama-3.3-70b-instruct`
- **Payments:** Stripe

## Run locally

### Prerequisites

- Node.js and npm
- A PostgreSQL database
- Clerk credentials
- An NVIDIA API key for AI features

### 1. Install dependencies

```bash
npm install

```bash
npm install
