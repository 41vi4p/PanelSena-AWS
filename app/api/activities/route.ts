import { NextRequest, NextResponse } from 'next/server'
import { createActivity, getUserActivities, getUserByFirebaseId } from '@/lib/database'

// GET /api/activities - Get activities for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const firebaseId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!firebaseId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get the user by Firebase ID
    const user = await getUserByFirebaseId(firebaseId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const activities = await getUserActivities(user.id, limit)
    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/activities - Create new activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId: firebaseId, ...activityData } = body

    if (!firebaseId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get the user by Firebase ID
    const user = await getUserByFirebaseId(firebaseId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const activity = await createActivity(user.id, activityData)
    return NextResponse.json(activity)
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}