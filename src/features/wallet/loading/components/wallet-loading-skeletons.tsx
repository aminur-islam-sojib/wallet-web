import Link from "next/link";
import { Home, List, MoreHorizontal, PieChart, Plus } from "lucide-react";

import { WALLET_NAV_ITEMS } from "@/features/wallet/navigation/lib/wallet-nav";
import { cn } from "@/lib/utils";

const navItems = [
  { ...WALLET_NAV_ITEMS[0], Icon: Home },
  { ...WALLET_NAV_ITEMS[1], Icon: List },
  { ...WALLET_NAV_ITEMS[2], Icon: PieChart },
  { ...WALLET_NAV_ITEMS[3], Icon: MoreHorizontal },
];

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-lg bg-muted", className)}
    />
  );
}

function TransactionRowSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-border bg-background px-4 py-3">
      <SkeletonBlock className="size-11 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-4 w-20" />
        </div>
        <SkeletonBlock className="h-3 w-44 max-w-full" />
      </div>
    </div>
  );
}

function ChartCardSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <section className="rounded-xl border bg-background p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <SkeletonBlock className="size-13 shrink-0 rounded-xl" />
          <div className="space-y-2">
            <SkeletonBlock className="h-5 w-36" />
            <SkeletonBlock className="h-4 w-28" />
          </div>
        </div>
        <SkeletonBlock className="size-11 rounded-full" />
      </div>
      <SkeletonBlock className="mt-6 h-7 w-40" />
      <SkeletonBlock className={cn("mt-6 w-full rounded-xl", tall ? "h-64" : "h-52")} />
    </section>
  );
}

export function DashboardHeaderSkeleton() {
  return (
    <div>
      <div className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur sm:hidden">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="size-10 rounded-full" />
            <SkeletonBlock className="h-5 w-24" />
          </div>
          <SkeletonBlock className="size-11 rounded-full" />
        </div>
      </div>

      <div className="hidden sm:block">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="size-11 rounded-full" />
            <div className="space-y-2">
              <SkeletonBlock className="h-3 w-32" />
              <SkeletonBlock className="h-5 w-40" />
            </div>
          </div>
          <SkeletonBlock className="h-11 w-36 rounded-xl" />
        </div>
        <div className="border-b" />
      </div>

      <div className="sm:hidden">
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 px-3 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 shadow-[0_-12px_30px_-24px_rgba(15,23,42,0.35)] backdrop-blur">
          <nav className="mx-auto grid max-w-md grid-cols-5 items-center gap-1">
            {navItems.slice(0, 2).map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="pressable-soft nav-active-transition flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <item.Icon className="size-5" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            ))}

            <button
              type="button"
              disabled
              className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/50 text-primary-foreground"
              aria-label="Add transaction loading"
            >
              <Plus className="size-6" />
            </button>

            {navItems.slice(2).map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="pressable-soft nav-active-transition flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <item.Icon className="size-5" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

export function WalletDashboardSkeleton() {
  return (
    <main className="-mt-10 min-h-screen pb-6 sm:mt-0 sm:bg-muted/30 sm:py-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col sm:px-6 lg:px-8">
        <section className="mx-auto flex w-full max-w-md flex-col overflow-hidden sm:max-w-none sm:overflow-visible sm:rounded-2xl sm:border sm:border-border/70 sm:bg-[#f5f5f7] sm:p-4 lg:grid lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-6">
          <div className="min-w-0">
            <div className="rounded-b-3xl bg-[#17172b] px-5 pb-8 pt-5 shadow-[0_18px_40px_-32px_rgba(23,23,43,0.8)] sm:rounded-2xl sm:px-6 sm:pt-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <SkeletonBlock className="size-11 rounded-full bg-white/15" />
                  <div className="space-y-2">
                    <SkeletonBlock className="h-3 w-20 bg-white/15" />
                    <SkeletonBlock className="h-4 w-32 bg-white/15" />
                  </div>
                </div>
                <SkeletonBlock className="size-11 rounded-full bg-white/15" />
              </div>
              <SkeletonBlock className="h-3 w-28 bg-white/15" />
              <SkeletonBlock className="mt-3 h-10 w-64 max-w-full bg-white/15" />
              <SkeletonBlock className="mt-3 h-3 w-36 bg-white/15" />
            </div>

            <div className="relative z-10 -mt-4 grid grid-cols-2 gap-2 px-4 sm:-mt-5 sm:gap-3 sm:px-5">
              <SkeletonBlock className="h-28 rounded-xl border border-border/70 bg-background" />
              <SkeletonBlock className="h-28 rounded-xl border border-border/70 bg-background" />
            </div>
          </div>

          <div className="gap-4 px-4 pb-5 pt-4 sm:px-5 lg:px-0 lg:pt-0">
            <SkeletonBlock className="mb-5 h-32 rounded-xl border border-border/70 bg-background" />
            <ChartCardSkeleton />
            <div className="mt-5 overflow-hidden rounded-xl border bg-background">
              {Array.from({ length: 5 }).map((_, index) => (
                <TransactionRowSkeleton key={index} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export function WalletTransactionsSkeleton() {
  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mt-4 grid grid-cols-2 gap-3">
          <SkeletonBlock className="h-28 rounded-xl border bg-background" />
          <SkeletonBlock className="h-28 rounded-xl border bg-background" />
        </div>
        <div className="mt-6 overflow-hidden rounded-xl border bg-background">
          {Array.from({ length: 8 }).map((_, index) => (
            <TransactionRowSkeleton key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}

export function WalletStatisticsSkeleton() {
  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-5xl px-4 py-5 pb-10 sm:px-6 lg:px-8">
        <div className="mt-6 space-y-6">
          <ChartCardSkeleton />
          <ChartCardSkeleton tall />
          <ChartCardSkeleton tall />
        </div>
      </div>
    </main>
  );
}

export function WalletMoreSkeleton() {
  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-lg flex-col gap-4 py-10">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="size-10 rounded-xl" />
            <div className="space-y-2">
              <SkeletonBlock className="h-5 w-32" />
              <SkeletonBlock className="h-3 w-24" />
            </div>
          </div>
          <SkeletonBlock className="h-11 rounded-xl" />
          <SkeletonBlock className="h-72 rounded-2xl border bg-background" />
          <SkeletonBlock className="h-4 w-36" />
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock
              key={index}
              className="h-18 rounded-2xl border bg-background"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
