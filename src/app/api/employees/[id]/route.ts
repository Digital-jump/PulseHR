import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const employee = await db.employee.update({
      where: { id: params.id },
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
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.employee.delete({
      where: { id: params.id }
    })
    return NextResponse.json({ message: 'Employee deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 })
  }
}