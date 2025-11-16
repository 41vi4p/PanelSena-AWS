import { NextRequest, NextResponse } from 'next/server'
import { updateSchedule, deleteSchedule } from '@/lib/database'

// PUT /api/schedules/[id] - Update schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const updateData = body

    const schedule = await updateSchedule(params.id, updateData)
    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Error updating schedule:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/schedules/[id] - Delete schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteSchedule(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}