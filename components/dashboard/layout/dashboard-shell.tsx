"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

interface DashboardShellProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export function DashboardShell({ children, pageTitle }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-surface flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          onMenuToggle={() => setSidebarOpen(true)}
          pageTitle={pageTitle}
        />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-4 py-5 lg:px-8 lg:py-7">
          {children}
        </main>
      </div>
    </div>
  );
}
