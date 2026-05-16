import { requireUser } from "@/lib/auth";
import DrawerRight from "@/components/ui/Shared/Drawer";
import MasterDialoge from "@/features/wallet/components/master-dialog";
import TransactionForm from "@/features/wallet/components/transaction-form";
import { getDashboardData } from "@/features/wallet/server/dashboard";
import WalletBottomNav from "@/features/wallet/components/wallet-bottom-nav";
import WalletMobileHeader from "@/features/wallet/components/wallet-mobile-header";
import { Separator } from "@/components/ui/separator";
import type { DashboardFilters } from "@/types/wallet";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

type HeaderProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardHeader({ searchParams }: HeaderProps) {
  const user = await requireUser();
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(now);
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
    <div>
      <WalletMobileHeader
        user={safeUser}
        greeting={greeting}
        dateLabel={dateLabel}
      />
      <div className="hidden sm:block">
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
          <div className="hidden gap-2 sm:flex">
            <MasterDialoge>
              <TransactionForm
                incomeCategories={incomeCategories}
                expenseCategories={expenseCategories}
                tags={data.tags}
              />
            </MasterDialoge>
          </div>
        </div>
        <Separator />
      </div>
      <WalletBottomNav
        selectedMonth={data.selectedMonth}
        monthlyLimit={data.monthlyLimit}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
        tags={data.tags}
      />
    </div>
  );
}
