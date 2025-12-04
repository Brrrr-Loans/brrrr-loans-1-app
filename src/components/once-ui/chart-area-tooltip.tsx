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
  }>;
  label?: string;
  /** Map of dataKey to display label */
  dataLabels?: Record<string, string>;
  /** Custom value formatter function */
  formatValue?: (value: number) => string;
  /** CSS variable name for primary data series color (without --) */
  primaryColorVar?: string;
  /** CSS variable name for secondary data series color (without --) */
  secondaryColorVar?: string;
}

export function ChartAreaTooltip({
  active,
  payload,
  label,
  dataLabels = {},
  formatValue = (v) => v.toLocaleString(),
  primaryColorVar = "chart-area-gradient-data-primary",
  secondaryColorVar = "chart-area-gradient-data-secondary",
}: ChartAreaTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const getColorVar = (dataKey: string, index: number) => {
    // First item uses primary, subsequent items use secondary
    return index === 0 ? primaryColorVar : secondaryColorVar;
  };

  return (
    <div className="rounded-xl border border-[rgb(var(--chart-grid)_/_0.15)] bg-background px-4 py-3 shadow-lg">
      {/* Header - Label */}
      <div className="mb-2 text-sm font-semibold">{label}</div>

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

