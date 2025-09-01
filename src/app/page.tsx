'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, Mail, Phone, User, Plus, Edit, Trash2, Gift, Bell, Building, Briefcase, Cake, Star, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface Employee {
  id: string
  firstName: string
  lastName: string
  dateOfJoining: string
  dateOfBirth: string
  gender: string
  department: string
  designation?: string
  email?: string
  phone?: string
  emailPersonal?: string
}

interface BirthdayReminder {
  id: string
  employeeId: string
  reminderDate: string
  sent: boolean
  sentAt?: string
}

interface BirthdayWish {
  id: string
  employeeId: string
  message: string
  emailType: string
  sent: boolean
  sentAt?: string
}

export default function BirthdayReminderApp() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [reminders, setReminders] = useState<BirthdayReminder[]>([])
  const [wishes, setWishes] = useState<BirthdayWish[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isWishDialogOpen, setIsWishDialogOpen] = useState(false)
  const [isWishHistoryDialogOpen, setIsWishHistoryDialogOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [customMessage, setCustomMessage] = useState('')
  const [emailType, setEmailType] = useState<'work' | 'personal' | 'both'>('work')
  const [isEditingMessage, setIsEditingMessage] = useState(false)
  const [tempMessage, setTempMessage] = useState('')

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfJoining: '',
    dateOfBirth: '',
    gender: '',
    department: '',
    designation: '',
    email: '',
    phone: '',
    emailPersonal: ''
  })

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated')
    if (auth !== 'true') {
      router.push('/login')
    } else {
      setIsAuthenticated(true)
      fetchEmployees()
      fetchReminders()
      fetchWishes()
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    router.push('/login')
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (error) {
      toast.error('Failed to fetch employees')
    }
  }

  const fetchReminders = async () => {
    try {
      const response = await fetch('/api/reminders')
      if (response.ok) {
        const data = await response.json()
        setReminders(data)
      }
    } catch (error) {
      toast.error('Failed to fetch reminders')
    }
  }

  const fetchWishes = async () => {
    try {
      const response = await fetch('/api/wishes')
      if (response.ok) {
        const data = await response.json()
        setWishes(data)
      }
    } catch (error) {
      toast.error('Failed to fetch wishes')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingEmployee ? `/api/employees/${editingEmployee.id}` : '/api/employees'
      const method = editingEmployee ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success(editingEmployee ? 'Employee updated successfully' : 'Employee added successfully')
        setIsDialogOpen(false)
        setEditingEmployee(null)
        setFormData({
          firstName: '',
          lastName: '',
          dateOfJoining: '',
          dateOfBirth: '',
          gender: '',
          department: '',
          designation: '',
          email: '',
          phone: '',
          emailPersonal: ''
        })
        fetchEmployees()
      } else {
        toast.error('Failed to save employee')
      }
    } catch (error) {
      toast.error('Failed to save employee')
    }
  }

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      dateOfJoining: employee.dateOfJoining,
      dateOfBirth: employee.dateOfBirth,
      gender: employee.gender,
      department: employee.department,
      designation: employee.designation || '',
      email: employee.email || '',
      phone: employee.phone || '',
      emailPersonal: employee.emailPersonal || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/employees/${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast.success('Employee deleted successfully')
        fetchEmployees()
      } else {
        toast.error('Failed to delete employee')
      }
    } catch (error) {
      toast.error('Failed to delete employee')
    }
  }

  const sendReminders = async () => {
    try {
      const response = await fetch('/api/reminders/send', { method: 'POST' })
      const result = await response.json()
      
      if (response.ok) {
        if (result.emailSent) {
          toast.success(`🎂 Reminders sent successfully to sanu.kumar@vovance.com for ${result.remindersSent} employees!`)
        } else {
          toast.warning(`⚠️ Reminders created but email failed: ${result.message}`)
        }
        fetchReminders()
      } else {
        toast.error(`❌ Failed to send reminders: ${result.error}`)
      }
    } catch (error) {
      toast.error('❌ Failed to send reminders')
    }
  }

  const sendBirthdayWish = async () => {
    if (!selectedEmployee) return

    try {
      const response = await fetch('/api/wishes/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          message: customMessage,
          emailType
        })
      })

      const result = await response.json()

      if (response.ok) {
        if (result.emailSent) {
          toast.success(`🎉 Birthday wish sent successfully to ${result.emailsSent.join(', ')}!`)
        } else {
          toast.warning(`⚠️ Wish saved but email failed: ${result.message}`)
        }
        setIsWishDialogOpen(false)
        setSelectedEmployee(null)
        setCustomMessage('')
        setEmailType('work')
        fetchWishes()
      } else {
        toast.error(`❌ Failed to send birthday wish: ${result.error}`)
      }
    } catch (error) {
      toast.error('❌ Failed to send birthday wish')
    }
  }

  const openWishDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    setCustomMessage(`Happy Birthday ${employee.firstName} ${employee.lastName}! 🎉 Wishing you a fantastic day filled with joy and celebration!`)
    setIsWishDialogOpen(true)
  }

  const openProfileDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsProfileDialogOpen(true)
  }

  const startEditingMessage = () => {
    setTempMessage(customMessage)
    setIsEditingMessage(true)
  }

  const saveEditedMessage = () => {
    setCustomMessage(tempMessage)
    setIsEditingMessage(false)
  }

  const cancelEditingMessage = () => {
    setTempMessage(customMessage)
    setIsEditingMessage(false)
  }

  const getBirthdayStatus = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    const currentYear = today.getFullYear()
    const nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate())
    
    if (nextBirthday < today) {
      nextBirthday.setFullYear(currentYear + 1)
    }
    
    const diffTime = nextBirthday.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return { status: 'today', days: 0 }
    if (diffDays === 1) return { status: 'tomorrow', days: 1 }
    if (diffDays <= 7) return { status: 'upcoming', days: diffDays }
    return { status: 'future', days: diffDays }
  }

  const getUpcomingBirthdays = () => {
    return employees
      .map(employee => ({
        ...employee,
        birthdayStatus: getBirthdayStatus(employee.dateOfBirth)
      }))
      .filter(employee => employee.birthdayStatus.days <= 30)
      .sort((a, b) => a.birthdayStatus.days - b.birthdayStatus.days)
  }

  const upcomingBirthdays = getUpcomingBirthdays()

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Enhanced Header with Statistics */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Main Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
            >
              <Gift className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Birthday Reminder System
              </h1>
              <p className="text-muted-foreground">Manage employee birthdays and send wishes</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsWishHistoryDialogOpen(true)} variant="outline" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              View Wishes
            </Button>
            <Button onClick={sendReminders} className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Send Reminders
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingEmployee(null)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Employee
                </Button>
              </DialogTrigger>
            </Dialog>
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Employees</p>
                <p className="text-3xl font-bold">{employees.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Upcoming Birthdays</p>
                <p className="text-3xl font-bold">{upcomingBirthdays.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
                <Cake className="w-6 h-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Wishes Sent</p>
                <p className="text-3xl font-bold">{wishes.filter(w => w.sent).length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center">
                <Gift className="w-6 h-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Reminders Sent</p>
                <p className="text-3xl font-bold">{reminders.filter(r => r.sent).length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Advanced Features Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Birthday Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                Birthday Calendar
              </CardTitle>
              <CardDescription>Monthly view of upcoming birthdays</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date()
                  date.setDate(1)
                  date.setDate(i - date.getDay() + 1)
                  
                  const hasBirthday = employees.some(emp => {
                    const empDate = new Date(emp.dateOfBirth)
                    return empDate.getMonth() === date.getMonth() && empDate.getDate() === date.getDate()
                  })
                  
                  const isToday = date.toDateString() === new Date().toDateString()
                  const isCurrentMonth = date.getMonth() === new Date().getMonth()
                  
                  return (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.1 }}
                      className={`h-12 p-1 rounded-lg text-center text-sm flex flex-col items-center justify-center
                        ${isToday ? 'bg-purple-100 border-2 border-purple-500' : ''}
                        ${hasBirthday ? 'bg-gradient-to-br from-pink-50 to-purple-50 border border-purple-200' : ''}
                        ${!isCurrentMonth ? 'text-muted-foreground' : ''}
                      `}
                    >
                      <span className={`text-xs ${isToday ? 'font-bold text-purple-600' : ''}`}>
                        {date.getDate()}
                      </span>
                      {hasBirthday && (
                        <span className="text-xs">🎂</span>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-500" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {/* Recent Wishes */}
                {wishes.slice(0, 3).map((wish) => (
                  <motion.div
                    key={wish.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <Gift className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Wish sent to {wish.employee.firstName} {wish.employee.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {wish.sentAt ? new Date(wish.sentAt).toLocaleDateString() : 'Pending'}
                      </p>
                    </div>
                    <Badge variant={wish.sent ? 'default' : 'secondary'} className="text-xs">
                      {wish.sent ? 'Sent' : 'Pending'}
                    </Badge>
                  </motion.div>
                ))}
                
                {/* Recent Reminders */}
                {reminders.slice(0, 2).map((reminder) => (
                  <motion.div
                    key={reminder.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Bell className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Reminder for {reminder.employee.firstName} {reminder.employee.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {reminder.sentAt ? new Date(reminder.sentAt).toLocaleDateString() : 'Pending'}
                      </p>
                    </div>
                    <Badge variant={reminder.sent ? 'default' : 'secondary'} className="text-xs">
                      {reminder.sent ? 'Sent' : 'Pending'}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Department Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-500" />
              Department Analytics
            </CardTitle>
            <CardDescription>Employee distribution by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(
                employees.reduce((acc, emp) => {
                  acc[emp.department] = (acc[emp.department] || 0) + 1
                  return acc
                }, {} as Record<string, number>)
              ).map(([department, count]) => (
                <motion.div
                  key={department}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border"
                >
                  <h3 className="font-medium text-gray-800">{department}</h3>
                  <p className="text-2xl font-bold text-gray-600">{count}</p>
                  <p className="text-sm text-gray-500">employees</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
            <DialogDescription>
              {editingEmployee ? 'Update employee information' : 'Add a new employee to the system'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfJoining">Date of Joining</Label>
                    <Input
                      id="dateOfJoining"
                      type="date"
                      value={formData.dateOfJoining}
                      onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Work Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailPersonal">Personal Email</Label>
                    <Input
                      id="emailPersonal"
                      type="email"
                      value={formData.emailPersonal}
                      onChange={(e) => setFormData({ ...formData, emailPersonal: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingEmployee ? 'Update' : 'Add'} Employee
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Birthdays
            </CardTitle>
            <CardDescription>Birthdays in the next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingBirthdays.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <p className="text-muted-foreground">No upcoming birthdays</p>
                </motion.div>
              ) : (
                upcomingBirthdays.map((employee, index) => (
                  <motion.div
                    key={employee.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-lg transition-all hover:scale-105"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                      >
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                      <div>
                        <h3 className="font-medium">{employee.firstName} {employee.lastName}</h3>
                        <p className="text-sm text-muted-foreground">{employee.designation || employee.department}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {employee.email && (
                            <Badge variant="secondary" className="text-xs">
                              <Mail className="h-3 w-3 mr-1" />
                              Work
                            </Badge>
                          )}
                          {employee.emailPersonal && (
                            <Badge variant="outline" className="text-xs">
                              <Mail className="h-3 w-3 mr-1" />
                              Personal
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.div whileHover={{ scale: 1.1 }}>
                        <Badge 
                          variant={employee.birthdayStatus.status === 'today' ? 'destructive' : 
                                  employee.birthdayStatus.status === 'tomorrow' ? 'default' : 'secondary'}
                        >
                          {employee.birthdayStatus.status === 'today' ? 'Today 🎂' :
                           employee.birthdayStatus.status === 'tomorrow' ? 'Tomorrow 🎈' :
                           `In ${employee.birthdayStatus.days} days`}
                        </Badge>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openWishDialog(employee)}
                          className="flex items-center gap-1"
                        >
                          <Gift className="h-3 w-3" />
                          Wish
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openProfileDialog(employee)}
                          className="flex items-center gap-1"
                        >
                          <User className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Employees</CardTitle>
            <CardDescription>Complete employee list with profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {employees.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <p className="text-muted-foreground">No employees found</p>
                </motion.div>
              ) : (
                employees.map((employee, index) => (
                  <motion.div
                    key={employee.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-lg transition-all hover:scale-102"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
                      >
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                      <div>
                        <h3 className="font-medium">{employee.firstName} {employee.lastName}</h3>
                        <p className="text-sm text-muted-foreground">{employee.designation || employee.department}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {employee.email && (
                            <Badge variant="secondary" className="text-xs">
                              <Mail className="h-3 w-3 mr-1" />
                              Work
                            </Badge>
                          )}
                          {employee.emailPersonal && (
                            <Badge variant="outline" className="text-xs">
                              <Mail className="h-3 w-3 mr-1" />
                              Personal
                            </Badge>
                          )}
                          {employee.phone && (
                            <Badge variant="outline" className="text-xs">
                              <Phone className="h-3 w-3 mr-1" />
                              Phone
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openProfileDialog(employee)}
                        >
                          <User className="h-3 w-3" />
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(employee)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(employee.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isWishDialogOpen} onOpenChange={setIsWishDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Birthday Wish</DialogTitle>
            <DialogDescription>
              Send a birthday wish to {selectedEmployee?.firstName} {selectedEmployee?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="message">Birthday Message</Label>
                {!isEditingMessage ? (
                  <Button variant="ghost" size="sm" onClick={startEditingMessage}>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={saveEditedMessage}>
                      <Star className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={cancelEditingMessage}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
              {isEditingMessage ? (
                <Textarea
                  id="message"
                  value={tempMessage}
                  onChange={(e) => setTempMessage(e.target.value)}
                  rows={4}
                  placeholder="Enter your birthday message..."
                  className="border-purple-300 focus:border-purple-500"
                />
              ) : (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-md border border-purple-200">
                  <p className="text-sm whitespace-pre-wrap text-purple-800">{customMessage}</p>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="emailType">Send to</Label>
              <Select value={emailType} onValueChange={(value: 'work' | 'personal' | 'both') => setEmailType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedEmployee?.email && (
                    <SelectItem value="work">Work Email ({selectedEmployee.email})</SelectItem>
                  )}
                  {selectedEmployee?.emailPersonal && (
                    <SelectItem value="personal">Personal Email ({selectedEmployee.emailPersonal})</SelectItem>
                  )}
                  {selectedEmployee?.email && selectedEmployee?.emailPersonal && (
                    <SelectItem value="both">Both Emails</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsWishDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={sendBirthdayWish} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Gift className="h-4 w-4 mr-2" />
                Send Wish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {selectedEmployee?.firstName?.charAt(0)}{selectedEmployee?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              Employee Profile
            </DialogTitle>
            <DialogDescription>
              Complete profile information for {selectedEmployee?.firstName} {selectedEmployee?.lastName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="space-y-6">
              {/* Profile Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
              >
                <Avatar className="w-24 h-24 mx-auto">
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl">
                    {selectedEmployee.firstName.charAt(0)}{selectedEmployee.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h2>
                  <p className="text-muted-foreground">{selectedEmployee.designation || 'Team Member'}</p>
                </div>
              </motion.div>

              {/* Profile Categories */}
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal
                  </TabsTrigger>
                  <TabsTrigger value="work" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Work
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Contact
                  </TabsTrigger>
                  <TabsTrigger value="events" className="flex items-center gap-2">
                    <Cake className="h-4 w-4" />
                    Events
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-red-500" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">First Name</Label>
                          <p className="font-medium">{selectedEmployee.firstName}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Last Name</Label>
                          <p className="font-medium">{selectedEmployee.lastName}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                          <p className="font-medium">{selectedEmployee.gender}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                          <p className="font-medium">{selectedEmployee.dateOfBirth}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="work" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-blue-500" />
                        Work Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                          <p className="font-medium">{selectedEmployee.department}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Designation</Label>
                          <p className="font-medium">{selectedEmployee.designation || 'Not specified'}</p>
                        </div>
                        <div className="col-span-2">
                          <Label className="text-sm font-medium text-muted-foreground">Date of Joining</Label>
                          <p className="font-medium">{selectedEmployee.dateOfJoining || 'Not specified'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-green-500" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        {selectedEmployee.email && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Work Email</Label>
                            <p className="font-medium flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {selectedEmployee.email}
                            </p>
                          </div>
                        )}
                        {selectedEmployee.emailPersonal && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Personal Email</Label>
                            <p className="font-medium flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {selectedEmployee.emailPersonal}
                            </p>
                          </div>
                        )}
                        {selectedEmployee.phone && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                            <p className="font-medium flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {selectedEmployee.phone}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="events" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Cake className="h-5 w-5 text-purple-500" />
                        Important Dates
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Birthday</Label>
                          <p className="font-medium flex items-center gap-2">
                            <Cake className="h-4 w-4" />
                            {selectedEmployee.dateOfBirth}
                          </p>
                        </div>
                        {selectedEmployee.dateOfJoining && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Work Anniversary</Label>
                            <p className="font-medium flex items-center gap-2">
                              <Star className="h-4 w-4" />
                              {selectedEmployee.dateOfJoining}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Quick Actions */}
              <div className="flex justify-center gap-2 pt-4">
                <Button
                  onClick={() => openWishDialog(selectedEmployee)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Send Birthday Wish
                </Button>
                <Button
                  onClick={() => handleEdit(selectedEmployee)}
                  variant="outline"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isWishHistoryDialogOpen} onOpenChange={setIsWishHistoryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Birthday Wishes History</DialogTitle>
            <DialogDescription>
              View all sent birthday wishes and their messages
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {wishes.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No birthday wishes sent yet</p>
            ) : (
              wishes.map((wish) => (
                <motion.div
                  key={wish.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 space-y-3 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          {wish.employee.firstName.charAt(0)}{wish.employee.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{wish.employee.firstName} {wish.employee.lastName}</h3>
                        <p className="text-sm text-muted-foreground">{wish.employee.designation || wish.employee.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={wish.sent ? 'default' : 'secondary'}>
                        {wish.sent ? 'Sent' : 'Pending'}
                      </Badge>
                      <Badge variant="outline">
                        {wish.emailType === 'work' ? 'Work Email' : 
                         wish.emailType === 'personal' ? 'Personal Email' : 'Both Emails'}
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-md border border-purple-200">
                    <p className="text-sm whitespace-pre-wrap text-purple-800">{wish.message}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Sent to: {wish.emailType === 'work' ? wish.employee.email : 
                                  wish.emailType === 'personal' ? wish.employee.emailPersonal : 
                                  `${wish.employee.email} & ${wish.employee.emailPersonal}`}</span>
                    <span>{wish.sentAt ? new Date(wish.sentAt).toLocaleDateString() : 'Not sent'}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}