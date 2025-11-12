import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot,
} from 'firebase/storage'
import { storage } from './firebase'

export interface UploadProgress {
  progress: number
  bytesTransferred: number
  totalBytes: number
}

export interface UploadResult {
  url: string
  storageRef: string
  fullPath: string
}

// Upload file to Firebase Storage with progress tracking
export const uploadFile = (
  file: File,
  userId: string,
  folder: 'images' | 'videos' | 'documents',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    // Create unique filename
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${sanitizedFileName}`
    const storagePath = `users/${userId}/${folder}/${fileName}`

    // Create storage reference
    const storageRef = ref(storage, storagePath)

    // Upload file
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        // Calculate progress
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100

        if (onProgress) {
          onProgress({
            progress,
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
          })
        }
      },
      (error) => {
        console.error('Upload error:', error)
        reject(error)
      },
      async () => {
        try {
          // Get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

          resolve({
            url: downloadURL,
            storageRef: storagePath,
            fullPath: uploadTask.snapshot.ref.fullPath,
          })
        } catch (error) {
          reject(error)
        }
      }
    )
  })
}

// Delete file from Firebase Storage
export const deleteFile = async (storageRef: string): Promise<void> => {
  try {
    const fileRef = ref(storage, storageRef)
    await deleteObject(fileRef)
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}

// Get file type category
export const getFileCategory = (mimeType: string): 'images' | 'videos' | 'documents' => {
  if (mimeType.startsWith('image/')) {
    return 'images'
  } else if (mimeType.startsWith('video/')) {
    return 'videos'
  } else {
    return 'documents'
  }
}

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// Validate file
export const validateFile = (
  file: File,
  maxSizeMB: number = 100
): { valid: boolean; error?: string } => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    }
  }

  const allowedTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Videos
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
  ]

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not supported',
    }
  }

  return { valid: true }
}
