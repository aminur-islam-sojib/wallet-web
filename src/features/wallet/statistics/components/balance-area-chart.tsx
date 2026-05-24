"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { WalletCards } from "lucide-react";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { BalanceHistoryResponse } from "@/features/wallet/statistics/types";
import { formatBDT } from "@/lib/money";

type BalanceAreaChartProps = {
  data: BalanceHistoryResponse;
};

const chartConfig = {
  balancePaisa: {
    label: "Balance",
    color: "#5BC8F5",
  },
};

function formatAxisPaisa(value: number) {
  const amount = value / 100;
  const sign = amount < 0 ? "-" : "";
  const absoluteAmount = Math.abs(amount);

  if (absoluteAmount >= 1000) {
    return `${sign}${Math.round(absoluteAmount / 1000)}k`;
  }

  return `${sign}${Math.round(absoluteAmount)}`;
}

export default function BalanceAreaChart({ data }: BalanceAreaChartProps) {
  const currentBalancePaisa =
    data.points.at(-1)?.balancePaisa ?? data.currentBalancePaisa;

  return (
    <section className="rounded-xl border bg-background p-4 sm:p-5">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex size-13 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
          <WalletCards className="size-7" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-medium text-foreground">
            Wallet balance
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            All-time running balance
          </p>
        </div>
      </div>

      <p className="mb-1 text-sm font-medium uppercase tracking-wider text-muted-foreground">
        Today
      </p>
      <p className="mb-6 break-words text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">
        {formatBDT(currentBalancePaisa)}
      </p>

      <ChartContainer
        config={chartConfig}
        className="h-[210px] w-full text-sm [&_.recharts-cartesian-axis-tick_text]:text-[14px]"
        initialDimension={{ width: 320, height: 210 }}
      >
        <AreaChart
          data={data.points}
          margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
          accessibilityLayer
        >
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5BC8F5" stopOpacity={0.32} />
              <stop offset="70%" stopColor="#5BC8F5" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#5BC8F5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
            tickMargin={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={formatAxisPaisa}
            width={38}
            domain={[
              Math.min(data.minBalancePaisa, 0),
              Math.max(data.maxBalancePaisa, 0),
            ]}
            tickMargin={6}
          />
          <ReferenceLine
            y={0}
            stroke="#F48FB1"
            strokeDasharray="5 5"
            strokeWidth={1.2}
            label={{
              value: "BDT 0",
              position: "insideTopRight",
              fill: "#F48FB1",
              fontSize: 14,
            }}
          />
          <ChartTooltip
            cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }}
            content={
              <ChartTooltipContent
                hideIndicator
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.date ?? ""
                }
                formatter={(value) => (
                  <div className="flex min-w-36 items-center justify-between gap-4">
                    <span className="text-muted-foreground">Balance</span>
                    <span className="font-medium tabular-nums text-foreground">
                      {formatBDT(Number(value))}
                    </span>
                  </div>
                )}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="balancePaisa"
            stroke="var(--color-balancePaisa)"
            strokeWidth={2}
            fill="url(#balanceGradient)"
            dot={false}
            activeDot={{
              r: 4,
              fill: "#5BC8F5",
              stroke: "var(--background)",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ChartContainer>
    </section>
  );
}
