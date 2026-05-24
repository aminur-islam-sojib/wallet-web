import { Types } from "mongoose";
import { z } from "zod";

import { Category } from "@/features/wallet/server/models/category";
import { Tag } from "@/features/wallet/server/models/tag";
import { Transaction } from "@/features/wallet/server/models/transaction";
import { mapTransactionsToRows } from "@/features/wallet/transactions/lib";
import type {
  PaymentMethod,
  TransactionsCategoryOption,
  TransactionsTagOption,
} from "@/features/wallet/transactions/types";
import type {
  CategoryDetailBreakdown,
  TagDetailFilters,
  TagDetailResponse,
} from "@/features/wallet/statistics/types";
import { dateInputValueToUtcRange } from "@/lib/date";
import {
  tagColor,
  UNTAGGED_TAG_COLOR,
  UNTAGGED_TAG_ID,
} from "@/features/wallet/statistics/server/tag-totals";

const tagDetailSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(["income", "expense"]).default("expense"),
  tagId: z.string(),
});

const paymentMethodLabels: Record<PaymentMethod | "unspecified", string> = {
  cash: "Cash",
  card: "Card",
  bank_transfer: "Bank transfer",
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  other: "Other",
  unspecified: "Unspecified",
};

function normalizeDateRange(startDate: string, endDate: string) {
  const startRange = dateInputValueToUtcRange(startDate);
  const endRange = dateInputValueToUtcRange(endDate);

  if (startRange.start <= endRange.end) {
    return { start: startRange.start, end: endRange.end };
  }

  return { start: endRange.start, end: startRange.end };
}

function toPercent(value: number, total: number) {
  return total ? Math.round((value / total) * 10000) / 100 : 0;
}

function toCategoryOption(category: {
  _id: { toString(): string };
  name: string;
  type: "income" | "expense";
  color: string;
  icon?: string | null;
  isDefault: boolean;
}): TransactionsCategoryOption {
  return {
    id: category._id.toString(),
    name: category.name,
    type: category.type,
    color: category.color,
    icon: category.icon ?? "circle",
    isDefault: category.isDefault,
  };
}

function toBreakdownList(
  entries: Map<string, { label: string; totalPaisa: number; count: number }>,
  totalPaisa: number,
): CategoryDetailBreakdown[] {
  return Array.from(entries, ([id, item]) => ({
    id,
    label: item.label,
    totalPaisa: item.totalPaisa,
    count: item.count,
    percent: toPercent(item.totalPaisa, totalPaisa),
  })).sort((a, b) => b.totalPaisa - a.totalPaisa);
}

export async function getTagDetailByRange(
  userId: string,
  filters: TagDetailFilters,
): Promise<TagDetailResponse | null> {
  const parsed = tagDetailSchema.safeParse(filters);

  if (!parsed.success) {
    return null;
  }

  const isUntagged = parsed.data.tagId === UNTAGGED_TAG_ID;

  if (!isUntagged && !Types.ObjectId.isValid(parsed.data.tagId)) {
    return null;
  }

  const { start, end } = normalizeDateRange(
    parsed.data.startDate,
    parsed.data.endDate,
  );
  const userObjectId = new Types.ObjectId(userId);
  const tagObjectId = isUntagged ? null : new Types.ObjectId(parsed.data.tagId);
  const transactionMatch: Record<string, unknown> = {
    userId: userObjectId,
    date: { $gte: start, $lt: end },
    type: parsed.data.type,
  };

  if (isUntagged) {
    transactionMatch.tagIds = { $size: 0 };
  } else {
    transactionMatch.tagIds = tagObjectId;
  }

  const [categories, tags, selectedTag, transactions, chartTotals] =
    await Promise.all([
      Category.find({ userId: userObjectId }).sort({ type: 1, name: 1 }).lean(),
      Tag.find({ userId: userObjectId }).sort({ name: 1 }).lean(),
      isUntagged
        ? Promise.resolve(null)
        : Tag.findOne({
            _id: parsed.data.tagId,
            userId: userObjectId,
          }).lean(),
      Transaction.find(transactionMatch)
        .sort({ date: -1, createdAt: -1 })
        .lean(),
      Transaction.aggregate<{ _id: null; total: number }>([
        {
          $match: {
            userId: userObjectId,
            date: { $gte: start, $lt: end },
            type: parsed.data.type,
          },
        },
        {
          $project: {
            amountPaisa: 1,
            tagKey: {
              $cond: [
                { $gt: [{ $size: "$tagIds" }, 0] },
                "$tagIds",
                [UNTAGGED_TAG_ID],
              ],
            },
          },
        },
        { $unwind: "$tagKey" },
        { $group: { _id: null, total: { $sum: "$amountPaisa" } } },
      ]),
    ]);

  if (!isUntagged && !selectedTag) {
    return null;
  }

  const categoryOptions = categories.map(toCategoryOption);
  const tagOptions: TransactionsTagOption[] = tags.map((tag) => ({
    id: tag._id.toString(),
    name: tag.name,
  }));
  const categoryNameById = new Map(
    categoryOptions.map((category) => [category.id, category.name]),
  );
  const paymentMethodEntries = new Map<
    PaymentMethod | "unspecified",
    { label: string; totalPaisa: number; count: number }
  >();
  const categoryEntries = new Map<
    string,
    { label: string; totalPaisa: number; count: number }
  >();
  const totalPaisa = transactions.reduce((sum, transaction) => {
    const paymentMethod = transaction.paymentMethod ?? "unspecified";
    const paymentEntry = paymentMethodEntries.get(paymentMethod) ?? {
      label: paymentMethodLabels[paymentMethod],
      totalPaisa: 0,
      count: 0,
    };
    const categoryId = transaction.categoryId.toString();
    const categoryEntry = categoryEntries.get(categoryId) ?? {
      label: categoryNameById.get(categoryId) ?? "Uncategorized",
      totalPaisa: 0,
      count: 0,
    };

    paymentEntry.totalPaisa += transaction.amountPaisa;
    paymentEntry.count += 1;
    paymentMethodEntries.set(paymentMethod, paymentEntry);

    categoryEntry.totalPaisa += transaction.amountPaisa;
    categoryEntry.count += 1;
    categoryEntries.set(categoryId, categoryEntry);

    return sum + transaction.amountPaisa;
  }, 0);
  const chartTotalPaisa = chartTotals[0]?.total ?? 0;

  return {
    tagId: isUntagged ? UNTAGGED_TAG_ID : selectedTag!._id.toString(),
    tagName: isUntagged ? "Untagged" : selectedTag!.name,
    tagColor: isUntagged ? UNTAGGED_TAG_COLOR : tagColor(parsed.data.tagId),
    startDate: parsed.data.startDate,
    endDate: parsed.data.endDate,
    type: parsed.data.type,
    totalPaisa,
    chartTotalPaisa,
    percent: toPercent(totalPaisa, chartTotalPaisa),
    transactionCount: transactions.length,
    averagePaisa: transactions.length
      ? Math.round(totalPaisa / transactions.length)
      : 0,
    paymentMethodBreakdown: toBreakdownList(
      paymentMethodEntries,
      totalPaisa,
    ) as TagDetailResponse["paymentMethodBreakdown"],
    categoryBreakdown: toBreakdownList(categoryEntries, totalPaisa),
    transactions: mapTransactionsToRows(
      transactions,
      categoryOptions,
      tagOptions,
    ),
    categories: categoryOptions,
    tags: tagOptions,
  };
}
