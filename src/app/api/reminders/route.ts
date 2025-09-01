import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const reminders = await db.birthdayReminder.findMany({
      include: { employee: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(reminders)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 })
  }
}