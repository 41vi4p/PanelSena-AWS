"use client"

import { useState } from "react"
import { PerformanceMetrics } from "@/components/performance-metrics"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { EngagementStats } from "@/components/engagement-stats"
import { UptimeTracker } from "@/components/uptime-tracker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d")

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Monitor display performance and engagement</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-40 bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <PerformanceMetrics timeRange={timeRange} />

        <Tabs defaultValue="overview" className="w-full mt-6 sm:mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="engagement" className="text-xs sm:text-sm">Engagement</TabsTrigger>
            <TabsTrigger value="uptime" className="text-xs sm:text-sm">Uptime</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
            <AnalyticsCharts timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="engagement" className="mt-4 sm:mt-6">
            <EngagementStats timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="uptime" className="mt-4 sm:mt-6">
            <UptimeTracker timeRange={timeRange} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
