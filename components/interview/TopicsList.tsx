"use client";

import { useState } from "react";
import { ExternalLink, BookOpen, Video, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import type { PrepTopic } from "@/types/interview";
import { cn } from "@/lib/utils";

const priorityClass: Record<string, string> = {
  high: "priority-high",
  medium: "priority-medium",
  low: "priority-low",
};

const resourceIcon = {
  article: FileText,
  video: Video,
  docs: BookOpen,
} as const;

interface TopicsListProps {
  topics: PrepTopic[];
}

export function TopicsList({ topics }: TopicsListProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <Accordion>
      {topics.map((topic, i) => {
        const ResourceItems = topic.resources ?? [];
        return (
          <AccordionItem
            key={topic.topic}
            value={String(i)}
            open={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? null : i)}
          >
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="font-medium">{topic.topic}</span>
                <Badge
                  variant="secondary"
                  className={cn("ml-1 text-[10px] capitalize", priorityClass[topic.priority])}
                >
                  {topic.priority}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-3 text-sm text-muted-foreground">{topic.whyImportant}</p>

              {topic.subtopics.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subtopics</p>
                  <ul className="space-y-1">
                    {topic.subtopics.map((sub) => (
                      <li key={sub} className="flex items-center gap-2 text-sm">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {sub}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {ResourceItems.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resources</p>
                  <div className="space-y-2">
                    {ResourceItems.map((res) => {
                      const Icon = resourceIcon[res.type] ?? FileText;
                      return (
                        <a
                          key={res.url}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 rounded-lg border border-border/50 px-3 py-2 text-sm hover:bg-muted/60 transition-colors group"
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                          <span className="flex-1 truncate">{res.title}</span>
                          <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
