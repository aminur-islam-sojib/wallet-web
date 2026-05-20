"use client";

import { useActionState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  saveMonthlyLimit,
  type MonthlyLimitActionState,
} from "@/features/wallet/server/actions";
import type { MonthlyLimit } from "@/types/wallet";

function formatAmountInput(amountPaisa?: number) {
  if (!amountPaisa) return "";
  return (amountPaisa / 100).toFixed(2);
}

type MonthlyLimitFormProps = {
  selectedMonth: string;
  monthlyLimit: MonthlyLimit | null;
  onSaved?: () => void;
};

export function MonthlyLimitForm({
  selectedMonth,
  monthlyLimit,
  onSaved,
}: MonthlyLimitFormProps) {
  const initialState: MonthlyLimitActionState = { success: false };
  const [state, formAction, pending] = useActionState(
    saveMonthlyLimit,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      onSaved?.();
    }
  }, [onSaved, state.success]);

  return (
    <form action={formAction} className="grid gap-4 px-4 pb-6">
      <label className="grid gap-2 text-base">
        <span className="font-medium">Month</span>
        <input
          type="month"
          name="month"
          defaultValue={monthlyLimit?.month ?? selectedMonth}
          required
          className="min-h-11 w-full rounded-md border bg-background px-3 text-base"
        />
      </label>

      <label className="grid gap-2 text-base">
        <span className="font-medium">Limit amount</span>
        <input
          name="amount"
          inputMode="decimal"
          placeholder="25000.00"
          defaultValue={formatAmountInput(monthlyLimit?.amountPaisa)}
          required
          className="min-h-11 w-full rounded-md border bg-background px-3 text-base"
        />
      </label>

      {state.message ? (
        <p
          className={
            state.success
              ? "text-sm text-emerald-700"
              : "text-sm text-destructive"
          }
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <Button type="submit" className="min-h-11 w-full" disabled={pending}>
        {pending ? "Saving..." : "Save monthly limit"}
      </Button>
    </form>
  );
}
