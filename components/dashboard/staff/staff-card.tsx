import { Mail, Phone, Pencil, Trash2 } from "lucide-react";
import type { StaffMember, StaffRole, StaffStatus } from "@/types/staff";
import { ROLE_LABELS } from "@/types/staff";

/* ── Role badge colours ──────────────────────────── */
const ROLE_STYLE: Record<StaffRole, { color: string; bg: string }> = {
  owner:   { color: "#0D1B2A", bg: "#E8E4DA" },
  manager: { color: "#92400E", bg: "#FEF3C7" },
  staff:   { color: "#1D4ED8", bg: "#DBEAFE" },
};

/* ── Status dot ─────────────────────────────────── */
const STATUS_STYLE: Record<StaffStatus, { color: string; label: string }> = {
  active:   { color: "#16A34A", label: "Active" },
  on_leave: { color: "#D97706", label: "On Leave" },
  inactive: { color: "#6B7280", label: "Inactive" },
};

/* ── Max services shown before "+N more" ─────────── */
const MAX_VISIBLE_SERVICES = 3;

interface StaffCardProps {
  member: StaffMember;
  onEdit:   (member: StaffMember) => void;
  onDelete: (id: string) => void;
}

export function StaffCard({ member, onEdit, onDelete }: StaffCardProps) {
  const roleStyle   = ROLE_STYLE[member.role];
  const statusStyle = STATUS_STYLE[member.status];
  const initials    = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();
  const visibleServices = member.services.slice(0, MAX_VISIBLE_SERVICES);
  const extraServices   = member.services.length - MAX_VISIBLE_SERVICES;

  return (
    <article
      className="bg-white rounded-2xl overflow-hidden flex flex-col group transition-all duration-200 hover:shadow-lg border border-[#E8E4DA] shadow-sm"
    >
      {/* ── Coloured header strip ──────────────────── */}
      <div
        className="relative h-20 flex items-end px-5 pb-0"
        style={{ backgroundColor: `${member.avatarColor}12` }}
      >
        {/* Action buttons — appear on hover */}
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(member)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors bg-white border border-[#E8E4DA] text-[#0D1B2A] hover:bg-[#F0EEE6]"
            title="Edit staff member"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(member.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors bg-white border border-[#E8E4DA] text-red-500 hover:bg-red-50"
            title="Remove staff member"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Avatar — overlaps the strip + card body */}
        <div
          className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 translate-y-7 ring-3 ring-white"
          style={{ boxShadow: `0 4px 12px ${member.avatarColor}30` }}
        >
          {member.avatarImage ? (
            <img
              src={member.avatarImage}
              alt={`${member.firstName} ${member.lastName}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-lg font-bold text-white"
              style={{ backgroundColor: member.avatarColor }}
            >
              {initials}
            </div>
          )}
        </div>
      </div>

      {/* ── Card body ─────────────────────────────── */}
      <div className="flex flex-col flex-1 px-5 pt-9 pb-5 gap-4">
        {/* Name + role + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-base leading-tight truncate text-[#0D1B2A]">
              {member.firstName} {member.lastName}
            </h3>
            {member.specialization && (
              <p className="text-xs mt-0.5 truncate text-[#6B7280]">
                {member.specialization}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {/* Role badge */}
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{ color: roleStyle.color, backgroundColor: roleStyle.bg }}
            >
              {ROLE_LABELS[member.role]}
            </span>
            {/* Status dot */}
            <span className="flex items-center gap-1 text-[11px] text-[#6B7280]">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: statusStyle.color }}
              />
              {statusStyle.label}
            </span>
          </div>
        </div>

        {/* Bio */}
        {member.bio && (
          <p className="text-xs leading-relaxed line-clamp-2 text-[#6B7A99]">
            {member.bio}
          </p>
        )}

        {/* Contact */}
        <div className="space-y-1.5">
          <a
            href={`mailto:${member.email}`}
            className="flex items-center gap-2 text-xs text-[#6B7A99] hover:text-[#0D1B2A] transition-colors"
          >
            <Mail size={13} className="shrink-0 text-[#9FB2D9]" />
            <span className="truncate">{member.email}</span>
          </a>
          <a
            href={`tel:${member.phone}`}
            className="flex items-center gap-2 text-xs text-[#6B7A99] hover:text-[#0D1B2A] transition-colors"
          >
            <Phone size={13} className="shrink-0 text-[#9FB2D9]" />
            <span>{member.phone}</span>
          </a>
        </div>

        {/* Services offered */}
        {member.services.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
            {visibleServices.map((s) => (
              <span
                key={s}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F5F3EE] text-[#0D1B2A]"
              >
                {s}
              </span>
            ))}
            {extraServices > 0 && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#E8E4DA] text-[#6B7280]">
                +{extraServices} more
              </span>
            )}
          </div>
        )}

        {/* Pay info */}
        <div className="text-xs pt-3 border-t border-[#F0EEE6] text-[#6B7280]">
          {member.commissionType === "salary" && "Salary"}
          {member.commissionType === "hourly" && member.commissionRate != null &&
            `$${member.commissionRate}/hr`}
          {member.commissionType === "commission" && member.commissionRate != null &&
            `${member.commissionRate}% commission`}
          <span className="mx-2 text-[#C4C9D4]">·</span>
          <span>Since {new Date(member.startDate).toLocaleDateString("en-AU", { month: "short", year: "numeric" })}</span>
        </div>
      </div>
    </article>
  );
}
