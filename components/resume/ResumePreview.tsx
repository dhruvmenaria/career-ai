import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResumeJSON } from "@/types/resume";

interface ResumePreviewProps {
  resume: ResumeJSON;
}

export function ResumePreview({ resume }: ResumePreviewProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Tailored Resume Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/50 bg-background p-6 font-mono text-[13px] leading-relaxed space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin">
          {/* Header */}
          <div>
            <p className="text-lg font-bold text-foreground">{resume.name || "—"}</p>
            <p className="text-xs text-muted-foreground">
              {[resume.email, resume.phone, resume.location].filter(Boolean).join(" · ")}
            </p>
          </div>

          {/* Summary */}
          {resume.summary && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Summary</p>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap">{resume.summary}</p>
            </div>
          )}

          {/* Experience */}
          {resume.experience.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Experience</p>
              <div className="space-y-3">
                {resume.experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex items-baseline justify-between">
                      <p className="text-xs font-semibold">{exp.title}</p>
                      <p className="text-[10px] text-muted-foreground">{exp.duration}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-1">{exp.company}</p>
                    <ul className="space-y-0.5">
                      {exp.bullets.map((b, j) => (
                        <li key={j} className="flex gap-2 text-[11px]">
                          <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {resume.education.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Education</p>
              {resume.education.map((edu, i) => (
                <p key={i} className="text-xs">
                  {edu.degree} — {edu.institution} {edu.year}
                </p>
              ))}
            </div>
          )}

          {/* Skills */}
          {resume.skills.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Skills</p>
              <p className="text-xs text-muted-foreground">{resume.skills.join(", ")}</p>
            </div>
          )}

          {/* Certifications */}
          {resume.certifications.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Certifications</p>
              <p className="text-xs text-muted-foreground">{resume.certifications.join(", ")}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
