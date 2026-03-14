import type { Metadata } from "next";
import { StaffPageClient } from "@/components/dashboard/staff/staff-page-client";

export const metadata: Metadata = { title: "Staff" };

export default function StaffPage() {
  return <StaffPageClient />;
}
