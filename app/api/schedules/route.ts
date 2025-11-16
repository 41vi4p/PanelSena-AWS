import { NextRequest, NextResponse } from 'next/server'
import { getUserSchedules, createSchedule, getUserByFirebaseId } from '@/lib/database'

// GET /api/schedules - Get all schedules for a user
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

    const schedules = await getUserSchedules(user.id)
    return NextResponse.json(schedules)
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/schedules - Create new schedule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId: firebaseId, ...scheduleData } = body

    if (!firebaseId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get the user by Firebase ID
    const user = await getUserByFirebaseId(firebaseId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const schedule = await createSchedule(user.id, scheduleData)
    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}