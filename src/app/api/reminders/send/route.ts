import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const employees = await db.employee.findMany({
      where: {
        dateOfBirth: {
          gte: today.toISOString().split('T')[0],
          lte: nextWeek.toISOString().split('T')[0]
        }
      }
    })

    let remindersCreated = 0
    for (const employee of employees) {
      const existingReminder = await db.birthdayReminder.findFirst({
        where: {
          employeeId: employee.id,
          reminderDate: today.toISOString().split('T')[0]
        }
      })

      if (!existingReminder) {
        await db.birthdayReminder.create({
          data: {
            employeeId: employee.id,
            reminderDate: today.toISOString().split('T')[0],
            sent: false
          }
        })
        remindersCreated++
      }
    }

    const unsentReminders = await db.birthdayReminder.findMany({
      where: { sent: false },
      include: { employee: true }
    })

    // Send actual email reminder to sanu.kumar@vovance.com
    let emailSent = false
    let emailError = null
    
    if (unsentReminders.length > 0) {
      try {
        const zai = await ZAI.create()
        
        // Create reminder email content
        const reminderContent = unsentReminders.map(reminder => {
          const employee = reminder.employee
          const birthDate = new Date(employee.dateOfBirth)
          const today = new Date()
          const currentYear = today.getFullYear()
          const nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate())
          
          if (nextBirthday < today) {
            nextBirthday.setFullYear(currentYear + 1)
          }
          
          const diffTime = nextBirthday.getTime() - today.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          return `
            <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea;">
              <h3 style="margin: 0 0 10px 0; color: #333;">${employee.firstName} ${employee.lastName}</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Department:</strong> ${employee.department}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Designation:</strong> ${employee.designation || 'N/A'}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Birthday:</strong> ${employee.dateOfBirth}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Days until birthday:</strong> ${diffDays} days</p>
              <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${employee.email || 'N/A'}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Personal Email:</strong> ${employee.emailPersonal || 'N/A'}</p>
            </div>
          `
        }).join('')

        await zai.functions.invoke("send_email", {
          to: "sanu.kumar@vovance.com",
          subject: `🎂 Birthday Reminders - ${unsentReminders.length} Upcoming Birthdays This Week`,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <h1 style="margin: 0; font-size: 2.5em;">🎂 Birthday Reminders</h1>
                <p style="margin: 10px 0; font-size: 1.3em;">Upcoming Birthdays This Week</p>
                <p style="margin: 10px 0; font-size: 1.1em; opacity: 0.9;">Sent on: ${new Date().toLocaleDateString()}</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
                <h2 style="color: #333; margin-top: 0; text-align: center;">Summary</h2>
                <div style="text-align: center; margin: 20px 0;">
                  <div style="display: inline-block; background: #667eea; color: white; padding: 15px 25px; border-radius: 50px; font-size: 1.2em;">
                    ${unsentReminders.length} Birthday${unsentReminders.length > 1 ? 's' : ''} This Week
                  </div>
                </div>
                
                <h3 style="color: #333; margin: 30px 0 15px 0;">Upcoming Birthdays:</h3>
                ${reminderContent}
              </div>
              
              <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <p style="margin: 0; color: #8b4513; font-size: 1.1em;">
                  🎉 Don't forget to send birthday wishes to make their day special! 🎁
                </p>
              </div>
              
              <div style="text-align: center; color: #666; font-size: 0.9em;">
                <p>Best regards,<br>Birthday Reminder System</p>
                <p style="margin-top: 20px; font-size: 0.8em; color: #999;">
                  This is an automated reminder. Please log in to the system to send birthday wishes.
                </p>
              </div>
            </div>
          `,
          is_html: true
        })
        
        emailSent = true
      } catch (emailError) {
        console.error('Reminder email sending failed:', emailError)
        emailError = emailError.message
      }
    }

    // Mark reminders as sent
    for (const reminder of unsentReminders) {
      await db.birthdayReminder.update({
        where: { id: reminder.id },
        data: { sent: emailSent, sentAt: emailSent ? new Date() : null }
      })
    }

    return NextResponse.json({ 
      message: emailSent 
        ? `Reminders sent to sanu.kumar@vovance.com for ${unsentReminders.length} employees`
        : `Reminders created but email failed to send. Error: ${emailError}`,
      remindersCreated,
      remindersSent: unsentReminders.length,
      emailSent
    })
  } catch (error) {
    console.error('Reminder sending error:', error)
    return NextResponse.json({ error: 'Failed to send reminders', details: error.message }, { status: 500 })
  }
}