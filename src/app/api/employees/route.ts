import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const employees = await db.employee.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(employees)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const employee = await db.employee.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        dateOfJoining: body.dateOfJoining,
        dateOfBirth: body.dateOfBirth,
        gender: body.gender,
        department: body.department,
        designation: body.designation || null,
        email: body.email || null,
        phone: body.phone || null,
        emailPersonal: body.emailPersonal || null
      }
    })
    return NextResponse.json(employee)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 })
  }
}