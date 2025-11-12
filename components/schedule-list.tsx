"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Edit, Trash2, Repeat } from "lucide-react"

interface Schedule {
  id: number
  name: string
  content: string
  displays: string[]
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  recurring: "none" | "daily" | "weekly" | "monthly"
  daysOfWeek?: string[]
  status: "active" | "scheduled" | "completed"
}

interface ScheduleListProps {
  schedules: Schedule[]
  onEdit: (schedule: Schedule) => void
  onDelete: (id: number) => void
}

export function ScheduleList({ schedules, onEdit, onDelete }: ScheduleListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-700 dark:text-green-400"
      case "scheduled":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400"
      case "completed":
        return "bg-gray-500/20 text-gray-700 dark:text-gray-400"
      default:
        return ""
    }
  }

  const getRecurringLabel = (recurring: string, daysOfWeek?: string[]) => {
    if (recurring === "none") return "One-time"
    if (recurring === "daily") return "Daily"
    if (recurring === "weekly") return `Weekly (${daysOfWeek?.join(", ")})`
    if (recurring === "monthly") return "Monthly"
    return recurring
  }

  return (
    <div className="space-y-3">
      {schedules.map((schedule) => (
        <Card key={schedule.id} className="border-border hover:border-primary/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-foreground">{schedule.name}</h3>
                  <Badge className={getStatusColor(schedule.status)}>
                    {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{schedule.content}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">Displays</p>
                    <p>{schedule.displays.length} display(s)</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Time</p>
                    <p>
                      {schedule.startTime} - {schedule.endTime}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Period</p>
                    <p>
                      {schedule.startDate} to {schedule.endDate}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Recurrence</p>
                    <p className="flex items-center gap-1">
                      <Repeat className="w-3 h-3" />
                      {getRecurringLabel(schedule.recurring, schedule.daysOfWeek)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={() => {
                    console.log("[v0] Edit schedule:", schedule.id)
                    onEdit(schedule)
                  }}
                  title="Edit schedule"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={() => {
                    console.log("[v0] Delete schedule:", schedule.id)
                    if (confirm("Are you sure you want to delete this schedule?")) {
                      onDelete(schedule.id)
                    }
                  }}
                  title="Delete schedule"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {schedules.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No schedules found</p>
        </div>
      )}
    </div>
  )
}
