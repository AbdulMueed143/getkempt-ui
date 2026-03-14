/* ── Role & access levels ───────────────────────── */
export type StaffRole = "owner" | "manager" | "staff";

/**
 * What each role can do:
 *  owner   – full access: all reports, billing, staff management, store config
 *  manager – manage bookings, clients, staff schedules, services; no billing
 *  staff   – can only see own schedule, own bookings, own clients
 */
export const ROLE_LABELS: Record<StaffRole, string> = {
  owner:   "Owner",
  manager: "Manager",
  staff:   "Staff Member",
};

export const ROLE_DESCRIPTIONS: Record<StaffRole, string> = {
  owner:   "Full access — manage everything including billing and store settings",
  manager: "Manage bookings, staff and services. No access to billing",
  staff:   "View and manage own schedule and bookings only",
};

/* ── Employment & pay ───────────────────────────── */
export type CommissionType = "hourly" | "commission" | "salary";
export type StaffStatus    = "active" | "on_leave" | "inactive";

/* ── Core staff record ──────────────────────────── */
export interface StaffMember {
  id: string;

  /* Personal */
  firstName:      string;
  lastName:       string;
  email:          string;
  phone:          string;
  bio:            string;
  specialization: string;
  /** Data URL or CDN URL for the profile photo. Falls back to coloured initials when absent. */
  avatarImage?:   string;
  /** Used for calendar colour-coding when no image is set */
  avatarColor:    string;
  calendarColor:  string;

  /* Role & access */
  role:   StaffRole;
  status: StaffStatus;

  /* Services this staff member can perform */
  services: string[];

  /* Pay */
  commissionType: CommissionType;
  commissionRate: number | null;   // $ per hour OR % of service price

  /* Metadata */
  startDate:  string;  // ISO date
  createdAt:  string;
}

/* ── Form shape (mirrors StaffMember minus server-generated fields) ─ */
export interface StaffFormValues {
  firstName:      string;
  lastName:       string;
  email:          string;
  phone:          string;
  bio:            string;
  specialization: string;
  avatarImage?:   string;
  avatarColor:    string;
  calendarColor:  string;
  role:           StaffRole;
  status:         StaffStatus;
  services:       string[];
  commissionType: CommissionType;
  commissionRate: number | null;
  startDate:      string;
}
