"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface UptimeTrackerProps {
  timeRange: string
}

export function UptimeTracker({ timeRange }: UptimeTrackerProps) {
  // TODO: Fetch uptime data from Firebase
  const displayUptime: any[] = []

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99) return "text-green-600 dark:text-green-400"
    if (uptime >= 98) return "text-blue-600 dark:text-blue-400"
    if (uptime >= 95) return "text-amber-600 dark:text-amber-400"
    return "text-red-600 dark:text-red-400"
  }

  return (
    <div className="space-y-4">
      {displayUptime.map((display) => (
        <Card key={display.name} className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-foreground">{display.name}</h3>
                  <Badge
                    variant={display.status === "online" ? "default" : "secondary"}
                    className={
                      display.status === "online"
                        ? "bg-green-500/20 text-green-700 dark:text-green-400"
                        : "bg-red-500/20 text-red-700 dark:text-red-400"
                    }
                  >
                    {display.status === "online" ? "Online" : "Offline"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p className="text-xs font-medium text-foreground">Last Incident</p>
                    <p>{display.lastIncident}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">Total Incidents</p>
                    <p>{display.incidents}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="text-right">
                  <p className={`text-2xl font-bold ${getUptimeColor(display.uptime)}`}>{display.uptime}%</p>
                  <p className="text-xs text-muted-foreground">Uptime</p>
                </div>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      display.uptime >= 99
                        ? "bg-green-500"
                        : display.uptime >= 98
                          ? "bg-blue-500"
                          : display.uptime >= 95
                            ? "bg-amber-500"
                            : "bg-red-500"
                    }`}
                    style={{ width: `${display.uptime}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
