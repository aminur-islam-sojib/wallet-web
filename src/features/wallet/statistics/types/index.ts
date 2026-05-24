import type {
  PaymentMethod,
  TransactionRow,
  TransactionType,
  TransactionsCategoryOption,
  TransactionsTagOption,
} from "@/features/wallet/transactions/types";

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

export type CategoryDetailFilters = CategoryTotalsFilters & {
  categoryId: string;
};

export type CategoryDetailBreakdown = {
  id: string;
  label: string;
  totalPaisa: number;
  count: number;
  percent: number;
};

export type CategoryDetailResponse = {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  startDate: string;
  endDate: string;
  type: TransactionType;
  totalPaisa: number;
  chartTotalPaisa: number;
  percent: number;
  transactionCount: number;
  averagePaisa: number;
  paymentMethodBreakdown: Array<
    CategoryDetailBreakdown & { id: PaymentMethod | "unspecified" }
  >;
  tagBreakdown: CategoryDetailBreakdown[];
  transactions: TransactionRow[];
  categories: TransactionsCategoryOption[];
  tags: TransactionsTagOption[];
};
