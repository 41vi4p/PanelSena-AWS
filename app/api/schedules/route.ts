import { NextRequest, NextResponse } from 'next/server'
import { getUserSchedules, createSchedule } from '@/lib/database'

// GET /api/schedules - Get all schedules for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const schedules = await getUserSchedules(userId)
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
    const { userId, ...scheduleData } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const schedule = await createSchedule(userId, scheduleData)
    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}