import Header from "@/components/ui/Shared/Header";
import type { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen pb-24 sm:pb-0">
      <Header />
      {children}
    </div>
  );
}
