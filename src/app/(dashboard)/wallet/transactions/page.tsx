import { requireUser } from "@/lib/auth";
import { getTransactionsPageData } from "@/features/wallet/transactions/server";
import type { TransactionsFilters } from "@/features/wallet/transactions/types";
import TransactionsFiltersPanel from "@/features/wallet/transactions/components/transactions-filters";
import TransactionsList from "@/features/wallet/transactions/components/transactions-list";
import { formatBDT } from "@/lib/money";

export const dynamic = "force-dynamic";

type WalletTransactionsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

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
  const resolvedSearchParams = await searchParams;
  const filters: TransactionsFilters = {
    month: firstParam(resolvedSearchParams?.month),
    type: normalizeType(firstParam(resolvedSearchParams?.type)),
    categoryId: firstParam(resolvedSearchParams?.categoryId),
    tagId: firstParam(resolvedSearchParams?.tagId),
  };
  const page = parsePage(firstParam(resolvedSearchParams?.page));
  const data = await getTransactionsPageData(
    user._id.toString(),
    filters,
    page,
  );
  console.log(data);
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
          <TransactionsFiltersPanel
            categories={data.categories}
            tags={data.tags}
            initialFilters={data.filters}
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border bg-background p-4">
              <p className="text-xs text-muted-foreground">Income</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {formatBDT(data.summary.income)}
              </p>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <p className="text-xs text-muted-foreground">Expense</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {formatBDT(data.summary.expense)}
              </p>
            </div>
          </div>
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

function formatAmount(amountPaisa: number) {
  return formatBDT(amountPaisa).replace(/^BDT\s?/, "");
}
