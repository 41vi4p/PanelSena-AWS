import { NextRequest, NextResponse } from 'next/server'
import { getUserAnalytics, createAnalytics } from '@/lib/database'

// GET /api/analytics - Get analytics for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const analytics = await getUserAnalytics(userId, startDate, endDate)
    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/analytics - Create new analytics entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...analyticsData } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const analytics = await createAnalytics(userId, analyticsData)
    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error creating analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}