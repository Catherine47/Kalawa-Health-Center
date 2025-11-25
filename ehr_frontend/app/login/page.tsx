"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth, type UserRole } from "@/context/auth-context"
import {
  Heart,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  User,
  Stethoscope,
  Settings,
  Phone,
  Calendar,
  CheckCircle,
  RotateCcw,
} from "lucide-react"

export default function LoginPage() {
  const [activeRole, setActiveRole] = useState<UserRole>("patient")
  const [isLogin, setIsLogin] = useState(true)
  const [showOtpVerification, setShowOtpVerification] = useState(false)
  const [otpData, setOtpData] = useState({
    email: "",
    otp: "",
    isResending: false,
    role: "patient" as UserRole,
  })
  const [formData, setFormData] = useState({
    email_address: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
    // Common fields
    first_name: "",
    last_name: "",
    phone_number: "",
    // Patient specific
    dob: "",
    gender: "",
    // Doctor specific
    specialization: "",
    // Admin specific
    username: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: "" })
  const { login, isLoading, register } = useAuth()
  const router = useRouter()

  const validatePasswordStrength = (password: string) => {
    let score = 0
    let feedback = ""

    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++

    if (password.length < 8) feedback = "Password must be at least 8 characters"
    else if (score < 3) feedback = "Weak - Add uppercase, numbers, and special characters"
    else if (score < 4) feedback = "Medium - Add more character types"
    else if (score === 4) feedback = "Strong - Consider adding special characters"
    else feedback = "Very Strong"

    return { score, feedback }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
    setSuccess("")
    
    if (field === "password" && typeof value === "string") {
      setPasswordStrength(validatePasswordStrength(value))
    }
  }

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role)
    setError("")
    setSuccess("")
  }

  const validateRegistrationForm = () => {
    // Common validations
    if (!formData.first_name.trim()) {
      return "First name is required"
    }
    if (!formData.last_name.trim()) {
      return "Last name is required"
    }
    if (!formData.email_address.trim()) {
      return "Email address is required"
    }
    if (!formData.phone_number.trim()) {
      return "Phone number is required"
    }

    // Role-specific validations
    if (activeRole === "patient") {
      if (!formData.dob) {
        return "Date of birth is required for patients"
      }
      if (!formData.gender) {
        return "Gender is required for patients"
      }
    }

    if (activeRole === "doctor") {
      if (!formData.specialization.trim()) {
        return "Specialization is required for doctors"
      }
    }

    if (activeRole === "admin") {
      if (!formData.username.trim()) {
        return "Username is required for administrators"
      }
    }

    // Password validations
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match"
    }
    if (passwordStrength.score < 3) {
      return "Password does not meet security requirements. " + passwordStrength.feedback
    }

    return null
  }

  // ✅ UPDATED: Handle OTP verification for all roles
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!otpData.otp || otpData.otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }

    try {
      // Determine correct verification endpoint based on role
      const endpoint = otpData.role === "admin" 
        ? `/api/admin/verify` 
        : `/api/${otpData.role}s/verify`;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: otpData.email,
          otp: otpData.otp,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "OTP verification failed")
      }

      const result = await response.json()
      setSuccess("Account verified successfully! You can now login.")
      
      // Switch back to login after successful verification
      setTimeout(() => {
        setShowOtpVerification(false)
        setIsLogin(true)
        setOtpData({ email: "", otp: "", isResending: false, role: "patient" })
      }, 3000)

    } catch (err: any) {
      console.error("OTP verification error:", err)
      setError(err?.message || "OTP verification failed. Please try again.")
    }
  }

  // ✅ UPDATED: Handle OTP resend for all roles
  const handleResendOtp = async () => {
    setOtpData(prev => ({ ...prev, isResending: true }))
    setError("")

    try {
      // Determine correct resend endpoint based on role
      const endpoint = otpData.role === "admin" 
        ? `/api/admin/resend-otp` 
        : `/api/${otpData.role}s/resend-otp`;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: otpData.email,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to resend OTP")
      }

      setSuccess("OTP resent successfully! Check your email.")

    } catch (err: any) {
      console.error("Resend OTP error:", err)
      setError(err?.message || "Failed to resend OTP. Please try again.")
    } finally {
      setOtpData(prev => ({ ...prev, isResending: false }))
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const validationError = validateRegistrationForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      // Prepare registration data based on role and table structure
      const baseData = {
        email_address: formData.email_address,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        role: activeRole,
      }

      let registrationData

      switch (activeRole) {
        case "patient":
          registrationData = {
            ...baseData,
            dob: formData.dob,
            gender: formData.gender,
          }
          break
        
        case "doctor":
          registrationData = {
            ...baseData,
            specialization: formData.specialization,
          }
          break
        
        case "admin":
          registrationData = {
            ...baseData,
            username: formData.username,
          }
          break
        
        default:
          throw new Error("Invalid role")
      }

      await register(registrationData)

      // ✅ UPDATED: Show OTP verification for ALL roles (patients, doctors, and admins)
      setOtpData({
        email: formData.email_address,
        otp: "",
        isResending: false,
        role: activeRole
      })
      setShowOtpVerification(true)
      setSuccess(`Registration successful! Please check your email for the OTP code to verify your ${activeRole} account.`)

    } catch (err: any) {
      console.error("Registration error:", err)
      
      // Handle specific error messages from the backend
      if (err.message.includes("already exists") || err.message.includes("duplicate") || err.message.includes("already registered")) {
        setError("An account with this email already exists. Please use a different email or login.")
      } else if (err.message.includes("required") || err.message.includes("fields are required")) {
        setError("Please fill in all required fields.")
      } else if (err.message.includes("password") || err.message.includes("Password")) {
        setError("Password does not meet requirements.")
      } else {
        setError(err?.message || "Something went wrong during registration. Please try again.")
      }
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (formData.password) {
      const strength = validatePasswordStrength(formData.password)
      if (strength.score < 3) {
        setError("Password does not meet security requirements. " + strength.feedback)
        return
      }
    }

    try {
      const success = await login(formData.email_address, formData.password, activeRole)

      if (!success) {
        setError("Invalid email or password. Please try again.")
        return
      }

      const redirectPaths = {
        patient: "/dashboard",
        doctor: "/doctor-dashboard",
        admin: "/admin-dashboard",
      }
      router.push(redirectPaths[activeRole])
    } catch (err: any) {
      console.error(err)
      setError(err?.message || "Something went wrong during login. Please try again.")
    }
  }

  const roleConfig = {
    patient: {
      title: "Patient Portal",
      description: "Access your health records and manage appointments",
      icon: User,
      color: "blue",
    },
    doctor: {
      title: "Doctor Portal",
      description: "Manage patients and clinical workflows",
      icon: Stethoscope,
      color: "green",
    },
    admin: {
      title: "Admin Portal",
      description: "System administration and management",
      icon: Settings,
      color: "purple",
    },
  }

  const currentConfig = roleConfig[activeRole]

  // ✅ UPDATED: OTP Verification Component for all roles
  if (showOtpVerification) {
    return (
      <div className="min-h-screen">
        <Header />
        <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              {/* Header */}
              <div className="text-center space-y-4 mb-8">
                <div className="flex items-center justify-center gap-2">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg">
                    <CheckCircle className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-primary">Kalawa Health Center</span>
                    <span className="text-xs text-muted-foreground">KEPH Level 4 Facility</span>
                  </div>
                </div>
                <Badge variant="secondary" className="w-fit mx-auto">
                  Verify Your {otpData.role.charAt(0).toUpperCase() + otpData.role.slice(1)} Account
                </Badge>
                <h1 className="text-3xl font-bold text-balance">Verify Your Account</h1>
                <p className="text-muted-foreground">
                  Enter the 6-digit OTP sent to your email
                </p>
              </div>

              {/* OTP Verification Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
                  <CardDescription className="text-center">
                    We sent a verification code to {otpData.email}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">{success}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="otp">6-Digit OTP Code</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={otpData.otp}
                        onChange={(e) => setOtpData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                        maxLength={6}
                        required
                        className="text-center text-lg font-mono tracking-widest"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the 6-digit code sent to your email
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResendOtp}
                        disabled={otpData.isResending}
                        className="flex-1"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        {otpData.isResending ? "Resending..." : "Resend OTP"}
                      </Button>
                      <Button type="submit" className="flex-1">
                        Verify OTP
                      </Button>
                    </div>

                    <div className="text-center">
                      <Button
                        variant="link"
                        onClick={() => {
                          setShowOtpVerification(false)
                          setIsLogin(true)
                        }}
                      >
                        Back to Login
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center space-y-4 mb-8">
              <div className="flex items-center justify-center gap-2">
                <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg">
                  <Heart className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-primary">Kalawa Health Center</span>
                  <span className="text-xs text-muted-foreground">KEPH Level 4 Facility</span>
                </div>
              </div>
              <Badge variant="secondary" className="w-fit mx-auto">
                {isLogin ? "Secure Login" : "New Registration"}
              </Badge>
              <h1 className="text-3xl font-bold text-balance">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-muted-foreground">
                {isLogin 
                  ? "Choose your role and enter your credentials" 
                  : "Choose your role and fill in the registration form"
                }
              </p>
            </div>

            {/* Login/Register Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  {isLogin ? "System Login" : "Account Registration"}
                </CardTitle>
                <CardDescription className="text-center">
                  {isLogin 
                    ? "Select your role and enter your credentials" 
                    : "Select your role and complete the registration form"
                  }
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Tabs value={activeRole} onValueChange={(value) => handleRoleChange(value as UserRole)} className="mb-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="patient" className="flex items-center gap-2">
                      <User className="w-4 h-4" /> Patient
                    </TabsTrigger>
                    <TabsTrigger value="doctor" className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" /> Doctor
                    </TabsTrigger>
                    <TabsTrigger value="admin" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" /> Admin
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeRole} className="mt-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <currentConfig.icon className="w-5 h-5 text-primary" />
                        <span className="font-semibold">{currentConfig.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{currentConfig.description}</p>
                    </div>
                  </TabsContent>
                </Tabs>

                <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="bg-green-50 border-green-200">
                      <AlertCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                  )}

                  {/* Registration Fields */}
                  {!isLogin && (
                    <>
                      {/* Common Fields for All Roles */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first_name">First Name *</Label>
                          <Input
                            id="first_name"
                            type="text"
                            placeholder="First name"
                            value={formData.first_name}
                            onChange={(e) => handleInputChange("first_name", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last_name">Last Name *</Label>
                          <Input
                            id="last_name"
                            type="text"
                            placeholder="Last name"
                            value={formData.last_name}
                            onChange={(e) => handleInputChange("last_name", e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone_number">Phone Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone_number"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={formData.phone_number}
                            onChange={(e) => handleInputChange("phone_number", e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      {/* Patient Specific Fields */}
                      {activeRole === "patient" && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="dob">Date of Birth *</Label>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="dob"
                                  type="date"
                                  value={formData.dob}
                                  onChange={(e) => handleInputChange("dob", e.target.value)}
                                  className="pl-10"
                                  required
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="gender">Gender *</Label>
                              <Select
                                value={formData.gender}
                                onValueChange={(value) => handleInputChange("gender", value)}
                                required
                              >
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
                          </div>
                        </>
                      )}

                      {/* Doctor Specific Fields */}
                      {activeRole === "doctor" && (
                        <div className="space-y-2">
                          <Label htmlFor="specialization">Specialization *</Label>
                          <Input
                            id="specialization"
                            type="text"
                            placeholder="Your medical specialization"
                            value={formData.specialization}
                            onChange={(e) => handleInputChange("specialization", e.target.value)}
                            required
                          />
                        </div>
                      )}

                      {/* Admin Specific Fields */}
                      {activeRole === "admin" && (
                        <div className="space-y-2">
                          <Label htmlFor="username">Username *</Label>
                          <Input
                            id="username"
                            type="text"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={(e) => handleInputChange("username", e.target.value)}
                            required
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* Common Fields for Both Login and Register */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email_address}
                        onChange={(e) => handleInputChange("email_address", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </div>

                    {formData.password && (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full ${
                                level <= passwordStrength.score
                                  ? passwordStrength.score <= 2
                                    ? "bg-red-500"
                                    : passwordStrength.score <= 3
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                  : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">{passwordStrength.feedback}</p>
                        <p className="text-xs text-muted-foreground">
                          Must contain: 8+ characters, letters, numbers, and special characters
                        </p>
                      </div>
                    )}
                  </div>

                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          className="pl-10 pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                      </div>
                    </div>
                  )}

                  {isLogin && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember"
                          checked={formData.rememberMe}
                          onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                        />
                        <Label htmlFor="remember" className="text-sm">
                          Remember me
                        </Label>
                      </div>
                      <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading 
                      ? (isLogin ? "Signing in..." : "Creating account...")
                      : (isLogin 
                          ? `Sign In as ${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}`
                          : `Register as ${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}`
                        )
                    }
                  </Button>
                </form>

                {/* Toggle between login and register - Only text link at bottom */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary"
                      onClick={() => setIsLogin(!isLogin)}
                    >
                      {isLogin ? "Register here" : "Login here"}
                    </Button>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Your data is protected with bank-level security</span>
              </div>
            </div>

            {/* Demo Credentials */}
            <Card className="mt-6 bg-muted/50">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-sm">Demo Credentials</h3>
                  <div className="text-xs text-muted-foreground space-y-2">
                    <div><strong>Patient:</strong> patient@kalawa.go.ke / Password123!</div>
                    <div><strong>Doctor:</strong> doctor@kalawa.go.ke / Password123!</div>
                    <div><strong>Admin:</strong> admin@kalawa.go.ke / Password123!</div>
                    <div className="text-green-600 font-medium mt-2">
                      Select role above and type credentials manually
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}