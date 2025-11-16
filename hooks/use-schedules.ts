import { useState, useEffect } from 'react'
import { Schedule } from '@/lib/types'

export function useSchedules(userId: string | undefined) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    loadSchedules()
  }, [userId])

  const loadSchedules = async () => {
    if (!userId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/schedules?userId=${encodeURIComponent(userId)}`)
      if (!response.ok) throw new Error('Failed to load schedules')
      const schedulesData = await response.json()
      setSchedules(schedulesData)
    } catch (error) {
      console.error('Error loading schedules:', error)
      setError('Failed to load schedules')
    } finally {
      setLoading(false)
    }
  }

  const addSchedule = async (scheduleData: Partial<Schedule>) => {
    if (!userId) throw new Error('User not authenticated')

    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...scheduleData })
      })
      if (!response.ok) throw new Error('Failed to add schedule')
      const newSchedule = await response.json()

      // Log schedule creation
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: 'schedule',
          action: 'Schedule Created',
          description: `Created schedule "${scheduleData.name}"`,
          metadata: { scheduleName: scheduleData.name, displayIds: scheduleData.displayIds }
        })
      })

      return newSchedule
    } catch (err) {
      console.error('Error adding schedule:', err)
      setError('Failed to add schedule')
      
      // Log error
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: 'system',
          action: 'Schedule Create Error',
          description: `Failed to create schedule: ${err}`,
          metadata: { error: String(err) }
        })
      }).catch(console.error)
      
      throw err
    }
  }

  const editSchedule = async (id: string, data: Partial<Schedule>) => {
    if (!userId) throw new Error('User not authenticated')

    try {
      await fetch(`/api/schedules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      // Find the schedule to get its name if not provided in data
      const schedule = schedules.find(s => s.id === id)
      const scheduleName = data.name || schedule?.name || 'Unnamed'

      // Log schedule update
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: 'schedule',
          action: 'Schedule Updated',
          description: `Updated schedule "${scheduleName}"`,
          metadata: { scheduleName, scheduleId: id }
        })
      })
    } catch (err) {
      console.error('Error updating schedule:', err)
      setError('Failed to update schedule')

      // Log error
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: 'system',
          action: 'Schedule Update Error',
          description: `Failed to update schedule: ${err}`,
          metadata: { error: String(err), scheduleId: id }
        })
      }).catch(console.error)
      
      throw err
    }
  }

  const removeSchedule = async (id: string) => {
    if (!userId) throw new Error('User not authenticated')

    try {
      const schedule = schedules.find(s => s.id === id)
      await fetch(`/api/schedules/${id}`, {
        method: 'DELETE'
      })

      // Log schedule deletion
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: 'schedule',
          action: 'Schedule Deleted',
          description: `Deleted schedule "${schedule?.name || id}"`,
          metadata: { scheduleName: schedule?.name, scheduleId: id }
        })
      })
    } catch (err) {
      console.error('Error deleting schedule:', err)
      setError('Failed to delete schedule')

      // Log error
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: 'system',
          action: 'Schedule Delete Error',
          description: `Failed to delete schedule: ${err}`,
          metadata: { error: String(err), scheduleId: id }
        })
      }).catch(console.error)
      
      throw err
    }
  }

  return {
    schedules,
    loading,
    error,
    addSchedule,
    editSchedule,
    removeSchedule,
    refreshSchedules: loadSchedules,
  }
}
