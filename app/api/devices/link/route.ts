import { NextRequest, NextResponse } from 'next/server'
import { linkDeviceToUser } from '@/lib/dynamodb-realtime'

// POST /api/devices/link - Link a device to a user's display
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceId, deviceKey, userId, displayId } = body

    // Validate required fields
    if (!deviceId || !deviceKey || !userId || !displayId) {
      return NextResponse.json(
        { error: 'Missing required fields: deviceId, deviceKey, userId, displayId' },
        { status: 400 }
      )
    }

    // Link the device to the user
    const result = await linkDeviceToUser(deviceId, deviceKey, userId, displayId)

    if (result.success) {
      return NextResponse.json({ success: true, deviceId })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to link device' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error linking device:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
