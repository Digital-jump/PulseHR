'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Gift, Cake, Sparkles, Star, Heart, Mail, Lock } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [floatingElements, setFloatingElements] = useState<Array<{id: number, x: number, y: number, emoji: string}>>([])

  useEffect(() => {
    // Create floating emoji elements
    const emojis = ['🎉', '🎂', '🎁', '✨', '🌟', '💝', '🎈', '🍰', '🎊']
    const elements = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      emoji: emojis[Math.floor(Math.random() * emojis.length)]
    }))
    setFloatingElements(elements)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate login - in real app, this would be an API call
    setTimeout(() => {
      // Simple authentication for demo
      if (email === 'admin@birthday.com' && password === 'birthday123') {
        localStorage.setItem('isAuthenticated', 'true')
        window.location.href = '/'
      } else {
        alert('Invalid credentials. Use admin@birthday.com / birthday123')
      }
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Floating animated elements */}
      {floatingElements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute text-2xl opacity-20 pointer-events-none"
          style={{ left: `${element.x}%`, top: `${element.y}%` }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {element.emoji}
        </motion.div>
      ))}

      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-yellow-300 rounded-full opacity-20 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            y: [0, -20, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-40 h-40 bg-blue-300 rounded-full opacity-20 blur-xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 30, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-24 h-24 bg-green-300 rounded-full opacity-20 blur-xl"
          animate={{
            scale: [1, 1.4, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <Card className="backdrop-blur-lg bg-white/90 border-0 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex justify-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Gift className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Birthday Reminder
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Celebrate every special moment! 🎉
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@birthday.com"
                    className="pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-all"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="flex items-center justify-center"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Signing in...
                    </motion.div>
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center justify-center"
                    >
                      <Cake className="w-5 h-5 mr-2" />
                      Sign In
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center text-sm text-gray-500"
            >
              <p>Demo Credentials:</p>
              <p className="font-medium text-purple-600">admin@birthday.com / birthday123</p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Decorative elements */}
      <motion.div
        className="absolute top-10 left-10 text-4xl"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🎂
      </motion.div>
      <motion.div
        className="absolute bottom-10 right-10 text-4xl"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        🎁
      </motion.div>
      <motion.div
        className="absolute top-1/3 right-20 text-3xl"
        animate={{ rotate: [0, 15, -15, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        🌟
      </motion.div>
    </div>
  )
}