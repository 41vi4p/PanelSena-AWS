import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || ''

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    const folder = formData.get('folder') as string
    const category = formData.get('category') as string

    if (!file || !userId || !folder) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

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
    }

    // Use the Upload class for progress tracking (though we won't track progress in API)
    const upload = new Upload({
      client: s3Client,
      params: uploadParams,
    })

    // Perform upload
    await upload.done()

    // Generate signed URL (valid for 7 days)
    const getObjectCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: storagePath,
    })
    const url = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 604800 }) // 7 days

    return NextResponse.json({
      url,
      storageRef: storagePath,
      fullPath: storagePath,
      fileName: file.name,
      size: file.size,
      type: file.type,
      category,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}