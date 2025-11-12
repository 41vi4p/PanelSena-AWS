"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, Key, Monitor } from "lucide-react"
import { linkDeviceToUser } from "@/lib/realtime-db"

interface DeviceLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  displayId: string
  displayName: string
  onSuccess?: (deviceId: string) => void // Pass deviceId to success callback
}

export function DeviceLinkDialog({
  open,
  onOpenChange,
  userId,
  displayId,
  displayName,
  onSuccess,
}: DeviceLinkDialogProps) {
  const [deviceId, setDeviceId] = useState("")
  const [deviceKey, setDeviceKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await linkDeviceToUser(deviceId, deviceKey, userId, displayId)

      if (result.success) {
        setSuccess(true)
        
        // Call success handler immediately (before closing dialog)
        if (onSuccess) {
          await onSuccess(deviceId)
        }
        
        // Wait a bit to show success message, then close
        setTimeout(() => {
          // Reset form
          setDeviceId("")
          setDeviceKey("")
          setSuccess(false)
          
          // Don't call onOpenChange(false) - parent handles closing
        }, 1500)
      } else {
        setError(result.error || "Failed to link device")
      }
    } catch (err) {
      setError("An error occurred while linking the device")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Link Raspberry Pi Device
          </DialogTitle>
          <DialogDescription>
            Link a Raspberry Pi device to <strong>{displayName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Device ID Input */}
            <div className="space-y-2">
              <Label htmlFor="device-id" className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Device ID
              </Label>
              <Input
                id="device-id"
                placeholder="DEVICE_001"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                required
                disabled={loading || success}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                The unique ID shown when you start the Raspberry Pi player
              </p>
            </div>

            {/* Device Key Input */}
            <div className="space-y-2">
              <Label htmlFor="device-key" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Device Key
              </Label>
              <Input
                id="device-key"
                type="password"
                placeholder="Enter device secret key"
                value={deviceKey}
                onChange={(e) => setDeviceKey(e.target.value)}
                required
                disabled={loading || success}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                The secret key generated for this device
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert className="bg-green-500/10 border-green-500/20 text-green-500">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Device linked successfully! Your Raspberry Pi should connect shortly.
                </AlertDescription>
              </Alert>
            )}

            {/* Instructions */}
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-medium">Where to find these values:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Run the player on your Raspberry Pi</li>
                <li>The Device ID and Key will be displayed in the console</li>
                <li>Copy both values and paste them here</li>
                <li>Click "Link Device" to connect</li>
              </ol>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading || success}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || success || !deviceId || !deviceKey}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {success && <CheckCircle className="mr-2 h-4 w-4" />}
              {loading ? "Linking..." : success ? "Linked!" : "Link Device"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
