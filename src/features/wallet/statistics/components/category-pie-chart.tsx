"use client";

import * as React from "react";
import { Cell, Pie, PieChart, Sector } from "recharts";
import type { PieSectorShapeProps } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

import { ChartContainer } from "@/components/ui/chart";
import { formatBDT } from "@/lib/money";
import type { CategoryTotalsResponse } from "@/features/wallet/statistics/types";
import { Button } from "@/components/ui/button";
import { div } from "framer-motion/client";

type Props = {
  data: CategoryTotalsResponse;
  onGoDeeper?: (categoryId: string, categoryName: string) => void;
};

// ---------- animated active shape ----------
function AnimatedActiveShape(props: PieSectorShapeProps) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;

  // Compute the expanded arc path using SVG arc commands
  const expandedOuter = outerRadius + 10;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const arcPath = (
    inner: number,
    outer: number,
    start: number,
    end: number,
  ) => {
    const s = toRad(start);
    const e = toRad(end);
    const cosS = Math.cos(-s);
    const sinS = Math.sin(-s);
    const cosE = Math.cos(-e);
    const sinE = Math.sin(-e);

    const x1 = cx + outer * cosS;
    const y1 = cy + outer * sinS;
    const x2 = cx + outer * cosE;
    const y2 = cy + outer * sinE;
    const x3 = cx + inner * cosE;
    const y3 = cy + inner * sinE;
    const x4 = cx + inner * cosS;
    const y4 = cy + inner * sinS;

    const largeArc = end - start > 180 ? 1 : 0;

    return [
      `M ${x1} ${y1}`,
      `A ${outer} ${outer} 0 ${largeArc} 0 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${inner} ${inner} 0 ${largeArc} 1 ${x4} ${y4}`,
      "Z",
    ].join(" ");
  };

  const d = arcPath(innerRadius, expandedOuter, startAngle, endAngle);

  return (
    <motion.path
      d={d}
      fill={fill}
      initial={{ opacity: 0.6, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      style={{
        transformOrigin: `${cx}px ${cy}px`,
        filter: "drop-shadow(0 3px 8px rgba(15,23,42,0.22))",
      }}
    />
  );
}

// ---------- main component ----------
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

  const renderPieShape = React.useCallback(
    (props: PieSectorShapeProps) => {
      if (props.index === activeIndex) {
        return <AnimatedActiveShape {...props} />;
      }

      return <Sector {...props} />;
    },
    [activeIndex],
  );

  if (data.categories.length === 0) {
    return (
      <div className="flex h-75 items-center justify-center rounded-xl border bg-background">
        <p className="text-sm text-muted-foreground">No data for this range</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-background p-5 relative">
      <p className="mb-1 text-sm font-medium text-foreground">
        {data.type === "expense" ? "Expenses" : "Income"} by Category
      </p>
      <p className="mb-4 text-xs text-muted-foreground">
        {data.startDate} - {data.endDate}
      </p>
      {onGoDeeper && activeCategory && (
        <div className="absolute top-20 right-10 z-50">
          <Button
            type="button"
            className="inline-flex min-h-11 rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
            onClick={() =>
              onGoDeeper(activeCategory.categoryId, activeCategory.name)
            }
          >
            Go deeper
          </Button>
        </div>
      )}
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
              shape={renderPieShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
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
                    transition: "opacity 200ms ease",
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {activeCategory ? (
              <motion.div
                key={activeCategory.categoryId}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
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
              </motion.div>
            ) : (
              <motion.div
                key="total"
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <span className="text-[11px] text-muted-foreground">Total</span>
                <span className="text-base font-semibold tabular-nums text-foreground">
                  {formatBDT(data.totalPaisa)}
                </span>
                <span className="mt-0.5 text-[10px] text-muted-foreground">
                  {data.categories.length} categories
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <ul className="mt-4 space-y-2">
        {data.categories.map((cat, index) => (
          <motion.li
            key={cat.categoryId}
            className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/50"
            animate={{
              opacity: activeIndex === null || activeIndex === index ? 1 : 0.4,
            }}
            transition={{ duration: 0.15 }}
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
          </motion.li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm">
        <span className="text-muted-foreground">Total</span>
        <span className="font-medium">{formatBDT(data.totalPaisa)}</span>
      </div>
    </div>
  );
}
