"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, PieChart, MoreHorizontal, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import BottomDrawer from "@/features/wallet/components/bottom-drawer";

import type { CategoryOption, TagOption } from "@/types/wallet";
import { WALLET_NAV_ITEMS } from "../navigation/wallet-nav";

const navItems = [
  { ...WALLET_NAV_ITEMS[0], Icon: Home },
  { ...WALLET_NAV_ITEMS[1], Icon: List },
  { ...WALLET_NAV_ITEMS[2], Icon: PieChart },
  { ...WALLET_NAV_ITEMS[3], Icon: MoreHorizontal },
];

type WalletBottomNavProps = {
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
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-2 shadow-[0_-12px_30px_-24px_rgba(15,23,42,0.35)]">
            <nav className="grid grid-cols-5 items-end gap-2">
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
                      "pressable-soft nav-active-transition flex min-h-11 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-sm",
                      isActive
                        ? "-translate-y-1 bg-foreground text-background shadow-sm"
                        : "text-muted-foreground hover:-translate-y-0.5 hover:text-foreground",
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
                className="pressable-soft mx-auto flex size-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg shadow-foreground/20 transition-transform duration-300 ease-out hover:scale-105"
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
                      "pressable-soft nav-active-transition flex min-h-11 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-sm",
                      isActive
                        ? "-translate-y-1 bg-foreground text-background shadow-sm"
                        : "text-muted-foreground hover:-translate-y-0.5 hover:text-foreground",
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
