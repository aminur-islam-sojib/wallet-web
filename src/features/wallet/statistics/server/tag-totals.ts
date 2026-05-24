import { Types } from "mongoose";
import { z } from "zod";

import { Tag } from "@/features/wallet/server/models/tag";
import { Transaction } from "@/features/wallet/server/models/transaction";
import type {
  TagTotal,
  TagTotalsFilters,
  TagTotalsResponse,
} from "@/features/wallet/statistics/types";
import { dateInputValueToUtcRange } from "@/lib/date";

export const UNTAGGED_TAG_ID = "__untagged";
export const UNTAGGED_TAG_COLOR = "#64748b";

const tagTotalsSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(["income", "expense"]).default("expense"),
});

type TagTotalsAggregationRow = {
  _id: Types.ObjectId | typeof UNTAGGED_TAG_ID;
  total: number;
  tag?: {
    name?: string;
  };
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

export function tagColor(tagId: string) {
  const colors = [
    "#2563eb",
    "#16a34a",
    "#f97316",
    "#dc2626",
    "#7c3aed",
    "#0891b2",
    "#c2410c",
    "#be123c",
  ];
  const hash = Array.from(tagId).reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0,
  );

  return colors[hash % colors.length];
}

export async function getTagTotalsByRange(
  userId: string,
  filters: TagTotalsFilters,
): Promise<TagTotalsResponse> {
  const parsed = tagTotalsSchema.parse(filters);
  const { start, end } = normalizeDateRange(parsed.startDate, parsed.endDate);
  const userObjectId = new Types.ObjectId(userId);

  const totals = await Transaction.aggregate<TagTotalsAggregationRow>([
    {
      $match: {
        userId: userObjectId,
        date: { $gte: start, $lt: end },
        type: parsed.type,
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
    { $group: { _id: "$tagKey", total: { $sum: "$amountPaisa" } } },
    { $sort: { total: -1 } },
    {
      $lookup: {
        from: Tag.collection.name,
        localField: "_id",
        foreignField: "_id",
        as: "tag",
      },
    },
    { $unwind: { path: "$tag", preserveNullAndEmptyArrays: true } },
  ]);

  const totalPaisa = totals.reduce((sum, item) => sum + item.total, 0);
  const tags: TagTotal[] = totals.map((item) => {
    const tagId = item._id.toString();
    const isUntagged = tagId === UNTAGGED_TAG_ID;

    return {
      tagId,
      tagName: isUntagged ? "Untagged" : (item.tag?.name ?? "Unknown tag"),
      tagColor: isUntagged ? UNTAGGED_TAG_COLOR : tagColor(tagId),
      totalPaisa: item.total,
      percent: toPercent(item.total, totalPaisa),
    };
  });

  return {
    startDate: parsed.startDate,
    endDate: parsed.endDate,
    type: parsed.type,
    totalPaisa,
    tags,
  };
}
