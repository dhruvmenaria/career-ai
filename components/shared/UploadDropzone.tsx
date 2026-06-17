"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  fileName?: string;
  onFile: (file: File) => void;
}

export function UploadDropzone({ fileName, onFile }: UploadDropzoneProps) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  };

  return (
    <label
      htmlFor="resume-upload"
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all duration-200",
        dragging
          ? "border-primary bg-accent/40 scale-[1.01]"
          : "border-border/60 hover:border-primary/50 hover:bg-muted/30"
      )}
    >
      {fileName ? (
        <div className="flex flex-col items-center gap-2 text-center px-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">{fileName}</p>
          <p className="text-xs text-muted-foreground">Drop a new file to replace</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-center px-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Drop your resume here</p>
            <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT · max 5 MB</p>
          </div>
          <span className="rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Click to browse
          </span>
        </div>
      )}
      <input
        id="resume-upload"
        type="file"
        accept=".pdf,.docx,.txt"
        className="sr-only"
        onChange={handleChange}
      />
    </label>
  );
}
