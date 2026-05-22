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
