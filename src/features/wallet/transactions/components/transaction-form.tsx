"use client";

import { useState } from "react";
import { createTransaction } from "@/features/wallet/server/transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateInputValue } from "@/lib/date";
import type { CategoryOption, TagOption } from "@/features/wallet/types";
import { cn } from "@/lib/utils";

type TransactionType = "expense" | "income";

type TransactionFormProps = {
  incomeCategories: CategoryOption[];
  expenseCategories: CategoryOption[];
  tags: TagOption[];
};

export default function TransactionForm({
  incomeCategories,
  expenseCategories,
  tags,
}: TransactionFormProps) {
  const today = formatDateInputValue();
  const [type, setType] = useState<TransactionType>("expense");

  const visibleCategories =
    type === "expense" ? expenseCategories : incomeCategories;

  return (
    <form action={createTransaction} className="space-y-4 pt-1">
      {/* Hidden type field for form submission */}
      <input type="hidden" name="type" value={type} />

      {/* ── Type Toggle ── */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Type
        </Label>
        <div className="grid grid-cols-2 gap-1.5 rounded-xl border bg-muted/40 p-1">
          {(["expense", "income"] as TransactionType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "rounded-lg py-2 text-sm font-medium transition-all duration-150",
                type === t
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground/80",
              )}
            >
              <span className="flex items-center justify-center gap-1.5">
                {t === "expense" ? (
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                ) : (
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                )}
                <span className="capitalize">{t}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Amount ── */}
      <div className="space-y-1.5">
        <Label
          htmlFor="amount"
          className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
        >
          Amount
        </Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground select-none">
            $
          </span>
          <Input
            id="amount"
            name="amount"
            inputMode="decimal"
            placeholder="0.00"
            required
            className="h-10 rounded-xl pl-7 text-sm"
          />
        </div>
      </div>

      {/* ── Date ── */}
      <div className="space-y-1.5">
        <Label
          htmlFor="date"
          className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
        >
          Date
        </Label>
        <Input
          id="date"
          type="date"
          name="date"
          defaultValue={today}
          required
          className="h-10 rounded-xl text-sm"
        />
      </div>

      {/* ── Category (filtered by type) ── */}
      <div className="space-y-1.5">
        <Label
          htmlFor="categoryId"
          className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
        >
          Category
        </Label>
        {visibleCategories.length > 0 ? (
          <Select name="categoryId" required>
            <SelectTrigger id="categoryId" className="h-10 rounded-xl text-sm">
              <SelectValue placeholder={`Select a ${type} category`} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {visibleCategories.map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.id}
                  className="rounded-lg text-sm"
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="flex h-10 w-full items-center rounded-xl border border-dashed bg-muted/30 px-3 text-xs text-muted-foreground">
            No {type} categories available.
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground capitalize">{type}</span>{" "}
          categories only.
        </p>
      </div>

      {/* ── Tags (filtered by type) ── */}
      <div className="space-y-1.5">
        <Label
          htmlFor="tagIds"
          className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
        >
          Tags{" "}
          <span className="normal-case font-normal text-muted-foreground/60">
            (optional)
          </span>
        </Label>
        {tags.length > 0 ? (
          <>
            <select
              id="tagIds"
              name="tagIds"
              multiple
              className="min-h-22 w-full rounded-xl border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
            >
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Hold Ctrl or Cmd to select multiple tags.
            </p>
          </>
        ) : (
          <div className="flex min-h-22 w-full items-center justify-center rounded-xl border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            No tags available.
          </div>
        )}
      </div>

      {/* ── Note ── */}
      <div className="space-y-1.5">
        <Label
          htmlFor="note"
          className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
        >
          Note{" "}
          <span className="normal-case font-normal text-muted-foreground/60">
            (optional)
          </span>
        </Label>
        <Textarea
          id="note"
          name="note"
          maxLength={240}
          rows={3}
          className="resize-none rounded-xl text-sm"
          placeholder="Add a note..."
        />
      </div>

      <Button type="submit" className="w-full rounded-xl h-10 font-medium">
        Save transaction
      </Button>
    </form>
  );
}
