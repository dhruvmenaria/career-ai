import * as React from "react"
import { cn } from "@/lib/utils"

const Accordion = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-2", className)} {...props}>{children}</div>
);

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  open?: boolean;
  onToggle?: () => void;
}

const AccordionItem = ({ children, className, open, onToggle, ...props }: AccordionItemProps) => (
  <div
    className={cn("rounded-xl border border-border/60 bg-card overflow-hidden transition-shadow", open && "shadow-sm", className)}
    {...props}
  >
    {React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        // @ts-expect-error - pass open/onToggle to trigger and content
        return React.cloneElement(child, { open, onToggle });
      }
      return child;
    })}
  </div>
);

interface TriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  open?: boolean;
  onToggle?: () => void;
}

const AccordionTrigger = ({ children, className, open, onToggle, ...props }: TriggerProps) => (
  <button
    onClick={onToggle}
    className={cn(
      "flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-medium transition-colors hover:bg-muted/50",
      className
    )}
    aria-expanded={open}
    {...props}
  >
    {children}
    <svg
      className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </button>
);

interface ContentProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
}

const AccordionContent = ({ children, className, open, ...props }: ContentProps) => (
  <div
    className={cn(
      "overflow-hidden transition-all duration-200",
      open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
    )}
    {...props}
  >
    <div className={cn("border-t border-border/50 px-4 py-4", className)}>
      {children}
    </div>
  </div>
);

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
