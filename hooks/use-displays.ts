import { useState, useEffect } from 'react'
import { Display } from '@/lib/types'

export function useDisplays(userId: string | undefined) {
  const [displays, setDisplays] = useState<Display[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    // Initial load
    loadDisplays()

    // Poll for updates every 5 seconds to get real-time status
    const pollInterval = setInterval(() => {
      loadDisplays()
    }, 5000)

    return () => {
      clearInterval(pollInterval)
    }
  }, [userId])

  const loadDisplays = async () => {
    if (!userId) return

    // Only show loading on initial load
    if (displays.length === 0) {
      setLoading(true)
    }
    
    try {
      const response = await fetch(`/api/displays?userId=${encodeURIComponent(userId)}`)
      if (!response.ok) throw new Error('Failed to load displays')
      const displaysData = await response.json()
      setDisplays(displaysData)
      setError(null)
    } catch (error) {
      console.error('Error loading displays:', error)
      setError('Failed to load displays')
    } finally {
      setLoading(false)
    }
  }

  const addDisplay = async (displayData: Partial<Display>) => {
    if (!userId) throw new Error('User not authenticated')

    try {
      const response = await fetch('/api/displays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...displayData })
      })
      if (!response.ok) throw new Error('Failed to add display')
      const newDisplay = await response.json()

      // Log activity
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: 'display',
          action: 'Display Added',
          description: `Added display "${newDisplay.name}"`,
          metadata: { displayName: newDisplay.name, displayId: newDisplay.id }
        })
      })

      return newDisplay
    } catch (err) {
      console.error('Error adding display:', err)
      setError('Failed to add display')
      throw err
    }
  }

  const editDisplay = async (id: string, data: Partial<Display>) => {
    try {
      const display = displays.find(d => d.id === id)
      await fetch(`/api/displays/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      // Log activity
      if (userId && display) {
        await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            type: 'display',
            action: 'Display Updated',
            description: `Updated display "${display.name}"`,
            metadata: { displayName: display.name, displayId: display.id }
          })
        })
      }
    } catch (err) {
      console.error('Error updating display:', err)
      setError('Failed to update display')
      throw err
    }
  }

  const removeDisplay = async (id: string) => {
    try {
      const display = displays.find(d => d.id === id)
      await fetch(`/api/displays/${id}`, {
        method: 'DELETE'
      })

      // Log activity
      if (userId && display) {
        await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            type: 'display',
            action: 'Display Removed',
            description: `Removed display "${display.name}"`,
            metadata: { displayName: display.name, displayId: display.id }
          })
        })
      }
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
    refreshDisplays: loadDisplays,
  }
}
