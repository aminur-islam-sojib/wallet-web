import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Bus,
  FileText,
  ShoppingBag,
  WalletCards,
} from "lucide-react";

import TransactionEditDrawer from "@/features/wallet/transactions/components/transaction-edit-drawer";
import { CategoryIcon } from "@/features/wallet/categories/components/category-icon";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/money";
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

      <div className="grid gap-1.5">
        {visibleTransactions.length ? (
          visibleTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              categories={categories}
              tags={tags}
            />
          ))
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
      </div>

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

function TransactionCard({
  transaction,
  categories,
  tags,
}: {
  transaction: TransactionRow;
  categories: CategoryOption[];
  tags: TagOption[];
}) {
  const isIncome = transaction.type === "income";
  const title = transaction.note || transaction.categoryName;
  const meta = `${transaction.date} · ${isIncome ? "Income" : transaction.categoryName}`;
  const category = categories.find(
    (item) => item.id === transaction.categoryId,
  );

  return (
    <article className="flex items-center gap-3 rounded-xl border border-border/70 bg-background px-3 py-2.5 shadow-sm">
      <span
        className={
          isIncome
            ? "grid size-10 shrink-0 place-items-center rounded-xl bg-[#e1f5ee] text-[#0f6e56]"
            : "grid size-10 shrink-0 place-items-center rounded-xl bg-[#faeeda] text-[#854f0b]"
        }
      >
        {getTransactionIcon(transaction, category)}
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium text-foreground">
          {title}
        </h3>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{meta}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <p
          className={
            isIncome
              ? "text-sm font-medium tracking-normal text-[#3b6d11]"
              : "text-sm font-medium tracking-normal text-[#a32d2d]"
          }
        >
          {isIncome ? "+" : "-"}
          {formatAmount(transaction.amountPaisa)}
        </p>
        <TransactionEditDrawer
          transaction={transaction}
          categories={categories}
          tags={tags}
        />
      </div>
    </article>
  );
}

function getTransactionIcon(
  transaction: TransactionRow,
  category?: CategoryOption,
) {
  if (category?.icon) {
    return <CategoryIcon icon={category.icon} iconClassName="size-5" />;
  }

  const name = transaction.categoryName.toLowerCase();

  if (transaction.type === "income") {
    return <BriefcaseBusiness className="size-5" />;
  }

  if (name.includes("travel") || name.includes("transport")) {
    return <Bus className="size-5" />;
  }

  if (name.includes("food") || name.includes("grocery")) {
    return <ShoppingBag className="size-5" />;
  }

  return <FileText className="size-5" />;
}

function formatAmount(amountPaisa: number) {
  return formatBDT(amountPaisa).replace(/^BDT\s?/, "");
}
