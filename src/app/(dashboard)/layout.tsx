import Header from "@/features/wallet/navigation/components/dashboard-header";
import type { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen pt-24 pb-10 sm:pb-0 sm:pt-0">
      <Header />
      {children}
    </div>
  );
}
