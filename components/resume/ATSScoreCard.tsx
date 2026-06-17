import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, TrendingUp } from "lucide-react";
import type { KeywordMatches } from "@/types/resume";
import { cn } from "@/lib/utils";

interface ATSScoreCardProps {
  scoreBefore: number;
  scoreAfter: number;
  keywordMatches: KeywordMatches;
  changesExplanation?: string[];
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 100 100" className="-rotate-90 h-full w-full">
          <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/30" />
          <circle
            cx="50" cy="50" r={r} fill="none"
            stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            className="ring-progress"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold">{score}</span>
          <span className="text-[9px] text-muted-foreground">/100</span>
        </div>
      </div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

export function ATSScoreCard({ scoreBefore, scoreAfter, keywordMatches, changesExplanation = [] }: ATSScoreCardProps) {
  const improvement = scoreAfter - scoreBefore;

  return (
    <div className="space-y-4">
      {/* Score comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            ATS Score Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-around">
            <ScoreRing score={scoreBefore} label="Before" />
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-semibold",
                  improvement >= 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-rose-100 text-rose-700"
                )}
              >
                {improvement >= 0 ? "+" : ""}{improvement} pts
              </div>
              <p className="mt-1 text-xs text-muted-foreground">improvement</p>
            </div>
            <ScoreRing score={scoreAfter} label="After" />
          </div>
        </CardContent>
      </Card>

      {/* Keyword matches */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              Matched Keywords ({keywordMatches.matched.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {keywordMatches.matched.length === 0 ? (
                <p className="text-xs text-muted-foreground">No matches found.</p>
              ) : (
                keywordMatches.matched.map((kw) => (
                  <Badge key={kw} variant="secondary" className="text-[10px] score-high">{kw}</Badge>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <XCircle className="h-3.5 w-3.5 text-rose-500" />
              Missing Keywords ({keywordMatches.missing.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {keywordMatches.missing.length === 0 ? (
                <p className="text-xs text-muted-foreground">All keywords matched!</p>
              ) : (
                keywordMatches.missing.map((kw) => (
                  <Badge key={kw} variant="secondary" className="text-[10px] score-low">{kw}</Badge>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Changes explanation */}
      {changesExplanation.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">What Was Changed</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {changesExplanation.map((change, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {change}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
