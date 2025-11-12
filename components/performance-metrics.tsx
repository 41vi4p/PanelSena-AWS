"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Activity, Clock, AlertTriangle } from "lucide-react"

interface PerformanceMetricsProps {
  timeRange: string
}

export function PerformanceMetrics({ timeRange }: PerformanceMetricsProps) {
  // TODO: Fetch performance metrics from Firebase
  const metrics = [
    {
      title: "Avg. Uptime",
      value: "0%",
      change: "0%",
      icon: Activity,
      color: "text-green-500",
    },
    {
      title: "Total Views",
      value: "0",
      change: "0%",
      icon: TrendingUp,
      color: "text-blue-500",
    },
    {
      title: "Avg. Display Time",
      value: "0s",
      change: "0%",
      icon: Clock,
      color: "text-purple-500",
    },
    {
      title: "Critical Alerts",
      value: "0",
      change: "0",
      icon: AlertTriangle,
      color: "text-amber-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.title} className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
                <Icon className={`w-4 h-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                <p className="text-xs text-green-600 dark:text-green-400">{metric.change} from last period</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
