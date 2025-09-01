import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employeeId, message, emailType } = body

    const employee = await db.employee.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Determine which email(s) to send to
    const emailsToSend = []
    if (emailType === 'work' && employee.email) {
      emailsToSend.push(employee.email)
    } else if (emailType === 'personal' && employee.emailPersonal) {
      emailsToSend.push(employee.emailPersonal)
    } else if (emailType === 'both') {
      if (employee.email) emailsToSend.push(employee.email)
      if (employee.emailPersonal) emailsToSend.push(employee.emailPersonal)
    }

    if (emailsToSend.length === 0) {
      return NextResponse.json({ error: 'No valid email addresses found' }, { status: 400 })
    }

    // Send emails using ZAI SDK
    let emailSent = false
    let emailError = null
    
    try {
      const zai = await ZAI.create()
      
      // Send email to each recipient
      for (const email of emailsToSend) {
        await zai.functions.invoke("send_email", {
          to: email,
          subject: `Happy Birthday ${employee.firstName} ${employee.lastName}! 🎉`,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <h1 style="margin: 0; font-size: 2.5em;">🎉 Happy Birthday! 🎉</h1>
                <p style="margin: 10px 0; font-size: 1.2em;">${employee.firstName} ${employee.lastName}</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
                <h2 style="color: #333; margin-top: 0;">Special Birthday Wishes</h2>
                <p style="color: #666; line-height: 1.6; font-size: 1.1em;">
                  ${message.replace(/\n/g, '<br>')}
                </p>
              </div>
              
              <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <p style="margin: 0; color: #8b4513; font-size: 1.1em;">
                  🎂 May your special day be filled with happiness, laughter, and all the things you love most! 🎁
                </p>
              </div>
              
              <div style="text-align: center; color: #666; font-size: 0.9em;">
                <p>Best regards,<br>Birthday Reminder Team</p>
                <p style="margin-top: 20px; font-size: 0.8em; color: #999;">
                  This email was sent automatically through the Birthday Reminder System
                </p>
              </div>
            </div>
          `,
          is_html: true
        })
      }
      emailSent = true
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      emailError = emailError.message
    }

    // Store the wish in database
    const wish = await db.birthdayWish.create({
      data: {
        employeeId,
        message,
        emailType,
        sent: emailSent,
        sentAt: emailSent ? new Date() : null
      }
    })

    return NextResponse.json({ 
      message: emailSent 
        ? `Birthday wish sent to ${emailType === 'work' ? employee.email : emailType === 'personal' ? employee.emailPersonal : 'both emails'}`
        : `Wish stored but email failed to send. Error: ${emailError}`,
      wish,
      emailSent,
      emailsSent: emailsToSend
    })
  } catch (error) {
    console.error('Wish sending error:', error)
    return NextResponse.json({ error: 'Failed to send birthday wish', details: error.message }, { status: 500 })
  }
}