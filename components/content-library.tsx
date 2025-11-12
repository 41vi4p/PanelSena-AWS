"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ImageIcon, Video, FileText, Trash2, Download, Eye, Play } from "lucide-react"
import { ContentItem } from "@/lib/types"
import { Display } from "@/lib/types"

interface ContentLibraryProps {
  items: ContentItem[]
  onDelete: (id: string) => void
  displays?: Display[]
  onPlayNow?: (contentId: string, displayId: string) => void
}

export function ContentLibrary({ items, onDelete, displays = [], onPlayNow }: ContentLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [previewContent, setPreviewContent] = useState<ContentItem | null>(null)
  const [showPlayDialog, setShowPlayDialog] = useState<ContentItem | null>(null)

  const categories = Array.from(new Set(items.map((item) => item.category)))

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleViewContent = (item: ContentItem) => {
    setPreviewContent(item)
  }

  const handleDownload = (item: ContentItem) => {
    window.open(item.url, '_blank')
  }

  const handlePlayNow = (item: ContentItem) => {
    if (displays.length === 0) {
      alert('No displays available. Please add and link a display first.')
      return
    }
    setShowPlayDialog(item)
  }

  const handleSelectDisplay = (displayId: string) => {
    if (showPlayDialog && onPlayNow) {
      onPlayNow(showPlayDialog.id, displayId)
      setShowPlayDialog(null)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-5 h-5 text-blue-500" />
      case "video":
        return <Video className="w-5 h-5 text-purple-500" />
      case "document":
        return <FileText className="w-5 h-5 text-amber-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Input
          placeholder="Search content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-input border-border"
        />

        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="border-border overflow-hidden hover:border-primary/50 transition-colors">
            {item.thumbnail && (
              <div className="relative group cursor-pointer" onClick={() => handleViewContent(item)}>
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <Eye className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}

            {!item.thumbnail && item.url && (
              <div className="relative group cursor-pointer w-full h-40 bg-muted flex items-center justify-center" onClick={() => handleViewContent(item)}>
                {getTypeIcon(item.type)}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <Eye className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}

            {!item.thumbnail && !item.url && (
              <div className="w-full h-40 bg-muted flex items-center justify-center">{getTypeIcon(item.type)}</div>
            )}

            <CardContent className="p-4 space-y-3">
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate flex-1">{item.name}</h3>
                  <div className="flex-shrink-0">{getTypeIcon(item.type)}</div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {item.category}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Size: {item.size}</p>
                <p>Uploaded: {item.uploadDate}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => handlePlayNow(item)}>
                  <Play className="w-4 h-4 mr-1" />
                  Play Now
                </Button>
                <Button variant="outline" size="sm" className="bg-transparent" onClick={() => handleDownload(item)}>
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive bg-transparent"
                  onClick={() => onDelete(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No content found</p>
        </div>
      )}

      {/* Content Preview Modal */}
      {previewContent && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewContent(null)}>
          <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-foreground">{previewContent.name}</h3>
              <Button variant="ghost" size="icon" onClick={() => setPreviewContent(null)}>
                <span className="text-xl">×</span>
              </Button>
            </div>
            <div className="p-4">
              {previewContent.type === 'image' && (
                <img src={previewContent.url} alt={previewContent.name} className="w-full h-auto" />
              )}
              {previewContent.type === 'video' && (
                <video src={previewContent.url} controls className="w-full h-auto" />
              )}
              {previewContent.type === 'document' && (
                <iframe src={previewContent.url} className="w-full h-[600px] border-0" title={previewContent.name} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Play Now Dialog */}
      {showPlayDialog && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowPlayDialog(null)}>
          <div className="bg-card rounded-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Play on Display</h3>
              <p className="text-sm text-muted-foreground mt-1">Select which display to play "{showPlayDialog.name}"</p>
            </div>
            <div className="p-4 space-y-2 max-h-[400px] overflow-auto">
              {displays.filter(d => d.status === 'online').length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No online displays available</p>
              ) : (
                displays
                  .filter(d => d.status === 'online')
                  .map(display => (
                    <Button
                      key={display.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleSelectDisplay(display.id)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {display.name} - {display.location}
                    </Button>
                  ))
              )}
            </div>
            <div className="p-4 border-t border-border">
              <Button variant="outline" className="w-full" onClick={() => setShowPlayDialog(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
