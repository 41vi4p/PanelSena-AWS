import { useState, useEffect, useCallback } from 'react'
import { LivePlaybackStatus, PlaybackCommand } from '@/lib/types'

export function useLivePlayback(userId: string | undefined) {
  const [displays, setDisplays] = useState<Record<string, LivePlaybackStatus>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)

    // Poll for display statuses every 5 seconds
    const pollDisplays = async () => {
      try {
        const response = await fetch(`/api/live-playback?userId=${encodeURIComponent(userId)}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setDisplays(data.displays || {})
        setLoading(false)
        setError(null)
      } catch (err: any) {
        console.error('Error fetching display statuses:', err)
        setDisplays({})
        setLoading(false)
        // Only set error for non-auth issues
        if (!err.message?.includes('401') && !err.message?.includes('403')) {
          setError('Failed to fetch display statuses')
        }
      }
    }

    // Initial fetch
    pollDisplays()

    // Set up polling interval
    const pollInterval = setInterval(pollDisplays, 5000) // Every 5 seconds

    return () => {
      clearInterval(pollInterval)
    }
  }, [userId])

  const sendCommand = useCallback(
    async (
      displayId: string,
      command: Omit<PlaybackCommand, 'commandId' | 'timestamp' | 'status' | 'displayId'>
    ) => {
      if (!userId) {
        throw new Error('User not authenticated')
      }

      try {
        const response = await fetch('/api/live-playback/command', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            displayId,
            command: {
              displayId,
              ...command,
            },
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return data.commandId
      } catch (err) {
        console.error('Error sending command:', err)
        setError('Failed to send command')
        throw err
      }
    },
    [userId]
  )

  const playContent = useCallback(
    (displayId: string, contentId: string) => {
      return sendCommand(displayId, {
        type: 'play',
        payload: { contentId },
      })
    },
    [sendCommand]
  )

  const pauseContent = useCallback(
    (displayId: string) => {
      return sendCommand(displayId, {
        type: 'pause',
      })
    },
    [sendCommand]
  )

  const stopContent = useCallback(
    (displayId: string) => {
      return sendCommand(displayId, {
        type: 'stop',
      })
    },
    [sendCommand]
  )

  const skipContent = useCallback(
    (displayId: string) => {
      return sendCommand(displayId, {
        type: 'skip',
      })
    },
    [sendCommand]
  )

  const setVolume = useCallback(
    (displayId: string, volume: number) => {
      return sendCommand(displayId, {
        type: 'volume',
        payload: { volume },
      })
    },
    [sendCommand]
  )

  const setBrightness = useCallback(
    (displayId: string, brightness: number) => {
      return sendCommand(displayId, {
        type: 'brightness',
        payload: { brightness },
      })
    },
    [sendCommand]
  )

  const restartDevice = useCallback(
    (displayId: string) => {
      return sendCommand(displayId, {
        type: 'restart',
      })
    },
    [sendCommand]
  )

  const playSchedule = useCallback(
    (displayId: string, scheduleId: string) => {
      return sendCommand(displayId, {
        type: 'play',
        payload: { scheduleId },
      })
    },
    [sendCommand]
  )

  // Get online displays count
  const onlineCount = Object.values(displays).filter(
    (d) => d.status === 'online' || d.status === 'playing'
  ).length

  // Get playing displays count
  const playingCount = Object.values(displays).filter(
    (d) => d.status === 'playing'
  ).length

  return {
    displays,
    loading,
    error,
    onlineCount,
    playingCount,
    playContent,
    pauseContent,
    stopContent,
    skipContent,
    setVolume,
    setBrightness,
    restartDevice,
    playSchedule,
    sendCommand,
  }
}
