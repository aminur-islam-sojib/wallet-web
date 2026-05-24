"use client";

import StatisticsPieChart from "@/features/wallet/statistics/components/statistics-pie-chart";
import type { TagTotalsResponse } from "@/features/wallet/statistics/types";

type Props = {
  data: TagTotalsResponse;
  onGoDeeper?: (tagId: string, tagName: string) => void;
};

export default function TagPieChart({ data, onGoDeeper }: Props) {
  return (
    <StatisticsPieChart
      title={`${data.type === "expense" ? "Expenses" : "Income"} by Tag`}
      startDate={data.startDate}
      endDate={data.endDate}
      totalPaisa={data.totalPaisa}
      items={data.tags.map((tag) => ({
        id: tag.tagId,
        name: tag.tagName,
        value: tag.totalPaisa,
        percent: tag.percent,
        color: tag.tagColor,
      }))}
      emptyText="No tag data for this range"
      itemLabel="tags"
      onGoDeeper={onGoDeeper}
    />
  );
}
