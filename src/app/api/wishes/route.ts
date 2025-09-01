import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const wishes = await db.birthdayWish.findMany({
      include: { employee: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(wishes)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch wishes' }, { status: 500 })
  }
}