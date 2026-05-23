"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, PieChart, MoreHorizontal, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import BottomDrawer from "@/features/wallet/transactions/components/bottom-drawer";

import type {
  CategoryOption,
  MonthlyLimit,
  TagOption,
} from "@/features/wallet/types";
import { WALLET_NAV_ITEMS } from "@/features/wallet/navigation/lib/wallet-nav";

const navItems = [
  { ...WALLET_NAV_ITEMS[0], Icon: Home },
  { ...WALLET_NAV_ITEMS[1], Icon: List },
  { ...WALLET_NAV_ITEMS[2], Icon: PieChart },
  { ...WALLET_NAV_ITEMS[3], Icon: MoreHorizontal },
];

type WalletBottomNavProps = {
  selectedMonth: string;
  monthlyLimit: MonthlyLimit | null;
  incomeCategories: CategoryOption[];
  expenseCategories: CategoryOption[];
  tags: TagOption[];
};

export default function WalletBottomNav({
  incomeCategories,
  expenseCategories,
  tags,
}: WalletBottomNavProps) {
  const pathname = usePathname();

  return (
    <div className="sm:hidden">
      <BottomDrawer
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
        tags={tags}
        hideDefaultTrigger
        renderTrigger={(open) => (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 px-3 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 shadow-[0_-12px_30px_-24px_rgba(15,23,42,0.35)] backdrop-blur">
            <nav className="mx-auto grid max-w-md grid-cols-5 items-center gap-1">
              {navItems.slice(0, 2).map((item) => {
                const isActive =
                  item.href === "/wallet"
                    ? pathname === "/wallet"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={cn(
                      "pressable-soft nav-active-transition flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-sm",
                      isActive
                        ? "text-[#534ab7]"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.Icon className="size-5" />
                    <span className="text-[10px]">{item.label}</span>
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={open}
                className="pressable-soft mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#534ab7] text-white shadow-lg shadow-[#534ab7]/25 transition-transform duration-300 ease-out hover:scale-105"
                aria-label="Add transaction"
              >
                <Plus className="size-6" />
              </button>

              {navItems.slice(2).map((item) => {
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={cn(
                      "pressable-soft nav-active-transition flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-sm",
                      isActive
                        ? "text-[#534ab7]"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.Icon className="size-5" />
                    <span className="text-[10px]">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      />
    </div>
  );
}
