"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Monitor, Activity, AlertCircle, TrendingUp } from "lucide-react"

export function MetricsCards() {
  // TODO: Fetch metrics from Firebase
  const metrics = [
    {
      title: "Active Displays",
      value: "0",
      description: "Online and running",
      icon: Monitor,
      color: "text-blue-500",
    },
    {
      title: "Content Updates",
      value: "0",
      description: "This week",
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "System Health",
      value: "0%",
      description: "Uptime",
      icon: Activity,
      color: "text-emerald-500",
    },
    {
      title: "Alerts",
      value: "0",
      description: "Require attention",
      icon: AlertCircle,
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
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
