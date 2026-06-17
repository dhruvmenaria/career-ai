"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  MessagesSquare,
  Moon,
  Sun,
  ChevronRight,
  Sparkles,
  Zap,
  Crown,
  Loader2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/resume", label: "Resume", icon: FileText, exact: false },
  { href: "/interview", label: "Interview Prep", icon: MessagesSquare, exact: false },
  { href: "/jobs", label: "Job Tracker", icon: BriefcaseBusiness, exact: false },
];

type BillingStatus = {
  plan: "free" | "pro";
  subStatus: string;
  billingConfigured: boolean;
  usage: {
    resumes: { used: number; limit: number };
    interviews: { used: number; limit: number };
  };
} | null;

function UsagePill({ used, limit, label }: { used: number; limit: number; label: string }) {
  const isUnlimited = limit === Infinity || limit > 1000;
  const pct = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
  const nearLimit = !isUnlimited && used >= limit - 1;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{label}</span>
        <span className={cn(nearLimit && "text-rose-500 font-semibold")}>
          {isUnlimited ? `${used} / ∞` : `${used} / ${limit}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              nearLimit ? "bg-rose-500" : "bg-primary"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

function BillingSection({ status, onRefresh }: { status: BillingStatus; onRefresh: () => void }) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  async function handlePortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  if (!status) return null;

  const isPro = status.plan === "pro";

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-border/50 bg-muted/30 p-3">
      {/* Plan badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {isPro ? (
            <Crown className="h-3.5 w-3.5 text-amber-500" />
          ) : (
            <Zap className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className={cn("text-xs font-semibold", isPro ? "text-amber-500" : "text-muted-foreground")}>
            {isPro ? "Pro Plan" : "Free Plan"}
          </span>
        </div>
      </div>

      {/* Usage bars */}
      <div className="space-y-2">
        <UsagePill
          used={status.usage.resumes.used}
          limit={status.usage.resumes.limit}
          label="Resumes this month"
        />
        <UsagePill
          used={status.usage.interviews.used}
          limit={status.usage.interviews.limit}
          label="Interviews this month"
        />
      </div>

      {/* CTA button */}
      {status.billingConfigured && (
        <button
          onClick={isPro ? handlePortal : handleUpgrade}
          disabled={loading}
          className={cn(
            "flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all disabled:opacity-50",
            isPro
              ? "border border-border text-muted-foreground hover:bg-accent"
              : "bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
          )}
        >
          {loading ? (
            <><Loader2 className="h-3 w-3 animate-spin" /> Redirecting…</>
          ) : isPro ? (
            "Manage Billing"
          ) : (
            <><Sparkles className="h-3 w-3" /> Upgrade to Pro — $9/mo</>
          )}
        </button>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [billingStatus, setBillingStatus] = useState<BillingStatus>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/billing/status")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data && !data.error) setBillingStatus(data);
      })
      .catch(() => {});
  }, []);

  return (
    <aside className="flex h-full w-full flex-col border-r border-border/50 bg-card px-3 py-5">
      {/* Logo */}
      <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-primary shadow-md">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="block text-sm font-bold tracking-tight">CareerAI</span>
          <span className="block text-[10px] text-muted-foreground">AI-powered careers</span>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("sidebar-link group", active && "sidebar-link-active")}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Quick actions */}
      <div className="mt-4 space-y-2">
        <Link
          href="/resume/new"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-primary hover:bg-accent transition-colors"
        >
          <FileText className="h-3.5 w-3.5" />
          Tailor New Resume
        </Link>
        <Link
          href="/interview/new"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-primary hover:bg-accent transition-colors"
        >
          <MessagesSquare className="h-3.5 w-3.5" />
          New Interview Prep
        </Link>
      </div>

      {/* Billing section */}
      <BillingSection status={billingStatus} onRefresh={() => {}} />

      {/* Theme toggle */}
      <div className="mt-3 border-t border-border/50 pt-3">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        )}
      </div>
      <UserProfile />
    </aside>
  );
}

function UserProfile() {
  const { user } = useUser();
  const { signOut } = useClerk();

  if (!user) return null;

  return (
    <div className="p-3 border-t border-border">
      <div className="flex items-center gap-3">
        <img
          src={user.imageUrl}
          alt={user.fullName ?? 'User'}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
          <p className="text-xs text-muted-foreground truncate">
            {user.emailAddresses[0]?.emailAddress}
          </p>
        </div>
        <button
          onClick={() => signOut({ redirectUrl: '/' })}
          className="text-xs text-muted-foreground hover:text-white transition-colors px-2 py-1 rounded hover:bg-muted"
          title="Sign out"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
