import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const employees = [
  {
    firstName: 'Mit',
    lastName: 'Soni',
    dateOfJoining: '2021-01-02',
    dateOfBirth: '2000-09-03',
    gender: 'Male',
    department: 'IT',
    designation: 'Sr. Developer',
    email: 'mit.soni@vovance.com',
    phone: '8849024310',
    emailPersonal: 'sonimit233@gmail.com'
  },
  {
    firstName: 'Nisarg',
    lastName: 'Patel',
    dateOfJoining: '2022-11-08',
    dateOfBirth: '2000-11-20',
    gender: 'Male',
    department: 'IT',
    designation: 'React Developer',
    email: 'nisarg.patel@vovance.com',
    phone: '9574108565',
    emailPersonal: 'patelnisharg201.np@gmail.com'
  },
  {
    firstName: 'Sanu',
    lastName: 'Kumar',
    dateOfJoining: '2022-08-01',
    dateOfBirth: '2000-05-27',
    gender: 'Male',
    department: 'IT',
    designation: '',
    email: 'sanu.kumar@vovance.com',
    phone: '8877728521',
    emailPersonal: 'Sanu1294@gmail.com'
  },
  {
    firstName: 'Om',
    lastName: 'Rajani',
    dateOfJoining: '2023-02-20',
    dateOfBirth: '2000-07-08',
    gender: 'Male',
    department: 'IT',
    designation: 'AI ML Developer',
    email: 'om.rajani@vovance.com',
    phone: '9820604497',
    emailPersonal: 'om.parasrajani@gmail.com'
  },
  {
    firstName: 'Amit',
    lastName: 'Patel',
    dateOfJoining: '2023-02-17',
    dateOfBirth: '2000-11-02',
    gender: 'Male',
    department: 'IT',
    designation: 'Project Manager',
    email: 'amit.patel@vovance.com',
    phone: '7567717143',
    emailPersonal: ''
  },
  {
    firstName: 'Nishant',
    lastName: 'Bhatt',
    dateOfJoining: '2023-10-01',
    dateOfBirth: '2000-06-14',
    gender: 'Male',
    department: 'IT',
    designation: 'Sr. Magento Developer',
    email: 'nishant.bhatt@vovance.com',
    phone: '9558740526',
    emailPersonal: 'nishantbhatt014@gmail.com'
  },
  {
    firstName: 'Krina',
    lastName: 'Khotiya',
    dateOfJoining: '2024-09-10',
    dateOfBirth: '2000-10-16',
    gender: 'Female',
    department: 'IT',
    designation: 'Laravel Developer',
    email: 'Krina.khotiya@vovance.com',
    phone: '9726251872',
    emailPersonal: 'kothiyakrina934@gmail.com'
  },
  {
    firstName: 'Krupal',
    lastName: 'Devani',
    dateOfJoining: '2024-10-01',
    dateOfBirth: '2000-08-13',
    gender: 'Male',
    department: 'IT',
    designation: 'React Developer',
    email: 'krupaldevani123@gmail.com',
    phone: '9737411814',
    emailPersonal: 'krupaldevani123@gmail.com'
  },
  {
    firstName: 'Charvin',
    lastName: 'Khanpara',
    dateOfJoining: '2025-02-17',
    dateOfBirth: '2000-04-18',
    gender: 'Male',
    department: 'IT',
    designation: 'AI ML',
    email: 'charvin.khanpara@vovance.com',
    phone: '9726113424',
    emailPersonal: 'charvinkhanpara123@gmail.com'
  },
  {
    firstName: 'Nihar',
    lastName: 'Borad',
    dateOfJoining: '2025-05-08',
    dateOfBirth: '2000-05-15',
    gender: 'Male',
    department: 'IT',
    designation: '',
    email: 'niharborad217@gmail.com',
    phone: '7990431772',
    emailPersonal: 'niharborad217@gmail.com'
  },
  {
    firstName: 'Herika',
    lastName: 'Thakkar',
    dateOfJoining: '2025-06-05',
    dateOfBirth: '2000-10-02',
    gender: 'Female',
    department: 'IT',
    designation: 'Digital Marketing',
    email: 'herika@vovance.com',
    phone: '9054581787',
    emailPersonal: 'thakkarherika@gmail.com'
  },
  {
    firstName: 'Krutika',
    lastName: 'Gorasiya',
    dateOfJoining: '2025-04-21',
    dateOfBirth: '2000-12-03',
    gender: 'Female',
    department: 'IT',
    designation: '',
    email: 'gorasiyakrutika085@gmail.com',
    phone: '9510023484',
    emailPersonal: 'Gorasiyakrutika085@gmail.com'
  },
  {
    firstName: 'Jay',
    lastName: 'Vagadia',
    dateOfJoining: '',
    dateOfBirth: '',
    gender: 'Male',
    department: 'IT',
    designation: '',
    email: 'javy.pvt.0226@gmail.com',
    phone: '',
    emailPersonal: 'javy.pvt.0226@gmail.com'
  }
]

async function main() {
  console.log('Seeding employees...')
  
  for (const employee of employees) {
    await prisma.employee.create({
      data: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        dateOfJoining: employee.dateOfJoining || '1970-01-01',
        dateOfBirth: employee.dateOfBirth || '1970-01-01',
        gender: employee.gender,
        department: employee.department,
        designation: employee.designation || null,
        email: employee.email || null,
        phone: employee.phone || null,
        emailPersonal: employee.emailPersonal || null
      }
    })
  }
  
  console.log('Employees seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })