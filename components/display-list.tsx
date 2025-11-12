"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Monitor, Power, Settings, Trash2, Link as LinkIcon } from "lucide-react"
import { Display } from "@/lib/types"

interface DisplayListProps {
  displays: Display[]
  onEdit: (display: Display) => void
  onDelete: (id: string) => void
  onLinkDevice?: (display: Display) => void
}

export function DisplayList({ displays, onEdit, onDelete, onLinkDevice }: DisplayListProps) {
  const groupedDisplays = displays.reduce(
    (acc, display) => {
      const group = display.group || "Uncategorized"
      if (!acc[group]) {
        acc[group] = []
      }
      acc[group].push(display)
      return acc
    },
    {} as Record<string, Display[]>,
  )

  return (
    <div className="space-y-6">
      {Object.entries(groupedDisplays).map(([group, groupDisplays]) => (
        <div key={group} className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">{group}</h2>
          <div className="grid grid-cols-1 gap-3">
            {groupDisplays.map((display) => (
              <Card key={display.id} className="border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="p-3 bg-muted rounded-lg flex-shrink-0">
                        <Monitor className="w-5 h-5 text-muted-foreground" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">{display.name}</h3>
                          <Badge
                            variant={display.status === "online" || display.status === "playing" ? "default" : "secondary"}
                            className={
                              display.status === "online"
                                ? "bg-green-500/20 text-green-700 dark:text-green-400"
                                : display.status === "playing"
                                ? "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                                : display.status === "paused"
                                ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                                : "bg-red-500/20 text-red-700 dark:text-red-400"
                            }
                          >
                            {display.status === "online" ? "Online" : display.status === "playing" ? "Playing" : display.status === "paused" ? "Paused" : "Offline"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{display.location}</p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{display.resolution}</span>
                          <span>Brightness: {display.brightness}%</span>
                          <span>Uptime: {display.uptime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onLinkDevice && display.status === "offline" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => onLinkDevice(display)}
                          title="Link Raspberry Pi Device"
                        >
                          <LinkIcon className="w-4 h-4" />
                          <span className="hidden md:inline">Link Device</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        title={display.status === "online" ? "Turn off" : "Turn on"}
                        onClick={() => console.log(`Toggle power for ${display.name}`)}
                      >
                        <Power className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onEdit(display)}>
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:text-destructive"
                        onClick={() => onDelete(display.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
