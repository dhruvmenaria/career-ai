"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PracticeMode } from "./PracticeMode";
import type { InterviewQuestion, AnswerScoreResult } from "@/types/interview";
import { cn } from "@/lib/utils";

const categoryClass: Record<string, string> = {
  technical: "cat-technical",
  behavioral: "cat-behavioral",
  situational: "cat-situational",
  culture: "cat-culture",
};

const difficultyClass: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  hard: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

interface QuestionCardProps {
  question: InterviewQuestion;
  sessionId?: string | null;
  onScored?: (questionId: string, result: AnswerScoreResult) => void;
}

export function QuestionCard({ question, sessionId, onScored }: QuestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [practicing, setPracticing] = useState(false);
  const [scoreResult, setScoreResult] = useState<AnswerScoreResult | null>(null);

  const handleScored = (result: AnswerScoreResult) => {
    setScoreResult(result);
    setPracticing(false);
    onScored?.(question.id, result);
  };

  return (
    <Card className={cn("transition-all duration-200", expanded && "shadow-md ring-1 ring-primary/20")}>
      <CardHeader className="cursor-pointer p-0" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start gap-3 p-4">
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className={cn("text-[10px] capitalize", categoryClass[question.category])}>
                {question.category}
              </Badge>
              <Badge variant="secondary" className={cn("text-[10px] capitalize", difficultyClass[question.difficulty])}>
                {question.difficulty}
              </Badge>
              {scoreResult && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px]",
                    scoreResult.score >= 70 ? "score-high" : scoreResult.score >= 40 ? "score-mid" : "score-low"
                  )}
                >
                  Score: {scoreResult.score}/100
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium leading-snug">{question.question}</p>
          </div>
          <div className="shrink-0 text-muted-foreground">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="border-t border-border/50 px-4 py-4 space-y-4 animate-in-up">
          {/* Why asked */}
          <div className="rounded-lg bg-muted/50 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Why asked</p>
            <p className="text-sm text-muted-foreground">{question.whyAsked}</p>
          </div>

          {/* STAR framework */}
          {question.starFramework && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">STAR Framework</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(["situation", "task", "action", "result"] as const).map((key) => (
                  <div key={key} className="rounded-lg border border-border/50 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase text-primary/80 mb-1">{key}</p>
                    <p className="text-xs text-muted-foreground">{question.starFramework![key]}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Model answer toggle */}
          <div>
            <button
              onClick={() => setShowModel(!showModel)}
              className="flex items-center gap-2 text-xs text-primary hover:underline"
            >
              {showModel ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showModel ? "Hide" : "Show"} model answer
            </button>
            {showModel && (
              <div className="mt-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-3 text-sm text-muted-foreground animate-in-up">
                {question.modelAnswer}
              </div>
            )}
          </div>

          {/* Score result */}
          {scoreResult && (
            <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3 animate-in-up">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Your Score</p>
                <span
                  className={cn(
                    "text-xl font-bold",
                    scoreResult.score >= 70 ? "text-emerald-500" : scoreResult.score >= 40 ? "text-amber-500" : "text-rose-500"
                  )}
                >
                  {scoreResult.score}/100
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(scoreResult.scoreBreakdown) as [string, number][]).map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-muted/40 px-2.5 py-2">
                    <p className="text-[10px] capitalize text-muted-foreground">{k}</p>
                    <p className="text-sm font-semibold">{v}/25</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Feedback</p>
                <p className="text-sm">{scoreResult.feedback}</p>
              </div>
              {scoreResult.improvedAnswer && (
                <div className="rounded-lg bg-emerald-50 px-3 py-2.5 dark:bg-emerald-950/30">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                    Improved Answer
                  </p>
                  <p className="text-sm text-emerald-900 dark:text-emerald-200">{scoreResult.improvedAnswer}</p>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setScoreResult(null); setPracticing(true); }}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Practice mode */}
          {!scoreResult && (
            <div>
              {practicing ? (
                <PracticeMode
                  question={question}
                  sessionId={sessionId}
                  onScored={handleScored}
                  onCancel={() => setPracticing(false)}
                />
              ) : (
                <Button size="sm" onClick={() => setPracticing(true)}>
                  <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                  Practice This Question
                </Button>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
