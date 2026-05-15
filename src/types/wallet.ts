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

export type TransactionRow = {
  id: string;
  type: TransactionType;
  amountPaisa: number;
  date: string;
  categoryName: string;
  categoryColor: string;
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
