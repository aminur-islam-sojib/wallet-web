import type { TransactionType } from "@/features/wallet/transactions/types";

export type CategoryTotalsFilters = {
  startDate: string;
  endDate: string;
  type?: TransactionType;
};

export type CategoryTotal = {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  totalPaisa: number;
  percent: number;
};

export type CategoryTotalsResponse = {
  startDate: string;
  endDate: string;
  type: TransactionType;
  totalPaisa: number;
  categories: CategoryTotal[];
};
