"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OTPService } from "@/lib/otpService";

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract query parameters
  const email = searchParams.get("email")?.trim() || "";
  const purpose = searchParams.get("purpose") || "registration";
  const role = searchParams.get("role") || "patient";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Handle OTP verification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await OTPService.verifyOTP(email, otp, purpose, role);

      if (res.status === 200) {
        setMessage("✅ OTP verified successfully!");

        // Redirect according to role
        setTimeout(() => {
          if (role === "patient") router.push("/patient/login");
          else if (role === "doctor") router.push("/doctor/login");
          else if (role === "admin") router.push("/admin/login");
          else router.push("/login"); // fallback
        }, 1500);
      }
    } catch (err: any) {
      console.error("❌ OTP verification failed:", err.response?.data || err.message);
      setError(err.response?.data?.error || "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP resend
  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await OTPService.sendOTP(email, purpose, role);

      if (res.status === 200) {
        setMessage("✅ A new OTP has been sent to your email.");
      }
    } catch (err: any) {
      console.error("❌ Resend OTP failed:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to resend OTP. Try again later.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-8 bg-white shadow-md rounded-lg flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-center">Email Verification</h2>
      <p className="text-center text-gray-700">
        Enter the 6-digit OTP sent to <strong>{email}</strong>
      </p>

      {error && <p className="text-red-600 font-semibold text-center">{error}</p>}
      {message && <p className="text-green-600 font-semibold text-center">{message}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          name="otp"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").trim())} // digits only
          placeholder="Enter OTP"
          maxLength={6}
          className="border border-gray-300 p-3 rounded text-center text-lg tracking-widest"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      <div className="text-center mt-3">
        <button
          onClick={handleResend}
          disabled={resendLoading}
          className="text-blue-600 font-medium hover:underline disabled:opacity-50"
        >
          {resendLoading ? "Resending..." : "Resend OTP"}
        </button>
      </div>
    </div>
  );
}
