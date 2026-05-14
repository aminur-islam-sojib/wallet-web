import { Dashboard } from "@/components/dashboard";
import { SignOutButton } from "@/components/auth-buttons";
import { requireUser } from "@/lib/auth";
import { getDashboardData, type DashboardFilters } from "@/lib/dashboard";

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({ searchParams }: HomeProps) {
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
      categories={data.categories}
      tags={data.tags}
      transactions={data.transactions}
      filters={{
        type: filters.type,
        categoryId: filters.categoryId,
        tagId: filters.tagId,
      }}
      signOut={<SignOutButton />}
    />
  );
}
