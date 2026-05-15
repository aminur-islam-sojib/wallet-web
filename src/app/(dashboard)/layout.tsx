import type { ReactNode } from "react";

import DashboardNav from "@/components/dashboard-nav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Command Center
            </p>
            <h1 className="text-lg font-semibold tracking-normal">
              Wallet + Health
            </h1>
          </div>
          <DashboardNav />
        </div>
      </div>
      {children}
    </div>
  );
}
