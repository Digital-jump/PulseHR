import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleWishes = [
  {
    firstName: 'Mit',
    lastName: 'Soni',
    message: 'Happy Birthday Mit! 🎉 Wishing you a fantastic day filled with joy and celebration! May this special day bring you lots of happiness and success in all your endeavors.',
    emailType: 'work',
    sent: true,
    sentAt: new Date('2024-09-03T10:30:00')
  },
  {
    firstName: 'Nisarg',
    lastName: 'Patel',
    message: 'Happy Birthday Nisarg! 🎂 Hope your day is as amazing as you are! Wishing you a year full of growth, learning, and exciting opportunities in your React development journey.',
    emailType: 'both',
    sent: true,
    sentAt: new Date('2024-11-20T09:15:00')
  },
  {
    firstName: 'Sanu',
    lastName: 'Kumar',
    message: 'Happy Birthday Sanu! 🎈 May your special day be filled with laughter, joy, and all the things you love most. Here\'s to another year of amazing adventures and accomplishments!',
    emailType: 'personal',
    sent: true,
    sentAt: new Date('2024-05-27T11:45:00')
  },
  {
    firstName: 'Om',
    lastName: 'Rajani',
    message: 'Happy Birthday Om! 🤖 Wishing you a day that\'s as brilliant and innovative as your AI/ML work! May this year bring you exciting breakthroughs and continued success in your tech journey.',
    emailType: 'work',
    sent: true,
    sentAt: new Date('2024-07-08T14:20:00')
  }
]

async function main() {
  console.log('Seeding sample birthday wishes...')
  
  for (const wishData of sampleWishes) {
    const employee = await prisma.employee.findFirst({
      where: {
        firstName: wishData.firstName,
        lastName: wishData.lastName
      }
    })
    
    if (employee) {
      await prisma.birthdayWish.create({
        data: {
          employeeId: employee.id,
          message: wishData.message,
          emailType: wishData.emailType,
          sent: wishData.sent,
          sentAt: wishData.sentAt
        }
      })
      console.log(`Created wish for ${employee.firstName} ${employee.lastName}`)
    } else {
      console.log(`Employee not found: ${wishData.firstName} ${wishData.lastName}`)
    }
  }
  
  console.log('Sample birthday wishes seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })