import { NextResponse } from "next/server";
import { z } from "zod";
import { generateResumePDF } from "@/lib/generators/pdf-generator";
import { getRequestUser } from "@/lib/auth";
import type { ResumeJSON } from "@/types/resume";

export const runtime = "nodejs";

const exportSchema = z.object({
  resume: z.custom<ResumeJSON>(),
  format: z.enum(["pdf", "docx"])
});

function resumeToPlainText(resume: ResumeJSON) {
  return [
    resume.name,
    [resume.email, resume.phone, resume.location].filter(Boolean).join(" | "),
    "",
    "SUMMARY",
    resume.summary,
    "",
    "EXPERIENCE",
    ...resume.experience.flatMap((item) => [
      `${item.title} - ${item.company}`,
      item.duration,
      ...item.bullets.map((bullet) => `- ${bullet}`)
    ]),
    "",
    "SKILLS",
    resume.skills.join(", ")
  ].join("\n");
}

export async function POST(request: Request) {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }

  try {
    const input = exportSchema.parse(await request.json());

    if (input.format === "pdf") {
      const buffer = await generateResumePDF(input.resume);
      return new Response(buffer, {
        headers: {
          "content-type": "application/pdf",
          "content-disposition": "attachment; filename=careerai-resume.pdf"
        }
      });
    }

    return new Response(resumeToPlainText(input.resume), {
      headers: {
        "content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "content-disposition": "attachment; filename=careerai-resume.docx"
      }
    });
  } catch {
    return NextResponse.json({ message: "Could not generate export." }, { status: 500 });
  }
}
