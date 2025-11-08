"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OTPService } from "@/lib/otpService";

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";
  const purpose = searchParams.get("purpose") || "registration";
  const role = searchParams.get("role") || "patient";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Verify OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("OTP must be 6 digits.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await OTPService.verifyOTP(email, otp, purpose, role);
      if (res.status === 200) {
        setMessage("✅ OTP verified successfully!");
        router.push("/login"); // Redirect after verification
      }
    } catch (err: any) {
      console.error("❌ OTP verification failed:", err.response?.data || err.message);
      setError(err.response?.data?.error || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await OTPService.sendOTP(email, purpose, role);
      if (res.status === 200) {
        setMessage("✅ OTP resent successfully! Check your email.");
      }
    } catch (err: any) {
      console.error("❌ Resend OTP failed:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col gap-4">
      <h2 className="text-xl font-bold">Verify OTP</h2>
      <p>Enter the 6-digit OTP sent to <strong>{email}</strong></p>

      {error && <p className="text-red-600 font-medium">{error}</p>}
      {message && <p className="text-green-600 font-medium">{message}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          name="otp"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          maxLength={6}
          className="border p-2 rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      <button
        onClick={handleResend}
        disabled={resendLoading}
        className="bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        {resendLoading ? "Resending..." : "Resend OTP"}
      </button>
    </div>
  );
}
