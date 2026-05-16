import { Dashboard } from "@/features/wallet/components/dashboard";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/features/wallet/server/dashboard";
import type { DashboardFilters } from "@/types/wallet";

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const filters: DashboardFilters = {
    month: firstParam(params.month),
    type: firstParam(params.type) as DashboardFilters["type"],
    categoryId: firstParam(params.categoryId),
    tagId: firstParam(params.tagId),
  };
  const data = await getDashboardData(user._id.toString(), filters);

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
    />
  );
}
