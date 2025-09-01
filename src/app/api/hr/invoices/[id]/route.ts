import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status, paidAmount } = body

    const invoice = await db.invoice.findUnique({
      where: { id: params.id }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const updatedInvoice = await db.invoice.update({
      where: { id: params.id },
      data: {
        status,
        paidAmount: paidAmount || invoice.paidAmount,
        balance: invoice.totalAmount - (paidAmount || invoice.paidAmount || 0)
      }
    })

    return NextResponse.json(updatedInvoice)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.invoice.delete({
      where: { id: params.id }
    })
    return NextResponse.json({ message: 'Invoice deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}