"use client";

import { createTransaction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import type { CategoryOption, TagOption } from "@/lib/dashboard";

const today = new Date().toISOString().slice(0, 10);

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
  return (
    <form
      action={createTransaction}
      className="rounded-lg border bg-background p-4"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-semibold">Add transaction</span>
      </div>
      <div className="grid gap-3">
        <label className="grid gap-1 text-sm">
          <span>Type</span>
          <select
            name="type"
            required
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span>Amount</span>
          <input
            name="amount"
            inputMode="decimal"
            placeholder="1200.00"
            required
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>Date</span>
          <input
            type="date"
            name="date"
            defaultValue={today}
            required
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>Category</span>
          <select
            name="categoryId"
            required
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <optgroup label="Expense">
              {expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Income">
              {incomeCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </optgroup>
          </select>
          <p className="text-xs text-muted-foreground">
            Pick a category that matches the selected type.
          </p>
        </label>
        <label className="grid gap-1 text-sm">
          <span>Tags</span>
          <select
            name="tagIds"
            multiple
            className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span>Note</span>
          <textarea
            name="note"
            maxLength={240}
            rows={3}
            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Optional"
          />
        </label>
      </div>
      <Button type="submit" className="mt-4 w-full">
        Save transaction
      </Button>
    </form>
  );
}
