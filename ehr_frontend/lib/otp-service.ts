// OTP Service for generating, validating, and managing OTPs
import { apiCall } from "./api-client"

export interface OTPData {
  code: string
  email: string
  expiresAt: Date
  attempts: number
  purpose: "registration" | "login" | "password-reset"
}

export class OTPService {
  private static readonly OTP_LENGTH = 6
  private static readonly OTP_EXPIRY_MINUTES = 10
  private static readonly MAX_ATTEMPTS = 3

  static async sendOTP(email: string, purpose: OTPData["purpose"]): Promise<{ success: boolean; message: string }> {
    try {
      console.log("[v0] Sending OTP request to backend for:", email)

      const response = await apiCall("/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({
          email,
          purpose,
        }),
      })

      return {
        success: true,
        message: response.message || `Verification code sent to ${email}`,
      }
    } catch (error) {
      console.error("[v0] Error sending OTP:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to send verification code. Please try again.",
      }
    }
  }

  static async verifyOTP(email: string, code: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log("[v0] Verifying OTP request to backend for:", email)

      const response = await apiCall("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          email,
          code,
        }),
      })

      return {
        success: true,
        message: response.message || "Verification successful!",
      }
    } catch (error) {
      console.error("[v0] Error verifying OTP:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Verification failed. Please try again.",
      }
    }
  }

  static async resendOTP(email: string, purpose: OTPData["purpose"]): Promise<{ success: boolean; message: string }> {
    try {
      console.log("[v0] Resending OTP request to backend for:", email)

      const response = await apiCall("/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({
          email,
          purpose,
        }),
      })

      return {
        success: true,
        message: response.message || "Verification code resent",
      }
    } catch (error) {
      console.error("[v0] Error resending OTP:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to resend code. Please try again.",
      }
    }
  }

  static isOTPPending(email: string): boolean {
    return true
  }

  static getOTPExpiryTime(email: string): Date | null {
    return null
  }
}
