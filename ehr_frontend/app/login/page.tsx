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
import { useAuth, type UserRole } from "@/lib/auth-context"
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
  Smartphone,
} from "lucide-react"

export default function LoginPage() {
  const [activeRole, setActiveRole] = useState<UserRole>("patient")
  const [formData, setFormData] = useState({
    email_address: "",
    password: "",
    rememberMe: false,
    twoFactorCode: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: "" })
  const { login, isLoading, user } = useAuth() // <-- include `user` from context
  const router = useRouter()

  const validatePasswordStrength = (password: string) => {
    let score = 0
    let feedback = ""

    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++

    if (password.length < 8) {
      feedback = "Password must be at least 8 characters"
    } else if (score < 3) {
      feedback = "Weak - Add uppercase, numbers, and special characters"
    } else if (score < 4) {
      feedback = "Medium - Add more character types"
    } else if (score === 4) {
      feedback = "Strong - Consider adding special characters"
    } else {
      feedback = "Very Strong"
    }

    return { score, feedback }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")

    if (field === "password" && typeof value === "string") {
      setPasswordStrength(validatePasswordStrength(value))
    }
  }

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role)
    setError("")
    setShowTwoFactor(false)
    const defaultCredentials = {
      patient: { email_address: "patient@kalawa.go.ke" },
      doctor: { email_address: "doctor@kalawa.go.ke" },
      admin: { email_address: "admin@kalawa.go.ke" },
    }
    setFormData((prev) => ({
      ...prev,
      email_address: defaultCredentials[role].email_address,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // password strength enforcement (optional)
    if (formData.password) {
      const strength = validatePasswordStrength(formData.password)
      if (strength.score < 3) {
        setError("Password does not meet security requirements. " + strength.feedback)
        return
      }
    }

    if (!showTwoFactor) {
      try {
        // call context login (returns boolean in your auth-context)
        const success = await login(formData.email_address, formData.password, activeRole)

        if (!success) {
          setError("Invalid email or password. Please try again.")
          return
        }

        // try to read user from context first
        let loggedUser = user

        // if context not yet updated, fallback to localStorage (auth-context writes there)
        if (!loggedUser) {
          try {
            const raw = localStorage.getItem("user")
            if (raw) loggedUser = JSON.parse(raw)
          } catch (err) {
            // ignore JSON parse errors
            loggedUser = null
          }
        }

        const userId = loggedUser?.id ?? loggedUser?.patientId ?? loggedUser?.userId
        if (!userId) {
          // defensive: login succeeded but user data missing
          setError("Login failed: User data is missing.")
          return
        }

        // persist userId (if you need it quickly elsewhere)
        localStorage.setItem("userId", userId.toString())

        // proceed to 2FA UI
        setShowTwoFactor(true)
        setError("")
        console.log("[v0] 2FA code sent to user")
      } catch (err: any) {
        console.error(err)
        setError(err?.message || "Something went wrong during login. Please try again.")
      }
    } else {
      // Two-factor verification step (demo)
      if (!formData.twoFactorCode || formData.twoFactorCode.length !== 6) {
        setError("Please enter a valid 6-digit verification code.")
        return
      }

      if (formData.twoFactorCode === "123456") {
        const redirectPaths = {
          patient: "/dashboard",
          doctor: "/doctor-dashboard",
          admin: "/admin-dashboard",
        }
        router.push(redirectPaths[activeRole])
      } else {
        setError("Invalid verification code. Please try again.")
      }
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
                {showTwoFactor ? "Two-Factor Authentication" : "Secure Login"}
              </Badge>
              <h1 className="text-3xl font-bold text-balance">
                {showTwoFactor ? "Verify Your Identity" : "Welcome Back"}
              </h1>
              <p className="text-muted-foreground">
                {showTwoFactor
                  ? "Enter the 6-digit code sent to your registered device"
                  : "Choose your role and sign in to continue"}
              </p>
            </div>

            {/* Login Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  {showTwoFactor ? "Two-Factor Authentication" : "System Login"}
                </CardTitle>
                <CardDescription className="text-center">
                  {showTwoFactor
                    ? "Complete your secure login with verification code"
                    : "Select your role and enter your credentials"}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {!showTwoFactor && (
                  <Tabs
                    value={activeRole}
                    onValueChange={(value) => handleRoleChange(value as UserRole)}
                    className="mb-6"
                  >
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
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {!showTwoFactor ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder={`${activeRole}@kalawa.go.ke`}
                            value={formData.email_address}
                            onChange={(e) => handleInputChange("email_address", e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
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
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>

                        {/* password strength bars */}
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

                      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                        {isLoading
                          ? "Signing in..."
                          : `Sign In as ${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}`}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="text-center mb-6">
                        <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4">
                          <Smartphone className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          We've sent a 6-digit verification code to your registered device.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="twoFactorCode">Verification Code</Label>
                        <Input
                          id="twoFactorCode"
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={formData.twoFactorCode}
                          onChange={(e) =>
                            handleInputChange("twoFactorCode", e.target.value.replace(/\D/g, "").slice(0, 6))
                          }
                          className="text-center text-lg tracking-widest"
                          maxLength={6}
                          required
                        />
                        <p className="text-xs text-muted-foreground text-center">Demo code: 123456</p>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          className="flex-1 bg-transparent"
                          onClick={() => setShowTwoFactor(false)}
                        >
                          Back
                        </Button>
                        <Button type="submit" size="lg" className="flex-1" disabled={isLoading}>
                          {isLoading ? "Verifying..." : "Verify & Sign In"}
                        </Button>
                      </div>

                      <div className="text-center">
                        <Button variant="link" className="text-sm">
                          Resend code
                        </Button>
                      </div>
                    </>
                  )}

                  {!showTwoFactor && (
                    <div className="text-center space-y-4">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">Or</span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link href="/register" className="text-primary hover:underline font-medium">
                          Create account
                        </Link>
                      </p>
                    </div>
                  )}
                </form>
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
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Email: {activeRole}@kalawa.go.ke</div>
                    <div>Password: Password123!</div>
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
