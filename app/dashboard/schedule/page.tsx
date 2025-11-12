"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Edit, Trash2, Plus, Play, Pause, Loader2 } from "lucide-react"
import { ScheduleDialog } from "@/components/schedule-dialog"
import { useAuth } from "@/hooks/use-auth"
import { useSchedules } from "@/hooks/use-schedules"
import { useDisplays } from "@/hooks/use-displays"
import { useContent } from "@/hooks/use-content"
import { Schedule } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function SchedulePage() {
  const { user } = useAuth()
  const { schedules, loading, addSchedule, editSchedule, removeSchedule } = useSchedules(user?.uid)
  const { displays, loading: displaysLoading } = useDisplays(user?.uid)
  const { content, loading: contentLoading } = useContent(user?.uid)
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | undefined>(undefined)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleNewSchedule = () => {
    setEditingSchedule(undefined)
    setDialogOpen(true)
  }

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setDialogOpen(true)
  }

  const handleSaveSchedule = async (scheduleData: Partial<Schedule>) => {
    if (editingSchedule) {
      await editSchedule(editingSchedule.id, scheduleData)
    } else {
      await addSchedule(scheduleData)
    }
  }

  const handleDeleteClick = (schedule: Schedule) => {
    setScheduleToDelete(schedule)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (scheduleToDelete) {
      setDeletingId(scheduleToDelete.id)
      try {
        await removeSchedule(scheduleToDelete.id)
      } finally {
        setDeletingId(null)
        setDeleteDialogOpen(false)
        setScheduleToDelete(null)
      }
    }
  }

  const handleToggleStatus = async (schedule: Schedule) => {
    const newStatus = schedule.status === "active" ? "paused" : "active"
    await editSchedule(schedule.id, { status: newStatus })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (timeStr: string) => {
    return timeStr
  }

  const getRepeatLabel = (repeat: string) => {
    return repeat.charAt(0).toUpperCase() + repeat.slice(1)
  }

  const isLoading = loading || displaysLoading || contentLoading

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Scheduling</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Create and manage content schedules
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
          onClick={handleNewSchedule}
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Schedule
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && schedules.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No schedules yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Create your first schedule to automate content playback on your displays
            </p>
            <Button onClick={handleNewSchedule}>
              <Plus className="w-4 h-4 mr-2" />
              Create Schedule
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Schedules Grid */}
      {!isLoading && schedules.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{schedule.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {getRepeatLabel(schedule.repeat)} schedule
                    </CardDescription>
                  </div>
                  <Badge
                    variant={schedule.status === "active" ? "default" : "secondary"}
                    className="ml-2"
                  >
                    {schedule.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Schedule Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">
                      {formatDate(schedule.startDate)} - {formatDate(schedule.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">
                      {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{schedule.displayIds.length} display(s)</span>
                    <span>•</span>
                    <span>{schedule.contentIds.length} content item(s)</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleToggleStatus(schedule)}
                  >
                    {schedule.status === "active" ? (
                      <>
                        <Pause className="w-3 h-3 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditSchedule(schedule)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(schedule)}
                    disabled={deletingId === schedule.id}
                  >
                    {deletingId === schedule.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Schedule Dialog */}
      <ScheduleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveSchedule}
        schedule={editingSchedule}
        displays={displays}
        content={content}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{scheduleToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

