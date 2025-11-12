"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useActivities } from "@/hooks/use-activities"
import { ProtectedRoute } from "@/components/protected-route"

type LogType = "all" | "info" | "warning" | "error" | "success"

export default function LogsPage() {
  const { user } = useAuth()
  const { activities, loading } = useActivities(user?.uid, 100)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<LogType>("all")

  // Map activity type to log type
  const getLogType = (activityType: string): "info" | "warning" | "error" | "success" => {
    // Check action/description for keywords to determine severity
    const activityText = `${activityType}`.toLowerCase()
    
    if (activityText.includes('error') || activityText.includes('failed') || activityText.includes('delete')) {
      return 'error'
    }
    if (activityText.includes('warning') || activityText.includes('offline')) {
      return 'warning'
    }
    if (activityText.includes('success') || activityText.includes('created') || activityText.includes('uploaded') || activityText.includes('linked')) {
      return 'success'
    }
    return 'info'
  }

  const filteredLogs = activities.filter((activity) => {
    const logType = getLogType(activity.action + activity.description)
    const matchesSearch =
      activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || logType === filterType
    return matchesSearch && matchesFilter
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
      case "error":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
      case "warning":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
      case "info":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `logs_${new Date().toISOString().split('T')[0]}.json`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Activity Logs</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Monitor all system activities and events</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card/50 backdrop-blur-sm border-border/50"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              onClick={() => setFilterType("all")}
              className="bg-card/50 backdrop-blur-sm border-border/50 whitespace-nowrap"
            >
              All
            </Button>
            <Button
              variant={filterType === "success" ? "default" : "outline"}
              onClick={() => setFilterType("success")}
              className="bg-card/50 backdrop-blur-sm border-border/50 whitespace-nowrap"
            >
              Success
            </Button>
            <Button
              variant={filterType === "warning" ? "default" : "outline"}
              onClick={() => setFilterType("warning")}
              className="bg-card/50 backdrop-blur-sm border-border/50 whitespace-nowrap"
            >
              Warning
            </Button>
            <Button
              variant={filterType === "error" ? "default" : "outline"}
              onClick={() => setFilterType("error")}
              className="bg-card/50 backdrop-blur-sm border-border/50 whitespace-nowrap"
            >
              Error
            </Button>
          </div>
          <Button 
            onClick={handleExport}
            className="bg-linear-to-r from-primary to-accent hover:opacity-90 text-primary-foreground whitespace-nowrap"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>

        {/* Logs Table */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Showing {filteredLogs.length} of {activities.length} logs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading logs...</p>
                </div>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((activity) => {
                  const logType = getLogType(activity.action + activity.description)
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border/30 hover:border-border/60 transition-colors bg-background/30 hover:bg-background/50"
                    >
                      <div className="flex items-center gap-2">
                        {getTypeIcon(logType)}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(logType)}`}>
                        {logType.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{activity.action}</h3>
                          {activity.metadata?.displayName && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {activity.metadata.displayName}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="capitalize">{activity.type} Activity</span>
                          <span>{formatTime(new Date(activity.timestamp))}</span>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No logs found matching your criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </ProtectedRoute>
  )
}
