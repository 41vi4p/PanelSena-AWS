import { useState, useEffect } from 'react'
import { Activity } from '@/lib/types'
import { createActivity, subscribeToActivities } from '@/lib/firestore'

export function useActivities(userId: string | undefined, limit: number = 50) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)

    // Subscribe to realtime updates
    const unsubscribe = subscribeToActivities(
      userId,
      (updatedActivities) => {
        setActivities(updatedActivities)
        setLoading(false)
      },
      limit
    )

    return () => unsubscribe()
  }, [userId, limit])

  const logActivity = async (
    type: 'display' | 'content' | 'schedule' | 'system',
    action: string,
    description: string,
    metadata?: Record<string, any>
  ) => {
    if (!userId) throw new Error('User not authenticated')

    try {
      const activityData: Partial<Activity> = {
        type,
        action,
        description,
        metadata,
      }

      await createActivity(userId, activityData)
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
  }
}
