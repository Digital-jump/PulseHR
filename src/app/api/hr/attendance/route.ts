import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const attendance = await db.attendance.findMany({
      include: { employee: true },
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(attendance)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employeeId, date, checkIn, checkOut, status, notes } = body

    // Calculate total hours if both check-in and check-out are provided
    let totalHours = null
    if (checkIn && checkOut) {
      const checkInTime = new Date(`${date}T${checkIn}`)
      const checkOutTime = new Date(`${date}T${checkOut}`)
      const diffMs = checkOutTime.getTime() - checkInTime.getTime()
      totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2))
    }

    // Check if attendance already exists for this employee and date
    const existingAttendance = await db.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date
        }
      }
    })

    if (existingAttendance) {
      return NextResponse.json({ error: 'Attendance already recorded for this employee and date' }, { status: 400 })
    }

    const attendance = await db.attendance.create({
      data: {
        employeeId,
        date,
        checkIn,
        checkOut,
        totalHours,
        status,
        notes
      }
    })

    return NextResponse.json(attendance)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create attendance' }, { status: 500 })
  }
}