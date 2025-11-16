import { NextRequest, NextResponse } from 'next/server'
import { createActivity } from '@/lib/database'

// POST /api/activities - Create new activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...activityData } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const activity = await createActivity(userId, activityData)
    return NextResponse.json(activity)
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}