import { useState, useEffect } from 'react'
import { Activity } from '@/lib/types'

export function useActivities(userId: string | undefined, limit: number = 50) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    loadActivities()
  }, [userId, limit])

  const loadActivities = async () => {
    if (!userId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/activities?userId=${encodeURIComponent(userId)}&limit=${limit}`)
      if (!response.ok) throw new Error('Failed to load activities')
      const activitiesData = await response.json()
      setActivities(activitiesData)
    } catch (error) {
      console.error('Error loading activities:', error)
      setError('Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  const logActivity = async (
    type: 'display' | 'content' | 'schedule' | 'system',
    action: string,
    description: string,
    metadata?: Record<string, any>
  ) => {
    if (!userId) throw new Error('User not authenticated')

    try {
      const activityData = {
        type,
        action,
        description,
        metadata,
      }

      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...activityData })
      })

      if (!response.ok) throw new Error('Failed to log activity')

      // Reload activities to include the new one
      await loadActivities()
    } catch (err) {
      console.error('Error logging activity:', err)
      setError('Failed to log activity')
      throw err
    }
  }

  return {
    activities,
    loading,
    error,
    logActivity,
    refreshActivities: loadActivities
  }
}
