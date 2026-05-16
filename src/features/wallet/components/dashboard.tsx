import Link from "next/link";
import { ArrowRight, CalendarDays, Filter, Tags } from "lucide-react";

import { createCategory, createTag } from "@/features/wallet/server/actions";
import TransactionEditDrawer from "@/features/wallet/components/transaction-edit-drawer";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/money";
import type { CategoryOption, TagOption, TransactionRow } from "@/types/wallet";
import ManageLists from "./Dashboard/ManageList";

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
  categories: CategoryOption[];
  tags: TagOption[];
  transactions: TransactionRow[];
  filters: {
    type?: string;
    categoryId?: string;
    tagId?: string;
  };
};

export function Dashboard({
  summary,
  categories,
  tags,
  transactions,
  filters,
}: DashboardProps) {
  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4  sm:px-6 lg:px-8">
        <section className="grid gap-3 md:grid-cols-3 py-0 md:py-6">
          <SummaryTile
            label="Income"
            value={formatBDT(summary.income)}
            tone="income"
          />
          <SummaryTile
            label="Cost"
            value={formatBDT(summary.expense)}
            tone="expense"
          />
          <SummaryTile
            label="Balance"
            value={formatBDT(summary.balance)}
            tone="balance"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex flex-col gap-6">
            {/* <FilterPanel
              selectedMonth={selectedMonth}
              categories={categories}
              tags={tags}
              filters={filters}
            /> */}
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

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "income" | "expense" | "balance";
}) {
  const toneClass =
    tone === "income"
      ? "border-emerald-200 bg-emerald-50 text-emerald-950"
      : tone === "expense"
        ? "border-rose-200 bg-rose-50 text-rose-950"
        : "border-sky-200 bg-sky-50 text-sky-950";

  return (
    <div className={`rounded-lg border p-4 ${toneClass}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-normal">{value}</p>
    </div>
  );
}

function FilterPanel({
  selectedMonth,
  categories,
  tags,
  filters,
}: {
  selectedMonth: string;
  categories: CategoryOption[];
  tags: TagOption[];
  filters: DashboardProps["filters"];
}) {
  return (
    <form className="rounded-lg border bg-background p-4">
      <div className="mb-4 flex items-center gap-2">
        <Filter className="size-4" />
        <h2 className="font-semibold">Filters</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Month">
          <input
            type="month"
            name="month"
            defaultValue={selectedMonth}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          />
        </Field>
        <Field label="Type">
          <select
            name="type"
            defaultValue={filters.type ?? "all"}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </Field>
        <Field label="Category">
          <select
            name="categoryId"
            defaultValue={filters.categoryId ?? ""}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.type === "income" ? "Income" : "Expense"} /{" "}
                {category.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tag">
          <select
            name="tagId"
            defaultValue={filters.tagId ?? ""}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">All tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Button type="submit" className="mt-4">
        Apply filters
      </Button>
    </form>
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}
