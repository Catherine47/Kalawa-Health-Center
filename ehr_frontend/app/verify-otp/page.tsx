"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { OTPInput } from "@/components/otp-input"
import { OTPService } from "@/lib/otp-service"
import { Heart, Shield, Mail, Clock, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export default function VerifyOTPPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const purpose = (searchParams.get("purpose") as "registration" | "login" | "password-reset") || "registration"

  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const [canResend, setCanResend] = useState(false)

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  // Check if OTP is pending for this email
  useEffect(() => {
    if (email && OTPService.isOTPPending(email)) {
      const expiryTime = OTPService.getOTPExpiryTime(email)
      if (expiryTime) {
        const remainingTime = Math.max(0, Math.floor((expiryTime.getTime() - Date.now()) / 1000))
        setTimeLeft(remainingTime)
        setCanResend(remainingTime === 0)
      }
    } else if (email) {
      // No pending OTP, allow immediate resend
      setCanResend(true)
      setTimeLeft(0)
    }
  }, [email])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError("Email address is required. Please go back to registration.")
      return
    }

    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await OTPService.verifyOTP(email, otp)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          // Redirect based on purpose
          if (purpose === "registration") {
            router.push("/login?verified=true")
          } else if (purpose === "password-reset") {
            router.push(`/reset-password?email=${encodeURIComponent(email)}`)
          } else {
            router.push("/dashboard")
          }
        }, 2000)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Verification failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError("Email address is required.")
      return
    }

    setIsLoading(true)
    setError("")
    setCanResend(false)

    try {
      const result = await OTPService.resendOTP(email, purpose)

      if (result.success) {
        setTimeLeft(600) // Reset to 10 minutes
        setOtp("") // Clear current input
        // Success message is handled by the service
      } else {
        setError(result.message)
        setCanResend(true)
      }
    } catch (err) {
      setError("Failed to resend code. Please try again.")
      setCanResend(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen">
        <Header />
        <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="space-y-2">
                      <h1 className="text-2xl font-bold">
                        {purpose === "registration"
                          ? "Email Verified!"
                          : purpose === "password-reset"
                            ? "Verification Complete!"
                            : "Login Successful!"}
                      </h1>
                      <p className="text-muted-foreground">
                        {purpose === "registration"
                          ? "Your email has been successfully verified. You can now sign in to your account."
                          : purpose === "password-reset"
                            ? "You can now reset your password."
                            : "Welcome back! Redirecting to your dashboard..."}
                      </p>
                    </div>
                    <Button asChild size="lg" className="w-full">
                      <Link href={purpose === "registration" ? "/login" : "/dashboard"}>
                        {purpose === "registration" ? "Continue to Login" : "Continue to Dashboard"}
                      </Link>
                    </Button>
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
                  <span className="text-xl font-bold text-primary">MediCare Plus</span>
                  <span className="text-xs text-muted-foreground">Email Verification</span>
                </div>
              </div>
              <Badge variant="secondary" className="w-fit mx-auto">
                Verify Email
              </Badge>
              <h1 className="text-3xl font-bold text-balance">Check Your Email</h1>
              <p className="text-muted-foreground">
                We've sent a 6-digit verification code to <span className="font-medium">{email}</span>. Enter it below
                to verify your account.
              </p>
            </div>

            {/* OTP Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                  <Mail className="w-6 h-6" />
                  Email Verification
                </CardTitle>
                <CardDescription className="text-center">Enter the 6-digit code sent to your email</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <OTPInput length={6} value={otp} onChange={setOtp} disabled={isLoading} />
                  </div>

                  {/* Timer */}
                  {timeLeft > 0 && (
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Code expires in {formatTime(timeLeft)}</span>
                      </div>
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full" disabled={isLoading || otp.length !== 6}>
                    {isLoading ? "Verifying..." : "Verify Email"}
                  </Button>

                  {/* Resend */}
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Didn't receive code?</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResend}
                      disabled={!canResend || isLoading}
                      className="w-full bg-transparent"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {canResend ? "Resend Code" : `Resend in ${formatTime(timeLeft)}`}
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Wrong email?{" "}
                      <Link href="/register" className="text-primary hover:underline font-medium">
                        Go back to registration
                      </Link>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>This verification helps keep your account secure</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
