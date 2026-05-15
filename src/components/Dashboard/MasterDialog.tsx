"use client";

import React, { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";

type AddTransactionButtonProps = {
  children: React.ReactNode;
  buttonLabel?: string;
  title?: string;
  description?: string;
};

const MasterDialoge: React.FC<AddTransactionButtonProps> = ({
  children,
  buttonLabel = "Add transaction",
  title = "Add transaction",
  description = "Log income or expense with category, tags, and notes.",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>{buttonLabel}</Button>
      </DialogTrigger>
      <DialogContent className="flex h-[90vh] w-160 max-w-[90vw] flex-col p-0 overflow-hidden">
        <DialogHeader className="shrink-0 px-4 pt-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div
          className="min-h-0 flex-1 overflow-y-auto px-4 pb-4"
          style={{
            scrollbarWidth: "none" /* Firefox */,
            msOverflowStyle: "none" /* IE / Edge legacy */,
          }}
        >
          {/* Hides WebKit scrollbar (Chrome, Safari, new Edge) */}
          <style>{`
            .hide-scrollbar::-webkit-scrollbar { display: none; }
          `}</style>
          <div className="hide-scrollbar">{children}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MasterDialoge;
