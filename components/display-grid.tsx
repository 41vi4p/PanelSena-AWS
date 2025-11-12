"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Monitor, MoreVertical, Settings, Trash2, Link as LinkIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDisplays } from "@/hooks/use-displays"
import { useAuth } from "@/hooks/use-auth"
import { Display } from "@/lib/types"
import { DeviceLinkDialog } from "@/components/device-link-dialog"
import { DisplayDetailsModal } from "@/components/display-details-modal"
import { useRouter } from "next/navigation"

export function DisplayGrid() {
  const router = useRouter()
  const { user } = useAuth()
  const { displays, loading, addDisplay, editDisplay, removeDisplay } = useDisplays(user?.uid)
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [displayToLink, setDisplayToLink] = useState<{ id: string; name: string } | null>(null)
  const [selectedDisplay, setSelectedDisplay] = useState<Display | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [pendingDisplayId, setPendingDisplayId] = useState<string | null>(null)

  const handleAddDisplay = async () => {
    if (!user) {
      alert('Please sign in to add a display')
      return
    }

    try {
      // Create a pending display that will be deleted if device link fails
      const newDisplay: Partial<Display> = {
        name: "Pending Link...",
        location: "Not Set",
        status: "offline",
        resolution: "1920x1080",
        uptime: "0%",
        brightness: 50,
        orientation: "landscape",
        lastUpdate: new Date().toISOString(),
        group: "Uncategorized",
      }

      const display = await addDisplay(newDisplay)
      setPendingDisplayId(display.id)
      setDisplayToLink({ id: display.id, name: 'New Display' })
      setIsLinkDialogOpen(true)
    } catch (error) {
      console.error("Error creating pending display:", error)
      alert('Failed to create display.')
    }
  }

  const handleDeviceLinkSuccess = async (deviceId: string) => {
    if (!user || !pendingDisplayId) return

    try {
      // Update the display name after successful linking
      await editDisplay(pendingDisplayId, {
        name: "New Display",
      })
      
      setPendingDisplayId(null)
      setIsLinkDialogOpen(false)
      setDisplayToLink(null)
    } catch (error) {
      console.error("Error updating display after device link:", error)
    }
  }

  const handleLinkDialogClose = async () => {
    // If user closes dialog without linking, delete the pending display
    if (pendingDisplayId) {
      try {
        await removeDisplay(pendingDisplayId)
        setPendingDisplayId(null)
      } catch (error) {
        console.error("Error removing pending display:", error)
      }
    }
    setIsLinkDialogOpen(false)
    setDisplayToLink(null)
  }

  const handleEditDisplay = (display: Display) => {
    setSelectedDisplay(display)
    setIsModalOpen(true)
  }

  const handleSaveDisplay = async (updatedDisplay: Display) => {
    try {
      if (selectedDisplay) {
        await editDisplay(selectedDisplay.id, updatedDisplay)
      }
      setIsModalOpen(false)
      setSelectedDisplay(null)
    } catch (error) {
      console.error("Error saving display:", error)
    }
  }

  const handleDeleteDisplay = async (id: string) => {
    if (!confirm("Are you sure you want to delete this display?")) return
    
    try {
      await removeDisplay(id)
      setIsModalOpen(false)
      setSelectedDisplay(null)
    } catch (error) {
      console.error("Error deleting display:", error)
    }
  }

  const handleLinkDevice = (display: Display) => {
    setDisplayToLink({ id: display.id, name: display.name })
    setIsLinkDialogOpen(true)
  }

  const handleViewAllDisplays = () => {
    router.push('/dashboard/displays')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Displays</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddDisplay}
            className="border-2 border-primary hover:bg-cyan-500 hover:border-cyan-500 hover:text-white transition-all duration-200 hover:shadow-md hover:shadow-cyan-500/50"
          >
            Add Display
          </Button>
          {displays.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleViewAllDisplays}>
              View All
            </Button>
          )}
        </div>
      </div>

      {displays.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No displays yet. Add your first display to get started.</p>
          <Button 
            onClick={handleAddDisplay}
            className="border-2 border-primary bg-primary hover:bg-cyan-500 hover:border-cyan-500 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105"
          >
            Add Your First Display
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displays.slice(0, 4).map((display) => (
            <Card key={display.id} className="border-border hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-muted rounded-lg mt-1">
                      <Monitor className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base">{display.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{display.location}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {display.status === "offline" && (
                        <DropdownMenuItem onClick={() => handleLinkDevice(display)}>
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Link Device
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleEditDisplay(display)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteDisplay(display.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={display.status === "online" || display.status === "playing" ? "default" : "secondary"}
                    className={
                      display.status === "online"
                        ? "bg-green-500/20 text-green-700 dark:text-green-400"
                        : display.status === "playing"
                        ? "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                        : display.status === "paused"
                        ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                        : ""
                    }
                  >
                    {display.status === "online" ? "Online" : display.status === "playing" ? "Playing" : display.status === "paused" ? "Paused" : "Offline"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Uptime: {display.uptime}</span>
                </div>
                <p className="text-xs text-muted-foreground">{display.resolution}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Device Link Dialog */}
      {displayToLink && (
        <DeviceLinkDialog
          open={isLinkDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              handleLinkDialogClose()
            }
          }}
          userId={user?.uid || ''}
          displayId={displayToLink.id}
          displayName={displayToLink.name}
          onSuccess={handleDeviceLinkSuccess}
        />
      )}

      {/* Display Details Modal */}
      {selectedDisplay && (
        <DisplayDetailsModal
          display={selectedDisplay}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedDisplay(null)
          }}
          onSave={handleSaveDisplay}
          onDelete={handleDeleteDisplay}
        />
      )}
    </div>
  )
}
