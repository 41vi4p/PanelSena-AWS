import { NextRequest, NextResponse } from 'next/server'
import { getUserByFirebaseId, createUser } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get('uid')
    const email = searchParams.get('email')
    const name = searchParams.get('name')

    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    let user = await getUserByFirebaseId(uid)

    // If user doesn't exist, create them
    if (!user) {
      if (!email) {
        return NextResponse.json({ error: 'Email is required to create user' }, { status: 400 })
      }

      try {
        user = await createUser({
          firebaseId: uid,
          email: email,
          name: name || email.split('@')[0],
        })
      } catch (createError: any) {
        // If user already exists (unique constraint violation), try to get them
        if (createError.code === 'P2002') {
          user = await getUserByFirebaseId(uid)
          if (!user) {
            return NextResponse.json({ error: 'Failed to create or retrieve user' }, { status: 500 })
          }
        } else {
          console.error('Error creating user:', createError)
          return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
        }
      }
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