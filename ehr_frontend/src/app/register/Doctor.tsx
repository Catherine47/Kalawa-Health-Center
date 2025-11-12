"use client";

import { useState } from "react";
import { registerDoctor, verifyDoctorOtp, resendDoctorOtp } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function DoctorRegister() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email_address: "",
    phone_number: "",
    specialization: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Basic validation
  const validateForm = () => {
    const { first_name, last_name, email_address, phone_number, specialization, password } = formData;
    if (!first_name || !last_name || !email_address || !phone_number || !specialization || !password) {
      setError("Please fill in all fields.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email_address)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    if (!/^\d{10,15}$/.test(phone_number)) {
      setError("Phone number must contain 10–15 digits.");
      return false;
    }
    setError("");
    return true;
  };

  // Handle doctor registration
  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");
    setMessage("Registering doctor...");

    try {
      const res = await registerDoctor(formData);

      // OTP already sent by backend
      setMessage("✅ Registration successful! OTP sent to your email.");
      setShowOtpForm(true);
    } catch (err: any) {
      console.error("❌ Registration error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("Verifying OTP...");

    try {
      await verifyDoctorOtp(formData.email_address, otp);
      setMessage("✅ OTP verified! Registration complete.");
      setShowOtpForm(false);

      // Optional: redirect to login page
      router.push("/doctor/login");
    } catch (err: any) {
      console.error("❌ OTP verification error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "OTP verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    setLoading(true);
    setError("");
    setMessage("Resending OTP...");

    try {
      const res = await resendDoctorOtp(formData.email_address);
      setMessage(res.message || "OTP resent. Check your email.");
    } catch (err: any) {
      console.error("❌ Resend OTP error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Doctor Registration</h1>

      {error && <p className="mb-4 text-red-600">{error}</p>}
      {message && <p className="mb-4 text-green-600">{message}</p>}

      {!showOtpForm ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
          }}
          className="space-y-3"
        >
          <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required className="w-full p-2 border rounded-md" />
          <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required className="w-full p-2 border rounded-md" />
          <input type="email" name="email_address" placeholder="Email" value={formData.email_address} onChange={handleChange} required className="w-full p-2 border rounded-md" />
          <input type="text" name="phone_number" placeholder="Phone Number" value={formData.phone_number} onChange={handleChange} required className="w-full p-2 border rounded-md" />
          <input type="text" name="specialization" placeholder="Specialization" value={formData.specialization} onChange={handleChange} required className="w-full p-2 border rounded-md" />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full p-2 border rounded-md" />
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
          <button
            onClick={handleVerifyOtp}
            disabled={loading}
            className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
          <button
            onClick={handleResendOtp}
            disabled={loading}
            className="w-full bg-yellow-600 text-white p-2 rounded-md hover:bg-yellow-700 disabled:opacity-50"
          >
            {loading ? "Resending..." : "Resend OTP"}
          </button>
        </div>
      )}
    </div>
  );
}
