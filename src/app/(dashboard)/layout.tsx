import Header from "@/features/wallet/navigation/components/dashboard-header";
import { DashboardHeaderSkeleton } from "@/features/wallet/loading/components/wallet-loading-skeletons";
import type { ReactNode } from "react";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen pt-10 pb-10 sm:pb-0 sm:pt-0">
      <Suspense fallback={<DashboardHeaderSkeleton />}>
        <Header />
      </Suspense>
      {children}
    </div>
  );
}
