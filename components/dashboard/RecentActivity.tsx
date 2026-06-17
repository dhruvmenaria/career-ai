import { CheckCircle2, FileText, MessageSquareText, Send, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const activities = [
  { icon: Sparkles, label: "Tailored resume for Frontend Engineer at Stripe", time: "12 min ago" },
  { icon: MessageSquareText, label: "Practiced 6 behavioral questions", time: "1 hr ago" },
  { icon: Send, label: "Moved Notion application to Interviewing", time: "Yesterday" },
  { icon: FileText, label: "Exported Product Designer resume", time: "Yesterday" },
  { icon: CheckCircle2, label: "Completed system design prep topics", time: "2 days ago" }
];

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.label} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-accent text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-5">{activity.label}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
