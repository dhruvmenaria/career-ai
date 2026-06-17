import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResumeJSON } from "@/types/resume";

function resumeLinesFromText(text: string): string[] {
  return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

function resumeLinesFromJSON(resume: ResumeJSON): string[] {
  return [
    resume.name,
    resume.summary,
    ...resume.experience.flatMap((e) => [e.title, e.company, ...e.bullets]),
    ...resume.skills,
    ...resume.certifications,
  ].filter(Boolean) as string[];
}

export function ResumeDiff({
  originalText,
  tailoredResume,
}: {
  originalText: string;
  tailoredResume: ResumeJSON;
}) {
  const original = resumeLinesFromText(originalText).slice(0, 24);
  const tailored = resumeLinesFromJSON(tailoredResume).slice(0, 24);
  const originalSet = new Set(original);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {/* Original */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
            Original
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {original.map((line, i) => (
            <p
              key={`orig-${i}`}
              className="diff-same rounded-md px-3 py-2 text-xs leading-5"
            >
              {line}
            </p>
          ))}
        </CardContent>
      </Card>

      {/* Tailored */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Tailored
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {tailored.map((line, i) => {
            const changed = !originalSet.has(line);
            return (
              <p
                key={`tail-${i}`}
                className={`rounded-md px-3 py-2 text-xs leading-5 ${
                  changed ? "diff-added font-medium" : "diff-same"
                }`}
              >
                {changed && (
                  <span className="mr-1.5 font-bold text-emerald-600 dark:text-emerald-400">+</span>
                )}
                {line}
              </p>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
