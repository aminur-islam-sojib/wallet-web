"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
} from "@/components/ui/Shared/Drawe";
import type {
  TransactionsCategoryOption,
  TransactionsFilters,
  TransactionsTagOption,
} from "@/features/wallet/transactions/types";

type TransactionsFiltersProps = {
  categories: TransactionsCategoryOption[];
  tags: TransactionsTagOption[];
  initialFilters: TransactionsFilters;
  containerClassName?: string;
  triggerClassName?: string;
};

export default function TransactionsFilters({
  categories,
  tags,
  initialFilters,
  containerClassName,
  triggerClassName,
}: TransactionsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(initialFilters.month ?? "");
  const [type, setType] = useState<TransactionsFilters["type"]>(
    initialFilters.type ?? "all",
  );
  const [categoryId, setCategoryId] = useState(initialFilters.categoryId ?? "");
  const [tagId, setTagId] = useState(initialFilters.tagId ?? "");

  function openFilters() {
    setMonth(initialFilters.month ?? "");
    setType(initialFilters.type ?? "all");
    setCategoryId(initialFilters.categoryId ?? "");
    setTagId(initialFilters.tagId ?? "");
    setOpen(true);
  }

  const tagOptions = useMemo(
    () => tags.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [tags],
  );

  function applyFilters() {
    const params = new URLSearchParams(searchParams?.toString());
    params.delete("page");

    if (month) params.set("month", month);
    else params.delete("month");

    if (type && type !== "all") params.set("type", type);
    else params.delete("type");

    if (categoryId) params.set("categoryId", categoryId);
    else params.delete("categoryId");

    if (tagId) params.set("tagId", tagId);
    else params.delete("tagId");

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
    setOpen(false);
  }

  function clearFilters() {
    setMonth("");
    setType("all");
    setCategoryId("");
    setTagId("");
    router.push(pathname);
    setOpen(false);
  }

  return (
    <div className={cn("mt-5", containerClassName)}>
      <button
        type="button"
        onClick={openFilters}
        className={cn(
          "flex min-h-11 items-center gap-2 rounded-xl border bg-background px-4 text-sm font-semibold text-foreground transition hover:bg-muted",
          triggerClassName,
        )}
      >
        <Filter className="size-4" />
      </button>

      <Drawer open={open} onOpenChange={setOpen} side="bottom">
        <DrawerOverlay className="bg-black/40" />
        <DrawerContent className="rounded-t-3xl border-t border-border p-0">
          <div className="mt-3 h-1 w-10 self-center rounded-full bg-border" />
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h3 className="text-base font-semibold">Filters</h3>
              <p className="text-xs text-muted-foreground">
                Narrow down transactions by time, type, or labels.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="min-h-10 rounded-lg border px-3 text-sm font-semibold"
            >
              Close
            </button>
          </div>

          <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto px-5 py-5">
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Month
              </label>
              <input
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="min-h-11 w-full rounded-lg border bg-background px-3 text-sm"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Type
              </label>
              <select
                value={type ?? "all"}
                onChange={(event) =>
                  setType(event.target.value as TransactionsFilters["type"])
                }
                className="min-h-11 w-full rounded-lg border bg-background px-3 text-sm"
              >
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="min-h-11 w-full rounded-lg border bg-background px-3 text-sm"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Tag
              </label>
              <select
                value={tagId}
                onChange={(event) => setTagId(event.target.value)}
                className="min-h-11 w-full rounded-lg border bg-background px-3 text-sm"
              >
                <option value="">All tags</option>
                {tagOptions.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={applyFilters}
                className="min-h-11 rounded-lg bg-foreground text-sm font-semibold text-background"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="min-h-11 rounded-lg border text-sm font-semibold text-foreground"
              >
                Clear
              </button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
