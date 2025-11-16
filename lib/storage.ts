import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

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

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || ''

// Upload file to AWS S3 with progress tracking
export const uploadFile = (
  file: File,
  userId: string,
  folder: 'images' | 'videos' | 'documents',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create unique filename
      const timestamp = Date.now()
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const fileName = `${timestamp}_${sanitizedFileName}`
      const storagePath = `users/${userId}/${folder}/${fileName}`

      // Convert File to Uint8Array for S3 upload
      const fileBuffer = await file.arrayBuffer()
      const fileUint8Array = new Uint8Array(fileBuffer)

      // Create upload parameters
      const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: storagePath,
        Body: fileUint8Array,
        ContentType: file.type,
        ACL: 'public-read' as const, // Make files publicly accessible
      }

      // Use the Upload class for progress tracking
      const upload = new Upload({
        client: s3Client,
        params: uploadParams,
      })

      // Track progress
      upload.on('httpUploadProgress', (progress) => {
        if (progress.loaded && progress.total && onProgress) {
          onProgress({
            progress: (progress.loaded / progress.total) * 100,
            bytesTransferred: progress.loaded,
            totalBytes: progress.total,
          })
        }
      })

      // Perform upload
      await upload.done()

      // Generate public URL
      const region = process.env.AWS_REGION || 'us-east-1'
      const url = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${storagePath}`

      resolve({
        url,
        storageRef: storagePath,
        fullPath: storagePath,
      })
    } catch (error) {
      console.error('Upload error:', error)
      reject(error)
    }
  })
}

// Delete file from AWS S3
export const deleteFile = async (storageRef: string): Promise<void> => {
  try {
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: storageRef,
    }

    await s3Client.send(new DeleteObjectCommand(deleteParams))
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
