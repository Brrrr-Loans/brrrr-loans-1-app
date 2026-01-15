"use client";

import { useMemo, useState, useEffect } from "react";
import { ChartContainer, ChartTooltip } from "@/components/ui";
import { ChartAreaTooltip } from "@/components/once-ui";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
} from "recharts";

/**
 * ROI data point structure for the investor chart
 */
export interface InvestorROIDataPoint {
  date: string;
  roi: number;
  month: string;
  contributions: number;
  distributions: number;
}

interface ChartAreaInvestorROIProps {
  /** Array of ROI data points to display */
  data: InvestorROIDataPoint[];
  /** Current ROI percentage to display in header */
  currentROI: number;
  /** Currency formatter function */
  formatCurrency: (value: number) => string;
}

/**
 * Generate the last 12 months as an array of { key, label } objects
 * key: "YYYY-MM" format for matching with data
 * label: "MMM YYYY" format for display (e.g., "Jan 2024")
 */
function getLast12Months(): Array<{ key: string; label: string }> {
  const months: Array<{ key: string; label: string }> = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    const label = date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    months.push({ key, label });
  }

  return months;
}

/**
 * ChartAreaInvestorROI - Once UI styled area chart for investor contributions vs distributions
 *
 * Displays a dual-series area chart comparing:
 * - Principal Balance Owed (primary color - orange) - point-in-time balance at month end
 * - Distributions Paid (secondary color - gray) - sum of distributions paid during month
 *
 * Always shows the preceding 12 months on the X-axis
 */
export function ChartAreaInvestorROI({
  data,
  currentROI,
  formatCurrency,
}: ChartAreaInvestorROIProps) {
  // Prevent Recharts "removeChild" errors by deferring render until mounted
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const dataLabels: Record<string, string> = {
    contributions: "Principal Balance Owed",
    distributions: "Distributions Paid",
  };

  // Explicit color mapping to ensure tooltip matches chart legend
  const dataColors: Record<string, string> = {
    contributions: "chart-area-gradient-data-secondary", // gray
    distributions: "chart-area-gradient-data-primary", // orange
  };

  // Generate 12-month chart data, mapping incoming data to each month
  const chartData = useMemo(() => {
    const months = getLast12Months();

    // Create a map of existing data by month key (YYYY-MM)
    const dataByMonth = new Map<string, InvestorROIDataPoint>();
    for (const point of data) {
      // Extract YYYY-MM from the date string
      const monthKey = point.date.substring(0, 7);
      dataByMonth.set(monthKey, point);
    }

    // Build the 12-month array, using existing data or zeros
    return months.map(({ key, label }) => {
      const existing = dataByMonth.get(key);
      return {
        date: key,
        month: label,
        roi: existing?.roi ?? 0,
        contributions: existing?.contributions ?? 0,
        distributions: existing?.distributions ?? 0,
      };
    });
  }, [data]);

  return (
    <div className="relative flex flex-col rounded-2xl border border-[rgb(var(--chart-grid)_/_0.15)] min-h-80">
      {/* Header */}
      <div className="flex flex-col gap-1 px-5 py-3">
        <span className="text-base font-semibold leading-5">
          Contributions vs Distributions
        </span>
        <span className="text-[13.2px] leading-4 text-muted-foreground">
          Current ROI: {currentROI.toFixed(1)}%
        </span>
      </div>

      {/* Chart Area */}
      <div className="relative flex-1 border-t border-[rgb(var(--chart-grid)_/_0.15)] rounded-t-2xl overflow-hidden">
        {/* Custom Legend - Positioned inside chart area */}
        <div className="absolute top-3 left-5 z-10 flex flex-wrap gap-4 items-center pointer-events-none">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 min-w-4 min-h-4 rounded-lg border border-[rgb(var(--chart-area-gradient-data-secondary))]"
              style={{
                background:
                  "linear-gradient(to bottom, rgb(var(--chart-area-gradient-data-secondary)) 0%, transparent 100%)",
              }}
            />
            <span className="text-[13.2px] leading-4 whitespace-nowrap">
              Principal Balance Owed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 min-w-4 min-h-4 rounded-lg border border-[rgb(var(--chart-area-gradient-data-primary))]"
              style={{
                background:
                  "linear-gradient(to bottom, rgb(var(--chart-area-gradient-data-primary)) 0%, transparent 100%)",
              }}
            />
            <span className="text-[13.2px] leading-4 whitespace-nowrap">
              Distributions Paid
            </span>
          </div>
        </div>

        {isMounted ? (
          <ChartContainer
            config={{
              contributions: {
                label: "Principal Balance Owed",
                color: "rgb(var(--chart-area-gradient-data-secondary))",
              },
              distributions: {
                label: "Distributions Paid",
                color: "rgb(var(--chart-area-gradient-data-primary))",
              },
            }}
            className="h-[380px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 40, right: 0, left: 0, bottom: 32 }}
              >
                <defs>
                  <linearGradient
                    id="contributionGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="rgb(var(--chart-area-gradient-data-secondary))"
                      stopOpacity={1}
                    />
                    <stop
                      offset="100%"
                      stopColor="rgb(var(--chart-area-gradient-data-secondary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient
                    id="distributionGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="rgb(var(--chart-area-gradient-data-primary))"
                      stopOpacity={1}
                    />
                    <stop
                      offset="100%"
                      stopColor="rgb(var(--chart-area-gradient-data-primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  horizontal={true}
                  vertical={false}
                  stroke="rgb(var(--chart-grid) / 0.15)"
                />
                <XAxis
                  dataKey="month"
                  axisLine={{ stroke: "rgb(var(--chart-grid) / 0.15)" }}
                  tickLine={false}
                  tick={{
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 11,
                  }}
                  dy={8}
                />
                <ChartTooltip
                  content={
                    <ChartAreaTooltip
                      dataLabels={dataLabels}
                      dataColors={dataColors}
                      formatValue={formatCurrency}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="contributions"
                  name="contributions"
                  stroke="rgb(var(--chart-area-gradient-data-secondary))"
                  fill="url(#contributionGradient)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="distributions"
                  name="distributions"
                  stroke="rgb(var(--chart-area-gradient-data-primary))"
                  fill="url(#distributionGradient)"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-[380px] w-full flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground text-sm">
              Loading chart...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
