"use client"

import { useState } from "react"
import { ScheduleCalendar } from "@/components/schedule-calendar"
import { ScheduleForm } from "@/components/schedule-form"
import { ScheduleList } from "@/components/schedule-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Filter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { useSchedules } from "@/hooks/use-schedules"
import { Schedule } from "@/lib/types"

export default function SchedulingPage() {
  const { user } = useAuth()
  const { schedules, loading, addSchedule, editSchedule: updateSchedule, removeSchedule } = useSchedules(user?.uid)
  const [showForm, setShowForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [filterStatus, setFilterStatus] = useState<string[]>(["active", "paused", "completed"])

  const handleAddSchedule = async (newSchedule: Partial<Schedule>) => {
    try {
      await addSchedule(newSchedule)
      setShowForm(false)
    } catch (error) {
      console.error("Error adding schedule:", error)
      alert('Failed to create schedule')
    }
  }

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setShowForm(true)
  }

  const handleUpdateSchedule = async (updatedSchedule: Partial<Schedule>) => {
    if (!editingSchedule) return
    
    try {
      await updateSchedule(editingSchedule.id, updatedSchedule)
      setShowForm(false)
      setEditingSchedule(null)
    } catch (error) {
      console.error("Error updating schedule:", error)
      alert('Failed to update schedule')
    }
  }

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return
    
    try {
      await removeSchedule(id)
    } catch (error) {
      console.error("Error deleting schedule:", error)
      alert('Failed to delete schedule')
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingSchedule(null)
  }

  const toggleFilter = (status: string) => {
    setFilterStatus((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  const filteredSchedules = schedules.filter((s) => filterStatus.includes(s.status))

  const activeCount = schedules.filter((s) => s.status === "active").length
  const pausedCount = schedules.filter((s) => s.status === "paused").length

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading schedules...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Content Scheduling</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Schedule content for your displays</p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent hover:bg-muted">
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={filterStatus.includes("active")}
                  onCheckedChange={() => toggleFilter("active")}
                >
                  Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterStatus.includes("scheduled")}
                  onCheckedChange={() => toggleFilter("scheduled")}
                >
                  Scheduled
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterStatus.includes("completed")}
                  onCheckedChange={() => toggleFilter("completed")}
                >
                  Completed
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={() => {
                console.log("[v0] New Schedule button clicked")
                setShowForm(true)
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Schedule</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Active Schedules</p>
            <p className="text-2xl font-bold text-foreground">{activeCount}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Scheduled</p>
            <p className="text-2xl font-bold text-foreground">{scheduledCount}</p>
          </div>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Schedules</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <ScheduleList schedules={filteredSchedules} onEdit={handleEditSchedule} onDelete={handleDeleteSchedule} />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <ScheduleCalendar schedules={schedules} />
          </TabsContent>
        </Tabs>

        {showForm && (
          <ScheduleForm
            schedule={editingSchedule}
            onSave={editingSchedule ? handleUpdateSchedule : handleAddSchedule}
            onClose={handleCloseForm}
          />
        )}
      </main>
    </div>
  )
}
