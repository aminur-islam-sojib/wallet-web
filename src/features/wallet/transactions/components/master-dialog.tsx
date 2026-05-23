"use client";

import { useState, type ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type MasterDialogProps = {
  children: ReactNode;
  buttonLabel?: string;
  title?: string;
  description?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
};

export default function MasterDialog({
  children,
  buttonLabel = "Add transaction",
  title = "Add transaction",
  description = "Log income or expense with category, tags, and notes.",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
}: MasterDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = isControlled
    ? (controlledOnOpenChange ?? setInternalOpen)
    : setInternalOpen;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="rounded-xl px-5 font-medium">{buttonLabel}</Button>
        )}
      </DialogTrigger>

      <DialogContent className="flex max-h-[92vh] w-full max-w-lg flex-col gap-0 overflow-hidden rounded-2xl border p-0 shadow-xl">
        <DialogHeader className="shrink-0 border-b px-6 py-5">
          <DialogTitle className="text-base font-semibold tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="mt-0.5 text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="master-dialog-scroll min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
