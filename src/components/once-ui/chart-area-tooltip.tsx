"use client";

/**
 * ChartAreaTooltip - Once UI styled tooltip for area charts
 *
 * This component follows the Once UI design system for chart tooltips,
 * featuring gradient pill indicators and a clean card layout.
 *
 * Note: This is a scoped departure from shadcn/ui for specific design requirements.
 * It uses CSS variables defined in globals.css for theme-aware styling.
 */

interface ChartAreaTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    dataKey: string;
    payload?: {
      date?: string;
      month?: string;
    };
  }>;
  label?: string;
  /** Map of dataKey to display label */
  dataLabels?: Record<string, string>;
  /** Map of dataKey to CSS variable name (without --) for explicit color control */
  dataColors?: Record<string, string>;
  /** Custom value formatter function */
  formatValue?: (value: number) => string;
  /** CSS variable name for primary data series color (without --) */
  primaryColorVar?: string;
  /** CSS variable name for secondary data series color (without --) */
  secondaryColorVar?: string;
}

/**
 * Format a month label (e.g., "Aug 2025") into a date range with styled year
 * Returns { range: "Aug 1 - 31", year: "2025" }
 */
function formatDateRange(label: string, dateKey?: string): { range: string; year: string } {
  // Try to parse from dateKey (YYYY-MM format) first
  if (dateKey && /^\d{4}-\d{2}$/.test(dateKey)) {
    const [year, month] = dateKey.split("-").map(Number);
    const lastDay = new Date(year, month, 0).getDate(); // Get last day of month
    const monthName = new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "short" });
    return {
      range: `${monthName} 1 - ${lastDay}`,
      year: year.toString(),
    };
  }

  // Fallback: parse from label (e.g., "Aug 2025")
  const match = label?.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (match) {
    const [, monthName, year] = match;
    // Parse the month to get last day
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
    const lastDay = new Date(Number(year), monthIndex + 1, 0).getDate();
    return {
      range: `${monthName} 1 - ${lastDay}`,
      year,
    };
  }

  // If parsing fails, return original label
  return { range: label || "", year: "" };
}

export function ChartAreaTooltip({
  active,
  payload,
  label,
  dataLabels = {},
  dataColors = {},
  formatValue = (v) => v.toLocaleString(),
  primaryColorVar = "chart-area-gradient-data-primary",
  secondaryColorVar = "chart-area-gradient-data-secondary",
}: ChartAreaTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const getColorVar = (dataKey: string, index: number) => {
    // Use explicit color mapping if provided, otherwise fallback to index-based
    if (dataColors[dataKey]) {
      return dataColors[dataKey];
    }
    // First item uses primary, subsequent items use secondary
    return index === 0 ? primaryColorVar : secondaryColorVar;
  };

  // Get date key from payload for more accurate parsing
  const dateKey = payload[0]?.payload?.date;
  const { range, year } = formatDateRange(label || "", dateKey);

  return (
    <div className="rounded-xl border border-[rgb(var(--chart-grid)_/_0.15)] bg-background px-4 py-3 shadow-lg">
      {/* Header - Date Range with styled year */}
      <div className="mb-2 text-sm font-semibold">
        {range}
        {year && (
          <span className="ml-1 text-[11px] font-medium text-muted-foreground align-baseline">
            {year}
          </span>
        )}
      </div>

      {/* Data rows */}
      <div className="flex flex-col gap-2">
        {payload.map((item, index) => {
          const colorVar = `--${getColorVar(item.dataKey, index)}`;
          return (
            <div key={item.dataKey} className="flex items-center gap-3">
              {/* Gradient pill indicator - matches Once UI legend style */}
              <div
                className="h-4 w-4 min-h-4 min-w-4 rounded-lg border"
                style={{
                  borderColor: `rgb(var(${colorVar}))`,
                  background: `linear-gradient(to bottom, rgb(var(${colorVar})) 0%, transparent 100%)`,
                }}
              />
              {/* Label */}
              <span className="text-[13px] text-muted-foreground">
                {dataLabels[item.dataKey] || item.name}
              </span>
              {/* Value - right aligned */}
              <span className="ml-auto text-[13px] font-medium tabular-nums">
                {formatValue(item.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

