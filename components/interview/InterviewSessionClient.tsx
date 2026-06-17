"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TopicsList } from "@/components/interview/TopicsList";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { ReadinessScore } from "@/components/interview/ReadinessScore";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InterviewGenerateResult, InterviewCategory, AnswerScoreResult } from "@/types/interview";

type CategoryFilter = "all" | InterviewCategory;

const CATEGORIES: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "technical", label: "Technical" },
  { value: "behavioral", label: "Behavioral" },
  { value: "situational", label: "Situational" },
  { value: "culture", label: "Culture" },
];

export function InterviewSessionClient({ 
  session,
  jobTitle,
  seniority,
  readiness: initialReadiness
}: { 
  session: InterviewGenerateResult & { id?: string };
  jobTitle: string;
  seniority: string;
  readiness: number;
}) {
  const [readiness, setReadiness] = useState(initialReadiness);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [scores, setScores] = useState<Record<string, number>>({});

  const handleScored = (questionId: string, result: AnswerScoreResult) => {
    const nextScores = { ...scores, [questionId]: result.score };
    setScores(nextScores);
    const values = Object.values(nextScores);
    setReadiness(Math.round(values.reduce((a, b) => a + b, 0) / values.length));
  };

  const filteredQuestions =
    categoryFilter === "all" ? session.questions : session.questions.filter((q) => q.category === categoryFilter);

  const categoryCounts = (["technical","behavioral","situational","culture"] as InterviewCategory[]).reduce<Record<string, number>>((acc, c) => {
    acc[c] = session.questions.filter((q) => q.category === c).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-in-up">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/interview"><ArrowLeft className="mr-1.5 h-4 w-4" />All Sessions</Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{jobTitle}</h1>
          {seniority && (
            <Badge variant="secondary" className="mt-1 capitalize">{seniority}</Badge>
          )}
        </div>
        <ReadinessScore score={readiness} label="Readiness Score" />
      </div>

      <Tabs defaultValue="topics">
        <TabsList>
          <TabsTrigger value="topics">📚 Study Topics</TabsTrigger>
          <TabsTrigger value="practice">🎯 Practice Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="topics">
          <TopicsList topics={session.topics} />
        </TabsContent>

        <TabsContent value="practice" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-all border",
                  categoryFilter === cat.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted border-transparent text-muted-foreground hover:border-border"
                )}
              >
                {cat.label}
                {cat.value !== "all" && (
                  <span className="ml-1 opacity-60">({categoryCounts[cat.value] ?? 0})</span>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredQuestions.map((q) => (
              <QuestionCard key={q.id} question={q} sessionId={session.id || null} onScored={handleScored} />
            ))}
            {filteredQuestions.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No questions in this category.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
