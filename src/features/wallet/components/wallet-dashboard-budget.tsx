import { Gauge, Plus } from "lucide-react";

import { formatBDT } from "@/lib/money";
import type { MonthlyLimit } from "@/types/wallet";

type WalletDashboardBudgetProps = {
  selectedMonth: string;
  monthExpense: number;
  monthlyLimit: MonthlyLimit | null;
};

export function WalletDashboardBudget({
  selectedMonth,
  monthExpense,
  monthlyLimit,
}: WalletDashboardBudgetProps) {
  const budgetPercent = monthlyLimit
    ? Math.min(Math.round((monthExpense / monthlyLimit.amountPaisa) * 100), 999)
    : 0;
  const barWidth = monthlyLimit ? `${Math.min(budgetPercent, 100)}%` : "0%";
  const remaining = monthlyLimit
    ? monthlyLimit.amountPaisa - monthExpense
    : null;
  const isOverLimit = remaining !== null && remaining < 0;

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-foreground">
          Monthly budget
        </h2>
        <span className="min-h-11 px-1 text-sm font-medium leading-[44px] text-[#534ab7]">
          {monthlyLimit ? "Edit" : selectedMonth}
        </span>
      </div>

      {monthlyLimit ? (
        <article className="rounded-xl border border-border/70 bg-background p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#eeedfe] text-[#534ab7]">
                <Gauge className="size-5" />
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-medium text-foreground">
                  Spending limit
                </h3>
                <p className="text-xs text-muted-foreground">
                  {formatBDT(monthExpense)} spent
                </p>
              </div>
            </div>
            <span
              className={
                isOverLimit
                  ? "rounded-md bg-[#fcebeb] px-2 py-1 text-xs font-medium text-[#a32d2d]"
                  : "rounded-md bg-[#eeedfe] px-2 py-1 text-xs font-medium text-[#534ab7]"
              }
            >
              {budgetPercent}% used
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={
                isOverLimit
                  ? "h-full rounded-full bg-[#a32d2d]"
                  : "h-full rounded-full bg-[#534ab7]"
              }
              style={{ width: barWidth }}
            />
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            {isOverLimit && remaining !== null
              ? `${formatBDT(Math.abs(remaining))} over ${formatBDT(
                  monthlyLimit.amountPaisa,
                )}`
              : `${formatBDT(monthExpense)} of ${formatBDT(
                  monthlyLimit.amountPaisa,
                )}`}
          </p>
        </article>
      ) : (
        <article className="flex min-h-20 items-center gap-3 rounded-xl border border-dashed border-border bg-background p-4 shadow-sm">
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-[#eeedfe] text-[#534ab7]">
            <Plus className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-[#534ab7]">
              Set a monthly budget
            </h3>
            <p className="text-xs text-muted-foreground">
              Track your spending limit
            </p>
          </div>
        </article>
      )}
    </section>
  );
}
