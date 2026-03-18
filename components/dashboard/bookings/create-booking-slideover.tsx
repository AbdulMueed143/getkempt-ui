"use client";

import { useState, useMemo, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Check, Clock, DollarSign, User, Package, Scissors } from "lucide-react";
import { MOCK_STAFF } from "@/lib/mock/staff";
import { MOCK_SERVICES } from "@/lib/mock/services";
import { MOCK_PACKAGES } from "@/lib/mock/packages";
import { MOCK_CLIENTS } from "@/lib/mock/clients";
import { generateSlots, minsToDisplay, toLocalDate } from "@/lib/utils/booking-slots";
import { STAFF_CAL_COLORS } from "@/types/booking";
import type { Booking } from "@/types/booking";
import { cn } from "@/lib/utils/cn";

/* ── Shared input style ─────────────────────────────────────── */
const inp = (err?: boolean) =>
  cn(
    "w-full text-sm text-gray-900 border rounded-xl px-3 py-2.5 bg-white transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-[#1B3163] focus:border-transparent placeholder:text-gray-400",
    err ? "border-rose-300" : "border-gray-200 hover:border-gray-300"
  );

interface Props {
  isOpen:      boolean;
  onClose:     () => void;
  onSave:      (booking: Omit<Booking, "id" | "createdAt">) => void;
  allBookings: Booking[];
  /** If provided → edit mode */
  editBooking?: Booking | null;
}

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS: Record<Step, string> = {
  1: "Staff",
  2: "Service",
  3: "Date & Time",
  4: "Client",
};

type ServiceMode = "service" | "package";

export function CreateBookingSlideover({
  isOpen, onClose, onSave, allBookings, editBooking,
}: Props) {
  const isEdit = !!editBooking;

  /* ── Form state ── */
  const [step,        setStep]       = useState<Step>(1);
  const [staffId,     setStaffId]    = useState(editBooking?.staffId ?? "");
  const [svcMode,     setSvcMode]    = useState<ServiceMode>("service");
  const [serviceId,   setServiceId]  = useState(editBooking?.serviceId ?? "");
  const [packageId,   setPackageId]  = useState(editBooking?.packageId ?? "");
  const [date,        setDate]       = useState(editBooking ? toLocalDate(editBooking.startAt) : "");
  const [startTime,   setStartTime]  = useState(""); // "HH:MM"
  const [clientName,  setClientName] = useState(editBooking?.clientName  ?? "");
  const [clientPhone, setClientPhone]= useState(editBooking?.clientPhone ?? "");
  const [clientEmail, setClientEmail]= useState(editBooking?.clientEmail ?? "");
  const [notes,       setNotes]      = useState(editBooking?.notes ?? "");
  const [clientSearch, setClientSearch] = useState("");
  const [isSaving,    setIsSaving]   = useState(false);

  /* Sync if editBooking changes */
  useEffect(() => {
    if (editBooking) {
      setStaffId(editBooking.staffId);
      setServiceId(editBooking.serviceId ?? "");
      setPackageId(editBooking.packageId ?? "");
      setDate(toLocalDate(editBooking.startAt));
      setStartTime(
        new Date(editBooking.startAt).toLocaleTimeString("en-CA", {
          hour: "2-digit", minute: "2-digit", hour12: false,
        })
      );
      setClientName(editBooking.clientName);
      setClientPhone(editBooking.clientPhone ?? "");
      setClientEmail(editBooking.clientEmail ?? "");
      setNotes(editBooking.notes ?? "");
      setSvcMode(editBooking.packageId ? "package" : "service");
    }
  }, [editBooking]);

  /* Reset on close */
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      if (!isEdit) {
        setStaffId(""); setServiceId(""); setPackageId(""); setDate("");
        setStartTime(""); setClientName(""); setClientPhone("");
        setClientEmail(""); setNotes("");
      }
    }
  }, [isOpen, isEdit]);

  /* ── Derived data ── */
  const selectedStaff   = MOCK_STAFF.find((s) => s.id === staffId);
  const selectedService = MOCK_SERVICES.find((s) => s.id === serviceId);
  const selectedPackage = MOCK_PACKAGES.find((p) => p.id === packageId);

  const durationMins = svcMode === "package"
    ? (selectedPackage?.customDurationMinutes
        ?? selectedPackage?.serviceIds?.reduce((acc, sid) => {
          const s = MOCK_SERVICES.find((x) => x.id === sid);
          return acc + (s?.durationMinutes ?? 0);
        }, 0)
        ?? 0)
    : (selectedService?.durationMinutes ?? 0);

  const price = useMemo(() => {
    if (svcMode === "service") return selectedService?.price ?? 0;
    if (!selectedPackage) return 0;
    const basePrice = selectedPackage.serviceIds.reduce((acc, sid) => {
      return acc + (MOCK_SERVICES.find((x) => x.id === sid)?.price ?? 0);
    }, 0);
    if (!selectedPackage.discountEnabled || !selectedPackage.discountType || !selectedPackage.discountValue) return basePrice;
    if (selectedPackage.discountType === "percentage") return basePrice * (1 - selectedPackage.discountValue / 100);
    return Math.max(0, basePrice - selectedPackage.discountValue);
  }, [svcMode, selectedService, selectedPackage]);

  const availableSlots = useMemo(() => {
    if (!staffId || !date || durationMins <= 0) return [];
    return generateSlots(staffId, date, durationMins, allBookings);
  }, [staffId, date, durationMins, allBookings]);

  const filteredClients = MOCK_CLIENTS.filter((c) => {
    if (!clientSearch) return false;
    const q = clientSearch.toLowerCase();
    return (
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  }).slice(0, 5);

  /* ── Step validation ── */
  const canAdvance: Record<Step, boolean> = {
    1: !!staffId,
    2: svcMode === "service" ? !!serviceId : !!packageId,
    3: !!date && !!startTime,
    4: !!clientName,
  };

  /* ── Save ── */
  async function handleSave() {
    if (!staffId || !date || !startTime || !clientName || durationMins <= 0) return;
    setIsSaving(true);

    const [y, m, d] = date.split("-").map(Number);
    const [h, min]  = startTime.split(":").map(Number);
    const startAt   = new Date(Date.UTC(y, m - 1, d, h - 11, min)).toISOString(); // AEDT→UTC
    const endAt     = new Date(new Date(startAt).getTime() + durationMins * 60_000).toISOString();

    const staff  = MOCK_STAFF.find((s) => s.id === staffId)!;
    const svcName = svcMode === "package"
      ? (selectedPackage?.name ?? "")
      : (selectedService?.name ?? "");

    await new Promise((r) => setTimeout(r, 400));

    onSave({
      clientName, clientPhone, clientEmail,
      staffId, staffName: `${staff.firstName} ${staff.lastName}`,
      serviceId:  svcMode === "service" ? serviceId : undefined,
      packageId:  svcMode === "package" ? packageId : undefined,
      serviceName: svcName,
      durationMinutes: durationMins,
      price,
      startAt, endAt,
      status: "confirmed",
      source: "manual",
      notes: notes || undefined,
    });

    setIsSaving(false);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-lg bg-white flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {isEdit ? "Edit Booking" : "New Booking"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Step {step} of 4 — {STEP_LABELS[step]}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100 shrink-0">
          <div
            className="h-full bg-[#1B3163] transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="grid grid-cols-4 border-b border-gray-100 shrink-0">
          {([1, 2, 3, 4] as Step[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => step > s && setStep(s)}
              className={cn(
                "py-2.5 flex flex-col items-center gap-0.5 text-xs transition-colors",
                step === s
                  ? "text-[#1B3163] font-semibold"
                  : step > s
                  ? "text-emerald-600 cursor-pointer hover:bg-gray-50"
                  : "text-gray-400 cursor-default"
              )}
            >
              <span
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                  step === s
                    ? "bg-[#1B3163] text-white"
                    : step > s
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-gray-100 text-gray-400"
                )}
              >
                {step > s ? <Check className="w-3 h-3" /> : s}
              </span>
              <span className="hidden sm:inline">{STEP_LABELS[s]}</span>
            </button>
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ── Step 1: Staff ── */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-4">Who will be performing the service?</p>
              <div className="grid grid-cols-1 gap-2">
                {MOCK_STAFF.map((s) => {
                  const color    = STAFF_CAL_COLORS[s.id] ?? "#1B3163";
                  const selected = staffId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { setStaffId(s.id); setStep(2); }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all",
                        selected
                          ? "border-[#1B3163] bg-[#EEF1F8]"
                          : "border-gray-100 hover:border-gray-200 bg-white"
                      )}
                    >
                      {s.avatarImage ? (
                        <img src={s.avatarImage} alt={s.firstName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          {s.firstName[0]}{s.lastName[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{s.firstName} {s.lastName}</p>
                        <p className="text-xs text-gray-500 truncate">{s.specialization}</p>
                      </div>
                      {selected && <Check className="w-4 h-4 text-[#1B3163] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Step 2: Service / Package ── */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">What service are you booking?</p>

              {/* Toggle */}
              <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
                {(["service", "package"] as ServiceMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSvcMode(m)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm font-semibold transition-all",
                      svcMode === m
                        ? "bg-white text-[#1B3163] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    {m === "service" ? <Scissors className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
                    {m === "service" ? "Service" : "Package"}
                  </button>
                ))}
              </div>

              {/* Service list */}
              {svcMode === "service" && (
                <div className="space-y-2">
                  {MOCK_SERVICES.map((svc) => {
                    const sel = serviceId === svc.id;
                    return (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => setServiceId(svc.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all",
                          sel ? "border-[#1B3163] bg-[#EEF1F8]" : "border-gray-100 hover:border-gray-200"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Scissors className="w-4 h-4 text-gray-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{svc.name}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />{svc.durationMinutes}m
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-bold text-gray-700">${svc.price}</span>
                          {sel && <Check className="w-4 h-4 text-[#1B3163]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Package list */}
              {svcMode === "package" && (
                <div className="space-y-2">
                  {MOCK_PACKAGES.map((pkg) => {
                    const sel = packageId === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setPackageId(pkg.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all",
                          sel ? "border-[#1B3163] bg-[#EEF1F8]" : "border-gray-100 hover:border-gray-200"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Package className="w-4 h-4 text-gray-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{pkg.name}</p>
                            <p className="text-xs text-gray-400">{pkg.serviceIds?.length ?? 0} services included</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-bold text-gray-700">
                            ${pkg.serviceIds.reduce((a, sid) => a + (MOCK_SERVICES.find(x => x.id === sid)?.price ?? 0), 0)}
                          </span>
                          {sel && <Check className="w-4 h-4 text-[#1B3163]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Date & Time ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Select Date</label>
                <input
                  type="date"
                  value={date}
                  min={new Date().toLocaleDateString("en-CA")}
                  onChange={(e) => { setDate(e.target.value); setStartTime(""); }}
                  className={inp(!date)}
                />
              </div>

              {date && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-700">Available Slots</label>
                    <span className="text-xs text-gray-400">
                      {availableSlots.filter((s) => s.available).length} available
                    </span>
                  </div>

                  {availableSlots.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">No slots found — check staff availability</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                      {availableSlots.map(({ time, available }) => (
                        <button
                          key={time}
                          type="button"
                          disabled={!available}
                          onClick={() => setStartTime(time)}
                          className={cn(
                            "py-2 rounded-xl text-xs font-semibold border transition-all",
                            startTime === time
                              ? "bg-[#1B3163] text-white border-[#1B3163]"
                              : available
                              ? "bg-white text-gray-700 border-gray-200 hover:border-[#1B3163] hover:text-[#1B3163]"
                              : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through"
                          )}
                        >
                          {minsToDisplay(parseInt(time.split(":")[0]) * 60 + parseInt(time.split(":")[1]))}
                        </button>
                      ))}
                    </div>
                  )}

                  {startTime && (
                    <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        <strong>{minsToDisplay(parseInt(startTime.split(":")[0]) * 60 + parseInt(startTime.split(":")[1]))}</strong>
                        {" "}selected · ends ~{minsToDisplay(parseInt(startTime.split(":")[0]) * 60 + parseInt(startTime.split(":")[1]) + durationMins)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Duration summary */}
              <div className="flex items-center gap-4 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{durationMins}m duration</span>
                <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />${price}</span>
              </div>
            </div>
          )}

          {/* ── Step 4: Client ── */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Who is this booking for?</p>

              {/* Client search */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Search existing client</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Search by name, email or phone…"
                    className={cn(inp(), "pl-9")}
                  />
                </div>

                {filteredClients.length > 0 && (
                  <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    {filteredClients.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setClientName(`${c.firstName} ${c.lastName}`);
                          setClientPhone(c.phone);
                          setClientEmail(c.email);
                          setClientSearch("");
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors border-b last:border-0 border-gray-50"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#EEF1F8] flex items-center justify-center text-xs font-bold text-[#1B3163] shrink-0">
                          {c.firstName[0]}{c.lastName[0]}
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{c.firstName} {c.lastName}</p>
                          <p className="text-xs text-gray-400 truncate">{c.phone} · {c.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="flex-1 border-t border-gray-100" /></div>
                <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2 w-fit mx-auto">or enter manually</div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Full Name <span className="text-rose-500">*</span></label>
                  <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. Sarah Johnson" className={inp(!clientName)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Phone</label>
                    <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} type="tel" placeholder="04XX XXX XXX" className={inp()} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Email</label>
                    <input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} type="email" placeholder="email@example.com" className={inp()} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Notes</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Any special requests or notes…" className={cn(inp(), "resize-none")} />
                </div>
              </div>

              {/* Booking summary */}
              <div className="bg-[#EEF1F8] rounded-xl p-3 space-y-1.5">
                <p className="text-xs font-semibold text-[#1B3163] mb-2">Booking Summary</p>
                {[
                  ["Staff",   selectedStaff ? `${selectedStaff.firstName} ${selectedStaff.lastName}` : "—"],
                  ["Service", svcMode === "package" ? selectedPackage?.name : selectedService?.name],
                  ["Date",    date ? new Date(date + "T12:00:00").toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" }) : "—"],
                  ["Time",    startTime ? minsToDisplay(parseInt(startTime.split(":")[0]) * 60 + parseInt(startTime.split(":")[1])) : "—"],
                  ["Duration", `${durationMins}m`],
                  ["Price",   `$${price}`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-semibold text-gray-800">{value ?? "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0 bg-white">
          <button
            type="button"
            onClick={() => step > 1 ? setStep((s) => (s - 1) as Step) : onClose()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 1 ? "Cancel" : "Back"}
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as Step)}
              disabled={!canAdvance[step]}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1B3163] hover:bg-[#152748] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={!canAdvance[4] || isSaving}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1B3163] hover:bg-[#152748] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isSaving ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</>
              ) : (
                <><Check className="w-4 h-4" />{isEdit ? "Save Changes" : "Confirm Booking"}</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
