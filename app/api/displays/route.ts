import { NextRequest, NextResponse } from 'next/server'
import { getUserDisplays, createDisplay } from '@/lib/database'

// GET /api/displays - Get all displays for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const displays = await getUserDisplays(userId)
    return NextResponse.json(displays)
  } catch (error) {
    console.error('Error fetching displays:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/displays - Create new display
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...displayData } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const display = await createDisplay(userId, displayData)
    return NextResponse.json(display)
  } catch (error) {
    console.error('Error creating display:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}