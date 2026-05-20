"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Gauge, Plus } from "lucide-react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerOverlay,
  DrawerTitle,
} from "@/components/ui/Shared/Drawe";
import { MonthlyLimitForm } from "@/features/wallet/components/monthly-limit-form";
import type { MonthlyLimit } from "@/types/wallet";

type WalletFloatingActionsProps = {
  selectedMonth: string;
  monthlyLimit: MonthlyLimit | null;
};

export default function WalletFloatingActions({
  selectedMonth,
  monthlyLimit,
}: WalletFloatingActionsProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [limitDrawerOpen, setLimitDrawerOpen] = useState(false);

  const handleToggleMenu = () => {
    setMenuOpen((open) => !open);
  };

  const handleOpenLimitDrawer = () => {
    setMenuOpen(false);
    setLimitDrawerOpen(true);
  };

  return (
    <>
      <motion.div className="fixed bottom-[calc(env(safe-area-inset-bottom)+104px)] right-4 z-[45] sm:hidden">
        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="absolute bottom-16 right-0 w-64 max-w-[calc(100vw-32px)] overflow-hidden rounded-lg border bg-background p-2 text-foreground shadow-xl shadow-foreground/15"
            >
              <button
                type="button"
                onClick={handleOpenLimitDrawer}
                className="pressable-soft flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2 text-left text-base hover:bg-muted"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-700">
                  <Gauge className="size-5" />
                </span>
                <span>
                  <span className="block font-medium">Add monthly limit</span>
                  <span className="block text-sm text-muted-foreground">
                    Set a spending cap
                  </span>
                </span>
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <button
          type="button"
          onClick={handleToggleMenu}
          aria-expanded={menuOpen}
          aria-label="Wallet quick actions"
          className="pressable-soft grid size-14 place-items-center rounded-full bg-foreground text-background shadow-lg shadow-foreground/25 ring-1 ring-background/80"
        >
          <Plus className="size-6" />
        </button>
      </motion.div>

      <Drawer
        open={limitDrawerOpen}
        onOpenChange={setLimitDrawerOpen}
        side="bottom"
      >
        <DrawerOverlay />
        <DrawerContent className="max-h-[85dvh] rounded-t-lg border-t p-0">
          <DrawerHeader className="px-4 py-4 text-left">
            <DrawerTitle>Add monthly limit</DrawerTitle>
            <DrawerDescription>
              Set a total expense limit for the selected month.
            </DrawerDescription>
          </DrawerHeader>
          <MonthlyLimitForm
            selectedMonth={selectedMonth}
            monthlyLimit={monthlyLimit}
            onSaved={() => {
              setLimitDrawerOpen(false);
              router.refresh();
            }}
          />
        </DrawerContent>
      </Drawer>
    </>
  );
}
