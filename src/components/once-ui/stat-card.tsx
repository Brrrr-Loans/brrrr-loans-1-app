"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

/**
 * Trend direction for the stat card
 */
export type TrendDirection = "up" | "down" | "neutral";

interface StatCardProps {
  /** Label displayed above the value */
  label: string;
  /** Main value to display (already formatted) */
  value: string;
  /** Optional trend percentage (e.g., 12.5 for +12.5%) */
  trendPercent?: number;
  /** Direction of trend - determines color and icon */
  trendDirection?: TrendDirection;
  /** Optional sparkline data for background chart */
  sparklineData?: number[];
  /** Optional click handler */
  onClick?: () => void;
}

/**
 * TrendIcon - Arrow icon that points up or down based on trend
 */
function TrendIcon({ direction }: { direction: TrendDirection }) {
  if (direction === "neutral") return null;

  const colorVar =
    direction === "up"
      ? "--stat-card-trend-positive"
      : "--stat-card-trend-negative";

  return (
    <span
      className="inline-flex items-center justify-center w-4 h-4"
      style={{ color: `rgb(var(${colorVar}))` }}
    >
      {direction === "up" ? (
        <svg
          stroke="currentColor"
          fill="none"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          aria-hidden="true"
          height="1em"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
          />
        </svg>
      ) : (
        <svg
          stroke="currentColor"
          fill="none"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          aria-hidden="true"
          height="1em"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 5.573 5.573l2.75 1.32m0 0-5.94 2.28m5.94-2.28-2.28-5.94"
          />
        </svg>
      )}
    </span>
  );
}

/**
 * Generate sample sparkline data if none provided
 */
function generateDefaultSparkline(): number[] {
  return Array.from({ length: 7 }, () => Math.random() * 80 + 10);
}

/**
 * StatCard - Once UI styled stat card with optional sparkline background
 *
 * Features:
 * - Rounded card with subtle border and background
 * - Label, trend indicator, and large value
 * - Optional sparkline chart in background (30% opacity)
 */
export function StatCard({
  label,
  value,
  trendPercent,
  trendDirection = "neutral",
  sparklineData,
  onClick,
}: StatCardProps) {
  // Prevent Recharts "removeChild" errors by deferring render until mounted
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Use provided sparkline data or generate default
  const chartData = useMemo(() => {
    const data = sparklineData ?? generateDefaultSparkline();
    return data.map((value, index) => ({ index, value }));
  }, [sparklineData]);

  // Determine trend color variable
  const trendColorVar =
    trendDirection === "up"
      ? "--stat-card-trend-positive"
      : trendDirection === "down"
        ? "--stat-card-trend-negative"
        : "--muted-foreground";

  // Determine gradient color based on trend
  const gradientColorVar =
    trendDirection === "down"
      ? "--stat-card-trend-negative"
      : "--stat-card-trend-positive";

  return (
    <div
      className="relative flex flex-col rounded-2xl border border-[rgb(var(--chart-grid)_/_0.15)] bg-transparent p-5 pb-20 min-w-48 transition-all duration-300 ease-in-out cursor-pointer hover:bg-[rgb(var(--stat-card-bg)_/_0.15)] hover:border-[rgb(var(--chart-grid)_/_0.25)]"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Background Sparkline Chart - Only render when mounted to prevent Recharts errors */}
      {isMounted && (
        <div className="absolute bottom-0 left-0 right-0 h-24 rounded-2xl overflow-hidden pointer-events-none opacity-30">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`sparklineGradient-${label.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={`rgb(var(${gradientColorVar}))`}
                    stopOpacity={1}
                  />
                  <stop
                    offset="100%"
                    stopColor={`rgb(var(${gradientColorVar}))`}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={`rgb(var(${gradientColorVar}))`}
                fill={`url(#sparklineGradient-${label.replace(/\s/g, "")})`}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Content */}
      <div className="relative flex flex-col gap-3 z-10">
        {/* Header Row: Label + Trend */}
        <div className="flex items-center gap-3">
          <span className="flex-1 text-[13.2px] leading-4 text-muted-foreground">
            {label}
          </span>
          {trendPercent !== undefined && trendDirection !== "neutral" && (
            <div
              className="flex items-center gap-1"
              style={{ color: `rgb(var(${trendColorVar}))` }}
            >
              <TrendIcon direction={trendDirection} />
              <span className="text-xs font-normal">
                {Math.abs(trendPercent).toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* Value */}
        <h1
          className="text-[32px] font-semibold leading-10"
          style={{ textWrap: "balance" }}
        >
          {value}
        </h1>
      </div>
    </div>
  );
}

