import { requireUser } from "@/lib/auth";
import DrawerRight from "./Drawer";
import MasterDialoge from "@/components/Dashboard/MasterDialog";
import { TransactionForm } from "@/components/dashboard";
import { DashboardFilters, getDashboardData } from "@/lib/dashboard";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
type HeaderProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Header({ searchParams }: HeaderProps) {
  const user = await requireUser();
  const params: Record<string, string | string[] | undefined> = searchParams
    ? await searchParams
    : {};
  const filters: DashboardFilters = {
    month: firstParam(params.month),
    type: firstParam(params.type) as DashboardFilters["type"],
    categoryId: firstParam(params.categoryId),
    tagId: firstParam(params.tagId),
  };
  const data = await getDashboardData(user._id.toString(), filters);

  const safeUser = {
    name: user.name,
    email: user.email,
    image: user.image ?? null,
  };
  const incomeCategories = data.categories.filter(
    (category) => category.type === "income",
  );
  const expenseCategories = data.categories.filter(
    (category) => category.type === "expense",
  );
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <div className="flex gap-3">
        <DrawerRight user={safeUser} />
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Command Center
          </p>
          <h1 className="text-lg font-semibold tracking-normal">
            Wallet + Health
          </h1>
        </div>
      </div>
      <div className="flex gap-2">
        <MasterDialoge>
          <TransactionForm
            incomeCategories={incomeCategories}
            expenseCategories={expenseCategories}
            tags={data.tags}
          />
        </MasterDialoge>
      </div>
    </div>
  );
}
