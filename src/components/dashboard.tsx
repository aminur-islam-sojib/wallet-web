import { CalendarDays, CirclePlus, Filter, Tags } from "lucide-react";

import { createCategory, createTag } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/money";
import type {
  CategoryOption,
  TagOption,
  TransactionRow,
} from "@/lib/dashboard";

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
  user,
  selectedMonth,
  summary,
  categories,
  tags,
  transactions,
  filters,
}: DashboardProps) {
  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <section className="grid gap-3 md:grid-cols-3">
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
            <FilterPanel
              selectedMonth={selectedMonth}
              categories={categories}
              tags={tags}
              filters={filters}
            />
            <TransactionList transactions={transactions} />
          </div>

          <aside className="flex flex-col gap-6">
            <ManageLists categories={categories} tags={tags} />
          </aside>
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

function ManageLists({
  categories,
  tags,
}: {
  categories: CategoryOption[];
  tags: TagOption[];
}) {
  return (
    <section className="rounded-lg border bg-background p-4">
      <div className="mb-4 flex items-center gap-2">
        <Tags className="size-4" />
        <h2 className="font-semibold">Categories and tags</h2>
      </div>
      <form action={createCategory} className="grid gap-3">
        <Field label="New category">
          <input
            name="name"
            placeholder="Books"
            required
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          />
        </Field>
        <div className="grid grid-cols-[1fr_88px] gap-2">
          <select
            name="type"
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <input
            type="color"
            name="color"
            defaultValue="#64748b"
            aria-label="Category color"
            className="h-9 w-full rounded-md border bg-background p-1"
          />
        </div>
        <Button type="submit" variant="secondary">
          Add category
        </Button>
      </form>
      <form action={createTag} className="mt-5 grid gap-3 border-t pt-5">
        <Field label="New tag">
          <input
            name="name"
            placeholder="Office"
            required
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          />
        </Field>
        <Button type="submit" variant="secondary">
          Add tag
        </Button>
      </form>
      <div className="mt-5 grid gap-3 border-t pt-5 text-sm">
        <div>
          <p className="mb-2 font-medium">Categories</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category.id}
                className="rounded-md border px-2 py-1"
                style={{ borderColor: category.color }}
              >
                {category.name}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 font-medium">Tags</p>
          <div className="flex flex-wrap gap-2">
            {tags.length ? (
              tags.map((tag) => (
                <span key={tag.id} className="rounded-md border px-2 py-1">
                  {tag.name}
                </span>
              ))
            ) : (
              <p className="text-muted-foreground">No tags yet.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function TransactionList({ transactions }: { transactions: TransactionRow[] }) {
  return (
    <section className="rounded-lg border bg-background">
      <div className="flex items-center gap-2 border-b p-4">
        <CalendarDays className="size-4" />
        <h2 className="font-semibold">Recent transactions</h2>
      </div>
      <div className="divide-y">
        {transactions.length ? (
          transactions.map((transaction) => (
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
            </article>
          ))
        ) : (
          <p className="p-6 text-sm text-muted-foreground">
            No transactions match this view.
          </p>
        )}
      </div>
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
