import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/layout/dashboard-shell";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | Get Kempt",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
