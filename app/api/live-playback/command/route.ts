import { NextRequest, NextResponse } from 'next/server'
import { sendPlaybackCommand } from '@/lib/dynamodb-realtime'
import { PlaybackCommand } from '@/lib/types'
import { getUserByFirebaseId, getUserContent, getUserSchedules } from '@/lib/database'

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

    // Get the user by Firebase ID to get the database user ID
    const user = await getUserByFirebaseId(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If this is a play command with contentId or scheduleId, enrich the payload
    if (command.type === 'play') {
      if (command.payload?.contentId) {
        // Fetch content details and add to payload
        const content = await getUserContent(user.id)
        const contentItem = content.find(c => c.id === command.payload.contentId)
        
        if (contentItem) {
          command.payload.contentData = {
            id: contentItem.id,
            name: contentItem.name,
            type: contentItem.type,
            url: contentItem.url,
            storageRef: contentItem.storageRef,
          }
        }
      }
      
      if (command.payload?.scheduleId) {
        // Fetch schedule details and add to payload
        const schedules = await getUserSchedules(user.id)
        const schedule = schedules.find(s => s.id === command.payload.scheduleId)
        
        if (schedule) {
          // Also fetch all content items in the schedule
          const content = await getUserContent(user.id)
          const scheduleContent = schedule.contentIds
            .map((contentId: string) => content.find(c => c.id === contentId))
            .filter(Boolean)
            .map((c: any) => ({
              id: c!.id,
              name: c!.name,
              type: c!.type,
              url: c!.url,
              storageRef: c!.storageRef,
            }))
          
          command.payload.scheduleData = {
            id: schedule.id,
            name: schedule.name,
            contentIds: schedule.contentIds,
            content: scheduleContent,
          }
        }
      }
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
