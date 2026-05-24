"use client";

import * as React from "react";
import Link from "next/link";
import { Cell, Pie, PieChart, Sector } from "recharts";
import type { PieSectorShapeProps } from "recharts";
import { AnimatePresence, motion } from "framer-motion";

import { ChartContainer } from "@/components/ui/chart";
import { formatBDT } from "@/lib/money";

export type StatisticsPieChartItem = {
  id: string;
  name: string;
  value: number;
  percent: number;
  color: string;
};

type Props = {
  title: string;
  startDate: string;
  endDate: string;
  totalPaisa: number;
  items: StatisticsPieChartItem[];
  emptyText?: string;
  itemLabel: string;
  onGoDeeper?: (id: string, name: string) => void;
  actionHref?: string;
  actionLabel?: string;
};

function AnimatedActiveShape(props: PieSectorShapeProps) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;
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

  return (
    <motion.path
      d={arcPath(innerRadius, expandedOuter, startAngle, endAngle)}
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

export default function StatisticsPieChart({
  title,
  startDate,
  endDate,
  totalPaisa,
  items,
  emptyText = "No data for this range",
  itemLabel,
  onGoDeeper,
  actionHref,
  actionLabel = "See more",
}: Props) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const chartConfig = Object.fromEntries(
    items.map((item) => [item.name, { label: item.name, color: item.color }]),
  );
  const activeItem = activeIndex !== null ? items[activeIndex] : null;
  const renderPieShape = React.useCallback(
    (props: PieSectorShapeProps) => {
      if (props.index === activeIndex) {
        return <AnimatedActiveShape {...props} />;
      }

      return <Sector {...props} />;
    },
    [activeIndex],
  );

  if (items.length === 0) {
    return (
      <div className="flex h-75 items-center justify-center rounded-xl border bg-background">
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl border bg-background p-5">
      <div className="mb-1 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {actionHref ? (
          <Link
            href={actionHref}
            className="flex min-h-11 shrink-0 items-center px-1 text-sm font-medium text-primary"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        {startDate} - {endDate}
      </p>

      {onGoDeeper && activeItem ? (
        <div className="absolute right-4 top-20 z-10 sm:right-10">
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
            onClick={() => onGoDeeper(activeItem.id, activeItem.name)}
          >
            Go deeper
          </button>
        </div>
      ) : null}

      <div className="relative">
        <ChartContainer config={chartConfig} className="mx-auto h-55 w-full">
          <PieChart>
            <Pie
              data={items}
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
              {items.map((entry, index) => (
                <Cell
                  key={entry.id}
                  fill={entry.color}
                  opacity={
                    activeIndex === null || activeIndex === index ? 1 : 0.35
                  }
                  style={{ transition: "opacity 200ms ease" }}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {activeItem ? (
              <motion.div
                key={activeItem.id}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <span
                  className="mb-1 h-2 w-2 rounded-full"
                  style={{ background: activeItem.color }}
                />
                <span className="max-w-22.5 truncate text-center text-[11px] text-muted-foreground">
                  {activeItem.name}
                </span>
                <span className="text-base font-semibold tabular-nums text-foreground">
                  {activeItem.percent}%
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {formatBDT(activeItem.value)}
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
                  {formatBDT(totalPaisa)}
                </span>
                <span className="mt-0.5 text-[10px] text-muted-foreground">
                  {items.length} {itemLabel}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {items.map((item, index) => (
          <motion.li
            key={item.id}
            className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted/50"
            animate={{
              opacity: activeIndex === null || activeIndex === index ? 1 : 0.4,
            }}
            transition={{ duration: 0.15 }}
            onClick={() => setActiveIndex(activeIndex === index ? null : index)}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: item.color }}
              />
              <span className="truncate text-foreground">{item.name}</span>
            </span>
            <span className="flex shrink-0 items-center gap-3">
              <span className="text-muted-foreground">{item.percent}%</span>
              <span className="font-medium tabular-nums">
                {formatBDT(item.value)}
              </span>
            </span>
          </motion.li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm">
        <span className="text-muted-foreground">Total</span>
        <span className="font-medium">{formatBDT(totalPaisa)}</span>
      </div>
    </div>
  );
}
