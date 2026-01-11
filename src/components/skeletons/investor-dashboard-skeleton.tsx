import { Card, CardContent, CardHeader } from "@/components/ui";
import { Skeleton } from "@/components/ui";

export function InvestorDashboardSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6 animate-in fade-in-50">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="gap-2">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Skeleton */}
      <Card className="overflow-hidden">
        <CardHeader className="gap-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col gap-4">
            <div className="flex-1 grid grid-cols-12 gap-2">
              {[60, 75, 45, 90, 55, 80, 70, 85, 50, 95, 65, 88].map(
                (height, i) => (
                  <div key={i} className="flex items-end w-full">
                    <Skeleton
                      className="w-full"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                )
              )}
            </div>
            <Skeleton className="h-6 w-full" /> {/* X-axis */}
          </div>
        </CardContent>
      </Card>

      {/* Tabs Skeleton */}
      <Card>
        <CardHeader className="gap-2">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
