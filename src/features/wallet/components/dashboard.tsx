import { Bell, TrendingDown, TrendingUp } from "lucide-react";

import { WalletDashboardBudget } from "@/features/wallet/components/wallet-dashboard-budget";
import { WalletDashboardTransactions } from "@/features/wallet/components/wallet-dashboard-transactions";
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
  user,
  selectedMonth,
  summary,
  todaySummary,
  monthlyLimit,
  categories,
  tags,
  transactions,
}: DashboardProps) {
  const updatedLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
  const greeting = getGreeting();

  return (
    <main className="-mt-24 min-h-screen bg-[#f5f5f7] pb-6 sm:mt-0 sm:bg-muted/30 sm:py-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col sm:px-6 lg:px-8">
        <section className="mx-auto flex w-full max-w-md flex-col overflow-hidden bg-[#f5f5f7] sm:max-w-none sm:overflow-visible sm:rounded-2xl sm:border sm:border-border/70 sm:bg-[#f5f5f7] sm:p-4 lg:grid lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-6">
          <div className="min-w-0">
            <WalletHero
              user={user}
              balance={summary.balance}
              greeting={greeting}
              updatedLabel={updatedLabel}
            />

            <div className="relative z-10 -mt-4 grid grid-cols-2 gap-2 px-4 sm:-mt-5 sm:gap-3 sm:px-5">
              <TodayStat
                label="Today's income"
                value={formatBDT(todaySummary.income)}
                tone="income"
              />
              <TodayStat
                label="Today's cost"
                value={formatBDT(todaySummary.expense)}
                tone="expense"
              />
            </div>
          </div>

          <div className="grid gap-4 px-4 pb-5 pt-4 sm:px-5 lg:px-0 lg:pt-0">
            <WalletDashboardBudget
              selectedMonth={selectedMonth}
              monthExpense={summary.expense}
              monthlyLimit={monthlyLimit}
            />
            <WalletDashboardTransactions
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

function WalletHero({
  user,
  balance,
  greeting,
  updatedLabel,
}: {
  user: DashboardProps["user"];
  balance: number;
  greeting: string;
  updatedLabel: string;
}) {
  return (
    <div className="rounded-b-3xl bg-[#17172b] px-5 pb-8 pt-5 text-white shadow-[0_18px_40px_-32px_rgba(23,23,43,0.8)] sm:rounded-2xl sm:px-6 sm:pt-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <WalletAvatar user={user} />
          <div className="min-w-0">
            <p className="text-sm text-white/55">{greeting},</p>
            <p className="truncate text-base font-medium text-white">
              {user.name}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 text-white/75 transition-colors hover:bg-white/15"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
        </button>
      </div>

      <p className="text-xs font-medium uppercase tracking-[0.08em] text-white/50">
        Total balance
      </p>
      <p className="mt-1 wrap-break-word text-[34px] font-medium leading-tight tracking-normal text-white sm:text-5xl">
        {formatBDT(balance)}
      </p>
      <p className="mt-1 text-xs text-white/40">Updated {updatedLabel}</p>
    </div>
  );
}

function WalletAvatar({ user }: { user: DashboardProps["user"] }) {
  if (user.image) {
    return (
      <div
        aria-hidden="true"
        className="size-11 shrink-0 rounded-full bg-cover bg-center ring-1 ring-white/20"
        style={{ backgroundImage: `url(${user.image})` }}
      />
    );
  }

  return (
    <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#534ab7] text-sm font-semibold text-[#eeedfe]">
      {getInitials(user.name)}
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
  const isIncome = tone === "income";
  const Icon = isIncome ? TrendingUp : TrendingDown;

  return (
    <article className="rounded-xl border border-border/70 bg-background p-3 shadow-sm sm:p-4">
      <span
        className={
          isIncome
            ? "grid size-8 place-items-center rounded-lg bg-[#eaf3de] text-[#3b6d11]"
            : "grid size-8 place-items-center rounded-lg bg-[#fcebeb] text-[#a32d2d]"
        }
      >
        <Icon className="size-4" />
      </span>
      <p className="mt-2 text-xs text-muted-foreground">{label}</p>
      <p
        className={
          isIncome
            ? "mt-1 wrap-break-word text-[17px] font-medium leading-tight tracking-normal text-[#3b6d11]"
            : "mt-1 wrap-break-word text-[17px] font-medium leading-tight tracking-normal text-[#a32d2d]"
        }
      >
        {value}
      </p>
    </article>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "U";
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
