// src/lib/otpService.ts
import axios from "axios";

// ✅ Use environment variable for flexibility
// Fallback to localhost if not set
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const OTPService = {
  /**
   * Send OTP to user's email
   * @param email - The user's email address
   * @param purpose - Purpose of the OTP (e.g. registration, reset_password)
   * @param role - Role of the user (patient, doctor, admin)
   */
  sendOTP: async (email: string, purpose: string, role: string) => {
    const endpoint = `${BASE_URL}/${role}s/send-otp`;
    console.log("📤 Sending OTP →", endpoint, { email, purpose });

    try {
      const response = await axios.post(endpoint, { email, purpose });
      return response;
    } catch (error) {
      console.error("❌ OTP Send Error:", error);
      throw error;
    }
  },

  /**
   * Verify OTP code
   * @param email - The user's email
   * @param otp - The OTP code entered by the user
   * @param purpose - Purpose for verification
   * @param role - User role
   */
  verifyOTP: async (email: string, otp: string, purpose: string, role: string) => {
    const endpoint = `${BASE_URL}/${role}s/verify-otp`;
    console.log("📩 Verifying OTP →", endpoint, { email, otp, purpose });

    try {
      const response = await axios.post(endpoint, { email, otp, purpose });
      return response;
    } catch (error) {
      console.error("❌ OTP Verification Error:", error);
      throw error;
    }
  },
};
