import { NextRequest, NextResponse } from 'next/server'
import { createActivity, getUserByFirebaseId } from '@/lib/database'

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