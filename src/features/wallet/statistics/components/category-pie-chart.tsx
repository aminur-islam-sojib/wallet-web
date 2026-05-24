"use client";

import StatisticsPieChart from "@/features/wallet/statistics/components/statistics-pie-chart";
import type { CategoryTotalsResponse } from "@/features/wallet/statistics/types";

type Props = {
  data: CategoryTotalsResponse;
  onGoDeeper?: (categoryId: string, categoryName: string) => void;
  actionHref?: string;
  actionLabel?: string;
};

export default function CategoryPieChart({
  data,
  onGoDeeper,
  actionHref,
  actionLabel,
}: Props) {
  return (
    <StatisticsPieChart
      title={`${data.type === "expense" ? "Expenses" : "Income"} by Category`}
      startDate={data.startDate}
      endDate={data.endDate}
      totalPaisa={data.totalPaisa}
      items={data.categories.map((category) => ({
        id: category.categoryId,
        name: category.categoryName,
        value: category.totalPaisa,
        percent: category.percent,
        color: category.categoryColor,
      }))}
      emptyText="No category data for this range"
      itemLabel="categories"
      onGoDeeper={onGoDeeper}
      actionHref={actionHref}
      actionLabel={actionLabel}
    />
  );
}
