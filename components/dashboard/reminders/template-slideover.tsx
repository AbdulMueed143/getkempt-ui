"use client";

import { useState, useRef } from "react";
import { X, Mail, MessageSquare, Smartphone, ChevronDown, ChevronUp, Plus, Trash2, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type {
  ReminderRule, ReminderChannel, ReminderEvent, ReminderTiming,
  TimingDirection, TimingUnit,
} from "@/types/reminders";
import {
  EVENT_META, CHANNEL_LABELS, CHANNEL_COLORS,
  TIMING_PRESETS, TEMPLATE_VARIABLES,
} from "@/types/reminders";

interface Props {
  rule:      ReminderRule;
  isNew?:    boolean;
  onSave:    (updated: ReminderRule) => void;
  onClose:   () => void;
}

type ChannelTab = ReminderChannel;

const ALL_CHANNELS: ReminderChannel[] = ["email", "sms", "push"];

const CHANNEL_ICONS: Record<ReminderChannel, React.ElementType> = {
  email: Mail,
  sms:   MessageSquare,
  push:  Smartphone,
};

const ALL_EVENTS: ReminderEvent[] = [
  "booking_confirmed",
  "appointment_reminder",
  "appointment_followup",
  "booking_cancelled",
  "booking_rescheduled",
];

const TIMING_DIRECTIONS: { value: TimingDirection; label: string }[] = [
  { value: "immediately", label: "Immediately" },
  { value: "before",      label: "Before appointment" },
  { value: "after",       label: "After appointment" },
];

const TIMING_UNITS: TimingUnit[] = ["minutes", "hours", "days"];

function insertAtCursor(
  ref: React.RefObject<HTMLTextAreaElement | null>,
  text: string,
  onChange: (v: string) => void
) {
  const el = ref.current;
  if (!el) return;
  const start = el.selectionStart ?? el.value.length;
  const end   = el.selectionEnd   ?? el.value.length;
  const next  = el.value.slice(0, start) + text + el.value.slice(end);
  onChange(next);
  setTimeout(() => {
    el.focus();
    el.setSelectionRange(start + text.length, start + text.length);
  }, 0);
}

export function TemplateSlideover({ rule, isNew = false, onSave, onClose }: Props) {
  const [draft,       setDraft]       = useState<ReminderRule>({ ...rule, template: { ...rule.template } });
  const [activeTab,   setActiveTab]   = useState<ChannelTab>("email");
  const [showVars,    setShowVars]    = useState(false);
  const [isSaving,    setIsSaving]    = useState(false);

  const emailBodyRef = useRef<HTMLTextAreaElement>(null);
  const smsBodyRef   = useRef<HTMLTextAreaElement>(null);
  const pushBodyRef  = useRef<HTMLTextAreaElement>(null);

  const activeRefs: Record<ChannelTab, React.RefObject<HTMLTextAreaElement | null>> = {
    email: emailBodyRef,
    sms:   smsBodyRef,
    push:  pushBodyRef,
  };

  const meta = EVENT_META[draft.event];

  function toggleChannel(ch: ReminderChannel) {
    setDraft((d) => ({
      ...d,
      channels: d.channels.includes(ch)
        ? d.channels.filter((c) => c !== ch)
        : [...d.channels, ch],
    }));
  }

  function setTiming(partial: Partial<ReminderTiming>) {
    setDraft((d) => ({ ...d, timing: { ...d.timing, ...partial } }));
  }

  function applyPreset(timing: ReminderTiming) {
    setDraft((d) => ({ ...d, timing }));
  }

  function setTemplate(key: keyof ReminderRule["template"], value: string) {
    setDraft((d) => ({ ...d, template: { ...d.template, [key]: value } }));
  }

  async function handleSave() {
    if (draft.channels.length === 0) return;
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    onSave(draft);
    setIsSaving(false);
  }

  const inp = "w-full text-sm text-gray-900 border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3163] focus:border-transparent placeholder:text-gray-400 transition-colors hover:border-gray-300";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 h-full w-full max-w-2xl bg-white flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{meta.icon}</span>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                {isNew ? "Add reminder rule" : `Edit — ${meta.label}`}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">{meta.description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ── Section 1: Rule settings ── */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">
              Rule settings
            </h3>

            {/* Event type (only shown for new rules) */}
            {isNew && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Event type</label>
                <select
                  value={draft.event}
                  onChange={(e) => setDraft((d) => ({ ...d, event: e.target.value as ReminderEvent }))}
                  className={inp}
                >
                  {ALL_EVENTS.map((ev) => (
                    <option key={ev} value={ev}>{EVENT_META[ev].label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Timing */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">When to send</label>

              {/* Quick presets */}
              <div className="flex flex-wrap gap-1.5">
                {TIMING_PRESETS.map((p) => {
                  const active =
                    p.timing.direction === draft.timing.direction &&
                    (p.timing.direction === "immediately" ||
                      (p.timing.value === draft.timing.value && p.timing.unit === draft.timing.unit));
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyPreset(p.timing)}
                      className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-full border transition-all",
                        active
                          ? "bg-[#1B3163] text-white border-[#1B3163]"
                          : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                      )}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom timing row */}
              {draft.timing.direction !== "immediately" && (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={draft.timing.value}
                    onChange={(e) => setTiming({ value: Number(e.target.value) })}
                    className={cn(inp, "w-20")}
                  />
                  <select
                    value={draft.timing.unit}
                    onChange={(e) => setTiming({ unit: e.target.value as TimingUnit })}
                    className={cn(inp, "flex-1")}
                  >
                    {TIMING_UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  <select
                    value={draft.timing.direction}
                    onChange={(e) => setTiming({ direction: e.target.value as TimingDirection })}
                    className={cn(inp, "flex-1")}
                  >
                    {TIMING_DIRECTIONS.filter((d) => d.value !== "immediately").map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Channels */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">Send via</label>
              <div className="flex flex-wrap gap-2">
                {ALL_CHANNELS.map((ch) => {
                  const colors  = CHANNEL_COLORS[ch];
                  const Icon    = CHANNEL_ICONS[ch];
                  const checked = draft.channels.includes(ch);
                  return (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => toggleChannel(ch)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-all",
                        checked
                          ? "ring-2"
                          : "opacity-50 hover:opacity-80"
                      )}
                      style={checked ? {
                        backgroundColor: colors.bg,
                        borderColor:     colors.border,
                        color:           colors.text,
                        outlineColor:    colors.border,
                      } : {
                        borderColor: "#E5E7EB",
                        color:       "#6B7280",
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      {CHANNEL_LABELS[ch]}
                    </button>
                  );
                })}
              </div>
              {draft.channels.length === 0 && (
                <p className="text-xs text-rose-500">Select at least one channel.</p>
              )}
            </div>
          </section>

          {/* ── Section 2: Template editor ── */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">
                Message templates
              </h3>
              <button
                type="button"
                onClick={() => setShowVars((v) => !v)}
                className="flex items-center gap-1 text-xs text-[#1B3163] font-semibold hover:underline"
              >
                <Info className="w-3.5 h-3.5" />
                Variables
                {showVars ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Variables reference */}
            {showVars && (
              <div className="bg-[#F8F9FC] border border-[#E5EAF4] rounded-xl p-3">
                <p className="text-xs font-semibold text-[#1B3163] mb-2">
                  Click a variable to insert it at the cursor
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {TEMPLATE_VARIABLES.map((v) => (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => {
                        const ref = activeRefs[activeTab];
                        const bodyKey =
                          activeTab === "email" ? "emailBody" :
                          activeTab === "sms"   ? "smsBody"   : "pushBody";
                        insertAtCursor(ref, v.key, (val) => setTemplate(bodyKey, val));
                      }}
                      className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-1 bg-white border border-[#C7D2E8] text-[#1B3163] rounded-lg hover:bg-[#EEF1F8] transition-colors"
                      title={`Example: ${v.example}`}
                    >
                      {v.key}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Hover a variable to see an example value</p>
              </div>
            )}

            {/* Channel tabs */}
            <div className="flex gap-0 bg-gray-100 rounded-xl p-1">
              {(draft.channels.length > 0 ? draft.channels : ALL_CHANNELS).map((ch) => {
                const colors = CHANNEL_COLORS[ch];
                const Icon   = CHANNEL_ICONS[ch];
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setActiveTab(ch)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
                      activeTab === ch ? "bg-white shadow-sm" : "text-gray-400 hover:text-gray-600"
                    )}
                    style={activeTab === ch ? { color: colors.text } : {}}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {CHANNEL_LABELS[ch]}
                  </button>
                );
              })}
            </div>

            {/* Email template */}
            {activeTab === "email" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Subject line</label>
                  <input
                    type="text"
                    value={draft.template.emailSubject}
                    onChange={(e) => setTemplate("emailSubject", e.target.value)}
                    placeholder="Email subject…"
                    className={inp}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Body</label>
                  <textarea
                    ref={emailBodyRef}
                    value={draft.template.emailBody}
                    onChange={(e) => setTemplate("emailBody", e.target.value)}
                    rows={10}
                    placeholder="Email body…"
                    className={cn(inp, "resize-y font-mono text-xs leading-relaxed")}
                  />
                  <p className="text-[10px] text-gray-400 text-right">{draft.template.emailBody.length} chars</p>
                </div>
              </div>
            )}

            {/* SMS template */}
            {activeTab === "sms" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700">SMS message</label>
                  <span
                    className={cn(
                      "text-[10px] font-bold",
                      draft.template.smsBody.length > 160 ? "text-amber-600" : "text-gray-400"
                    )}
                  >
                    {draft.template.smsBody.length} / 160{draft.template.smsBody.length > 160 ? ` (${Math.ceil(draft.template.smsBody.length / 160)} SMS)` : ""}
                  </span>
                </div>
                <textarea
                  ref={smsBodyRef}
                  value={draft.template.smsBody}
                  onChange={(e) => setTemplate("smsBody", e.target.value)}
                  rows={5}
                  placeholder="SMS body…"
                  className={cn(inp, "resize-none font-mono text-xs")}
                />
                <p className="text-[10px] text-gray-400">
                  Messages over 160 characters are split into multiple SMS — each costs 1 credit.
                </p>
              </div>
            )}

            {/* Push template */}
            {activeTab === "push" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Notification title</label>
                  <input
                    type="text"
                    value={draft.template.pushTitle}
                    onChange={(e) => setTemplate("pushTitle", e.target.value)}
                    placeholder="Push title…"
                    maxLength={65}
                    className={inp}
                  />
                  <p className="text-[10px] text-gray-400 text-right">
                    {draft.template.pushTitle.length}/65
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Notification body</label>
                  <textarea
                    ref={pushBodyRef}
                    value={draft.template.pushBody}
                    onChange={(e) => setTemplate("pushBody", e.target.value)}
                    rows={3}
                    placeholder="Push body…"
                    maxLength={240}
                    className={cn(inp, "resize-none")}
                  />
                  <p className="text-[10px] text-gray-400 text-right">
                    {draft.template.pushBody.length}/240
                  </p>
                </div>

                {/* Push preview card */}
                <div className="bg-gray-900 rounded-2xl p-4">
                  <p className="text-[10px] text-gray-500 mb-2 font-medium uppercase tracking-wide">
                    Preview
                  </p>
                  <div className="bg-white/10 rounded-xl px-3 py-2.5 flex gap-2.5 items-start">
                    <div className="w-8 h-8 rounded-lg bg-[#1B3163] flex items-center justify-center shrink-0 text-sm">✂️</div>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">
                        {draft.template.pushTitle || "Notification title"}
                      </p>
                      <p className="text-[11px] text-white/70 mt-0.5 leading-snug">
                        {draft.template.pushBody || "Notification body text"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || draft.channels.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1B3163] text-white text-sm font-bold rounded-xl hover:bg-[#243F80] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? "Saving…" : isNew ? "Add rule" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
