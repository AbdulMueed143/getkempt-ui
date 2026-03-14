"use client";

import { useState } from "react";
import { Plus, Info } from "lucide-react";
import { LoyaltyStats } from "./loyalty-stats";
import { LoyaltyJourney } from "./loyalty-journey";
import { LoyaltyProgramCard } from "./loyalty-program-card";
import { LoyaltySlideover } from "./loyalty-slideover";
import { MOCK_LOYALTY_PROGRAMS } from "@/lib/mock/loyalty";
import type { LoyaltyProgram } from "@/types/loyalty";
import type { LoyaltyProgramSchema } from "@/lib/validations/loyalty";
import { useConfirm } from "@/hooks/use-confirm";
import { useToast } from "@/hooks/use-toast";

export function LoyaltyPageClient() {
  const [programs,      setPrograms]      = useState<LoyaltyProgram[]>(MOCK_LOYALTY_PROGRAMS);
  const [slideoverOpen, setSlideoverOpen] = useState(false);
  const [editing,       setEditing]       = useState<LoyaltyProgram | null>(null);

  const confirm = useConfirm();
  const toast   = useToast();

  /* ── Sorted by sequenceOrder ────────────────────────── */
  const sorted = [...programs].sort((a, b) => a.sequenceOrder - b.sequenceOrder);

  /* ── Handlers ───────────────────────────────────────── */
  const handleSave = (values: LoyaltyProgramSchema, editingId?: string) => {
    if (editingId) {
      setPrograms((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                ...values,
                rewardValue:    values.rewardValue    ?? null,
                partnerName:    values.partnerName    ?? null,
                partnerAddress: values.partnerAddress ?? null,
                programExpiryDate: values.programExpiryDate || null,
                rewardExpiryDays:  values.rewardExpiryDays  ?? null,
              }
            : p
        )
      );
      toast.success({ title: "Program updated", message: `"${values.name}" has been saved.` });
    } else {
      const nextOrder = programs.length > 0
        ? Math.max(...programs.map((p) => p.sequenceOrder)) + 1
        : 1;
      const newProgram: LoyaltyProgram = {
        id:             `lp-${Date.now()}`,
        sequenceOrder:  nextOrder,
        ...values,
        rewardValue:    values.rewardValue    ?? null,
        partnerName:    values.partnerName    ?? null,
        partnerAddress: values.partnerAddress ?? null,
        programExpiryDate: values.programExpiryDate || null,
        rewardExpiryDays:  values.rewardExpiryDays  ?? null,
        totalEarned:    0,
        totalRedeemed:  0,
        createdAt:      new Date().toISOString(),
      };
      setPrograms((prev) => [...prev, newProgram]);
      toast.success({
        title:   "Program added",
        message: `"${values.name}" is now program #${nextOrder} in your loyalty ladder.`,
      });
    }
  };

  const handleEdit = (program: LoyaltyProgram) => {
    setEditing(program);
    setSlideoverOpen(true);
  };

  const handleDelete = async (id: string) => {
    const program = programs.find((p) => p.id === id);
    if (!program) return;

    const ok = await confirm({
      variant:      "danger",
      title:        "Remove loyalty program?",
      message:      `"${program.name}" will be permanently deleted.`,
      detail:       "Clients who are currently working toward this reward will lose their progress. This cannot be undone.",
      confirmLabel: "Yes, remove",
    });

    if (ok) {
      setPrograms((prev) => {
        /* Remove program and re-sequence remaining ones */
        const remaining = prev
          .filter((p) => p.id !== id)
          .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
          .map((p, idx) => ({ ...p, sequenceOrder: idx + 1 }));
        return remaining;
      });
      toast.success({
        title:   "Program removed",
        message: `"${program.name}" has been deleted and the sequence re-ordered.`,
      });
    }
  };

  const handleAdd = () => {
    setEditing(null);
    setSlideoverOpen(true);
  };

  /* ── Render ─────────────────────────────────────────── */
  return (
    <>
      <div className="space-y-6">

        {/* ── Page header ────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3163" }}>Loyalty System</h1>
            <p className="text-sm mt-0.5" style={{ color: "#8E95A5" }}>
              Build a ladder of rewards to keep clients coming back.
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ backgroundColor: "#1B3163", color: "#EAEAEA" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#142548"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1B3163"; }}
          >
            <Plus size={16} />
            Add Program
          </button>
        </div>

        {/* ── How it works callout ────────────────────── */}
        <div
          className="flex gap-3 px-4 py-3.5 rounded-2xl text-sm"
          style={{ backgroundColor: "#EEF1F8", border: "1px solid #C7D2E8" }}
        >
          <Info size={16} className="shrink-0 mt-0.5" style={{ color: "#1B3163" }} />
          <div style={{ color: "#1B3163" }}>
            <span className="font-semibold">One program at a time. </span>
            Each client is always working toward a single reward — whichever program
            they are closest to completing next. Once they earn it, they automatically
            advance to the next program in the sequence.
          </div>
        </div>

        {/* ── Stats ──────────────────────────────────── */}
        <LoyaltyStats programs={programs} />

        {/* ── Journey flow ───────────────────────────── */}
        {sorted.some((p) => p.status === "active") && (
          <LoyaltyJourney programs={sorted} />
        )}

        {/* ── Program list ───────────────────────────── */}
        {sorted.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm mb-4" style={{ color: "#8E95A5" }}>
              No loyalty programs yet. Add your first one to get started!
            </p>
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "#1B3163", color: "#EAEAEA" }}
            >
              <Plus size={15} />
              Add your first program
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
            {sorted.map((program) => (
              <LoyaltyProgramCard
                key={program.id}
                program={program}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <LoyaltySlideover
        isOpen={slideoverOpen}
        onClose={() => { setSlideoverOpen(false); setEditing(null); }}
        onSave={handleSave}
        editing={editing}
      />
    </>
  );
}
