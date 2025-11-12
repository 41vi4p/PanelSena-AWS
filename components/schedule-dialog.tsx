"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Monitor, Image, X } from "lucide-react"
import { Schedule, Display, ContentItem } from "@/lib/types"

interface ScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (schedule: Partial<Schedule>) => Promise<void>
  schedule?: Schedule
  displays: Display[]
  content: ContentItem[]
}

export function ScheduleDialog({
  open,
  onOpenChange,
  onSave,
  schedule,
  displays,
  content,
}: ScheduleDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    displayIds: [] as string[],
    contentIds: [] as string[],
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    repeat: "once" as "once" | "daily" | "weekly" | "monthly",
    status: "active" as "active" | "paused" | "completed",
  })

  // Initialize form when schedule changes
  useEffect(() => {
    if (schedule) {
      setFormData({
        name: schedule.name || "",
        displayIds: schedule.displayIds || [],
        contentIds: schedule.contentIds || [],
        startDate: schedule.startDate || "",
        endDate: schedule.endDate || "",
        startTime: schedule.startTime || "",
        endTime: schedule.endTime || "",
        repeat: schedule.repeat || "once",
        status: schedule.status || "active",
      })
    } else {
      // Reset form for new schedule
      const today = new Date().toISOString().split("T")[0]
      setFormData({
        name: "",
        displayIds: [],
        contentIds: [],
        startDate: today,
        endDate: today,
        startTime: "09:00",
        endTime: "17:00",
        repeat: "once",
        status: "active",
      })
    }
  }, [schedule, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      alert("Please enter a schedule name")
      return
    }
    if (formData.displayIds.length === 0) {
      alert("Please select at least one display")
      return
    }
    if (formData.contentIds.length === 0) {
      alert("Please select at least one content item")
      return
    }

    setLoading(true)
    try {
      await onSave(formData)
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving schedule:", error)
      alert("Failed to save schedule. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const toggleDisplay = (displayId: string) => {
    setFormData((prev) => ({
      ...prev,
      displayIds: prev.displayIds.includes(displayId)
        ? prev.displayIds.filter((id) => id !== displayId)
        : [...prev.displayIds, displayId],
    }))
  }

  const toggleContent = (contentId: string) => {
    setFormData((prev) => ({
      ...prev,
      contentIds: prev.contentIds.includes(contentId)
        ? prev.contentIds.filter((id) => id !== contentId)
        : [...prev.contentIds, contentId],
    }))
  }

  const removeContent = (contentId: string) => {
    setFormData((prev) => ({
      ...prev,
      contentIds: prev.contentIds.filter((id) => id !== contentId),
    }))
  }

  const onlineDisplays = displays.filter((d) => d.status === "online")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{schedule ? "Edit Schedule" : "Create New Schedule"}</DialogTitle>
          <DialogDescription>
            {schedule
              ? "Update schedule details and content"
              : "Create a new content schedule for your displays"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-6 pb-4">
              {/* Schedule Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Schedule Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Morning Announcements"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Start Date *
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    End Date *
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    min={formData.startDate}
                    required
                  />
                </div>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Start Time *
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">
                    <Clock className="w-4 h-4 inline mr-1" />
                    End Time *
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Repeat Pattern */}
              <div className="space-y-2">
                <Label htmlFor="repeat">Repeat Pattern</Label>
                <Select
                  value={formData.repeat}
                  onValueChange={(value: any) => setFormData({ ...formData, repeat: value })}
                >
                  <SelectTrigger id="repeat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Display Selection */}
              <div className="space-y-2">
                <Label>
                  <Monitor className="w-4 h-4 inline mr-1" />
                  Select Displays * ({formData.displayIds.length} selected)
                </Label>
                {onlineDisplays.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No online displays available</p>
                ) : (
                  <div className="border rounded-lg p-3 space-y-2">
                    {onlineDisplays.map((display) => (
                      <div key={display.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`display-${display.id}`}
                          checked={formData.displayIds.includes(display.id)}
                          onCheckedChange={() => toggleDisplay(display.id)}
                        />
                        <label
                          htmlFor={`display-${display.id}`}
                          className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {display.name}
                          <span className="text-muted-foreground ml-2">({display.location})</span>
                        </label>
                        <Badge variant="secondary" className="text-xs">
                          {display.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Content Selection */}
              <div className="space-y-2">
                <Label>
                  <Image className="w-4 h-4 inline mr-1" />
                  Select Content * ({formData.contentIds.length} selected)
                </Label>
                {content.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No content available</p>
                ) : (
                  <>
                    <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                      {content.map((item) => (
                        <div key={item.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`content-${item.id}`}
                            checked={formData.contentIds.includes(item.id)}
                            onCheckedChange={() => toggleContent(item.id)}
                          />
                          <label
                            htmlFor={`content-${item.id}`}
                            className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {item.name}
                          </label>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {/* Selected Content Order */}
                    {formData.contentIds.length > 0 && (
                      <div className="mt-3">
                        <Label className="text-xs text-muted-foreground mb-2 block">
                          Playback Order ({formData.contentIds.length} items)
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {formData.contentIds.map((contentId, index) => {
                            const item = content.find((c) => c.id === contentId)
                            if (!item) return null
                            return (
                              <Badge key={contentId} variant="secondary" className="pr-1">
                                <span className="text-xs mr-1">#{index + 1}</span>
                                {item.name}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 ml-1"
                                  onClick={() => removeContent(contentId)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 pb-6 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : schedule ? "Update Schedule" : "Create Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
