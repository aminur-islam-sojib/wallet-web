import type { TransactionType } from "@/features/wallet/types/models";
import type { CategoryIconId } from "@/features/wallet/categories/lib/category-icons";

export const DEFAULT_CATEGORIES: Array<{
  name: string;
  type: TransactionType;
  color: string;
  icon: CategoryIconId;
}> = [
  { name: "Food", type: "expense", color: "#ef4444", icon: "utensils" },
  { name: "Transport", type: "expense", color: "#f97316", icon: "bus" },
  { name: "Rent", type: "expense", color: "#8b5cf6", icon: "home" },
  { name: "Shopping", type: "expense", color: "#ec4899", icon: "shopping-bag" },
  { name: "Bills", type: "expense", color: "#06b6d4", icon: "receipt" },
  { name: "Health", type: "expense", color: "#22c55e", icon: "heart-pulse" },
  { name: "Salary", type: "income", color: "#16a34a", icon: "briefcase" },
  { name: "Freelance", type: "income", color: "#2563eb", icon: "laptop" },
  { name: "Gift", type: "income", color: "#d946ef", icon: "gift" },
  { name: "Other", type: "income", color: "#0f766e", icon: "circle" },
];
