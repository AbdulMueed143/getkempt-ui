"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface StepMeta {
  key:   string;
  label: string;
}

interface Props {
  steps:       StepMeta[];
  currentIndex: number;
  /** Allow jumping back to an already-completed step. */
  onStepClick?: (index: number) => void;
}

export function BookingStepper({ steps, currentIndex, onStepClick }: Props) {
  return (
    <nav aria-label="Booking progress" className="w-full">
      <ol className="flex items-center">
        {steps.map((step, i) => {
          const isDone    = i < currentIndex;
          const isCurrent = i === currentIndex;
          const clickable = isDone && !!onStepClick;

          return (
            <li key={step.key} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick?.(i)}
                className={cn(
                  "flex items-center gap-2 group",
                  clickable ? "cursor-pointer" : "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all shrink-0",
                    isCurrent && "bg-royal-indigo text-white ring-4 ring-indigo-subtle",
                    isDone && "bg-emerald-500 text-white",
                    !isCurrent && !isDone && "bg-white text-ink-300 border border-border-soft"
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "hidden sm:inline text-sm font-semibold transition-colors whitespace-nowrap",
                    isCurrent ? "text-ink-900" : isDone ? "text-emerald-600 group-hover:underline" : "text-ink-300"
                  )}
                >
                  {step.label}
                </span>
              </button>

              {i < steps.length - 1 && (
                <span
                  className={cn(
                    "mx-2 sm:mx-3 h-px flex-1 transition-colors",
                    isDone ? "bg-emerald-300" : "bg-border-soft"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
