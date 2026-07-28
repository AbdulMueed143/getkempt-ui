"use client";

import { useMemo, useState } from "react";
import { Check, Clock, Plus, Scissors, Package as PackageIcon, Tag } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatMoney } from "@/lib/utils/currency";
import { formatDuration, calculateSaving } from "@/lib/utils/package-calculations";
import { CATEGORY_LABELS, type ServiceCategory } from "@/types/service";
import { stepTitleClass, stepSubClass } from "./shared";
import type {
  BookableService,
  BookablePackage,
  BookingSelection,
  SelectionKind,
} from "@/types/public-booking";

interface Props {
  services:   BookableService[];
  packages:   BookablePackage[];
  loading:    boolean;
  currency:   string;
  selections: BookingSelection[];
  onToggle:   (selection: BookingSelection) => void;
}

export function StepServices({
  services,
  packages,
  loading,
  currency,
  selections,
  onToggle,
}: Props) {
  const [mode, setMode] = useState<SelectionKind>("service");

  const isSelected = (kind: SelectionKind, id: string) =>
    selections.some((s) => s.kind === kind && s.id === id);

  const grouped = useMemo(() => {
    const map = new Map<string, BookableService[]>();
    for (const s of services) {
      const arr = map.get(s.category) ?? [];
      arr.push(s);
      map.set(s.category, arr);
    }
    return Array.from(map.entries());
  }, [services]);

  return (
    <div>
      <h2 className={stepTitleClass}>What would you like?</h2>
      <p className={stepSubClass}>
        Add as many services or packages as you like — mix and match.
      </p>

      {/* Mode toggle */}
      <div className="mt-5 inline-flex rounded-xl bg-indigo-subtle p-1 gap-1">
        {(["service", "package"] as SelectionKind[]).map((m) => {
          const count = selections.filter((s) => s.kind === m).length;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
                mode === m
                  ? "bg-white text-royal-indigo shadow-sm"
                  : "text-ink-500 hover:text-ink-700"
              )}
            >
              {m === "service" ? (
                <Scissors className="h-3.5 w-3.5" />
              ) : (
                <PackageIcon className="h-3.5 w-3.5" />
              )}
              {m === "service" ? "Services" : "Packages"}
              {count > 0 && (
                <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-royal-indigo px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <SkeletonList />
      ) : mode === "service" ? (
        <div className="mt-6 space-y-6">
          {grouped.length === 0 && (
            <p className="text-sm text-ink-400 py-8 text-center">
              No services are available for online booking right now.
            </p>
          )}
          {grouped.map(([category, items]) => (
            <section key={category}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-3">
                {CATEGORY_LABELS[category as ServiceCategory] ?? category}
              </h3>
              <div className="space-y-2.5">
                {items.map((svc) => (
                  <SelectableRow
                    key={svc.id}
                    selected={isSelected("service", svc.id)}
                    title={svc.name}
                    description={svc.description}
                    duration={svc.durationMinutes}
                    price={formatMoney(svc.price, currency)}
                    onClick={() =>
                      onToggle({
                        kind:            "service",
                        id:              svc.id,
                        name:            svc.name,
                        durationMinutes: svc.durationMinutes,
                        price:           svc.price,
                      })
                    }
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-2.5">
          {packages.length === 0 && (
            <p className="text-sm text-ink-400 py-8 text-center">
              No packages are available right now.
            </p>
          )}
          {packages.map((pkg) => {
            const saving = calculateSaving(pkg.basePrice, pkg.price);
            return (
              <SelectableRow
                key={pkg.id}
                selected={isSelected("package", pkg.id)}
                title={pkg.name}
                description={pkg.description}
                duration={pkg.durationMinutes}
                price={formatMoney(pkg.price, currency)}
                oldPrice={saving.amount > 0 ? formatMoney(pkg.basePrice, currency) : undefined}
                badge={
                  saving.amount > 0
                    ? `Save ${formatMoney(saving.amount, currency)}`
                    : undefined
                }
                chips={pkg.serviceNames}
                onClick={() =>
                  onToggle({
                    kind:            "package",
                    id:              pkg.id,
                    name:            pkg.name,
                    durationMinutes: pkg.durationMinutes,
                    price:           pkg.price,
                  })
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function SelectableRow({
  selected,
  title,
  description,
  duration,
  price,
  oldPrice,
  badge,
  chips,
  onClick,
}: {
  selected: boolean;
  title: string;
  description?: string;
  duration: number;
  price: string;
  oldPrice?: string;
  badge?: string;
  chips?: string[];
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "w-full text-left rounded-2xl border-2 p-4 transition-all",
        selected
          ? "border-royal-indigo bg-indigo-subtle/60 shadow-sm"
          : "border-border-soft bg-white hover:border-ink-300"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-ink-900 truncate">{title}</p>
            {badge && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 shrink-0">
                <Tag className="h-2.5 w-2.5" />
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-ink-400 mt-1 line-clamp-2">{description}</p>
          )}
          <p className="text-xs text-ink-500 mt-2 inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(duration)}
          </p>
          {chips && chips.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {chips.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-stone-beige/70 text-ink-500 text-[10px] font-medium px-2 py-0.5"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="text-right">
            {oldPrice && (
              <span className="block text-xs text-ink-300 line-through">{oldPrice}</span>
            )}
            <span className="font-bold text-ink-900">{price}</span>
          </div>
          <span
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all",
              selected
                ? "bg-royal-indigo border-royal-indigo text-white"
                : "border-border-soft text-ink-300"
            )}
          >
            {selected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          </span>
        </div>
      </div>
    </button>
  );
}

function SkeletonList() {
  return (
    <div className="mt-6 space-y-2.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-20 rounded-2xl bg-white border border-border-soft animate-pulse"
        />
      ))}
    </div>
  );
}
