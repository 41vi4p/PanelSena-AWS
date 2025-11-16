import { NextRequest, NextResponse } from 'next/server'
import { getUserById } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get('uid')

    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const user = await getUserById(uid)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Convert to UserProfile format
    const userProfile = {
      uid: user.id,
      email: user.email,
      displayName: user.name,
      companyName: user.name, // Using name as company name for now
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }

    return NextResponse.json(userProfile)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}