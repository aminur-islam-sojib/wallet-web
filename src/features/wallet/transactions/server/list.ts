"use server";

import { Types } from "mongoose";

import { Category } from "@/features/wallet/server/models/category";
import { Tag } from "@/features/wallet/server/models/tag";
import { Transaction } from "@/features/wallet/server/models/transaction";
import {
  dateInputValueToUtcRange,
  formatDateInputValueInTimeZone,
} from "@/lib/date";
import type {
  TransactionsPageData,
  TransactionsPagination,
  TransactionsFilters,
  TransactionsCategoryOption,
  TransactionsTagOption,
} from "@/features/wallet/transactions/types";
import { mapTransactionsToRows } from "@/features/wallet/transactions/lib";

const WALLET_TIME_ZONE = "Asia/Dhaka";
const DEFAULT_PAGE_SIZE = 50;

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

function clampPage(value?: number) {
  if (!value || Number.isNaN(value) || value < 1) return 1;
  return Math.floor(value);
}

function getPagination(total: number, page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  return {
    page: safePage,
    pageSize,
    total,
    totalPages,
  } satisfies TransactionsPagination;
}

export async function getTransactionsPageData(
  userId: string,
  filters: TransactionsFilters,
  page?: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<TransactionsPageData> {
  const { value: selectedMonth, start, end } = getMonthRange(filters.month);
  const normalizedPage = clampPage(page);
  const userObjectId = new Types.ObjectId(userId);

  const [categories, tags] = await Promise.all([
    Category.find({ userId: userObjectId }).sort({ type: 1, name: 1 }).lean(),
    Tag.find({ userId: userObjectId }).sort({ name: 1 }).lean(),
  ]);

  const query: Record<string, unknown> = {
    userId: userObjectId,
    date: { $gte: start, $lt: end },
  };

  const summaryQuery: Record<string, unknown> = {
    userId: userObjectId,
    date: { $gte: start, $lt: end },
  };

  if (filters.type === "income" || filters.type === "expense") {
    query.type = filters.type;
    summaryQuery.type = filters.type;
  }

  if (isObjectId(filters.categoryId)) {
    const categoryObjectId = new Types.ObjectId(filters.categoryId);
    query.categoryId = categoryObjectId;
    summaryQuery.categoryId = new Types.ObjectId(filters.categoryId);
  }

  if (isObjectId(filters.tagId)) {
    const tagObjectId = new Types.ObjectId(filters.tagId);
    query.tagIds = tagObjectId;
    summaryQuery.tagIds = new Types.ObjectId(filters.tagId);
  }

  const [total, transactions, totals] = await Promise.all([
    Transaction.countDocuments(query),
    Transaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip((normalizedPage - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Transaction.aggregate<{ _id: "income" | "expense"; total: number }>([
      { $match: summaryQuery },
      { $group: { _id: "$type", total: { $sum: "$amountPaisa" } } },
    ]),
  ]);

  const categoryOptions = categories.map(
    (category): TransactionsCategoryOption => ({
      id: category._id.toString(),
      name: category.name,
      type: category.type as "income" | "expense",
      color: category.color,
      icon: category.icon ?? "circle",
      isDefault: category.isDefault,
    }),
  );
  const tagOptions = tags.map(
    (tag): TransactionsTagOption => ({
      id: tag._id.toString(),
      name: tag.name,
    }),
  );

  const pagination = getPagination(total, normalizedPage, pageSize);
  const summary = {
    income: totals.find((item) => item._id === "income")?.total ?? 0,
    expense: totals.find((item) => item._id === "expense")?.total ?? 0,
  };

  return {
    selectedMonth,
    categories: categoryOptions,
    tags: tagOptions,
    transactions: mapTransactionsToRows(
      transactions,
      categoryOptions,
      tagOptions,
    ),
    pagination,
    summary,
    filters: {
      ...filters,
      month: selectedMonth,
    },
  };
}

export async function getCurrentMonthRange() {
  const today = formatDateInputValueInTimeZone(new Date(), WALLET_TIME_ZONE);
  return dateInputValueToUtcRange(today);
}
