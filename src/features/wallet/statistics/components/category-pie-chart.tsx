"use client";

import * as React from "react";
import { Cell, Pie, PieChart } from "recharts";

import { ChartContainer } from "@/components/ui/chart";
import { formatBDT } from "@/lib/money";
import type { CategoryTotalsResponse } from "@/features/wallet/statistics/types";

type Props = {
  data: CategoryTotalsResponse;
  onGoDeeper?: (categoryId: string, categoryName: string) => void;
};

export default function CategoryPieChart({ data, onGoDeeper }: Props) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const chartData = data.categories.map((cat) => ({
    name: cat.categoryName,
    value: cat.totalPaisa,
    percent: cat.percent,
    color: cat.categoryColor,
    icon: cat.categoryIcon,
    categoryId: cat.categoryId,
  }));

  const chartConfig = Object.fromEntries(
    data.categories.map((cat) => [
      cat.categoryName,
      { label: cat.categoryName, color: cat.categoryColor },
    ]),
  );

  const activeCategory = activeIndex !== null ? chartData[activeIndex] : null;

  if (data.categories.length === 0) {
    return (
      <div className="flex h-75 items-center justify-center rounded-xl border bg-background">
        <p className="text-sm text-muted-foreground">No data for this range</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-background p-5">
      <p className="mb-1 text-sm font-medium text-foreground">
        {data.type === "expense" ? "Expenses" : "Income"} by Category
      </p>
      <p className="mb-4 text-xs text-muted-foreground">
        {data.startDate} — {data.endDate}
      </p>

      <div className="relative">
        <ChartContainer config={chartConfig} className="mx-auto h-55 w-full">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={100}
              paddingAngle={2}
              strokeWidth={0}
              isAnimationActive
              animationDuration={500}
              animationEasing="ease-out"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={(_, index) =>
                setActiveIndex(activeIndex === index ? null : index)
              }
              style={{ cursor: "pointer" }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.color}
                  opacity={
                    activeIndex === null || activeIndex === index ? 1 : 0.35
                  }
                  style={{
                    transition: "opacity 200ms ease, transform 200ms ease",
                    transform:
                      activeIndex === index ? "scale(1.03)" : "scale(1)",
                    transformOrigin: "center",
                    transformBox: "fill-box",
                    filter:
                      activeIndex === index
                        ? "drop-shadow(0 2px 6px rgba(15, 23, 42, 0.18))"
                        : "none",
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {activeCategory ? (
            <>
              <span
                className="mb-1 h-2 w-2 rounded-full"
                style={{ background: activeCategory.color }}
              />
              <span className="max-w-22.5 truncate text-center text-[11px] text-muted-foreground">
                {activeCategory.name}
              </span>
              <span className="text-base font-semibold tabular-nums text-foreground">
                {activeCategory.percent}%
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {formatBDT(activeCategory.value)}
              </span>
              {onGoDeeper && (
                <button
                  className="pointer-events-auto mt-2 rounded-full border border-border bg-background px-2.5 py-0.5 text-[10px] font-medium text-foreground transition-colors hover:bg-muted"
                  onClick={() =>
                    onGoDeeper(activeCategory.categoryId, activeCategory.name)
                  }
                >
                  Go deeper →
                </button>
              )}
            </>
          ) : (
            <>
              <span className="text-[11px] text-muted-foreground">Total</span>
              <span className="text-base font-semibold tabular-nums text-foreground">
                {formatBDT(data.totalPaisa)}
              </span>
              <span className="mt-0.5 text-[10px] text-muted-foreground">
                {data.categories.length} categories
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <ul className="mt-4 space-y-2">
        {data.categories.map((cat, index) => (
          <li
            key={cat.categoryId}
            className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/50"
            style={{
              opacity: activeIndex === null || activeIndex === index ? 1 : 0.4,
            }}
            onClick={() => setActiveIndex(activeIndex === index ? null : index)}
          >
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: cat.categoryColor }}
              />
              <span className="text-foreground">{cat.categoryName}</span>
            </span>
            <span className="flex items-center gap-3">
              <span className="text-muted-foreground">{cat.percent}%</span>
              <span className="font-medium tabular-nums">
                {formatBDT(cat.totalPaisa)}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm">
        <span className="text-muted-foreground">Total</span>
        <span className="font-medium">{formatBDT(data.totalPaisa)}</span>
      </div>
    </div>
  );
}
