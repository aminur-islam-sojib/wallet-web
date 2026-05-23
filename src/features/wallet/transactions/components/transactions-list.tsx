"use client";

import { formatBDT } from "@/lib/money";
import TransactionEditDrawer from "@/features/wallet/transactions/components/transaction-edit-drawer";
import { deleteTransaction } from "@/features/wallet/server/transactions";
import type {
  TransactionRow,
  TransactionsCategoryOption,
  TransactionsTagOption,
} from "@/features/wallet/transactions/types";

export default function TransactionsList({
  transactions,
  categories,
  tags,
}: {
  transactions: TransactionRow[];
  categories: TransactionsCategoryOption[];
  tags: TransactionsTagOption[];
}) {
  if (!transactions.length) {
    return (
      <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
        No transactions yet.
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {transactions.map((transaction) => (
        <article
          key={transaction.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background px-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {transaction.note || transaction.categoryName}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {transaction.date} · {transaction.categoryName}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">
              {transaction.type === "income" ? "+" : "-"}
              {formatAmount(transaction.amountPaisa)}
            </p>
            <TransactionEditDrawer
              transaction={transaction}
              categories={categories}
              tags={tags}
            />
            <form
              action={deleteTransaction}
              onSubmit={(event) => {
                if (
                  !window.confirm(
                    `Delete ${
                      transaction.note || transaction.categoryName
                    }? This cannot be undone.`,
                  )
                ) {
                  event.preventDefault();
                }
              }}
            >
              <input type="hidden" name="id" value={transaction.id} />
              <button
                type="submit"
                className="min-h-11 rounded-lg border border-destructive/30 px-3 text-xs font-semibold text-destructive transition hover:bg-destructive/10"
              >
                Delete
              </button>
            </form>
          </div>
        </article>
      ))}
    </div>
  );
}

function formatAmount(amountPaisa: number) {
  return formatBDT(amountPaisa).replace(/^BDT\s?/, "");
}
