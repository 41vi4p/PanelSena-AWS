import { NextRequest, NextResponse } from 'next/server'
import { getAllDisplayStatuses } from '@/lib/dynamodb-realtime'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const displays = await getAllDisplayStatuses(userId)
    return NextResponse.json({ displays })
  } catch (error: any) {
    console.error('Error fetching display statuses:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch display statuses' },
      { status: 500 }
    )
  }
}
