import Link from "next/link";
import { ArrowUp, ReceiptText, Tags, WalletCards, X } from "lucide-react";
import type { ReactNode } from "react";

import TransactionsList from "@/features/wallet/transactions/components/transactions-list";
import type {
  CategoryDetailBreakdown,
  TagDetailResponse,
} from "@/features/wallet/statistics/types";
import { formatBDT } from "@/lib/money";

type Props = {
  detail: TagDetailResponse | null;
};

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-normal text-foreground">
        {value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
    </div>
  );
}

function BreakdownList({
  title,
  icon,
  items,
  emptyText,
}: {
  title: string;
  icon: ReactNode;
  items: CategoryDetailBreakdown[];
  emptyText: string;
}) {
  return (
    <section className="rounded-lg border bg-background p-4">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      </div>

      {items.length ? (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-foreground">
                  {item.label}
                </span>
                <span className="shrink-0 font-medium tabular-nums">
                  {formatBDT(item.totalPaisa)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(item.percent, 100)}%` }}
                />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.percent}% - {item.count} transactions
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      )}
    </section>
  );
}

export default function TagDetailPanel({ detail }: Props) {
  if (!detail) {
    return (
      <section className="rounded-xl border bg-background p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Tag details unavailable
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This tag is no longer available for the current range.
            </p>
          </div>
          <Link
            href="/wallet/statistics"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium"
          >
            <X className="size-4" />
            Clear tag
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-xl border bg-background p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="grid size-12 shrink-0 place-items-center rounded-full text-white"
              style={{ background: detail.tagColor }}
              aria-hidden="true"
            >
              <Tags className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Tag detail</p>
              <h2 className="truncate text-xl font-semibold text-foreground">
                {detail.tagName}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {detail.startDate} - {detail.endDate}
              </p>
            </div>
          </div>

          <Link
            href="/wallet/statistics"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            <ArrowUp className="size-4" />
            Back to chart
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total"
            value={formatBDT(detail.totalPaisa)}
            helper={`${detail.percent}% of tag chart`}
          />
          <StatCard
            label="Transactions"
            value={String(detail.transactionCount)}
            helper="Current range"
          />
          <StatCard
            label="Average"
            value={formatBDT(detail.averagePaisa)}
            helper="Per transaction"
          />
          <StatCard
            label="Chart total"
            value={formatBDT(detail.chartTotalPaisa)}
            helper="All tag slices"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="space-y-4">
          <BreakdownList
            title="Payment methods"
            icon={<WalletCards className="size-5 text-muted-foreground" />}
            items={detail.paymentMethodBreakdown}
            emptyText="No payment method data for this tag."
          />
          <BreakdownList
            title="Categories"
            icon={<Tags className="size-5 text-muted-foreground" />}
            items={detail.categoryBreakdown}
            emptyText="No category data for this tag."
          />
        </div>

        <section className="overflow-hidden rounded-lg border bg-background">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <ReceiptText className="size-5 text-muted-foreground" />
            <h3 className="text-base font-semibold text-foreground">
              Transactions
            </h3>
          </div>
          <TransactionsList
            transactions={detail.transactions}
            categories={detail.categories}
            tags={detail.tags}
          />
        </section>
      </div>
    </section>
  );
}
