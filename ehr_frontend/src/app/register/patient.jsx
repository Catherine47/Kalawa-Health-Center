"use client";

import { useState } from "react";
import { registerPatient, verifyPatientOtp } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function PatientRegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    dob: "",
    gender: "",
    email_address: "",
    phone_number: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Basic form validation
  const validateForm = () => {
    const { first_name, last_name, dob, gender, email_address, phone_number, password } = formData;

    if (!first_name || !last_name || !dob || !gender || !email_address || !phone_number || !password) {
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
      setError("Phone number must be 10–15 digits.");
      return false;
    }

    setError("");
    return true;
  };

  // Handle patient registration
  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");
    setMessage("Registering patient...");

    try {
      const res = await registerPatient(formData);

      // OTP is already sent by backend
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
      await verifyPatientOtp(formData.email_address, otp);
      setMessage("✅ OTP verified! Registration complete.");
      setShowOtpForm(false);

      // Optional: redirect to login page
      router.push("/patient/login");
    } catch (err: any) {
      console.error("❌ OTP verification error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "OTP verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">Patient Registration</h2>

        {error && <p className="text-red-600 text-center font-medium mb-2">{error}</p>}
        {message && <p className="text-green-600 text-center font-medium mb-2">{message}</p>}

        {!showOtpForm ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
            className="space-y-4"
          >
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            />
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            />
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            />
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <input
              type="email"
              name="email_address"
              placeholder="Email Address"
              value={formData.email_address}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            />
            <input
              type="text"
              name="phone_number"
              placeholder="Phone Number"
              value={formData.phone_number}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
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
              {loading ? "Verifying OTP..." : "Verify OTP"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
