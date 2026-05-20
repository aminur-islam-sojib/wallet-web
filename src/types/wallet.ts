export type TransactionType = "income" | "expense";
export type PaymentMethod =
  | "cash"
  | "card"
  | "bank_transfer"
  | "bkash"
  | "nagad"
  | "rocket"
  | "other";

export type DashboardFilters = {
  month?: string;
  type?: "all" | TransactionType;
  categoryId?: string;
  tagId?: string;
};

export type CategoryOption = {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  isDefault: boolean;
};

export type TagOption = {
  id: string;
  name: string;
};

export type MonthlyLimit = {
  month: string;
  amountPaisa: number;
};

export type TodaySummary = {
  income: number;
  expense: number;
};

export type TransactionRow = {
  id: string;
  type: TransactionType;
  amountPaisa: number;
  date: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  tagIds: string[];
  tagNames: string[];
  note: string;
  paymentMethod?: PaymentMethod;
  place?: string;
  attachment?: {
    name: string;
    type: string;
    size: number;
  };
};
