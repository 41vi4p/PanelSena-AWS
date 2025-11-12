"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useLivePlayback } from "@/hooks/use-live-playback"
import { useDisplays } from "@/hooks/use-displays"
import { useSchedules } from "@/hooks/use-schedules"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  Play,
  StopCircle,
  SkipForward,
  Volume2,
  Sun,
  RotateCcw,
  Monitor,
  Activity,
  Calendar,
  AlertCircle,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export default function LiveControlPage() {
  const { user } = useAuth()
  const {
    displays: liveDisplays,
    loading: liveLoading,
    onlineCount,
    playingCount,
    playContent,
    stopContent,
    skipContent,
    setVolume,
    setBrightness,
    restartDevice,
    playSchedule,
  } = useLivePlayback(user?.uid)
  const { displays } = useDisplays(user?.uid)
  const { schedules } = useSchedules(user?.uid)

  const [selectedSchedules, setSelectedSchedules] = useState<Record<string, string>>({})
  const [volumes, setVolumes] = useState<Record<string, number>>({})
  const [brightnessLevels, setBrightnessLevels] = useState<Record<string, number>>({})

  // Initialize volumes and brightness from live data
  useEffect(() => {
    const newVolumes: Record<string, number> = {}
    const newBrightness: Record<string, number> = {}
    Object.entries(liveDisplays).forEach(([displayId, status]) => {
      newVolumes[displayId] = status.volume || 80
      newBrightness[displayId] = status.brightness || 100
    })
    setVolumes(newVolumes)
    setBrightnessLevels(newBrightness)
  }, [liveDisplays])

  const handlePlaySchedule = async (displayId: string) => {
    const scheduleId = selectedSchedules[displayId]
    if (!scheduleId) {
      toast.error("Please select a schedule first")
      return
    }

    try {
      await playSchedule(displayId, scheduleId)
      toast.success("Play command sent to display")
    } catch (error) {
      toast.error("Failed to send play command")
    }
  }

  const handleStop = async (displayId: string) => {
    try {
      await stopContent(displayId)
      toast.success("Stop command sent to display")
    } catch (error) {
      toast.error("Failed to send stop command")
    }
  }

  const handleSkip = async (displayId: string) => {
    try {
      await skipContent(displayId)
      toast.success("Skip command sent to display")
    } catch (error) {
      toast.error("Failed to send skip command")
    }
  }

  const handleVolumeChange = async (displayId: string, value: number[]) => {
    const newVolume = value[0]
    setVolumes((prev) => ({ ...prev, [displayId]: newVolume }))

    try {
      await setVolume(displayId, newVolume)
    } catch (error) {
      toast.error("Failed to set volume")
    }
  }

  const handleBrightnessChange = async (displayId: string, value: number[]) => {
    const newBrightness = value[0]
    setBrightnessLevels((prev) => ({ ...prev, [displayId]: newBrightness }))

    try {
      await setBrightness(displayId, newBrightness)
      toast.success("Brightness command sent")
    } catch (error) {
      toast.error("Failed to set brightness")
    }
  }

  const handleRestart = async (displayId: string) => {
    try {
      await restartDevice(displayId)
      toast.success("Restart command sent to display")
    } catch (error) {
      toast.error("Failed to send restart command")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      online: "outline",
      playing: "default",
      paused: "secondary",
      offline: "destructive",
      error: "destructive",
    }

    const colors: Record<string, string> = {
      online: "bg-green-500/10 text-green-500 border-green-500/20",
      playing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      paused: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      offline: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      error: "bg-red-500/10 text-red-500 border-red-500/20",
    }

    return (
      <Badge variant={variants[status] || "outline"} className={colors[status]}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  if (liveLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading live data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Live Playback Control</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Monitor and control displays in real-time
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Displays</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(liveDisplays).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Online</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{onlineCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Playing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{playingCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Display Controls */}
        <div className="space-y-4">
          {displays.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Monitor className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No displays configured yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add displays from the Displays page to start controlling them
                </p>
              </CardContent>
            </Card>
          ) : (
            displays.map((display) => {
              const liveStatus = liveDisplays[display.id]
              const isOnline = liveStatus?.status === "online" || liveStatus?.status === "playing"
              const currentVolume = volumes[display.id] || liveStatus?.volume || 80

              return (
                <Card key={display.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Monitor className="w-5 h-5" />
                          {display.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {display.location} • {display.resolution}
                        </CardDescription>
                      </div>
                      {liveStatus && getStatusBadge(liveStatus.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Current Content */}
                    {liveStatus?.currentContent && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Currently Playing:</p>
                        <p className="text-sm text-muted-foreground">
                          {liveStatus.currentContent.name} ({liveStatus.currentContent.type})
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Started at: {formatTime(liveStatus.currentContent.startedAt)}
                        </p>
                      </div>
                    )}

                    {/* Active Schedule */}
                    {liveStatus?.schedule && (
                      <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <p className="text-sm font-medium mb-1 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Active Schedule:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {liveStatus.schedule.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Content {liveStatus.schedule.currentIndex + 1} of{" "}
                          {liveStatus.schedule.contentQueue?.length || 0}
                        </p>
                      </div>
                    )}

                    {/* Error Message */}
                    {liveStatus?.errorMessage && (
                      <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <p className="text-sm font-medium mb-1 flex items-center gap-2 text-red-500">
                          <AlertCircle className="w-4 h-4" />
                          Error:
                        </p>
                        <p className="text-sm text-red-500">{liveStatus.errorMessage}</p>
                      </div>
                    )}

                    {/* Schedule Selector */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Schedule</label>
                      <Select
                        value={selectedSchedules[display.id] || ""}
                        onValueChange={(value) =>
                          setSelectedSchedules((prev) => ({ ...prev, [display.id]: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a schedule to play" />
                        </SelectTrigger>
                        <SelectContent>
                          {schedules
                            .filter((s) => s.status === "active" || s.status === "paused")
                            .map((schedule) => (
                              <SelectItem key={schedule.id} value={schedule.id}>
                                {schedule.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Playback Controls */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => handlePlaySchedule(display.id)}
                        disabled={!isOnline || !selectedSchedules[display.id]}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Play Schedule
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStop(display.id)}
                        disabled={!isOnline}
                      >
                        <StopCircle className="w-4 h-4 mr-2" />
                        Stop
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSkip(display.id)}
                        disabled={!isOnline || liveStatus?.status !== "playing"}
                      >
                        <SkipForward className="w-4 h-4 mr-2" />
                        Skip
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestart(display.id)}
                        disabled={!isOnline}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Restart
                      </Button>
                    </div>

                    {/* Volume Control */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Volume2 className="w-4 h-4" />
                          Volume
                        </label>
                        <span className="text-sm text-muted-foreground">{currentVolume}%</span>
                      </div>
                      <Slider
                        value={[currentVolume]}
                        onValueChange={(value) => handleVolumeChange(display.id, value)}
                        max={100}
                        step={1}
                        disabled={!isOnline}
                      />
                    </div>

                    {/* Last Heartbeat */}
                    {liveStatus && (
                      <p className="text-xs text-muted-foreground">
                        Last heartbeat: {formatTime(liveStatus.lastHeartbeat)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
