import { requireUser } from "@/lib/auth";
import DrawerRight from "@/components/ui/Shared/Drawer";
import MasterDialog from "@/features/wallet/transactions/components/master-dialog";
import TransactionForm from "@/features/wallet/transactions/components/transaction-form";
import { getWalletOptions } from "@/features/wallet/server/options";
import WalletBottomNav from "@/features/wallet/navigation/components/wallet-bottom-nav";
import WalletMobileHeader from "@/features/wallet/navigation/components/wallet-mobile-header";
import type {
  TransactionsCategoryOption,
  TransactionsTagOption,
} from "@/features/wallet/transactions/types";
import { Separator } from "@/components/ui/separator";

type HeaderProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardHeader({ searchParams }: HeaderProps) {
  const user = await requireUser();
  await searchParams;
  const { categories, tags } = await getWalletOptions(user._id.toString());

  const safeUser = {
    name: user.name,
    email: user.email,
    image: user.image ?? null,
  };
  const incomeCategories = categories.filter(
    (category) => category.type === "income",
  );
  const expenseCategories = categories.filter(
    (category) => category.type === "expense",
  );

  return (
    <div>
      <WalletMobileHeader
        user={safeUser}
        transactionsFilters={{
          categories: categories as TransactionsCategoryOption[],
          tags: tags as TransactionsTagOption[],
        }}
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
            <MasterDialog>
              <TransactionForm
                incomeCategories={incomeCategories}
                expenseCategories={expenseCategories}
                tags={tags}
              />
            </MasterDialog>
          </div>
        </div>
        <Separator />
      </div>
      <WalletBottomNav
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
        tags={tags}
      />
    </div>
  );
}
