// src/lib/otpService.ts
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

export const OTPService = {
  sendOTP: async (email: string, purpose: string, role: string) => {
    const endpoint =
      role === "admin"
        ? `${BASE_URL}/admin/resend-otp`
        : `${BASE_URL}/${role}s/resend-otp`;

    console.log("📤 Sending OTP →", endpoint, { email, purpose, role });

    try {
      const response = await axios.post(endpoint, { email, purpose });
      return response.data;
    } catch (error: any) {
      console.error("❌ OTP Send Error:", error.response?.data || error.message);
      throw error.response?.data || { error: "Failed to send OTP" };
    }
  },

  verifyOTP: async (email: string, otp: string, purpose: string, role: string) => {
    const endpoint =
      role === "admin"
        ? `${BASE_URL}/admin/verify`
        : `${BASE_URL}/${role}s/verify`;

    console.log("📩 Verifying OTP →", endpoint, { email, otp, purpose, role });

    try {
      const response = await axios.post(endpoint, { email, otp, purpose });
      return response.data;
    } catch (error: any) {
      console.error("❌ OTP Verification Error:", error.response?.data || error.message);
      throw error.response?.data || { error: "OTP verification failed" };
    }
  },
};
