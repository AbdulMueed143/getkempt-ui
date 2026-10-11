"use client";

import { Check, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { stepTitleClass, stepSubClass } from "./shared";
import type { BookableStaff } from "@/types/public-booking";

interface Props {
  staff:       BookableStaff[];
  loading:     boolean;
  staffChosen: boolean;
  staffId:     string | null;   // null + chosen → "any available"
  onSelect:    (staffId: string | null) => void;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function StepStaff({ staff, loading, staffChosen, staffId, onSelect }: Props) {
  const anySelected = staffChosen && staffId === null;

  return (
    <div>
      <h2 className={stepTitleClass}>Choose your professional</h2>
      <p className={stepSubClass}>Pick a favourite, or let us match you with the soonest available.</p>

      {loading ? (
        <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-white border border-border-soft animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-2.5">
          {/* Any available */}
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={cn(
              "w-full flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all",
              anySelected
                ? "border-royal-indigo bg-indigo-subtle/60 shadow-sm"
                : "border-border-soft bg-white hover:border-ink-300"
            )}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-warm-sand/20 text-warm-sand shrink-0">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink-900">Any available professional</p>
              <p className="text-xs text-ink-400">Fastest way to get booked in</p>
            </div>
            <Selector selected={anySelected} />
          </button>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {staff.map((s) => {
              const selected = staffChosen && staffId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSelect(s.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all",
                    selected
                      ? "border-royal-indigo bg-indigo-subtle/60 shadow-sm"
                      : "border-border-soft bg-white hover:border-ink-300"
                  )}
                >
                  {s.avatarImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.avatarImage}
                      alt={s.name}
                      className="h-11 w-11 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-full text-white text-sm font-bold shrink-0"
                      style={{ backgroundColor: s.avatarColor }}
                    >
                      {initials(s.name)}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink-900 truncate">{s.name}</p>
                    <p className="text-xs text-ink-400 truncate">{s.specialization}</p>
                  </div>
                  <Selector selected={selected} />
                </button>
              );
            })}
          </div>

          {staff.length === 0 && (
            <p className="text-sm text-ink-400 py-6 text-center inline-flex items-center gap-2 justify-center w-full">
              <User className="h-4 w-4" />
              No specific professionals listed — we&apos;ll match you with any available.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Selector({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        "flex h-5 w-5 items-center justify-center rounded-full border transition-all shrink-0",
        selected
          ? "bg-royal-indigo border-royal-indigo text-white"
          : "border-border-soft text-transparent"
      )}
    >
      <Check className="h-3 w-3" />
    </span>
  );
}
