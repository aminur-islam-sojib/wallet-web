import { requireUser } from "@/lib/auth";
import { getTransactionsPageData } from "@/features/wallet/transactions/server";
import type { TransactionsFilters } from "@/features/wallet/transactions/types";
import TransactionsList from "@/features/wallet/transactions/components/transactions-list";
import { formatBDT } from "@/lib/money";
import { TrendingDown, TrendingUp } from "lucide-react";
import { WalletTransactionsSkeleton } from "@/features/wallet/loading/components/wallet-loading-skeletons";
import { Suspense } from "react";

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

export default function WalletTransactionsPage({
  searchParams,
}: WalletTransactionsPageProps) {
  return (
    <Suspense fallback={<WalletTransactionsSkeleton />}>
      <TransactionsPageData searchParams={searchParams} />
    </Suspense>
  );
}

async function TransactionsPageData({
  searchParams,
}: WalletTransactionsPageProps) {
  const [user, resolvedSearchParams] = await Promise.all([
    requireUser(),
    searchParams,
  ]);
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

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="rounded-2xl">
          <div className="mt-4 grid grid-cols-2 gap-3">
            {/* Income Card */}
            <div className="relative overflow-hidden rounded-xl border bg-background p-4">
              <div className="absolute inset-x-0 top-0 h-0.75 rounded-t-xl bg-chart-2" />
              <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-chart-2" />
                Income
              </p>
              <p className="text-xl font-medium leading-none tracking-tight text-chart-2">
                {formatBDT(data.summary.income)}
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground/60">
                This month
              </p>
            </div>

            {/* Expense Card */}
            <div className="relative overflow-hidden rounded-xl border bg-background p-4">
              <div className="absolute inset-x-0 top-0 h-0.75 rounded-t-xl bg-chart-4" />
              <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <TrendingDown className="h-3.5 w-3.5 text-chart-4" />
                Expense
              </p>
              <p className="text-xl font-medium leading-none tracking-tight text-chart-4">
                {formatBDT(data.summary.expense)}
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground/60">
                This month
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
