import { useState, useEffect } from 'react'
import { Display } from '@/lib/types'
import {
  createDisplay,
  updateDisplay,
  deleteDisplay,
  subscribeToDisplays,
} from '@/lib/firestore'
import { listenToAllDisplaysStatus } from '@/lib/realtime-db'

export function useDisplays(userId: string | undefined) {
  const [displays, setDisplays] = useState<Display[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)

    let firestoreDisplays: Display[] = []
    let realtimeStatuses: Record<string, any> = {}
    let firestoreLoaded = false
    let realtimeLoaded = false

    const mergeAndSetDisplays = () => {
      // Only merge if we have at least Firestore data
      if (!firestoreLoaded) return

      const mergedDisplays = firestoreDisplays.map(display => {
        const realtimeStatus = realtimeStatuses[display.id]
        if (realtimeStatus) {
          return {
            ...display,
            status: realtimeStatus.status || display.status,
            lastUpdate: realtimeStatus.lastHeartbeat 
              ? new Date(realtimeStatus.lastHeartbeat).toISOString() 
              : display.lastUpdate,
            uptime: realtimeStatus.uptime || display.uptime,
            volume: realtimeStatus.volume,
            currentContent: realtimeStatus.currentContent,
            schedule: realtimeStatus.schedule,
          }
        }
        return display
      })
      
      setDisplays(mergedDisplays)
      
      // Mark as loaded once we have data from both sources or just Firestore
      if (firestoreLoaded) {
        setLoading(false)
      }
    }

    // Subscribe to Firestore displays
    const unsubscribeFirestore = subscribeToDisplays(userId, (updatedDisplays) => {
      firestoreDisplays = updatedDisplays
      firestoreLoaded = true
      mergeAndSetDisplays()
    })

    // Subscribe to Realtime Database status updates
    const unsubscribeRealtime = listenToAllDisplaysStatus(userId, (statuses) => {
      realtimeStatuses = statuses
      realtimeLoaded = true
      mergeAndSetDisplays()
    })

    return () => {
      unsubscribeFirestore()
      unsubscribeRealtime()
    }
  }, [userId])

  const addDisplay = async (displayData: Partial<Display>) => {
    if (!userId) throw new Error('User not authenticated')

    try {
      const newDisplay = await createDisplay(userId, displayData)
      return newDisplay
    } catch (err) {
      console.error('Error adding display:', err)
      setError('Failed to add display')
      throw err
    }
  }

  const editDisplay = async (id: string, data: Partial<Display>) => {
    try {
      await updateDisplay(id, data)
    } catch (err) {
      console.error('Error updating display:', err)
      setError('Failed to update display')
      throw err
    }
  }

  const removeDisplay = async (id: string) => {
    try {
      await deleteDisplay(id)
    } catch (err) {
      console.error('Error deleting display:', err)
      setError('Failed to delete display')
      throw err
    }
  }

  return {
    displays,
    loading,
    error,
    addDisplay,
    editDisplay,
    removeDisplay,
  }
}
