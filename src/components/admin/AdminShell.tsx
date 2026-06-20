"use client";

import { useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SuperSearch } from "@/components/admin/SuperSearch";
import type { SessionPayload } from "@/lib/auth";

interface Props {
  session: SessionPayload;
  children: React.ReactNode;
}

export function AdminShell({ session, children }: Props) {
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [collapsed,   setCollapsed]   = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-[#09090b]">
      <Sidebar
        session={session}
        mobileOpen={mobileOpen}
        collapsed={collapsed}
        onClose={() => setMobileOpen(false)}
        onToggleCollapse={() => setCollapsed((v) => !v)}
      />

      {/* Right column */}
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
        <AdminHeader
          onMenuClick={() => setMobileOpen(true)}
          sidebarCollapsed={collapsed}
          onSearchOpen={() => setSearchOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Super Search — montado fora do header para z-index correto */}
      <SuperSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
