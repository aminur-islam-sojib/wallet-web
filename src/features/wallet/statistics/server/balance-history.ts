import { Types } from "mongoose";

import { Transaction } from "@/features/wallet/server/models/transaction";
import type {
  BalanceHistoryFilters,
  BalanceHistoryPoint,
  BalanceHistoryResponse,
} from "@/features/wallet/statistics/types";

type BalanceHistoryAggregationRow = {
  _id: string;
  incomePaisa: number;
  expensePaisa: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function formatUtcDate(value = new Date()) {
  return value.toISOString().slice(0, 10);
}

function parseUtcDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

function addUtcDays(value: Date, days: number) {
  return new Date(value.getTime() + days * DAY_MS);
}

function formatPointLabel(date: string, today: string) {
  if (date === today) return "Today";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(parseUtcDate(date));
}

function normalizeDateRange(startDate: string, endDate: string) {
  if (parseUtcDate(startDate) <= parseUtcDate(endDate)) {
    return { startDate, endDate };
  }

  return { startDate: endDate, endDate: startDate };
}

export async function getBalanceHistory(
  userId: string,
  filters?: BalanceHistoryFilters,
): Promise<BalanceHistoryResponse> {
  const today = formatUtcDate();
  const userObjectId = new Types.ObjectId(userId);
  const selectedRange = filters
    ? normalizeDateRange(filters.startDate, filters.endDate)
    : null;
  const match: Record<string, unknown> = { userId: userObjectId };

  if (selectedRange) {
    const endExclusive = addUtcDays(parseUtcDate(selectedRange.endDate), 1);

    match.date = { $lt: endExclusive };
  }

  const totals = await Transaction.aggregate<BalanceHistoryAggregationRow>([
    { $match: match },
    {
      $group: {
        _id: {
          $dateToString: {
            date: "$date",
            format: "%Y-%m-%d",
            timezone: "UTC",
          },
        },
        incomePaisa: {
          $sum: {
            $cond: [{ $eq: ["$type", "income"] }, "$amountPaisa", 0],
          },
        },
        expensePaisa: {
          $sum: {
            $cond: [{ $eq: ["$type", "expense"] }, "$amountPaisa", 0],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  if (totals.length === 0 && !selectedRange) {
    const emptyPoint: BalanceHistoryPoint = {
      date: today,
      label: "Today",
      incomePaisa: 0,
      expensePaisa: 0,
      netPaisa: 0,
      balancePaisa: 0,
    };

    return {
      startDate: today,
      endDate: today,
      currentBalancePaisa: 0,
      minBalancePaisa: 0,
      maxBalancePaisa: 0,
      points: [emptyPoint],
    };
  }

  const totalsByDate = new Map(totals.map((item) => [item._id, item]));
  const startDate = selectedRange?.startDate ?? totals[0]._id;
  const endDate =
    selectedRange?.endDate ??
    totals.reduce((latest, item) => (item._id > latest ? item._id : latest), today);
  const points: BalanceHistoryPoint[] = [];
  let balancePaisa = 0;

  for (
    let cursor = totals.length > 0 ? parseUtcDate(totals[0]._id) : parseUtcDate(startDate);
    cursor <= parseUtcDate(endDate);
    cursor = addUtcDays(cursor, 1)
  ) {
    const date = formatUtcDate(cursor);
    const dayTotals = totalsByDate.get(date);
    const incomePaisa = dayTotals?.incomePaisa ?? 0;
    const expensePaisa = dayTotals?.expensePaisa ?? 0;
    const netPaisa = incomePaisa - expensePaisa;

    balancePaisa += netPaisa;
    if (date >= startDate) {
      points.push({
        date,
        label: formatPointLabel(date, today),
        incomePaisa,
        expensePaisa,
        netPaisa,
        balancePaisa,
      });
    }
  }

  const balances = points.map((point) => point.balancePaisa);

  return {
    startDate,
    endDate,
    currentBalancePaisa: points.at(-1)?.balancePaisa ?? 0,
    minBalancePaisa: Math.min(...balances),
    maxBalancePaisa: Math.max(...balances),
    points,
  };
}
