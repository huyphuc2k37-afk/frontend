import * as React from "react";
import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; positiveIsGood?: boolean };
  iconClassName?: string;
  description?: string;
  loading?: boolean;
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  trend,
  iconClassName,
  description,
  loading,
}: StatsCardProps) {
  const trendUp = trend && trend.value > 0;
  const trendGood = trend?.positiveIsGood ?? trendUp;
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-caption font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            {loading ? (
              <div className="mt-2 h-9 w-24 animate-pulse rounded-md bg-muted" />
            ) : (
              <p className="mt-1 text-display-sm tracking-tight">{value}</p>
            )}
            {(trend || description) && (
              <div className="mt-3 flex items-center gap-2 text-caption">
                {trend && (
                  <span
                    className={cn(
                      "flex items-center gap-0.5 rounded-full px-2 py-0.5 font-medium",
                      trendGood
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {trendUp ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(trend.value).toFixed(1)}%
                  </span>
                )}
                {description && (
                  <span className="text-muted-foreground">{description}</span>
                )}
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
              iconClassName ?? "bg-primary/10 text-primary"
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
