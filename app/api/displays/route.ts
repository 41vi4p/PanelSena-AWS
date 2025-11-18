import { NextRequest, NextResponse } from 'next/server'
import { getUserDisplays, createDisplay, getUserByFirebaseId } from '@/lib/database'
import { getAllDisplayStatuses } from '@/lib/dynamodb-realtime'

// GET /api/displays - Get all displays for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const firebaseId = searchParams.get('userId')

    if (!firebaseId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get the user by Firebase ID
    const user = await getUserByFirebaseId(firebaseId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get displays from database
    const displays = await getUserDisplays(user.id)

    // Get real-time status from DynamoDB
    try {
      const liveStatuses = await getAllDisplayStatuses(firebaseId)
      
      // Merge real-time status with display data
      const displaysWithStatus = displays.map(display => {
        const liveStatus = liveStatuses[display.id]
        
        if (liveStatus) {
          // Check if heartbeat is recent (within last 30 seconds)
          const now = Date.now()
          const lastHeartbeat = liveStatus.lastHeartbeat || 0
          const isOnline = (now - lastHeartbeat) < 30000 // 30 seconds
          
          return {
            ...display,
            status: isOnline ? liveStatus.status : 'offline',
            lastUpdate: new Date(lastHeartbeat).toISOString(),
            volume: liveStatus.volume ?? display.volume,
            brightness: liveStatus.brightness ?? display.brightness,
            currentContent: liveStatus.currentContent || display.currentContent,
            schedule: liveStatus.schedule || display.schedule,
          }
        }
        
        // No live status, keep original display data
        return display
      })
      
      return NextResponse.json(displaysWithStatus)
    } catch (dynamoError) {
      console.error('Error fetching live status from DynamoDB:', dynamoError)
      // If DynamoDB fails, return displays without live status
      return NextResponse.json(displays)
    }
  } catch (error) {
    console.error('Error fetching displays:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/displays - Create new display
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId: firebaseId, ...displayData } = body

    if (!firebaseId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get the user by Firebase ID
    const user = await getUserByFirebaseId(firebaseId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const display = await createDisplay(user.id, displayData)
    return NextResponse.json(display)
  } catch (error) {
    console.error('Error creating display:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}