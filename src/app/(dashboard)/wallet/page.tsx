import { Dashboard } from "@/features/wallet/dashboard/components/dashboard";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/features/wallet/server/dashboard";
import { getCategoryTotalsByRange } from "@/features/wallet/statistics/server/category-totals";
import { WalletDashboardSkeleton } from "@/features/wallet/loading/components/wallet-loading-skeletons";
import type { DashboardFilters } from "@/features/wallet/types";
import { Suspense } from "react";

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getMonthDateRange(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const startDate = `${year}-${String(monthIndex).padStart(2, "0")}-01`;
  const endDate = new Date(Date.UTC(year, monthIndex, 0))
    .toISOString()
    .slice(0, 10);

  return { startDate, endDate };
}

export default function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  return (
    <Suspense fallback={<WalletDashboardSkeleton />}>
      <DashboardData searchParams={searchParams} />
    </Suspense>
  );
}

async function DashboardData({ searchParams }: DashboardPageProps) {
  const [user, params] = await Promise.all([requireUser(), searchParams]);
  const filters: DashboardFilters = {
    month: firstParam(params.month),
    type: firstParam(params.type) as DashboardFilters["type"],
    categoryId: firstParam(params.categoryId),
    tagId: firstParam(params.tagId),
  };
  const data = await getDashboardData(user._id.toString(), filters);
  const categoryRange = getMonthDateRange(data.selectedMonth);
  const categoryData = await getCategoryTotalsByRange(user._id.toString(), {
    ...categoryRange,
    type: "expense",
  });

  return (
    <Dashboard
      user={{
        name: user.name,
        email: user.email,
        image: user.image,
      }}
      selectedMonth={data.selectedMonth}
      summary={data.summary}
      todaySummary={data.todaySummary}
      monthlyLimit={data.monthlyLimit}
      categories={data.categories}
      tags={data.tags}
      transactions={data.transactions}
      categoryData={categoryData}
    />
  );
}
