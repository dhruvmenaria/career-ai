import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { JobSummary } from "@/types/job";

export function JobCard({ job }: { job: JobSummary }) {
  return (
    <Card className="shadow-none">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium leading-5">{job.title}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              {job.company}
            </p>
          </div>
          <Badge variant="outline">{job.atsScore}% ATS</Badge>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Readiness</span>
            <span>{job.readiness}%</span>
          </div>
          <Progress value={job.readiness} />
        </div>
      </CardContent>
    </Card>
  );
}
