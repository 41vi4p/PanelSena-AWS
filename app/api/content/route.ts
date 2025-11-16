import { NextRequest, NextResponse } from 'next/server'
import { getUserContent, createContent, updateContent, deleteContent } from '@/lib/database'
import { ContentItem } from '@/lib/types'

// GET /api/content - Get all content for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const content = await getUserContent(userId)
    return NextResponse.json(content)
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/content - Create new content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...contentData } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const content = await createContent(userId, contentData)
    return NextResponse.json(content)
  } catch (error) {
    console.error('Error creating content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}