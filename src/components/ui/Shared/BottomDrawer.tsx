"use client";
import { useState } from "react";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  Button,
} from "./Drawe";

import type { CategoryOption, TagOption } from "@/lib/dashboard";
import TransactionForm from "@/components/Dashboard/transaction-form";

type BottomDrawerProps = {
  incomeCategories: CategoryOption[];
  expenseCategories: CategoryOption[];
  tags: TagOption[];
};

export default function BottomDrawer({
  incomeCategories,
  expenseCategories,
  tags,
}: BottomDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button className="sm:hidden" onClick={() => setIsOpen(true)}>
        Add transaction
      </Button>

      <Drawer open={isOpen} onOpenChange={setIsOpen} side="bottom">
        <DrawerOverlay />
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Add transaction</DrawerTitle>
            <DrawerDescription>
              Log income or expense on the go.
            </DrawerDescription>
          </DrawerHeader>

          <div className="overflow-y-auto ">
            <TransactionForm
              incomeCategories={incomeCategories}
              expenseCategories={expenseCategories}
              tags={tags}
            />
          </div>

          <DrawerFooter className="gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
