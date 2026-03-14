"use client";

import { Plus, Pencil, Trash2, CalendarOff, Clock } from "lucide-react";
import type { AvailabilityOverride } from "@/types/availability";

interface OverridesListProps {
  overrides: AvailabilityOverride[];
  onAdd: () => void;
  onEdit: (override: AvailabilityOverride) => void;
  onDelete: (id: string) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${suffix}`;
}

function isPast(dateStr: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  return dateStr < today;
}

export function OverridesList({ overrides, onAdd, onEdit, onDelete }: OverridesListProps) {
  const today = new Date().toISOString().split("T")[0];

  const sorted = [...overrides].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = sorted.filter((o) => o.date >= today);
  const past = sorted.filter((o) => o.date < today);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">Date Overrides</h3>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1B3163] text-white hover:bg-[#15285A] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Override
        </button>
      </div>

      <div className="divide-y divide-gray-50">
        {upcoming.length === 0 && past.length === 0 && (
          <div className="px-5 py-10 text-center">
            <CalendarOff className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No date overrides yet</p>
            <p className="text-xs text-gray-300 mt-0.5">
              Overrides let you adjust one-off availability for specific dates
            </p>
          </div>
        )}

        {upcoming.map((o) => (
          <OverrideCard
            key={o.id}
            override={o}
            onEdit={() => onEdit(o)}
            onDelete={() => onDelete(o.id)}
          />
        ))}

        {past.length > 0 && (
          <>
            <div className="px-5 py-2 bg-gray-50">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Past</p>
            </div>
            {past.map((o) => (
              <OverrideCard
                key={o.id}
                override={o}
                onEdit={() => onEdit(o)}
                onDelete={() => onDelete(o.id)}
                dimmed
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Single override card ─────────────────────────────────────────── */

interface OverrideCardProps {
  override: AvailabilityOverride;
  onEdit: () => void;
  onDelete: () => void;
  dimmed?: boolean;
}

function OverrideCard({ override, onEdit, onDelete, dimmed }: OverrideCardProps) {
  return (
    <div className={`px-5 py-4 ${dimmed ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        {/* Left: date + status */}
        <div className="flex items-start gap-3 min-w-0">
          {/* Status dot */}
          <span
            className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${
              override.isWorking ? "bg-emerald-400" : "bg-rose-400"
            }`}
          />

          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {formatDate(override.date)}
            </p>

            {override.isWorking ? (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {override.slots.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1 text-xs bg-[#EEF1F8] text-[#1B3163] px-2 py-0.5 rounded-full"
                  >
                    <Clock className="w-3 h-3" />
                    {formatTime(s.startTime)} – {formatTime(s.endTime)}
                    {s.label && <span className="text-[#1B3163]/70">· {s.label}</span>}
                  </span>
                ))}
              </div>
            ) : (
              <span className="mt-1 inline-block text-xs text-rose-500 font-medium">
                Day off
              </span>
            )}

            {override.note && (
              <p className="mt-1.5 text-xs text-gray-400 italic">{override.note}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit override"
            className="p-1.5 text-gray-400 hover:text-[#1B3163] hover:bg-[#EEF1F8] rounded-lg transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete override"
            className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
