"use client";

import { BriefcaseBusiness } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type JDInputProps = {
  company: string;
  seniority: string;
  jobDescription: string;
  onCompanyChange: (value: string) => void;
  onSeniorityChange: (value: string) => void;
  onJobDescriptionChange: (value: string) => void;
};

export function JDInput({
  company,
  seniority,
  jobDescription,
  onCompanyChange,
  onSeniorityChange,
  onJobDescriptionChange
}: JDInputProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BriefcaseBusiness className="h-4 w-4 text-primary" />
          Target Role
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input value={company} onChange={(event) => onCompanyChange(event.target.value)} placeholder="Company name" />
          <select
            value={seniority}
            onChange={(event) => onSeniorityChange(event.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="junior">Junior</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
          </select>
        </div>
        <Textarea
          value={jobDescription}
          onChange={(event) => onJobDescriptionChange(event.target.value)}
          placeholder="Paste the job description..."
          className="min-h-80 resize-y"
        />
      </CardContent>
    </Card>
  );
}
