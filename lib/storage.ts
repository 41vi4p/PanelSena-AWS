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

// Upload file to AWS S3 with progress tracking
export const uploadFile = (
  file: File,
  userId: string,
  folder: 'images' | 'videos' | 'documents',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  return new Promise(async (resolve, reject) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', userId)
      formData.append('folder', folder)

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress({
            progress: (event.loaded / event.total) * 100,
            bytesTransferred: event.loaded,
            totalBytes: event.total,
          })
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve({
              url: response.url,
              storageRef: response.storageRef,
              fullPath: response.fullPath,
            })
          } catch (error) {
            reject(new Error('Invalid response format'))
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText)
            reject(new Error(errorResponse.error || 'Upload failed'))
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        }
      }

      xhr.onerror = () => {
        reject(new Error('Network error occurred'))
      }

      xhr.open('POST', '/api/upload')
      xhr.send(formData)
    } catch (error) {
      console.error('Upload error:', error)
      reject(error)
    }
  })
}

// Delete file from AWS S3
export const deleteFile = async (storageRef: string): Promise<void> => {
  try {
    const response = await fetch('/api/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ storageRef }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Delete failed')
    }
  } catch (error) {
    console.error('Delete error:', error)
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
