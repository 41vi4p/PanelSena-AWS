"use client"

import { useState } from "react"
import { ContentLibrary } from "@/components/content-library"
import { ContentUpload } from "@/components/content-upload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageIcon, VideoIcon, FileTextIcon } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useContent } from "@/hooks/use-content"
import { useDisplays } from "@/hooks/use-displays"
import { ContentItem } from "@/lib/types"
import { sendPlaybackCommand } from "@/lib/realtime-db"

export default function ContentPage() {
  const { user } = useAuth()
  const { content, loading, uploadContent, editContent, removeContent, uploadProgress } = useContent(user?.uid)
  const { displays } = useDisplays(user?.uid)
  const [activeTab, setActiveTab] = useState("library")

  const handleUpload = async (file: File, category: string, type: 'image' | 'video' | 'document') => {
    try {
      await uploadContent(file, category, type)
      setActiveTab("library")
    } catch (error) {
      console.error("Upload failed:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await removeContent(id)
    } catch (error) {
      console.error("Delete failed:", error)
    }
  }

  const handlePlayNow = async (contentId: string, displayId: string) => {
    if (!user) return
    
    try {
      const contentItem = content.find(c => c.id === contentId)
      if (!contentItem) return

      await sendPlaybackCommand(user.uid, displayId, {
        type: 'play',
        displayId,
        payload: {
          contentId: contentItem.id,
        }
      })
      
      alert(`Playing "${contentItem.name}" on display`)
    } catch (error) {
      console.error("Play now failed:", error)
      alert('Failed to send play command')
    }
  }

  const imageCount = content.filter((item) => item.type === "image").length
  const videoCount = content.filter((item) => item.type === "video").length
  const documentCount = content.filter((item) => item.type === "document").length

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading content...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Content Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Upload and organize content for your displays</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <ImageIcon className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Images</p>
                <p className="text-2xl font-bold text-foreground">{imageCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <VideoIcon className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Videos</p>
                <p className="text-2xl font-bold text-foreground">{videoCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <FileTextIcon className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Documents</p>
                <p className="text-2xl font-bold text-foreground">{documentCount}</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Content Library</TabsTrigger>
            <TabsTrigger value="upload">Upload Content</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="mt-6">
            <ContentLibrary 
              items={content} 
              onDelete={handleDelete}
              displays={displays}
              onPlayNow={handlePlayNow}
            />
          </TabsContent>

          <TabsContent value="upload" className="mt-6">
            <ContentUpload onUpload={handleUpload} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
