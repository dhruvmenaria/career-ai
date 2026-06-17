"use client";

import { useState } from "react";
import { Loader2, SendHorizonal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { InterviewQuestion, AnswerScoreResult } from "@/types/interview";

interface PracticeModeProps {
  question: InterviewQuestion;
  sessionId?: string | null;
  onScored: (result: AnswerScoreResult) => void;
  onCancel: () => void;
}

export function PracticeMode({ question, sessionId, onScored, onCancel }: PracticeModeProps) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = async () => {
    if (answer.trim().length < 10) {
      toast.error("Please write at least a sentence before submitting.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/interview/score", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          sessionId: sessionId ?? null,
          question: question.question,
          modelAnswer: question.modelAnswer,
          userAnswer: answer,
        }),
      });
      if (!res.ok) {
        const { message } = await res.json() as { message: string };
        throw new Error(message || "Scoring failed.");
      }
      const result = await res.json() as AnswerScoreResult;
      toast.success("Answer scored!");
      onScored(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not score your answer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-primary/30 bg-accent/20 p-4 animate-in-up">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Your Answer</p>
        <button onClick={onCancel} className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <Textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Write your answer using the STAR method (Situation → Task → Action → Result)…"
        className="min-h-[120px] resize-y text-sm"
        disabled={loading}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{wordCount} words</span>
        <Button size="sm" onClick={handleSubmit} disabled={loading || answer.trim().length < 10}>
          {loading ? (
            <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Scoring…</>
          ) : (
            <><SendHorizonal className="mr-1.5 h-3.5 w-3.5" />Submit for AI Scoring</>
          )}
        </Button>
      </div>
    </div>
  );
}
