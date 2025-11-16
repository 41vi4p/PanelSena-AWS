import { NextRequest, NextResponse } from 'next/server'
import { getUserDisplays, createDisplay, getUserByFirebaseId } from '@/lib/database'

// GET /api/displays - Get all displays for a user
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

    const displays = await getUserDisplays(user.id)
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
    const { userId: firebaseId, ...displayData } = body

    if (!firebaseId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get the user by Firebase ID
    const user = await getUserByFirebaseId(firebaseId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const display = await createDisplay(user.id, displayData)
    return NextResponse.json(display)
  } catch (error) {
    console.error('Error creating display:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}