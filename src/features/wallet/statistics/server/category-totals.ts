import { Types } from "mongoose";
import { z } from "zod";

import { Category } from "@/features/wallet/server/models/category";
import { Transaction } from "@/features/wallet/server/models/transaction";
import type {
  CategoryTotal,
  CategoryTotalsFilters,
  CategoryTotalsResponse,
} from "@/features/wallet/statistics/types";
import { dateInputValueToUtcRange } from "@/lib/date";

const categoryTotalsSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(["income", "expense"]).default("expense"),
});

function normalizeDateRange(startDate: string, endDate: string) {
  const startRange = dateInputValueToUtcRange(startDate);
  const endRange = dateInputValueToUtcRange(endDate);

  if (startRange.start <= endRange.end) {
    return { start: startRange.start, end: endRange.end };
  }

  return { start: endRange.start, end: startRange.end };
}

type CategoryTotalsAggregationRow = {
  _id: Types.ObjectId;
  total: number;
  category?: {
    name?: string;
    color?: string;
    icon?: string;
  };
};

export async function getCategoryTotalsByRange(
  userId: string,
  filters: CategoryTotalsFilters,
): Promise<CategoryTotalsResponse> {
  const parsed = categoryTotalsSchema.parse(filters);
  const { start, end } = normalizeDateRange(parsed.startDate, parsed.endDate);
  const userObjectId = new Types.ObjectId(userId);

  const totals = await Transaction.aggregate<CategoryTotalsAggregationRow>([
    {
      $match: {
        userId: userObjectId,
        date: { $gte: start, $lt: end },
        type: parsed.type,
      },
    },
    { $group: { _id: "$categoryId", total: { $sum: "$amountPaisa" } } },
    { $sort: { total: -1 } },
    {
      $lookup: {
        from: Category.collection.name,
        localField: "_id",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
  ]);

  const totalPaisa = totals.reduce((sum, item) => sum + item.total, 0);
  const categories: CategoryTotal[] = totals.map((item) => {
    const percent = totalPaisa
      ? Math.round((item.total / totalPaisa) * 10000) / 100
      : 0;

    return {
      categoryId: item._id.toString(),
      categoryName: item.category?.name ?? "Uncategorized",
      categoryColor: item.category?.color ?? "#64748b",
      categoryIcon: item.category?.icon ?? "circle",
      totalPaisa: item.total,
      percent,
    };
  });

  return {
    startDate: parsed.startDate,
    endDate: parsed.endDate,
    type: parsed.type,
    totalPaisa,
    categories,
  };
}
