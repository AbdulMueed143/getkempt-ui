"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Users, CalendarCheck, User, MousePointerClick, Mail, Clock, Send } from "lucide-react";
import { campaignSchema, type CampaignSchema } from "@/lib/validations/campaign";
import { dispatchCampaign } from "@/lib/api/campaigns";
import type { CampaignAudience, CampaignPayload } from "@/types/campaign";
import type { Client } from "@/types/client";
import { MOCK_STAFF } from "@/lib/mock/staff";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/cn";

const MAX_MSG_CHARS = 2000;

/* ── Audience counts passed in from the parent ─────────────── */
export interface AudienceCounts {
  all:      number;
  upcoming: number;
  staff:    Record<string, number>;  // staffId → count
  selected: number;
}

interface BroadcastSlideoverProps {
  isOpen:          boolean;
  onClose:         () => void;
  counts:          AudienceCounts;
  presetAudience?: CampaignAudience;  // open with this audience pre-selected
  presetClients?:  Client[];          // pre-filled for "selected" audience
}

const DEFAULT_VALUES: CampaignSchema = {
  audience:    "all",
  staffId:     null,
  channel:     "email",
  subject:     "",
  message:     "",
  scheduledAt: null,
};

export function BroadcastSlideover({
  isOpen, onClose, counts, presetAudience, presetClients,
}: BroadcastSlideoverProps) {
  const toast = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CampaignSchema>({
    resolver:      zodResolver(campaignSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const audience    = watch("audience");
  const staffId     = watch("staffId");
  const message     = watch("message") ?? "";
  const scheduledAt = watch("scheduledAt");
  const isScheduled = scheduledAt != null && scheduledAt !== "";

  /* ── Sync preset when slideover opens ─────────────────── */
  useEffect(() => {
    if (!isOpen) return;
    reset({
      ...DEFAULT_VALUES,
      audience: presetAudience ?? "all",
      staffId:  null,
    });
  }, [isOpen, presetAudience, reset]);

  /* ── Recipient count for selected audience ─────────────── */
  const recipientCount = (() => {
    if (audience === "all")      return counts.all;
    if (audience === "upcoming") return counts.upcoming;
    if (audience === "selected") return counts.selected;
    if (audience === "staff" && staffId) return counts.staff[staffId] ?? 0;
    return 0;
  })();

  /* ── Submit ─────────────────────────────────────────────── */
  const onSubmit = async (values: CampaignSchema) => {
    const payload: CampaignPayload = {
      filter: {
        audience:  values.audience,
        staffId:   values.audience === "staff"    ? values.staffId    : null,
        clientIds: values.audience === "selected" ? (presetClients?.map((c) => c.id) ?? []) : undefined,
      },
      channel:     values.channel,
      subject:     values.subject,
      message:     values.message,
      scheduledAt: values.scheduledAt || null,
    };

    try {
      const result = await dispatchCampaign(payload, recipientCount);
      toast.success({
        title:   result.scheduledAt ? "Campaign scheduled" : "Campaign sent!",
        message: result.scheduledAt
          ? `Will reach ~${result.estimatedCount} clients.`
          : `Queued for ~${result.estimatedCount} clients. Job ID: ${result.jobId.slice(0, 12)}`,
      });
      onClose();
    } catch {
      toast.error({ title: "Failed to send", message: "Please try again." });
    }
  };

  const audienceOptions: {
    key:   CampaignAudience;
    icon:  React.ReactNode;
    label: string;
    desc:  string;
    count: number | null;
  }[] = [
    {
      key:   "all",
      icon:  <Users size={16} />,
      label: "All clients",
      desc:  "Everyone who has ever booked",
      count: counts.all,
    },
    {
      key:   "upcoming",
      icon:  <CalendarCheck size={16} />,
      label: "Upcoming bookings",
      desc:  "Clients with a future booking",
      count: counts.upcoming,
    },
    {
      key:   "staff",
      icon:  <User size={16} />,
      label: "Specific staff",
      desc:  "Clients of one team member",
      count: audience === "staff" && staffId ? counts.staff[staffId] ?? 0 : null,
    },
    {
      key:   "selected",
      icon:  <MousePointerClick size={16} />,
      label: "Selected clients",
      desc:  "Your manual selection from the list",
      count: counts.selected,
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-[520px] z-50 flex flex-col",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{ backgroundColor: "#FFFFFF", boxShadow: "-4px 0 24px rgba(27,49,99,0.12)" }}
      >
        {/* ── Header ──────────────────────────────── */}
        <div
          className="flex items-center justify-between px-6 py-5 shrink-0"
          style={{ borderBottom: "1px solid #E8ECF4" }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: "#1B3163" }}>Send Campaign</h2>
            <p className="text-xs mt-0.5" style={{ color: "#8E95A5" }}>
              Reach your clients via email — the backend handles delivery
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#F0F3FA", color: "#1B3163" }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Form body ───────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <form id="campaign-form" onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* ── 1. Recipients ───────────────────── */}
            <SlidSection icon={<Users size={15} />} title="1. Choose recipients">
              {errors.audience?.message && (
                <p className="text-xs text-red-500">⚠ {errors.audience.message}</p>
              )}

              <div className="grid grid-cols-2 gap-2">
                {audienceOptions.map((opt) => {
                  const isActive = audience === opt.key;
                  const disabled = opt.key === "selected" && counts.selected === 0;
                  return (
                    <label
                      key={opt.key}
                      className={cn(
                        "flex flex-col gap-1 p-3 rounded-xl cursor-pointer transition-all",
                        disabled && "opacity-40 cursor-not-allowed"
                      )}
                      style={{
                        border:          `1.5px solid ${isActive ? "#1B3163" : "#E8ECF4"}`,
                        backgroundColor: isActive ? "#EEF1F8" : "#F8F9FC",
                      }}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        value={opt.key}
                        disabled={disabled}
                        {...register("audience")}
                      />
                      <div className="flex items-center justify-between">
                        <span style={{ color: isActive ? "#1B3163" : "#6B7A99" }}>{opt.icon}</span>
                        {opt.count != null && (
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums"
                            style={{ backgroundColor: isActive ? "#1B3163" : "#E8ECF4", color: isActive ? "#EAEAEA" : "#6B7A99" }}
                          >
                            {opt.count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold" style={{ color: isActive ? "#1B3163" : "#374151" }}>
                        {opt.label}
                      </p>
                      <p className="text-[11px] leading-snug" style={{ color: "#8E95A5" }}>
                        {opt.desc}
                      </p>
                    </label>
                  );
                })}
              </div>

              {/* Staff selector — shown when audience = "staff" */}
              {audience === "staff" && (
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "#8E95A5" }}>
                    Select staff member <span style={{ color: "#D5B584" }}>*</span>
                  </label>
                  <select
                    className="w-full rounded-xl text-sm py-2.5 px-3 appearance-none"
                    style={{ backgroundColor: "#F8F9FC", border: `1px solid ${errors.staffId ? "#EF4444" : "#E8ECF4"}`, color: "#1B3163", outline: "none" }}
                    {...register("staffId")}
                    defaultValue=""
                  >
                    <option value="" disabled>Choose a staff member…</option>
                    {MOCK_STAFF.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} — {counts.staff[s.id] ?? 0} clients
                      </option>
                    ))}
                  </select>
                  {errors.staffId?.message && (
                    <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{errors.staffId.message}</p>
                  )}
                </div>
              )}

              {/* Recipient count summary */}
              {recipientCount > 0 && (
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
                  style={{ backgroundColor: "#EEF1F8", border: "1px solid #C7D2E8" }}
                >
                  <Mail size={14} style={{ color: "#1B3163" }} />
                  <span style={{ color: "#1B3163" }}>
                    This campaign will reach <strong>{recipientCount}</strong> client{recipientCount !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </SlidSection>

            {/* ── 2. Compose ──────────────────────── */}
            <SlidSection icon={<Mail size={15} />} title="2. Compose message">

              <FieldWrap label="Channel" required>
                <div
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
                  style={{ backgroundColor: "#F8F9FC", border: "1px solid #E8ECF4", color: "#1B3163" }}
                >
                  <Mail size={14} />
                  <span className="font-medium">Email</span>
                  <span className="text-xs ml-auto" style={{ color: "#8E95A5" }}>SMS & push notifications coming soon</span>
                </div>
              </FieldWrap>

              <FieldWrap label="Subject" error={errors.subject?.message} required>
                  <input
                  placeholder="e.g. Special offer just for you!"
                  className="w-full rounded-lg text-sm px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1B3163] focus:bg-white"
                  style={{ backgroundColor: "#F8F9FC", border: `1px solid ${errors.subject ? "#EF4444" : "#E8ECF4"}`, color: "#1B3163" }}
                  {...register("subject")}
                />
              </FieldWrap>

              <FieldWrap label="Message" error={errors.message?.message} required>
                <div className="relative">
                  <textarea
                    placeholder={"Hi {{firstName}},\n\nWe'd love to see you back…"}
                    rows={7}
                    maxLength={MAX_MSG_CHARS}
                    className="w-full rounded-lg text-sm px-4 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-[#1B3163] focus:bg-white"
                    style={{
                      backgroundColor: "#F8F9FC",
                      border:          `1px solid ${errors.message ? "#EF4444" : "#E8ECF4"}`,
                      color:           "#1B3163",
                    }}
                    {...register("message")}
                  />
                  <span
                    className="absolute bottom-2.5 right-3 text-[10px] tabular-nums"
                    style={{ color: message.length > MAX_MSG_CHARS * 0.9 ? "#D97706" : "#8E95A5" }}
                  >
                    {MAX_MSG_CHARS - message.length} remaining
                  </span>
                </div>
                <p className="text-[11px] flex items-center gap-1" style={{ color: "#8E95A5" }}>
                  <span>💡</span>
                  Use <code className="text-[10px] px-1 rounded" style={{ backgroundColor: "#EEF1F8", color: "#1B3163" }}>{"{{firstName}}"}</code> to personalise each message
                </p>
              </FieldWrap>
            </SlidSection>

            {/* ── 3. Schedule ─────────────────────── */}
            <SlidSection icon={<Clock size={15} />} title="3. Schedule">

              <div className="space-y-2">
                <label className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors"
                  style={{ border: `1.5px solid ${!isScheduled ? "#1B3163" : "#E8ECF4"}`, backgroundColor: !isScheduled ? "#EEF1F8" : "#F8F9FC" }}>
                  <input
                    type="radio"
                    className="accent-[#1B3163]"
                    checked={!isScheduled}
                    onChange={() => setValue("scheduledAt", null)}
                  />
                  <div>
                    <p className="text-sm font-medium" style={{ color: !isScheduled ? "#1B3163" : "#374151" }}>
                      Send immediately
                    </p>
                    <p className="text-xs" style={{ color: "#8E95A5" }}>
                      Campaign is queued as soon as you confirm
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors"
                  style={{ border: `1.5px solid ${isScheduled ? "#1B3163" : "#E8ECF4"}`, backgroundColor: isScheduled ? "#EEF1F8" : "#F8F9FC" }}>
                  <input
                    type="radio"
                    className="accent-[#1B3163] mt-0.5"
                    checked={isScheduled}
                    onChange={() => setValue("scheduledAt", new Date(Date.now() + 3600000).toISOString().slice(0, 16))}
                  />
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="text-sm font-medium" style={{ color: isScheduled ? "#1B3163" : "#374151" }}>
                        Schedule for later
                      </p>
                      <p className="text-xs" style={{ color: "#8E95A5" }}>
                        Pick a date and time — backend handles delivery
                      </p>
                    </div>
                    {isScheduled && (
                      <input
                        type="datetime-local"
                        className="w-full rounded-lg text-sm px-3 py-2"
                        style={{ backgroundColor: "white", border: "1px solid #E8ECF4", color: "#1B3163", outline: "none" }}
                        min={new Date().toISOString().slice(0, 16)}
                        {...register("scheduledAt")}
                      />
                    )}
                  </div>
                </label>
              </div>
            </SlidSection>

          </form>
        </div>

        {/* ── Footer ──────────────────────────────── */}
        <div
          className="flex items-center justify-between gap-3 px-6 py-4 shrink-0"
          style={{ borderTop: "1px solid #E8ECF4" }}
        >
          <div className="text-xs" style={{ color: "#8E95A5" }}>
            {recipientCount > 0
              ? `~${recipientCount} recipients`
              : "Select an audience above"}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{ backgroundColor: "#F0F3FA", color: "#1B3163", border: "1px solid #E8ECF4" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="campaign-form"
              disabled={isSubmitting || recipientCount === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#1B3163", color: "#EAEAEA" }}
              onMouseEnter={(e) => { if (!isSubmitting && recipientCount > 0) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#142548"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1B3163"; }}
            >
              <Send size={14} />
              {isSubmitting
                ? "Sending…"
                : isScheduled
                  ? `Schedule — ${recipientCount} clients`
                  : `Send now — ${recipientCount} clients`}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ── Micro-components ─────────────────────────────────────── */
function SlidSection({
  icon, title, children,
}: {
  icon: React.ReactNode; title: string; children: React.ReactNode;
}) {
  return (
    <div className="px-6 py-5 space-y-4" style={{ borderBottom: "1px solid #F0F3FA" }}>
      <div className="flex items-center gap-2">
        <span style={{ color: "#1B3163" }}>{icon}</span>
        <h3 className="text-sm font-semibold" style={{ color: "#1B3163" }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function FieldWrap({
  label, error, required, children,
}: {
  label: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "#8E95A5" }}>
        {label}{required && <span className="text-[#D5B584] ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{error}</p>
      )}
    </div>
  );
}
