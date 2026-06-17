"use client";

import { FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadDropzone } from "@/components/shared/UploadDropzone";

type ResumeUploaderProps = {
  resumeText: string;
  fileName?: string;
  onTextChange: (value: string) => void;
  onFile: (file: File) => void;
};

export function ResumeUploader({ resumeText, fileName, onTextChange, onFile }: ResumeUploaderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Resume Source
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <UploadDropzone fileName={fileName} onFile={onFile} />
        <Textarea
          value={resumeText}
          onChange={(event) => onTextChange(event.target.value)}
          placeholder="Paste your resume text here..."
          className="min-h-40 resize-y"
        />
      </CardContent>
    </Card>
  );
}
