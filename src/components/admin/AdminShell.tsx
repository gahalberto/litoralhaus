"use client";

import { useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import type { SessionPayload } from "@/lib/auth";

interface Props {
  session: SessionPayload;
  children: React.ReactNode;
}

export function AdminShell({ session, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-[#09090b]">
      <Sidebar
        session={session}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Right column */}
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
        <AdminHeader onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
