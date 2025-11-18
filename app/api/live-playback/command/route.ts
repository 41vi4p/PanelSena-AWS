import { NextRequest, NextResponse } from 'next/server'
import { sendPlaybackCommand } from '@/lib/dynamodb-realtime'
import { PlaybackCommand } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, displayId, command } = body

    if (!userId || !displayId || !command) {
      return NextResponse.json(
        { error: 'userId, displayId, and command are required' },
        { status: 400 }
      )
    }

    await sendPlaybackCommand(userId, displayId, command as PlaybackCommand)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error sending playback command:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send playback command' },
      { status: 500 }
    )
  }
}
