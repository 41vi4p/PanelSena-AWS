import { NextRequest, NextResponse } from 'next/server'
import { getUserAnalytics, createAnalytics, getUserByFirebaseId } from '@/lib/database'

// GET /api/analytics - Get analytics for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const firebaseId = searchParams.get('userId')
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined

    if (!firebaseId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get the user by Firebase ID
    const user = await getUserByFirebaseId(firebaseId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const analytics = await getUserAnalytics(user.id, startDate, endDate)
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
    const { userId: firebaseId, ...analyticsData } = body

    if (!firebaseId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get the user by Firebase ID
    const user = await getUserByFirebaseId(firebaseId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const analytics = await createAnalytics(user.id, analyticsData)
    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error creating analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}