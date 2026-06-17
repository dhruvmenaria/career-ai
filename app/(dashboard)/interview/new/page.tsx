"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Loader2, MessagesSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { InterviewGenerateResult } from "@/types/interview";

export default function NewInterviewPage() {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState("");
  const [jd, setJd] = useState("");
  const [seniority, setSeniority] = useState("mid");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!jobTitle.trim()) { toast.error("Please enter a job title."); return; }
    if (!jd.trim() || jd.length < 20) { toast.error("Please paste a job description."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/interview/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jobTitle, jobDescription: jd, seniority }),
      });
      if (!res.ok) {
        const { message } = (await res.json()) as { message: string };
        throw new Error(message || "Generation failed");
      }
      const data = (await res.json()) as InterviewGenerateResult & { sessionId?: string };

      // Store in sessionStorage to pass to result page without URL params
      sessionStorage.setItem("interview-result", JSON.stringify(data));
      sessionStorage.setItem("interview-meta", JSON.stringify({ jobTitle, seniority }));

      toast.success("Interview prep generated!");
      if (data.sessionId) {
        router.push(`/interview/${data.sessionId}`);
      } else {
        router.push("/interview/session");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Interview Prep</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI generates study topics, likely questions, and model answers tailored to your role.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessagesSquare className="h-4 w-4 text-primary" />
            Role Details
          </CardTitle>
          <CardDescription>Tell us about the role you&apos;re interviewing for.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="job-title">Job Title *</Label>
              <Input
                id="job-title"
                placeholder="e.g. Senior Frontend Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seniority">Seniority Level</Label>
              <Select id="seniority" value={seniority} onChange={(e) => setSeniority(e.target.value)}>
                <SelectItem value="junior">Junior</SelectItem>
                <SelectItem value="mid">Mid-level</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
                <SelectItem value="lead">Lead / Principal</SelectItem>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="jd">Job Description *</Label>
            <Textarea
              id="jd"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the full job description here…"
              className="min-h-[200px] resize-y text-sm"
            />
            <p className="text-xs text-muted-foreground">{jd.length} characters</p>
          </div>

          <div className="rounded-lg bg-muted/50 px-4 py-3">
            <p className="text-xs font-semibold text-muted-foreground mb-1">What you&apos;ll get</p>
            <ul className="space-y-0.5 text-xs text-muted-foreground">
              <li>• 8 key topics to study (ranked by relevance)</li>
              <li>• 20 likely interview questions across all categories</li>
              <li>• Model answers with STAR framework</li>
              <li>• Practice mode with AI scoring</li>
            </ul>
          </div>

          <Button className="w-full" onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" />Generating with AI…</>
            ) : (
              <>Generate Interview Prep <ChevronRight className="ml-1.5 h-4 w-4" /></>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
