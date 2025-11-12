import { useState, useEffect } from 'react'
import { ContentItem } from '@/lib/types'
import {
  createContent,
  updateContent,
  deleteContent,
  subscribeToContent,
  createActivity,
} from '@/lib/firestore'
import { uploadFile, deleteFile, UploadProgress } from '@/lib/storage'

export function useContent(userId: string | undefined) {
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({})

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)

    // Subscribe to realtime updates
    const unsubscribe = subscribeToContent(userId, (updatedContent) => {
      setContent(updatedContent)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userId])

  const uploadContent = async (
    file: File,
    category: string,
    type: 'image' | 'video' | 'document'
  ) => {
    if (!userId) throw new Error('User not authenticated')

    try {
      const fileId = `${Date.now()}_${file.name}`

      // Upload file to storage with progress tracking
      const folder = type === 'image' ? 'images' : type === 'video' ? 'videos' : 'documents'

      const uploadResult = await uploadFile(file, userId, folder, (progress) => {
        setUploadProgress((prev) => ({
          ...prev,
          [fileId]: progress,
        }))
      })

      // Create content metadata in Firestore
      const contentData: Partial<ContentItem> = {
        name: file.name,
        type,
        size: formatFileSize(file.size),
        sizeBytes: file.size,
        uploadDate: new Date().toISOString(),
        category,
        url: uploadResult.url,
        storageRef: uploadResult.storageRef,
      }

      const newContent = await createContent(userId, contentData)

      // Log upload activity
      await createActivity(userId, {
        type: 'content',
        action: 'Content Uploaded',
        description: `Uploaded ${type} "${file.name}"`,
        metadata: { contentName: file.name, contentType: type, category }
      })

      // Clear upload progress
      setUploadProgress((prev) => {
        const newProgress = { ...prev }
        delete newProgress[fileId]
        return newProgress
      })

      return newContent
    } catch (err) {
      console.error('Error uploading content:', err)
      setError('Failed to upload content')
      
      // Log error
      await createActivity(userId, {
        type: 'system',
        action: 'Content Upload Error',
        description: `Failed to upload ${type}: ${err}`,
        metadata: { error: String(err), fileName: file.name }
      }).catch(console.error)
      
      throw err
    }
  }

  const removeContent = async (contentId: string) => {
    if (!userId) throw new Error('User not authenticated')
    
    try {
      // Find the content item to get storage ref
      const contentItem = content.find(c => c.id === contentId)
      if (!contentItem) throw new Error('Content not found')
      
      // Delete file from storage
      await deleteFile(contentItem.storageRef)

      // Delete metadata from Firestore
      await deleteContent(contentItem.id)
      
      // Log deletion activity
      await createActivity(userId, {
        type: 'content',
        action: 'Content Deleted',
        description: `Deleted ${contentItem.type} "${contentItem.name}"`,
        metadata: { contentName: contentItem.name, contentType: contentItem.type }
      })
    } catch (err) {
      console.error('Error deleting content:', err)
      setError('Failed to delete content')
      
      // Log error
      await createActivity(userId, {
        type: 'system',
        action: 'Content Delete Error',
        description: `Failed to delete content: ${err}`,
        metadata: { error: String(err), contentId }
      }).catch(console.error)
      
      throw err
    }
  }

  const editContent = async (id: string, data: Partial<ContentItem>) => {
    try {
      await updateContent(id, data)
    } catch (err) {
      console.error('Error updating content:', err)
      setError('Failed to update content')
      throw err
    }
  }

  return {
    content,
    loading,
    error,
    uploadProgress,
    uploadContent,
    removeContent,
    editContent,
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
