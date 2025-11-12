"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

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

interface ScheduleFormProps {
  schedule: Schedule | null
  onSave: (schedule: Schedule | Omit<Schedule, "id">) => void
  onClose: () => void
}

export function ScheduleForm({ schedule, onSave, onClose }: ScheduleFormProps) {
  const [formData, setFormData] = useState(
    schedule || {
      name: "",
      content: "",
      displays: [] as string[],
      startDate: "",
      endDate: "",
      startTime: "09:00",
      endTime: "17:00",
      recurring: "none" as const,
      daysOfWeek: [] as string[],
      status: "scheduled" as const,
    },
  )

  // TODO: Fetch content and display options from Firebase
  const contentOptions: string[] = []
  const displayOptions: string[] = []
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const handleSave = () => {
    if (!formData.name || !formData.content || formData.displays.length === 0) {
      alert("Please fill in all required fields")
      return
    }
    onSave(formData)
  }

  const toggleDisplay = (display: string) => {
    setFormData((prev) => ({
      ...prev,
      displays: prev.displays.includes(display)
        ? prev.displays.filter((d) => d !== display)
        : [...prev.displays, display],
    }))
  }

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek?.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...(prev.daysOfWeek || []), day],
    }))
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{schedule ? "Edit Schedule" : "Create New Schedule"}</DialogTitle>
          <DialogDescription>Set up content scheduling for your displays</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Schedule Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Morning Welcome"
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Select value={formData.content} onValueChange={(value) => setFormData({ ...formData, content: value })}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select content" />
              </SelectTrigger>
              <SelectContent>
                {contentOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Displays *</Label>
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted rounded-lg">
              {displayOptions.map((display) => (
                <div key={display} className="flex items-center gap-2">
                  <Checkbox
                    id={display}
                    checked={formData.displays.includes(display)}
                    onCheckedChange={() => toggleDisplay(display)}
                  />
                  <Label htmlFor={display} className="font-normal cursor-pointer">
                    {display}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="bg-input border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="bg-input border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurring">Recurrence</Label>
            <Select
              value={formData.recurring}
              onValueChange={(value: any) => setFormData({ ...formData, recurring: value })}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">One-time</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.recurring === "weekly" && (
            <div className="space-y-3">
              <Label>Days of Week</Label>
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted rounded-lg">
                {daysOfWeek.map((day) => (
                  <div key={day} className="flex items-center gap-2">
                    <Checkbox
                      id={day}
                      checked={formData.daysOfWeek?.includes(day) || false}
                      onCheckedChange={() => toggleDay(day)}
                    />
                    <Label htmlFor={day} className="font-normal cursor-pointer">
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{schedule ? "Update Schedule" : "Create Schedule"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
