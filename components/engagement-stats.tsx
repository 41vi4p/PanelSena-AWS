"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Eye, Clock } from "lucide-react"

interface EngagementStatsProps {
  timeRange: string
}

export function EngagementStats({ timeRange }: EngagementStatsProps) {
  // TODO: Fetch engagement data from Firebase
  const contentEngagement: any[] = []

  return (
    <div className="space-y-4">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Content Engagement</CardTitle>
          <CardDescription>Performance metrics for each content item</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {contentEngagement.map((content) => (
              <div
                key={content.name}
                className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{content.name}</p>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {content.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {content.avgTime} avg
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{content.engagement}%</p>
                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {content.trend}
                    </p>
                  </div>
                  <div className="w-16 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <div
                      className="h-full bg-primary rounded-lg transition-all"
                      style={{ width: `${content.engagement}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
