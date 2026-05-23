export type TransactionType = "income" | "expense";

export type PaymentMethod =
  | "cash"
  | "card"
  | "bank_transfer"
  | "bkash"
  | "nagad"
  | "rocket"
  | "other";

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

export type TransactionsCategoryOption = {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  isDefault: boolean;
};

export type TransactionsTagOption = {
  id: string;
  name: string;
};

export type TransactionsFilters = {
  month?: string;
  type?: "all" | TransactionType;
  categoryId?: string;
  tagId?: string;
};

export type TransactionsPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type TransactionsSummary = {
  income: number;
  expense: number;
};

export type TransactionsPageData = {
  selectedMonth: string;
  categories: TransactionsCategoryOption[];
  tags: TransactionsTagOption[];
  transactions: TransactionRow[];
  pagination: TransactionsPagination;
  summary: TransactionsSummary;
  filters: TransactionsFilters;
};
