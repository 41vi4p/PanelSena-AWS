import { NextRequest, NextResponse } from 'next/server'
import { updateDisplay, deleteDisplay } from '@/lib/database'

// PUT /api/displays/[id] - Update display
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const updateData = body

    const display = await updateDisplay(params.id, updateData)
    return NextResponse.json(display)
  } catch (error) {
    console.error('Error updating display:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/displays/[id] - Delete display
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteDisplay(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting display:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}