// OTP Service for generating, validating, and managing OTPs
export interface OTPData {
  code: string
  email: string
  expiresAt: Date
  attempts: number
  purpose: "registration" | "login" | "password-reset"
}

// In-memory storage for demo purposes (replace with database in production)
const otpStorage = new Map<string, OTPData>()

export class OTPService {
  private static readonly OTP_LENGTH = 6
  private static readonly OTP_EXPIRY_MINUTES = 10
  private static readonly MAX_ATTEMPTS = 3

  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  static async sendOTP(email: string, purpose: OTPData["purpose"]): Promise<{ success: boolean; message: string }> {
    try {
      // Generate new OTP
      const code = this.generateOTP()
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000)

      // Store OTP data
      const otpData: OTPData = {
        code,
        email,
        expiresAt,
        attempts: 0,
        purpose,
      }

      otpStorage.set(email, otpData)

      // Simulate email sending (replace with actual email service)
      console.log(`[v0] OTP sent to ${email}: ${code} (expires at ${expiresAt})`)

      // In production, integrate with email service like:
      // await emailService.send({
      //   to: email,
      //   subject: 'Your MediCare Plus Verification Code',
      //   template: 'otp-verification',
      //   data: { code, purpose, expiryMinutes: this.OTP_EXPIRY_MINUTES }
      // });

      return {
        success: true,
        message: `Verification code sent to ${email}`,
      }
    } catch (error) {
      console.error("[v0] Error sending OTP:", error)
      return {
        success: false,
        message: "Failed to send verification code. Please try again.",
      }
    }
  }

  static async verifyOTP(email: string, code: string): Promise<{ success: boolean; message: string }> {
    const otpData = otpStorage.get(email)

    if (!otpData) {
      return {
        success: false,
        message: "No verification code found. Please request a new one.",
      }
    }

    // Check if OTP has expired
    if (new Date() > otpData.expiresAt) {
      otpStorage.delete(email)
      return {
        success: false,
        message: "Verification code has expired. Please request a new one.",
      }
    }

    // Check if max attempts exceeded
    if (otpData.attempts >= this.MAX_ATTEMPTS) {
      otpStorage.delete(email)
      return {
        success: false,
        message: "Too many failed attempts. Please request a new verification code.",
      }
    }

    // Increment attempts
    otpData.attempts++

    // Verify code
    if (otpData.code !== code) {
      return {
        success: false,
        message: `Invalid verification code. ${this.MAX_ATTEMPTS - otpData.attempts} attempts remaining.`,
      }
    }

    // Success - remove OTP from storage
    otpStorage.delete(email)
    return {
      success: true,
      message: "Verification successful!",
    }
  }

  static async resendOTP(email: string, purpose: OTPData["purpose"]): Promise<{ success: boolean; message: string }> {
    // Remove existing OTP
    otpStorage.delete(email)

    // Send new OTP
    return this.sendOTP(email, purpose)
  }

  static isOTPPending(email: string): boolean {
    const otpData = otpStorage.get(email)
    return otpData !== undefined && new Date() <= otpData.expiresAt
  }

  static getOTPExpiryTime(email: string): Date | null {
    const otpData = otpStorage.get(email)
    return otpData ? otpData.expiresAt : null
  }
}
