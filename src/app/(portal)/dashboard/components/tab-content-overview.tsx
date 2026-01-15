"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

const data = [
  { month: "Jan", capital: 2500000, returns: 125000 },
  { month: "Feb", capital: 2750000, returns: 137500 },
  { month: "Mar", capital: 3000000, returns: 150000 },
  { month: "Apr", capital: 3250000, returns: 162500 },
  { month: "May", capital: 3500000, returns: 175000 },
  { month: "Jun", capital: 3750000, returns: 187500 },
  { month: "Jul", capital: 4000000, returns: 200000 },
  { month: "Aug", capital: 4231000, returns: 211550 },
]

export function Overview() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
        <CardDescription>View your capital and returns over time</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer
          config={{
            capital: {
              label: "Capital Raised",
              color: "hsl(var(--chart-1))",
            },
            returns: {
              label: "Returns Generated",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                tickFormatter={(value) =>
                  new Intl.NumberFormat("en-US", {
                    notation: "compact",
                    compactDisplay: "short",
                    style: "currency",
                    currency: "USD",
                  }).format(value)
                }
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="capital"
                stroke="var(--color-capital)"
                name="Capital Raised"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="returns"
                stroke="var(--color-returns)"
                name="Returns Generated"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
