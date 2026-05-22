"use client";

import { useState, type ReactNode } from "react";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  Button,
} from "@/components/ui/Shared/Drawe";

import type { CategoryOption, TagOption } from "@/features/wallet/types";
import MobileAddTransactionCalculator from "@/features/wallet/transactions/components/mobile-add-transaction-calculator";

type BottomDrawerProps = {
  incomeCategories: CategoryOption[];
  expenseCategories: CategoryOption[];
  tags: TagOption[];
  renderTrigger?: (open: () => void) => ReactNode;
  hideDefaultTrigger?: boolean;
};

export default function BottomDrawer({
  incomeCategories,
  expenseCategories,
  tags,
  renderTrigger,
  hideDefaultTrigger,
}: BottomDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const openDrawer = () => setIsOpen(true);

  return (
    <>
      {renderTrigger ? (
        renderTrigger(openDrawer)
      ) : hideDefaultTrigger ? null : (
        <Button className="sm:hidden" onClick={openDrawer}>
          Add transaction
        </Button>
      )}

      <Drawer open={isOpen} onOpenChange={setIsOpen} side="bottom">
        <DrawerOverlay />
        <DrawerContent className="h-dvh max-h-dvh rounded-none border-0 p-0">
          <DrawerHeader className="px-4 py-4 text-left">
            <DrawerTitle>Add transaction</DrawerTitle>
            <DrawerDescription>
              Enter an amount, pick a category, and save.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto">
            <MobileAddTransactionCalculator
              incomeCategories={incomeCategories}
              expenseCategories={expenseCategories}
              tags={tags}
              onSaved={() => setIsOpen(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
