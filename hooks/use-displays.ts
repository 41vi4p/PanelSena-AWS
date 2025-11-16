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

    loadDisplays()
  }, [userId])

  const loadDisplays = async () => {
    if (!userId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/displays?userId=${encodeURIComponent(userId)}`)
      if (!response.ok) throw new Error('Failed to load displays')
      const displaysData = await response.json()
      setDisplays(displaysData)
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
      return newDisplay
    } catch (err) {
      console.error('Error adding display:', err)
      setError('Failed to add display')
      throw err
    }
  }

  const editDisplay = async (id: string, data: Partial<Display>) => {
    try {
      await fetch(`/api/displays/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    } catch (err) {
      console.error('Error updating display:', err)
      setError('Failed to update display')
      throw err
    }
  }

  const removeDisplay = async (id: string) => {
    try {
      await fetch(`/api/displays/${id}`, {
        method: 'DELETE'
      })
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
