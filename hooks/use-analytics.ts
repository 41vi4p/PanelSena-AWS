import { useState, useEffect } from 'react'
import { Analytics } from '@/lib/types'
import { createAnalytics, getUserAnalytics } from '@/lib/firestore'

export function useAnalytics(
  userId: string | undefined,
  startDate?: string,
  endDate?: string
) {
  const [analytics, setAnalytics] = useState<Analytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const loadAnalytics = async () => {
      setLoading(true)
      try {
        const data = await getUserAnalytics(userId, startDate, endDate)
        setAnalytics(data)
      } catch (err) {
        console.error('Error loading analytics:', err)
        setError('Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [userId, startDate, endDate])

  const trackMetric = async (
    metric: string,
    value: number,
    displayId?: string,
    contentId?: string
  ) => {
    if (!userId) throw new Error('User not authenticated')

    try {
      const analyticsData: Partial<Analytics> = {
        metric,
        value,
        displayId,
        contentId,
      }

      const newAnalytic = await createAnalytics(userId, analyticsData)
      setAnalytics((prev) => [newAnalytic, ...prev])
      return newAnalytic
    } catch (err) {
      console.error('Error tracking metric:', err)
      setError('Failed to track metric')
      throw err
    }
  }

  const getMetricsByType = (metric: string) => {
    return analytics.filter((a) => a.metric === metric)
  }

  const getMetricsByDisplay = (displayId: string) => {
    return analytics.filter((a) => a.displayId === displayId)
  }

  const getMetricsByContent = (contentId: string) => {
    return analytics.filter((a) => a.contentId === contentId)
  }

  return {
    analytics,
    loading,
    error,
    trackMetric,
    getMetricsByType,
    getMetricsByDisplay,
    getMetricsByContent,
  }
}
