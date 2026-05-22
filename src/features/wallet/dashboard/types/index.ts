import type { TransactionType } from "@/features/wallet/transactions/types";

export type DashboardFilters = {
  month?: string;
  type?: "all" | TransactionType;
  categoryId?: string;
  tagId?: string;
};

export type TodaySummary = {
  income: number;
  expense: number;
};
