import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
} from "lucide-react";

import TransactionEditDrawer from "@/features/wallet/components/transaction-edit-drawer";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/money";
import type {
  CategoryOption,
  MonthlyLimit,
  TagOption,
  TodaySummary,
  TransactionRow,
} from "@/types/wallet";

type DashboardProps = {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  selectedMonth: string;
  summary: {
    income: number;
    expense: number;
    balance: number;
  };
  todaySummary: TodaySummary;
  monthlyLimit: MonthlyLimit | null;
  categories: CategoryOption[];
  tags: TagOption[];
  transactions: TransactionRow[];
};

export function Dashboard({
  selectedMonth,
  summary,
  todaySummary,
  monthlyLimit,
  categories,
  tags,
  transactions,
}: DashboardProps) {
  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4  sm:px-6 lg:px-8">
        <section className="py-0 md:py-6">
          <WalletSummaryCard
            selectedMonth={selectedMonth}
            balance={summary.balance}
            monthExpense={summary.expense}
            todaySummary={todaySummary}
            monthlyLimit={monthlyLimit}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex flex-col gap-6">
            <TransactionList
              transactions={transactions}
              categories={categories}
              tags={tags}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function WalletSummaryCard({
  selectedMonth,
  balance,
  monthExpense,
  todaySummary,
  monthlyLimit,
}: {
  selectedMonth: string;
  balance: number;
  monthExpense: number;
  todaySummary: TodaySummary;
  monthlyLimit: MonthlyLimit | null;
}) {
  const budgetPercent = monthlyLimit
    ? Math.min(Math.round((monthExpense / monthlyLimit.amountPaisa) * 100), 999)
    : 0;
  const barWidth = monthlyLimit ? `${Math.min(budgetPercent, 100)}%` : "0%";
  const remaining = monthlyLimit
    ? monthlyLimit.amountPaisa - monthExpense
    : null;
  const remainingLabel =
    remaining === null
      ? null
      : remaining >= 0
        ? `${formatBDT(remaining)} left`
        : `${formatBDT(Math.abs(remaining))} over`;
  const isOverLimit = remaining !== null && remaining < 0;

  return (
    <div className="rounded-lg border bg-background p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Total balance
          </p>
          <p className="mt-2 break-words text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
            {formatBDT(balance)}
          </p>
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          {selectedMonth}
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.5fr]">
        <TodayStat
          label="Today income"
          value={formatBDT(todaySummary.income)}
          tone="income"
        />
        <TodayStat
          label="Today cost"
          value={formatBDT(todaySummary.expense)}
          tone="expense"
        />
        <div className="rounded-lg border border-border bg-muted/30 p-4 sm:col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Monthly budget
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-normal text-foreground">
                {monthlyLimit ? `${budgetPercent}% used` : "No budget set"}
              </p>
            </div>
            {monthlyLimit ? (
              <span
                className={
                  isOverLimit
                    ? "rounded-md bg-rose-100 px-2 py-1 text-sm font-medium text-rose-700"
                    : "rounded-md bg-emerald-100 px-2 py-1 text-sm font-medium text-emerald-700"
                }
              >
                {remainingLabel}
              </span>
            ) : null}
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-background">
            <div
              className={
                isOverLimit
                  ? "h-full rounded-full bg-rose-500"
                  : "h-full rounded-full bg-foreground"
              }
              style={{ width: barWidth }}
            />
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            {monthlyLimit
              ? `${formatBDT(monthExpense)} spent of ${formatBDT(
                  monthlyLimit.amountPaisa,
                )}`
              : `${formatBDT(monthExpense)} spent this month`}
          </p>
        </div>
      </div>
    </div>
  );
}

function TodayStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "income" | "expense";
}) {
  const Icon = tone === "income" ? ArrowUpRight : ArrowDownRight;
  const toneClass =
    tone === "income"
      ? "border-emerald-200 bg-emerald-50 text-emerald-950"
      : "border-rose-200 bg-rose-50 text-rose-950";
  const iconClass =
    tone === "income"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-rose-100 text-rose-700";

  return (
    <div
      className={`flex min-h-24 items-center gap-3 rounded-lg border p-4 ${toneClass}`}
    >
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-full ${iconClass}`}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium opacity-75">{label}</p>
        <p className="mt-1 break-words text-xl font-semibold tracking-normal">
          {value}
        </p>
      </div>
    </div>
  );
}

function TransactionList({
  transactions,
  categories,
  tags,
}: {
  transactions: TransactionRow[];
  categories: CategoryOption[];
  tags: TagOption[];
}) {
  const visibleTransactions = transactions.slice(0, 5);
  const hasMoreTransactions = transactions.length > visibleTransactions.length;

  return (
    <section className="rounded-lg border bg-background">
      <div className="flex items-center gap-2 border-b p-4">
        <CalendarDays className="size-4" />
        <h2 className="font-semibold">Recent transactions</h2>
      </div>
      <div className="divide-y">
        {visibleTransactions.length ? (
          visibleTransactions.map((transaction) => (
            <article
              key={transaction.id}
              className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: transaction.categoryColor }}
                  />
                  <h3 className="font-medium">{transaction.categoryName}</h3>
                  <span className="text-sm text-muted-foreground">
                    {transaction.date}
                  </span>
                </div>
                {transaction.note ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {transaction.note}
                  </p>
                ) : null}
                {transaction.place ||
                transaction.paymentMethod ||
                transaction.attachment ? (
                  <div className="mt-2 flex flex-wrap gap-1 text-xs text-muted-foreground">
                    {transaction.paymentMethod ? (
                      <span className="rounded-md bg-muted px-2 py-0.5">
                        {transaction.paymentMethod.replace("_", " ")}
                      </span>
                    ) : null}
                    {transaction.place ? (
                      <span className="rounded-md bg-muted px-2 py-0.5">
                        {transaction.place}
                      </span>
                    ) : null}
                    {transaction.attachment ? (
                      <span className="rounded-md bg-muted px-2 py-0.5">
                        {transaction.attachment.name}
                      </span>
                    ) : null}
                  </div>
                ) : null}
                {transaction.tagNames.length ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {transaction.tagNames.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-muted px-2 py-0.5 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <p
                  className={
                    transaction.type === "income"
                      ? "font-semibold text-emerald-700"
                      : "font-semibold text-rose-700"
                  }
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatBDT(transaction.amountPaisa)}
                </p>
                <TransactionEditDrawer
                  transaction={transaction}
                  categories={categories}
                  tags={tags}
                />
              </div>
            </article>
          ))
        ) : (
          <p className="p-6 text-sm text-muted-foreground">
            No transactions match this view.
          </p>
        )}
      </div>
      {hasMoreTransactions ? (
        <div className="border-t p-4">
          <Button asChild variant="outline" className="min-h-11 w-full">
            <Link href="/wallet/transactions">
              See more
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      ) : null}
    </section>
  );
}
