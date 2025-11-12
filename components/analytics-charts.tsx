"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface AnalyticsChartsProps {
  timeRange: string
}

export function AnalyticsCharts({ timeRange }: AnalyticsChartsProps) {
  // TODO: Fetch analytics data from Firebase
  const viewsData: any[] = []
  const displayPerformanceData: any[] = []

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Views & Engagement Trend</CardTitle>
          <CardDescription>Daily views and engagement rate over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={viewsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: `1px solid var(--color-border)`,
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="views"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ fill: "var(--color-primary)" }}
              />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke="var(--color-accent)"
                strokeWidth={2}
                dot={{ fill: "var(--color-accent)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Display Performance</CardTitle>
          <CardDescription>Uptime and views by display</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={displayPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: `1px solid var(--color-border)`,
                }}
              />
              <Legend />
              <Bar dataKey="uptime" fill="var(--color-primary)" />
              <Bar dataKey="views" fill="var(--color-accent)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
