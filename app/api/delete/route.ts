import { NextRequest, NextResponse } from 'next/server'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || ''

export async function DELETE(request: NextRequest) {
  try {
    const { storageRef } = await request.json()

    if (!storageRef) {
      return NextResponse.json({ error: 'Missing storageRef' }, { status: 400 })
    }

    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: storageRef,
    }

    await s3Client.send(new DeleteObjectCommand(deleteParams))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}