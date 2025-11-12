"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, CheckCircle } from "lucide-react"

interface ContentUploadProps {
  onUpload: (file: File, category: string, type: 'image' | 'video' | 'document') => Promise<void>
}

export function ContentUpload({ onUpload }: ContentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState("")
  const [category, setCategory] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const categories = ["Marketing", "Promotions", "Information", "Events", "Announcements", "Menus"]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setFileName(file.name)
    }
  }

  const getFileType = (file: File): 'image' | 'video' | 'document' => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    return 'document'
  }

  const handleUpload = async () => {
    if (!selectedFile || !category) {
      alert("Please select a file and category")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const fileType = getFileType(selectedFile)
      await onUpload(selectedFile, category, fileType)
      
      // Reset form
      setFileName("")
      setCategory("")
      setSelectedFile(null)
      setUploadProgress(100)
      
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Upload New Content</CardTitle>
          <CardDescription>Add images, videos, or documents to your content library</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">Drag and drop your files here</p>
            <p className="text-xs text-muted-foreground mb-4">or click to browse</p>
            <Input
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
              accept="image/*,video/*,.pdf"
            />
            <Label htmlFor="file-input" className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>Browse Files</span>
              </Button>
            </Label>
          </div>

          {fileName && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium text-foreground">{fileName}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                    <p className="text-sm font-medium text-foreground">{Math.round(uploadProgress)}%</p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleUpload} disabled={isUploading} className="flex-1">
                  {isUploading ? "Uploading..." : "Upload File"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFileName("")
                    setCategory("")
                  }}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
