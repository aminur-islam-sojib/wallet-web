"use client";

import { useState } from "react";

import { formatBDT } from "@/lib/money";
import TransactionEditDrawer from "@/features/wallet/transactions/components/transaction-edit-drawer";
import { CategoryIcon } from "@/features/wallet/categories/components/category-icon";
import type {
  TransactionRow,
  TransactionsCategoryOption,
  TransactionsTagOption,
} from "@/features/wallet/transactions/types";

// ─── Group transactions by date ───────────────────────────────────────────────
function groupByDate(transactions: TransactionRow[]) {
  const groups: Record<string, TransactionRow[]> = {};
  for (const t of transactions) {
    if (!groups[t.date]) groups[t.date] = [];
    groups[t.date].push(t);
  }
  return Object.entries(groups);
}

function formatAmount(amountPaisa: number) {
  return formatBDT(amountPaisa).replace(/^BDT\s?/, "");
}
function formatTransactionDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
// ─── Single transaction card ──────────────────────────────────────────────────
function TransactionCard({
  transaction,
  categories,
}: {
  transaction: TransactionRow;
  categories: TransactionsCategoryOption[];
}) {
  const isIncome = transaction.type === "income";
  const displayName = transaction.categoryName;
  const note = transaction.note;
  const category = categories.find(
    (item) => item.id === transaction.categoryId,
  );
  const categoryColor =
    category?.color ?? transaction.categoryColor ?? "#64748b";
  const categoryIcon = category?.icon ?? "circle";

  return (
    <article className="relative flex cursor-pointer items-center gap-3 border-b border-border bg-background px-4 py-3 transition-colors active:bg-muted/40">
      {/* Category icon circle */}
      <div
        className="relative shrink-0 flex h-11 w-11 items-center justify-center rounded-full text-white text-lg"
        style={{ background: categoryColor }}
        aria-hidden="true"
      >
        <CategoryIcon icon={categoryIcon} iconClassName="size-5" />
        {/* Verified check badge */}
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background text-white"
          style={{ background: "#1a9e6e", fontSize: 8 }}
        >
          ✓
        </span>
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-medium text-foreground max-w-40">
            {displayName}
          </p>
          <div>
            <span
              className="shrink-0 text-sm font-semibold"
              style={{ color: isIncome ? "#1a9e6e" : "#e24b4a" }}
            >
              {isIncome ? "+BDT " : "-BDT "}
              {formatAmount(transaction.amountPaisa)}
            </span>
          </div>
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-muted-foreground">
            {transaction.paymentMethod ?? "Cash"} - {transaction.categoryName}
          </p>
          <p className="text-muted-foreground text-right">
            {formatTransactionDate(transaction.date)}
          </p>
        </div>
        <div>
          {note ? (
            <div className="truncate text-xs text-muted-foreground">
              <i>&quot;{note}&quot;</i>
            </div>
          ) : (
            ""
          )}
        </div>

        {/* Tags row */}
        {transaction.tagNames.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {transaction.tagNames.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={{ background: "#b5e8d4", color: "#0f7a52" }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

// ─── Main list component ──────────────────────────────────────────────────────
export default function TransactionsList({
  transactions,
  categories,
  tags,
}: {
  transactions: TransactionRow[];
  categories: TransactionsCategoryOption[];
  tags: TransactionsTagOption[];
}) {
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionRow | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  function openTransaction(transaction: TransactionRow) {
    setSelectedTransaction(transaction);
    setEditOpen(true);
  }

  if (!transactions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
        <span className="text-4xl opacity-30">💸</span>
        <p className="text-sm">No transactions yet.</p>
      </div>
    );
  }

  const groups = groupByDate(transactions);

  return (
    <div className="divide-y divide-border">
      {groups.map(([date, txns]) => (
        <section key={date}>
          {/* Date group header */}
          <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm px-4 py-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {date}
            </p>
          </div>

          {/* Transactions for this date */}
          <div>
            {txns.map((transaction) => (
              <div
                key={transaction.id}
                role="button"
                tabIndex={0}
                onClick={() => openTransaction(transaction)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openTransaction(transaction);
                  }
                }}
                className="w-full text-left"
                aria-label={`Open ${
                  transaction.note || transaction.categoryName
                } transaction`}
              >
                <TransactionCard
                  transaction={transaction}
                  categories={categories}
                />
              </div>
            ))}
          </div>
        </section>
      ))}

      {selectedTransaction ? (
        <TransactionEditDrawer
          key={selectedTransaction.id}
          transaction={selectedTransaction}
          categories={categories}
          tags={tags}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      ) : null}
    </div>
  );
}
