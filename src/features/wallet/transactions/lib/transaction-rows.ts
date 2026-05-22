import type {
  TransactionRow,
  TransactionsCategoryOption,
  TransactionsTagOption,
} from "@/features/wallet/transactions/types";

type TransactionDoc = {
  _id: { toString(): string };
  type: "income" | "expense";
  amountPaisa: number;
  date: Date;
  categoryId: { toString(): string };
  tagIds: { toString(): string }[];
  note?: string | null;
  paymentMethod?: TransactionRow["paymentMethod"] | null;
  place?: string | null;
  attachment?: {
    name?: string | null;
    type?: string | null;
    size?: number | null;
  } | null;
};

export function mapTransactionsToRows(
  transactions: TransactionDoc[],
  categories: TransactionsCategoryOption[],
  tags: TransactionsTagOption[],
): TransactionRow[] {
  const categoryById = new Map(
    categories.map((category) => [category.id, category]),
  );
  const tagById = new Map(tags.map((tag) => [tag.id, tag]));

  return transactions.map((transaction) => {
    const categoryId = transaction.categoryId.toString();
    const category = categoryById.get(categoryId);

    return {
      id: transaction._id.toString(),
      type: transaction.type,
      amountPaisa: transaction.amountPaisa,
      date: transaction.date.toISOString().slice(0, 10),
      categoryId,
      categoryName: category?.name ?? "Uncategorized",
      categoryColor: category?.color ?? "#64748b",
      tagIds: transaction.tagIds.map((tagId) => tagId.toString()),
      tagNames: transaction.tagIds
        .map((tagId) => tagById.get(tagId.toString())?.name)
        .filter((name): name is string => Boolean(name)),
      note: transaction.note ?? "",
      paymentMethod: transaction.paymentMethod ?? undefined,
      place: transaction.place ?? undefined,
      attachment: transaction.attachment?.name
        ? {
            name: transaction.attachment.name,
            type: transaction.attachment.type ?? "",
            size: transaction.attachment.size ?? 0,
          }
        : undefined,
    };
  });
}
