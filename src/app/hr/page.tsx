'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Users, FileText, Clock, DollarSign, TrendingUp, Plus, Edit, Trash2, Eye, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface Employee {
  id: string
  firstName: string
  lastName: string
  department: string
  designation?: string
  email?: string
}

interface Attendance {
  id: string
  employeeId: string
  employee: Employee
  date: string
  checkIn?: string
  checkOut?: string
  totalHours?: number
  status: string
  notes?: string
}

interface Invoice {
  id: string
  employeeId: string
  employee: Employee
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  amount: number
  currency: string
  status: string
  description?: string
  totalAmount: number
  paidAmount?: number
  balance?: number
}

interface HRStats {
  totalEmployees: number
  presentToday: number
  absentToday: number
  pendingInvoices: number
  paidInvoices: number
  totalRevenue: number
}

export default function HRDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [stats, setStats] = useState<HRStats>({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    pendingInvoices: 0,
    paidInvoices: 0,
    totalRevenue: 0
  })
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false)
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  // Attendance form state
  const [attendanceForm, setAttendanceForm] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'present',
    notes: ''
  })

  // Invoice form state
  const [invoiceForm, setInvoiceForm] = useState({
    employeeId: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    amount: 0,
    currency: 'USD',
    status: 'draft',
    description: '',
    taxRate: 0,
    items: JSON.stringify([{ description: '', quantity: 1, price: 0 }])
  })

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated')
    if (auth !== 'true') {
      router.push('/login')
    } else {
      setIsAuthenticated(true)
      fetchHRData()
    }
  }, [router])

  const fetchHRData = async () => {
    try {
      const [employeesRes, attendanceRes, invoicesRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/hr/attendance'),
        fetch('/api/hr/invoices')
      ])

      if (employeesRes.ok) {
        const employeesData = await employeesRes.json()
        setEmployees(employeesData)
      }

      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json()
        setAttendance(attendanceData)
      }

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json()
        setInvoices(invoicesData)
      }

      // Calculate stats
      if (employeesRes.ok && attendanceRes.ok && invoicesRes.ok) {
        const employeesData = await employeesRes.json()
        const attendanceData = await attendanceRes.json()
        const invoicesData = await invoicesRes.json()
        
        const today = new Date().toISOString().split('T')[0]
        const todayAttendance = attendanceData.filter((a: Attendance) => a.date === today)
        
        setStats({
          totalEmployees: employeesData.length,
          presentToday: todayAttendance.filter((a: Attendance) => a.status === 'present').length,
          absentToday: todayAttendance.filter((a: Attendance) => a.status === 'absent').length,
          pendingInvoices: invoicesData.filter((i: Invoice) => i.status === 'draft' || i.status === 'sent').length,
          paidInvoices: invoicesData.filter((i: Invoice) => i.status === 'paid').length,
          totalRevenue: invoicesData.filter((i: Invoice) => i.status === 'paid').reduce((sum, i) => sum + i.totalAmount, 0)
        })
      }
    } catch (error) {
      toast.error('Failed to fetch HR data')
    }
  }

  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/hr/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceForm)
      })

      if (response.ok) {
        toast.success('Attendance recorded successfully')
        setIsAttendanceDialogOpen(false)
        setAttendanceForm({
          employeeId: '',
          date: new Date().toISOString().split('T')[0],
          checkIn: '',
          checkOut: '',
          status: 'present',
          notes: ''
        })
        fetchHRData()
      } else {
        toast.error('Failed to record attendance')
      }
    } catch (error) {
      toast.error('Failed to record attendance')
    }
  }

  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const items = JSON.parse(invoiceForm.items)
      const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0)
      const taxAmount = subtotal * (invoiceForm.taxRate / 100)
      const totalAmount = subtotal + taxAmount

      const invoiceData = {
        ...invoiceForm,
        items,
        subtotal,
        taxAmount,
        totalAmount,
        balance: totalAmount,
        paidAmount: 0
      }

      const response = await fetch('/api/hr/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      })

      if (response.ok) {
        toast.success('Invoice created successfully')
        setIsInvoiceDialogOpen(false)
        setInvoiceForm({
          employeeId: '',
          invoiceNumber: '',
          invoiceDate: new Date().toISOString().split('T')[0],
          dueDate: '',
          amount: 0,
          currency: 'USD',
          status: 'draft',
          description: '',
          taxRate: 0,
          items: JSON.stringify([{ description: '', quantity: 1, price: 0 }])
        })
        fetchHRData()
      } else {
        toast.error('Failed to create invoice')
      }
    } catch (error) {
      toast.error('Failed to create invoice')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800'
      case 'absent': return 'bg-red-100 text-red-800'
      case 'late': return 'bg-yellow-100 text-yellow-800'
      case 'half_day': return 'bg-blue-100 text-blue-800'
      case 'leave': return 'bg-purple-100 text-purple-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
          >
            <Users className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HR Management System
            </h1>
            <p className="text-muted-foreground">Manage employees, attendance, and invoices</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/')} variant="outline">
            Back to Birthday System
          </Button>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4"
      >
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
              <p className="text-3xl font-bold">{stats.totalEmployees}</p>
            </div>
            <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6" />
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
              <p className="text-green-100 text-sm">Present Today</p>
              <p className="text-3xl font-bold">{stats.presentToday}</p>
            </div>
            <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Absent Today</p>
              <p className="text-3xl font-bold">{stats.absentToday}</p>
            </div>
            <div className="w-12 h-12 bg-red-400 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending Invoices</p>
              <p className="text-3xl font-bold">{stats.pendingInvoices}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Paid Invoices</p>
              <p className="text-3xl font-bold">{stats.paidInvoices}</p>
            </div>
            <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <div className="flex gap-2">
        <Button onClick={() => setIsAttendanceDialogOpen(true)} className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Record Attendance
        </Button>
        <Button onClick={() => setIsInvoiceDialogOpen(true)} className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Invoices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Attendance Records
              </CardTitle>
              <CardDescription>Employee attendance tracking and management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {attendance.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No attendance records found</p>
                ) : (
                  attendance.map((record) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            {record.employee.firstName.charAt(0)}{record.employee.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{record.employee.firstName} {record.employee.lastName}</h3>
                          <p className="text-sm text-muted-foreground">{record.employee.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{record.date}</p>
                          <p className="text-xs text-muted-foreground">
                            {record.checkIn && record.checkOut ? `${record.checkIn} - ${record.checkOut}` : 'No time recorded'}
                          </p>
                        </div>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                        {record.totalHours && (
                          <span className="text-sm font-medium">{record.totalHours}h</span>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-500" />
                Invoice Management
              </CardTitle>
              <CardDescription>Create and manage employee invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {invoices.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No invoices found</p>
                ) : (
                  invoices.map((invoice) => (
                    <motion.div
                      key={invoice.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            {invoice.employee.firstName.charAt(0)}{invoice.employee.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{invoice.employee.firstName} {invoice.employee.lastName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {invoice.invoiceNumber} • {invoice.invoiceDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold">${invoice.totalAmount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            Due: {invoice.dueDate}
                          </p>
                        </div>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                        {invoice.balance && invoice.balance > 0 && (
                          <span className="text-sm text-red-600 font-medium">
                            Balance: ${invoice.balance.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Attendance Dialog */}
      <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Attendance</DialogTitle>
            <DialogDescription>Record employee attendance for today</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAttendanceSubmit} className="space-y-4">
            <div>
              <Label htmlFor="employee">Employee</Label>
              <Select value={attendanceForm.employeeId} onValueChange={(value) => setAttendanceForm({...attendanceForm, employeeId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName} - {employee.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkIn">Check In</Label>
                <Input
                  id="checkIn"
                  type="time"
                  value={attendanceForm.checkIn}
                  onChange={(e) => setAttendanceForm({...attendanceForm, checkIn: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="checkOut">Check Out</Label>
                <Input
                  id="checkOut"
                  type="time"
                  value={attendanceForm.checkOut}
                  onChange={(e) => setAttendanceForm({...attendanceForm, checkOut: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={attendanceForm.status} onValueChange={(value) => setAttendanceForm({...attendanceForm, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="half_day">Half Day</SelectItem>
                  <SelectItem value="leave">Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={attendanceForm.notes}
                onChange={(e) => setAttendanceForm({...attendanceForm, notes: e.target.value})}
                placeholder="Add any notes about the attendance..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAttendanceDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Record Attendance</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
            <DialogDescription>Create a new invoice for an employee</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInvoiceSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee">Employee</Label>
                <Select value={invoiceForm.employeeId} onValueChange={(value) => setInvoiceForm({...invoiceForm, employeeId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName} - {employee.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceForm.invoiceNumber}
                  onChange={(e) => setInvoiceForm({...invoiceForm, invoiceNumber: e.target.value})}
                  placeholder="INV-001"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceDate">Invoice Date</Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={invoiceForm.invoiceDate}
                  onChange={(e) => setInvoiceForm({...invoiceForm, invoiceDate: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm({...invoiceForm, dueDate: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={invoiceForm.description}
                onChange={(e) => setInvoiceForm({...invoiceForm, description: e.target.value})}
                placeholder="Invoice description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({...invoiceForm, amount: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  value={invoiceForm.taxRate}
                  onChange={(e) => setInvoiceForm({...invoiceForm, taxRate: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={invoiceForm.status} onValueChange={(value) => setInvoiceForm({...invoiceForm, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Invoice</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function handleLogout() {
  localStorage.removeItem('isAuthenticated')
  window.location.href = '/login'
}