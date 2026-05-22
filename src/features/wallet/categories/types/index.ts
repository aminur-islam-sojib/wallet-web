import type { TransactionType } from "@/features/wallet/transactions/types";

export type CategoryOption = {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  isDefault: boolean;
};
