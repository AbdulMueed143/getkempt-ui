import { cn } from "@/lib/utils/cn";

/** Shared light-theme input styling for the booking flow. */
export const inputClass = (error?: boolean) =>
  cn(
    "w-full text-sm text-ink-900 rounded-xl px-3.5 py-2.5 bg-white border transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-royal-indigo focus:border-transparent",
    "placeholder:text-ink-300",
    error ? "border-rose-300" : "border-border-soft hover:border-ink-300"
  );

export const stepTitleClass = "heading-serif text-xl sm:text-2xl text-ink-900";
export const stepSubClass = "text-sm text-ink-400 mt-1";
