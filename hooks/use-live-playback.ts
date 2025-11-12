import { useState, useEffect, useCallback } from 'react'
import { LivePlaybackStatus, PlaybackCommand } from '@/lib/types'
import {
  listenToAllDisplaysStatus,
  sendPlaybackCommand,
  cleanupOldCommands,
} from '@/lib/realtime-db'

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

    // Listen to all displays status
    const unsubscribe = listenToAllDisplaysStatus(userId, (displaysData) => {
      setDisplays(displaysData)
      setLoading(false)
    })

    // Cleanup old commands periodically
    const cleanupInterval = setInterval(() => {
      Object.keys(displays).forEach(async (displayId) => {
        try {
          await cleanupOldCommands(userId, displayId)
        } catch (err) {
          console.error('Error cleaning up commands:', err)
        }
      })
    }, 5 * 60 * 1000) // Every 5 minutes

    return () => {
      unsubscribe()
      clearInterval(cleanupInterval)
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
        const commandId = await sendPlaybackCommand(userId, displayId, {
          displayId,
          ...command,
        })
        return commandId
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
