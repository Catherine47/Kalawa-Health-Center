"use client"

import type React from "react"
import { apiCall } from "@/lib/api-client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, AlertCircle, User, Stethoscope, Settings } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<"patient" | "doctor" | "admin">("patient")
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email_address: "",
    phone_number: "",
    dob: "",
    gender: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    agreeToPrivacy: false,
    specialization: "",
    username: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return {
      isValid: minLength && hasLetter && hasNumber && hasSpecial,
      requirements: {
        minLength,
        hasLetter,
        hasNumber,
        hasSpecial,
      },
    }
  }

  const validateStep1 = () => {
    if (!formData.first_name || !formData.last_name || !formData.email_address) {
      setError("Please fill in all required fields.")
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email_address)) {
      setError("Please enter a valid email address.")
      return false
    }

    if (role === "patient" && (!formData.phone_number || !formData.dob || !formData.gender)) {
      setError("Please fill in all required fields.")
      return false
    }

    if (role === "doctor" && (!formData.phone_number || !formData.specialization)) {
      setError("Please fill in all required fields.")
      return false
    }
    if (role === "admin" && !formData.username) {
      setError("Please enter a username.")
      return false
    }

    return true
  }

  const validateStep2 = () => {
    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in all password fields.")
      return false
    }

    const passwordCheck = validatePassword(formData.password)
    if (!passwordCheck.isValid) {
      setError("Password must be at least 8 characters and include letters, numbers, and special characters.")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return false
    }
    if (!formData.agreeToTerms || !formData.agreeToPrivacy) {
      setError("Please agree to the terms and privacy policy.")
      return false
    }
    return true
  }

  const handleNext = () => {
    setError("")
    if (step === 1 && validateStep1()) {
      setStep(2)
    }
  }

  const handleBack = () => {
    setStep(1)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep2()) return

    setIsLoading(true)
    setError("")

    try {
      const registrationData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email_address: formData.email_address,
        password: formData.password,
        ...(role === "patient" && {
          phone_number: formData.phone_number,
          dob: formData.dob,
          gender: formData.gender,
        }),
        ...(role === "doctor" && {
          phone_number: formData.phone_number,
          specialization: formData.specialization,
        }),
        ...(role === "admin" && {
          username: formData.username,
        }),
      }

      const endpoint = role === "admin" ? "/api/admin/register" : `/api/${role}s/register`

      const registerResponse = await apiCall(endpoint, {
        method: "POST",
        body: JSON.stringify(registrationData),
      })

      console.log("[v0] Registration successful:", registerResponse)

      router.push(`/verify-otp?email=${encodeURIComponent(formData.email_address)}&purpose=registration&role=${role}`)
    } catch (err) {
      console.error("[v0] Registration failed:", err)
      setError("Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          {/* Role Selection Tabs */}
          <div className="mb-6">
            <Tabs value={role} onValueChange={(value) => setRole(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="patient" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Patient</span>
                </TabsTrigger>
                <TabsTrigger value="doctor" className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  <span className="hidden sm:inline">Doctor</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Create Account</CardTitle>
              <CardDescription className="text-center">
                {step === 1 ? "Enter your personal information" : "Set up your password"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange("first_name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange("last_name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email_address">Email Address</Label>
                    <Input
                      id="email_address"
                      type="email"
                      value={formData.email_address}
                      onChange={(e) => handleInputChange("email_address", e.target.value)}
                    />
                  </div>
                  {role === "patient" && (
                    <>
                      <div>
                        <Label htmlFor="phone_number">Phone Number</Label>
                        <Input
                          id="phone_number"
                          value={formData.phone_number}
                          onChange={(e) => handleInputChange("phone_number", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input
                          id="dob"
                          type="date"
                          value={formData.dob}
                          onChange={(e) => handleInputChange("dob", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                          <SelectTrigger id="gender">
                            <SelectValue placeholder="Select your gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  {role === "doctor" && (
                    <>
                      <div>
                        <Label htmlFor="phone_number">Phone Number</Label>
                        <Input
                          id="phone_number"
                          value={formData.phone_number}
                          onChange={(e) => handleInputChange("phone_number", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input
                          id="specialization"
                          value={formData.specialization}
                          onChange={(e) => handleInputChange("specialization", e.target.value)}
                        />
                      </div>
                    </>
                  )}
                  {role === "admin" && (
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => handleInputChange("username", e.target.value)}
                      />
                    </div>
                  )}
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button onClick={handleNext} disabled={isLoading} className="w-full">
                    Next
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-0 top-0"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium">Password must contain:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>At least 8 characters</li>
                      <li>Letters (a-z, A-Z)</li>
                      <li>Numbers (0-9)</li>
                      <li>Special characters (!@#$%^&*)</li>
                    </ul>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                    />
                    <Label htmlFor="agreeToTerms" className="text-sm">
                      I agree to the terms and conditions
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="agreeToPrivacy"
                      checked={formData.agreeToPrivacy}
                      onCheckedChange={(checked) => handleInputChange("agreeToPrivacy", checked)}
                    />
                    <Label htmlFor="agreeToPrivacy" className="text-sm">
                      I agree to the privacy policy
                    </Label>
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleBack}
                      disabled={isLoading}
                      variant="outline"
                      className="flex-1 bg-transparent"
                    >
                      Back
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
                      {isLoading ? "Creating..." : "Create Account"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Sign in link */}
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
