"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Display } from "@/lib/types"

interface DisplayDetailsModalProps {
  display: Display
  isOpen: boolean
  onClose: () => void
  onSave: (display: Display) => void
  onDelete: (id: string) => void
}

export function DisplayDetailsModal({ display, isOpen, onClose, onSave, onDelete }: DisplayDetailsModalProps) {
  const [formData, setFormData] = useState(display)

  const handleSave = () => {
    onSave(formData)
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this display?")) {
      onDelete(display.id)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Display Settings</DialogTitle>
          <DialogDescription>Manage display configuration and properties</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="group">Group</Label>
              <Input
                id="group"
                value={formData.group}
                onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                className="bg-input border-border"
              />
            </div>
          </TabsContent>

          <TabsContent value="display" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="resolution">Resolution</Label>
              <Select
                value={formData.resolution}
                onValueChange={(value) => setFormData({ ...formData, resolution: value })}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1920x1080">1920x1080 (Full HD)</SelectItem>
                  <SelectItem value="2560x1440">2560x1440 (2K)</SelectItem>
                  <SelectItem value="3840x2160">3840x2160 (4K)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orientation">Orientation</Label>
              <Select
                value={formData.orientation}
                onValueChange={(value: any) => setFormData({ ...formData, orientation: value })}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landscape">Landscape</SelectItem>
                  <SelectItem value="portrait">Portrait</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Brightness</Label>
                <span className="text-sm font-medium text-foreground">{formData.brightness}%</span>
              </div>
              <Slider
                value={[formData.brightness]}
                onValueChange={(value) => setFormData({ ...formData, brightness: value[0] })}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground capitalize">{formData.status}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Uptime</Label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground">{formData.uptime}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Last Update</Label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground">{formData.lastUpdate}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <Button variant="destructive" onClick={handleDelete}>
            Delete Display
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
