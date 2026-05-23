import { Types } from "mongoose";

import { Category } from "@/features/wallet/server/models/category";
import { MonthlyLimit } from "@/features/wallet/server/models/monthly-limit";
import { Tag } from "@/features/wallet/server/models/tag";
import { Transaction } from "@/features/wallet/server/models/transaction";
import {
  dateInputValueToUtcRange,
  formatDateInputValueInTimeZone,
} from "@/lib/date";
import type {
  CategoryOption,
  DashboardFilters,
  MonthlyLimit as MonthlyLimitOption,
  TagOption,
  TodaySummary,
  TransactionRow,
} from "@/features/wallet/types";

const WALLET_TIME_ZONE = "Asia/Dhaka";

function getMonthRange(month?: string) {
  const value =
    month && /^\d{4}-\d{2}$/.test(month)
      ? month
      : formatDateInputValueInTimeZone(new Date(), WALLET_TIME_ZONE).slice(
          0,
          7,
        );
  const [year, monthIndex] = value.split("-").map(Number);
  const start = new Date(Date.UTC(year, monthIndex - 1, 1));
  const end = new Date(Date.UTC(year, monthIndex, 1));

  return { value, start, end };
}

function isObjectId(value?: string) {
  return Boolean(value && Types.ObjectId.isValid(value));
}

function getTodayRange() {
  return dateInputValueToUtcRange(
    formatDateInputValueInTimeZone(new Date(), WALLET_TIME_ZONE),
  );
}

export async function getDashboardData(
  userId: string,
  filters: DashboardFilters,
) {
  const { value: selectedMonth, start, end } = getMonthRange(filters.month);
  const { start: todayStart, end: todayEnd } = getTodayRange();

  const [categories, tags] = await Promise.all([
    Category.find({ userId }).sort({ type: 1, name: 1 }).lean(),
    Tag.find({ userId }).sort({ name: 1 }).lean(),
  ]);

  const query: Record<string, unknown> = {
    userId,
    date: { $gte: start, $lt: end },
  };

  if (filters.type === "income" || filters.type === "expense") {
    query.type = filters.type;
  }

  if (isObjectId(filters.categoryId)) {
    query.categoryId = filters.categoryId;
  }

  if (isObjectId(filters.tagId)) {
    query.tagIds = filters.tagId;
  }

  const [transactions, monthlyTotals, todayTotals, monthlyLimit] =
    await Promise.all([
      Transaction.find(query)
        .sort({ date: -1, createdAt: -1 })
        .limit(50)
        .lean(),
      Transaction.aggregate<{ _id: "income" | "expense"; total: number }>([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            date: { $gte: start, $lt: end },
          },
        },
        { $group: { _id: "$type", total: { $sum: "$amountPaisa" } } },
      ]),
      Transaction.aggregate<{ _id: "income" | "expense"; total: number }>([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            date: { $gte: todayStart, $lt: todayEnd },
          },
        },
        { $group: { _id: "$type", total: { $sum: "$amountPaisa" } } },
      ]),
      MonthlyLimit.findOne({ userId, month: selectedMonth }).lean(),
    ]);

  const categoryById = new Map(
    categories.map((category) => [category._id.toString(), category]),
  );
  const tagById = new Map(tags.map((tag) => [tag._id.toString(), tag]));
  const income =
    monthlyTotals.find((item) => item._id === "income")?.total ?? 0;
  const expense =
    monthlyTotals.find((item) => item._id === "expense")?.total ?? 0;
  const todaySummary: TodaySummary = {
    income: todayTotals.find((item) => item._id === "income")?.total ?? 0,
    expense: todayTotals.find((item) => item._id === "expense")?.total ?? 0,
  };

  return {
    selectedMonth,
    categories: categories.map(
      (category): CategoryOption => ({
        id: category._id.toString(),
        name: category.name,
        type: category.type as "income" | "expense",
        color: category.color,
        icon: category.icon ?? "circle",
        isDefault: category.isDefault,
      }),
    ),
    tags: tags.map(
      (tag): TagOption => ({
        id: tag._id.toString(),
        name: tag.name,
      }),
    ),
    summary: {
      income,
      expense,
      balance: income - expense,
    },
    todaySummary,
    monthlyLimit: monthlyLimit
      ? ({
          month: monthlyLimit.month,
          amountPaisa: monthlyLimit.amountPaisa,
        } satisfies MonthlyLimitOption)
      : null,
    transactions: transactions.map((transaction): TransactionRow => {
      const category = categoryById.get(transaction.categoryId.toString());

      return {
        id: transaction._id.toString(),
        type: transaction.type as "income" | "expense",
        amountPaisa: transaction.amountPaisa,
        date: transaction.date.toISOString().slice(0, 10),
        categoryId: transaction.categoryId.toString(),
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
    }),
  };
}
