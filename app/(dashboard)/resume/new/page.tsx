"use client";

import { useState } from "react";
import { Check, ChevronRight, Loader2, Download, RefreshCw, FileText, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResumeUploader } from "@/components/resume/ResumeUploader";
import { ATSScoreCard } from "@/components/resume/ATSScoreCard";
import { ResumeDiff } from "@/components/resume/ResumeDiff";
import { ResumePreview } from "@/components/resume/ResumePreview";
import type { TailoredResumeResult } from "@/types/resume";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

const STEPS = ["Upload Resume", "Job Description", "Tailored Results"];

export default function NewResumePage() {
  const [step, setStep] = useState(0);
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState<string>();
  const [jd, setJd] = useState("");
  const [company, setCompany] = useState("");
  const [seniority, setSeniority] = useState("mid");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<(TailoredResumeResult & { sessionId?: string }) | null>(null);
  const [exporting, setExporting] = useState(false);

  // ── Step 1: upload file ──────────────────────────────────────────────────
  const handleFile = async (file: File) => {
    setFileName(file.name);
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/resume/parse", { method: "POST", body: form });
      if (!res.ok) {
        const { message } = (await res.json()) as { message: string };
        throw new Error(message || "Parse failed");
      }
      const { rawText } = (await res.json()) as { rawText: string };
      setResumeText(rawText);
      toast.success("Resume parsed successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not parse file.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: tailor ───────────────────────────────────────────────────────
  const handleTailor = async () => {
    if (!resumeText.trim() || resumeText.length < 20) {
      toast.error("Please add your resume text first.");
      return;
    }
    if (!jd.trim() || jd.length < 20) {
      toast.error("Please paste a job description.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/resume/tailor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription: jd }),
      });
      if (!res.ok) {
        const { message } = (await res.json()) as { message: string };
        throw new Error(message || "Tailoring failed");
      }
      const data = (await res.json()) as TailoredResumeResult & { sessionId?: string };
      setResult(data);
      setStep(2);
      toast.success("Resume tailored! Check your results below.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tailoring failed. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  // ── Export ───────────────────────────────────────────────────────────────
  const handleExport = async (format: "pdf" | "docx") => {
    if (!result) return;
    setExporting(true);
    try {
      const res = await fetch("/api/resume/export", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ resume: result.tailoredResume, format }),
      });
      if (!res.ok) throw new Error("Export failed.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `careerai-resume.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded as ${format.toUpperCase()}!`);
    } catch {
      toast.error("Export failed. Please retry.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tailor Your Resume</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI rewrites your resume to match the job description and maximise ATS score.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
            <button
              disabled={i > step}
              onClick={() => i < step && setStep(i)}
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all",
                i < step && "bg-primary text-white cursor-pointer hover:opacity-80",
                i === step && "bg-primary text-white ring-4 ring-primary/20",
                i > step && "bg-muted text-muted-foreground"
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </button>
            <span className={cn("text-sm font-medium hidden sm:block", i === step ? "text-foreground" : "text-muted-foreground")}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={cn("step-connector mx-2", i < step && "step-connector-active")} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 0: Upload Resume ─────────────────────────────────────────── */}
      {step === 0 && (
        <Card className="animate-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Upload Your Resume
            </CardTitle>
            <CardDescription>
              Upload a file (PDF, DOCX, TXT) or paste your resume text directly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ResumeUploader
              resumeText={resumeText}
              fileName={fileName}
              onTextChange={setResumeText}
              onFile={handleFile}
            />
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Parsing your resume…
              </div>
            )}
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  if (!resumeText.trim() || resumeText.length < 20) {
                    toast.error("Please provide your resume before continuing.");
                    return;
                  }
                  setStep(1);
                }}
                disabled={loading}
              >
                Continue <ChevronRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 1: Job Description ───────────────────────────────────────── */}
      {step === 1 && (
        <Card className="animate-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              Job Description
            </CardTitle>
            <CardDescription>
              Paste the full job description. The more detail, the better the tailoring.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="company">Company (optional)</Label>
                <Input
                  id="company"
                  placeholder="e.g. Stripe, Google…"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seniority">Seniority Level</Label>
                <Select
                  id="seniority"
                  value={seniority}
                  onChange={(e) => setSeniority(e.target.value)}
                >
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
                className="min-h-[220px] resize-y text-sm"
              />
              <p className="text-xs text-muted-foreground">{jd.length} characters</p>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
              <Button onClick={handleTailor} disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" />Tailoring with AI…</>
                ) : (
                  <>Tailor My Resume <ChevronRight className="ml-1.5 h-4 w-4" /></>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 2: Results ───────────────────────────────────────────────── */}
      {step === 2 && result && (
        <div className="space-y-6 animate-in-up">
          {/* Action bar */}
          <Card>
            <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Resume Tailored ✅</p>
                <p className="text-sm text-muted-foreground">
                  ATS score improved from <strong>{result.atsScoreBefore}</strong> → <strong>{result.atsScoreAfter}</strong>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setStep(0); setResult(null); }}
                >
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Start Over
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("docx")}
                  disabled={exporting}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  DOCX
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleExport("pdf")}
                  disabled={exporting}
                >
                  {exporting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />}
                  PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ATS score + keywords */}
          <ATSScoreCard
            scoreBefore={result.atsScoreBefore}
            scoreAfter={result.atsScoreAfter}
            keywordMatches={result.keywordMatches}
            changesExplanation={result.changesExplanation}
          />

          {/* Side-by-side diff */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Side-by-Side Comparison
            </h2>
            <ResumeDiff originalText={resumeText} tailoredResume={result.tailoredResume} />
          </div>

          {/* Full preview */}
          <ResumePreview resume={result.tailoredResume} />
        </div>
      )}
    </div>
  );
}
