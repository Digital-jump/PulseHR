import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const invoices = await db.invoice.findMany({
      include: { employee: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(invoices)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employeeId, invoiceNumber, invoiceDate, dueDate, amount, currency, status, description, taxRate, items, subtotal, taxAmount, totalAmount, balance, paidAmount } = body

    // Check if invoice number already exists
    const existingInvoice = await db.invoice.findUnique({
      where: { invoiceNumber }
    })

    if (existingInvoice) {
      return NextResponse.json({ error: 'Invoice number already exists' }, { status: 400 })
    }

    const invoice = await db.invoice.create({
      data: {
        employeeId,
        invoiceNumber,
        invoiceDate,
        dueDate,
        amount,
        currency,
        status,
        description,
        taxRate,
        items,
        taxAmount,
        totalAmount,
        balance,
        paidAmount
      }
    })

    return NextResponse.json(invoice)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}