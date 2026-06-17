import { ArrowUpRight, FileCheck2, MessagesSquare, Target, Workflow } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "Total Applications", value: "18", icon: Workflow, trend: "+4 this week" },
  { label: "Resumes Tailored", value: "31", icon: FileCheck2, trend: "82 avg ATS" },
  { label: "Questions Practiced", value: "146", icon: MessagesSquare, trend: "+28 this week" },
  { label: "Avg ATS Score", value: "84%", icon: Target, trend: "+17 after tailoring" }
];

export function StatsGrid() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <Icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-normal">{stat.value}</div>
              <p className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-300">
                <ArrowUpRight className="h-3.5 w-3.5" />
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
