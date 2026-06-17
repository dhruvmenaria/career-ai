"use client";

import { useState, useEffect } from "react";
import { Plus, Briefcase, Building2, X, Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { JobStatus } from "@/types/job";

interface Job {
  id: string;
  title: string;
  company: string;
  status: JobStatus;
}

const COLUMNS: { status: JobStatus; label: string; color: string; headerBg: string }[] = [
  { status: "SAVED", label: "Saved", color: "text-slate-600 dark:text-slate-400", headerBg: "bg-slate-100 dark:bg-slate-800/50" },
  { status: "APPLIED", label: "Applied", color: "text-blue-600 dark:text-blue-400", headerBg: "bg-blue-100 dark:bg-blue-900/30" },
  { status: "INTERVIEWING", label: "Interviewing", color: "text-violet-600 dark:text-violet-400", headerBg: "bg-violet-100 dark:bg-violet-900/30" },
  { status: "OFFERED", label: "Offered", color: "text-emerald-600 dark:text-emerald-400", headerBg: "bg-emerald-100 dark:bg-emerald-900/30" },
  { status: "REJECTED", label: "Rejected", color: "text-rose-600 dark:text-rose-400", headerBg: "bg-rose-100 dark:bg-rose-900/30" },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTo, setAddingTo] = useState<JobStatus | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");

  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await fetch('/api/jobs');
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setJobs(data.jobs);
      } catch (err) {
        toast.error("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  const addJob = async (status: JobStatus) => {
    if (!newTitle.trim()) { toast.error("Please enter a job title."); return; }
    
    const tempId = `temp-${Date.now()}`;
    const optimisticJob: Job = {
      id: tempId,
      title: newTitle.trim(),
      company: newCompany.trim() || "Unknown",
      status,
    };
    
    // Optimistic update
    setJobs((prev) => [...prev, optimisticJob]);
    setNewTitle("");
    setNewCompany("");
    setAddingTo(null);
    
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: optimisticJob.title,
          company: optimisticJob.company,
          status,
        })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      
      // Update with real DB job ID
      setJobs((prev) => prev.map(j => j.id === tempId ? data.job : j));
      toast.success("Job added!");
    } catch (err) {
      // Revert optimistic update
      setJobs((prev) => prev.filter(j => j.id !== tempId));
      toast.error("Failed to add job");
    }
  };

  const moveJob = async (id: string, status: JobStatus) => {
    const originalJob = jobs.find(j => j.id === id);
    if (!originalJob) return;
    const originalStatus = originalJob.status;

    // Optimistic update
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j)));

    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      // Revert
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: originalStatus } : j)));
      toast.error("Failed to move job");
    }
  };

  const removeJob = async (id: string) => {
    const jobToRemove = jobs.find(j => j.id === id);
    if (!jobToRemove) return;

    // Optimistic update
    setJobs((prev) => prev.filter((j) => j.id !== id));

    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success("Job removed.");
    } catch (err) {
      // Revert
      setJobs((prev) => [...prev, jobToRemove]);
      toast.error("Failed to remove job");
    }
  };

  return (
    <div className="space-y-6 animate-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Job Tracker</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track all your applications in one kanban board.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 overflow-x-auto pb-4" style={{ gridTemplateColumns: `repeat(${COLUMNS.length}, minmax(220px, 1fr))` }}>
          {COLUMNS.map((col) => {
            const colJobs = jobs.filter((j) => j.status === col.status);
            return (
              <div key={col.status} className="kanban-col">
                {/* Column header */}
                <div className={cn("kanban-header", col.headerBg, col.color)}>
                  <span>{col.label}</span>
                  <span className="rounded-full bg-background/60 px-2 py-0.5 text-[10px] font-bold tabular-nums">
                    {colJobs.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-1 flex-col gap-2">
                  {colJobs.map((job) => (
                    <Card key={job.id} className="group relative cursor-grab shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{job.title}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Building2 className="h-3 w-3 text-muted-foreground" />
                              <p className="truncate text-xs text-muted-foreground">{job.company}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeJob(job.id)}
                            className="shrink-0 rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                          >
                            <X className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>

                        {/* Move buttons */}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {COLUMNS.filter((c) => c.status !== col.status).map((c) => (
                            <button
                              key={c.status}
                              onClick={() => moveJob(job.id, c.status)}
                              className={cn(
                                "rounded-sm px-1.5 py-0.5 text-[9px] font-medium transition-colors",
                                c.headerBg, c.color, "hover:opacity-80"
                              )}
                            >
                              → {c.label}
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Add job form */}
                {addingTo === col.status ? (
                  <div className="space-y-2 rounded-xl border border-primary/30 bg-card p-3">
                    <Input
                      placeholder="Job title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="h-8 text-xs"
                      autoFocus
                    />
                    <Input
                      placeholder="Company"
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <div className="flex gap-1.5">
                      <Button size="sm" className="h-7 flex-1 text-xs" onClick={() => addJob(col.status)}>
                        <Check className="mr-1 h-3 w-3" /> Add
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => { setAddingTo(null); setNewTitle(""); setNewCompany(""); }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingTo(col.status)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors w-full"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add job
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
