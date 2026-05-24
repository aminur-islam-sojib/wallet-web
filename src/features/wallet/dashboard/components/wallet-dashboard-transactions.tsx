import Link from "next/link";
import { ArrowRight, WalletCards } from "lucide-react";

import { Button } from "@/components/ui/button";
import TransactionsList from "@/features/wallet/transactions/components/transactions-list";
import type {
  CategoryOption,
  TagOption,
  TransactionRow,
} from "@/features/wallet/types";

type WalletDashboardTransactionsProps = {
  transactions: TransactionRow[];
  categories: CategoryOption[];
  tags: TagOption[];
};

export function WalletDashboardTransactions({
  transactions,
  categories,
  tags,
}: WalletDashboardTransactionsProps) {
  const visibleTransactions = transactions.slice(0, 5);
  const hasMoreTransactions = transactions.length > visibleTransactions.length;

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-foreground">
          Recent transactions
        </h2>
        <Link
          href="/wallet/transactions"
          className="flex min-h-11 items-center px-1 text-sm font-medium text-primary"
        >
          See all
        </Link>
      </div>

      {visibleTransactions.length ? (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-background pt-5 ">
          <TransactionsList
            transactions={visibleTransactions}
            categories={categories}
            tags={tags}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-background p-5 text-center shadow-sm">
          <span className="mx-auto grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
            <WalletCards className="size-5" />
          </span>
          <p className="mt-3 text-sm font-medium text-foreground">
            No transactions yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first income or cost from the plus button below.
          </p>
        </div>
      )}

      {hasMoreTransactions ? (
        <Button
          asChild
          variant="outline"
          className="mt-3 min-h-11 w-full rounded-xl"
        >
          <Link href="/wallet/transactions">
            See more
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      ) : null}
    </section>
  );
}
