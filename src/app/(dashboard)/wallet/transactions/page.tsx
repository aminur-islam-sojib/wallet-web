import { requireUser } from "@/lib/auth";
import { getTransactionsPageData } from "@/features/wallet/transactions/server";
import type { TransactionsFilters } from "@/features/wallet/transactions/types";
import TransactionsList from "@/features/wallet/transactions/components/transactions-list";

type WalletTransactionsPageProps = {
  searchParams?: {
    month?: string;
    type?: string;
    categoryId?: string;
    tagId?: string;
    page?: string;
  };
};

function normalizeType(value?: string): TransactionsFilters["type"] {
  if (value === "income" || value === "expense") return value;
  if (value === "all") return "all";
  return "all";
}

function parsePage(value?: string) {
  if (!value) return 1;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

export default async function WalletTransactionsPage({
  searchParams,
}: WalletTransactionsPageProps) {
  const user = await requireUser();
  const filters: TransactionsFilters = {
    month: searchParams?.month,
    type: normalizeType(searchParams?.type),
    categoryId: searchParams?.categoryId,
    tagId: searchParams?.tagId,
  };
  const page = parsePage(searchParams?.page);
  const data = await getTransactionsPageData(
    user._id.toString(),
    filters,
    page,
  );

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border bg-background p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Wallet
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal">
            Transactions
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Review your wallet activity and filter by date, category, or tag.
          </p>
          <div className="mt-6">
            <TransactionsList
              transactions={data.transactions}
              categories={data.categories}
              tags={data.tags}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
