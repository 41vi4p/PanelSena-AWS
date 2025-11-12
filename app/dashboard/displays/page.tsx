"use client"

import { useState, useRef } from "react"
import { DisplayList } from "@/components/display-list"
import { DisplayDetailsModal } from "@/components/display-details-modal"
import { DeviceLinkDialog } from "@/components/device-link-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Filter, Link as LinkIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { useDisplays } from "@/hooks/use-displays"
import { useActivities } from "@/hooks/use-activities"
import { Display } from "@/lib/types"

export default function DisplaysPage() {
  const { user } = useAuth()
  const { displays, loading, addDisplay, editDisplay, removeDisplay } = useDisplays(user?.uid)
  const { logActivity } = useActivities(user?.uid)
  
  const [selectedDisplay, setSelectedDisplay] = useState<Display | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [displayToLink, setDisplayToLink] = useState<{ id: string; name: string } | null>(null)
  const [filterStatus, setFilterStatus] = useState<string[]>(["online", "offline", "paused", "playing"])

  const [pendingDisplayId, setPendingDisplayId] = useState<string | null>(null)
  const linkSuccessRef = useRef(false)

  const handleEditDisplay = (display: Display) => {
    setSelectedDisplay(display)
    setIsModalOpen(true)
  }

  const handleSaveDisplay = async (updatedDisplay: Display) => {
    try {
      if (selectedDisplay?.id) {
        await editDisplay(selectedDisplay.id, updatedDisplay)
        await logActivity(
          'display',
          'Display Updated',
          `Updated display "${updatedDisplay.name}"`,
          { displayName: updatedDisplay.name, displayId: selectedDisplay.id }
        )
      } else {
        const newDisplay = await addDisplay(updatedDisplay)
        await logActivity(
          'display',
          'Display Created',
          `Created new display "${updatedDisplay.name}"`,
          { displayName: updatedDisplay.name, displayId: newDisplay.id }
        )
      }
      setIsModalOpen(false)
      setSelectedDisplay(null)
    } catch (error) {
      console.error("Error saving display:", error)
      await logActivity(
        'system',
        'Display Error',
        `Failed to save display: ${error}`,
        { error: String(error) }
      )
    }
  }

  const handleDeleteDisplay = async (id: string) => {
    try {
      const display = displays.find(d => d.id === id)
      await removeDisplay(id)
      await logActivity(
        'display',
        'Display Deleted',
        `Deleted display "${display?.name || id}"`,
        { displayName: display?.name, displayId: id }
      )
      setIsModalOpen(false)
      setSelectedDisplay(null)
    } catch (error) {
      console.error("Error deleting display:", error)
      await logActivity(
        'system',
        'Display Error',
        `Failed to delete display: ${error}`,
        { error: String(error) }
      )
    }
  }

  const handleAddDisplay = async () => {
    if (!user) {
      console.error('User not authenticated')
      alert('Please sign in to add a display')
      return
    }

    console.log('Creating pending display for user:', user.uid)
    
    // Create a pending display with temporary name
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

      console.log('Calling addDisplay with:', newDisplay)
      const display = await addDisplay(newDisplay)
      console.log('Pending display created:', display)
      
      setPendingDisplayId(display.id)
      linkSuccessRef.current = false // Reset success flag
      setDisplayToLink({ id: display.id, name: display.name })
      setIsLinkDialogOpen(true)
    } catch (error) {
      console.error("Error adding display:", error)
      alert('Failed to create display. Check console for details.')
    }
  }

  const handleDeviceLinkSuccess = async (deviceId: string) => {
    if (!user || !pendingDisplayId) {
      console.error('[handleDeviceLinkSuccess] Missing user or pendingDisplayId')
      return
    }

    try {
      // Mark link as successful FIRST - this prevents deletion
      linkSuccessRef.current = true
      
      const displayIdToUpdate = pendingDisplayId
      
      // Clear pending ID IMMEDIATELY to prevent any deletion attempts
      setPendingDisplayId(null)
      
      // Update display name and status after successful linking
      await editDisplay(displayIdToUpdate, { 
        name: "New Display",
        status: "online",
        lastUpdate: new Date().toISOString()
      })
      
      await logActivity(
        'display',
        'Device Linked Successfully',
        `Linked device ${deviceId} to display`,
        { deviceId, displayId: displayIdToUpdate }
      )
      
      // Close dialog after successful update
      setIsLinkDialogOpen(false)
      setDisplayToLink(null)
    } catch (error) {
      console.error("Error updating display after link:", error)
      await logActivity(
        'system',
        'Device Link Error',
        `Failed to link device: ${error}`,
        { error: String(error), deviceId }
      )
    }
  }

  const handleLinkDialogClose = async () => {
    // Delete pending display since user cancelled
    if (pendingDisplayId) {
      try {
        await removeDisplay(pendingDisplayId)
      } catch (error) {
        console.error("Error removing pending display:", error)
      }
    }
    
    // Reset state
    setPendingDisplayId(null)
    setIsLinkDialogOpen(false)
    setDisplayToLink(null)
    linkSuccessRef.current = false
  }

  const handleLinkDevice = (display: Display) => {
    setDisplayToLink({ id: display.id, name: display.name })
    setIsLinkDialogOpen(true)
  }

  const toggleFilter = (status: string) => {
    setFilterStatus((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  const filteredDisplays = displays.filter((d) => filterStatus.includes(d.status))

  // Debug logging
  console.log('[DisplaysPage] All displays:', displays.length)
  console.log('[DisplaysPage] Filter status:', filterStatus)
  console.log('[DisplaysPage] Filtered displays:', filteredDisplays.length)
  displays.forEach(d => {
    console.log(`[DisplaysPage] Display ${d.name} (${d.id}): status=${d.status}, filtered=${filterStatus.includes(d.status)}`)
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading displays...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Display Management</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage and configure all your displays</p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent hover:bg-muted">
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={filterStatus.includes("online")}
                  onCheckedChange={() => toggleFilter("online")}
                >
                  Online
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterStatus.includes("offline")}
                  onCheckedChange={() => toggleFilter("offline")}
                >
                  Offline
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterStatus.includes("paused")}
                  onCheckedChange={() => toggleFilter("paused")}
                >
                  Paused
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterStatus.includes("playing")}
                  onCheckedChange={() => toggleFilter("playing")}
                >
                  Playing
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              onClick={handleAddDisplay} 
              className="gap-2 border-2 border-primary hover:border-accent hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Display</span>
            </Button>
          </div>
        </div>

        {displays.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <LinkIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Displays Yet</h3>
            <p className="text-muted-foreground mb-6">Add your first display to get started</p>
            <Button onClick={handleAddDisplay}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Display
            </Button>
          </div>
        ) : (
          <DisplayList 
            displays={filteredDisplays} 
            onEdit={handleEditDisplay} 
            onDelete={(id) => handleDeleteDisplay(id.toString())}
            onLinkDevice={handleLinkDevice}
          />
        )}

        {selectedDisplay && (
          <DisplayDetailsModal
            display={selectedDisplay}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              setSelectedDisplay(null)
            }}
            onSave={handleSaveDisplay}
            onDelete={(id) => handleDeleteDisplay(id.toString())}
          />
        )}

        {displayToLink && user && (
          <DeviceLinkDialog
            open={isLinkDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                // This is a manual close (cancel) - delete the pending display
                handleLinkDialogClose()
              }
            }}
            userId={user.uid}
            displayId={displayToLink.id}
            displayName={displayToLink.name}
            onSuccess={handleDeviceLinkSuccess}
          />
        )}
      </main>
    </div>
  )
}
