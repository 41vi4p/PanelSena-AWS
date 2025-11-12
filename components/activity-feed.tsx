"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, AlertTriangle, CheckCircle, Clock } from "lucide-react"

export function ActivityFeed() {
  // TODO: Fetch activities from Firebase
  const activities: any[] = []

  const getIconColor = (type: string) => {
    switch (type) {
      case "upload":
        return "text-blue-500"
      case "alert":
        return "text-amber-500"
      case "success":
        return "text-green-500"
      case "pending":
        return "text-purple-500"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card className="border-border h-full">
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                <div className={`p-2 rounded-lg bg-muted flex-shrink-0 ${getIconColor(activity.type)}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
