"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Bell, Filter, Search } from "lucide-react";

import TransactionsFilters from "@/features/wallet/transactions/components/transactions-filters-top";
import { cn } from "@/lib/utils";
import { WALLET_NAV_ITEMS } from "@/features/wallet/navigation/lib/wallet-nav";
import DrawerRight from "@/components/ui/Shared/Drawer";
import type {
  TransactionsCategoryOption,
  TransactionsFilters as TransactionsFiltersType,
  TransactionsTagOption,
} from "@/features/wallet/transactions/types";

type WalletMobileHeaderProps = {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  transactionsFilters?: {
    categories: TransactionsCategoryOption[];
    tags: TransactionsTagOption[];
  };
};

function normalizeType(value?: string): TransactionsFiltersType["type"] {
  if (value === "income" || value === "expense") return value;
  if (value === "all") return "all";
  return "all";
}

function getRouteLabel(pathname: string) {
  if (pathname === "/wallet") {
    return "Wallet";
  }

  const match = WALLET_NAV_ITEMS.find(
    (item) => item.href !== "/wallet" && pathname.startsWith(item.href),
  );

  if (match) {
    return match.label;
  }

  if (pathname.startsWith("/health")) {
    return "Health";
  }

  const segments = pathname.split("/").filter(Boolean);
  if (!segments.length) {
    return "Home";
  }

  const last = segments[segments.length - 1];
  return last.charAt(0).toUpperCase() + last.slice(1);
}

function Avatar({
  user,
  className,
}: {
  user: WalletMobileHeaderProps["user"];
  className?: string;
}) {
  if (user.image) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "size-10 rounded-full border bg-muted bg-cover bg-center",
          className,
        )}
        style={{ backgroundImage: `url(${user.image})` }}
      />
    );
  }

  return (
    <div
      className={cn(
        "grid size-10 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground",
        className,
      )}
    >
      {user.name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function WalletMobileHeader({
  user,
  transactionsFilters,
}: WalletMobileHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeLabel = getRouteLabel(pathname);
  const isWalletHome = pathname === "/wallet";
  const isTransactions = pathname.startsWith("/wallet/transactions");
  const initialFilters: TransactionsFiltersType = {
    month: searchParams?.get("month") ?? undefined,
    type: normalizeType(searchParams?.get("type") ?? undefined),
    categoryId: searchParams?.get("categoryId") ?? undefined,
    tagId: searchParams?.get("tagId") ?? undefined,
  };

  if (isWalletHome) {
    return null;
  }

  const accountTrigger = (
    <DrawerRight
      user={user}
      renderTrigger={(open) => (
        <button
          type="button"
          className="pressable-soft grid size-11 place-items-center rounded-full border border-border"
          aria-label="Account"
          onClick={open}
        >
          <Avatar user={user} className="size-9" />
        </button>
      )}
    />
  );

  return (
    <div className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur sm:hidden">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
        {isTransactions ? (
          <p className="text-lg font-semibold text-foreground">Transactions</p>
        ) : (
          <div className="flex items-center gap-3">
            {accountTrigger}
            <p className="text-lg font-semibold text-foreground">
              {routeLabel}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2">
          {isTransactions ? (
            <>
              <button
                type="button"
                className="grid size-11 place-items-center rounded-full border border-border text-foreground"
                aria-label="Search transactions"
              >
                <Search className="size-5" />
              </button>
              {transactionsFilters ? (
                <TransactionsFilters
                  categories={transactionsFilters.categories}
                  tags={transactionsFilters.tags}
                  initialFilters={initialFilters}
                  containerClassName="mt-0"
                  triggerClassName="grid size-11 place-items-center rounded-full border border-border text-foreground px-0"
                />
              ) : (
                <button
                  type="button"
                  className="grid size-11 place-items-center rounded-full border border-border text-foreground"
                  aria-label="Filter transactions"
                >
                  <Filter className="size-5" />
                </button>
              )}
              {accountTrigger}
            </>
          ) : (
            <>
              <button
                type="button"
                className="grid size-11 place-items-center rounded-full border border-border text-foreground"
                aria-label="Notifications"
              >
                <Bell className="size-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
