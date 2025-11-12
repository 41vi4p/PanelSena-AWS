"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

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

interface ScheduleCalendarProps {
  schedules: Schedule[]
}

export function ScheduleCalendar({ schedules }: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 29))

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getSchedulesForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return schedules.filter((schedule) => {
      const startDate = new Date(schedule.startDate)
      const endDate = new Date(schedule.endDate)
      const currentDate = new Date(dateStr)

      if (currentDate < startDate || currentDate > endDate) return false

      if (schedule.recurring === "none") return true
      if (schedule.recurring === "daily") return true
      if (schedule.recurring === "weekly") {
        const dayName = date.toLocaleDateString("en-US", { weekday: "long" })
        return schedule.daysOfWeek?.includes(dayName)
      }

      return false
    })
  }

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i))
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle>{monthName}</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}

            {days.map((date, index) => {
              const daySchedules = date ? getSchedulesForDate(date) : []
              const isToday = date && date.toDateString() === new Date().toDateString()

              return (
                <div
                  key={index}
                  className={`min-h-24 p-2 rounded-lg border ${
                    date
                      ? isToday
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/50"
                      : "bg-muted/30"
                  }`}
                >
                  {date && (
                    <div className="space-y-1">
                      <p className={`text-sm font-semibold ${isToday ? "text-primary" : "text-foreground"}`}>
                        {date.getDate()}
                      </p>
                      <div className="space-y-1">
                        {daySchedules.slice(0, 2).map((schedule) => (
                          <Badge
                            key={schedule.id}
                            variant="secondary"
                            className="text-xs w-full truncate justify-start"
                          >
                            {schedule.name}
                          </Badge>
                        ))}
                        {daySchedules.length > 2 && (
                          <p className="text-xs text-muted-foreground">+{daySchedules.length - 2} more</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
