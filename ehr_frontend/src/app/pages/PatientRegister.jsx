"use client";

import { useState } from "react";
import axios from "axios";

export default function PatientRegister() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email_address: "",
    phone_number: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Register patient
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("Processing registration...");

    try {
      const res = await axios.post("http://localhost:5000/patients/register", formData);
      setMessage(res.data.message || "Registered successfully! OTP sent to email.");
      setShowOtpForm(true);
    } catch (err) {
      console.error("Registration error:", err);
      setMessage(err.response?.data?.error || "Registration failed");
    }
  };

  // ✅ Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage("Verifying OTP...");

    try {
      const res = await axios.post("http://localhost:5000/patients/verify-otp", {
        email_address: formData.email_address,
        otp,
      });
      setMessage(res.data.message || "✅ Verification successful!");
      setShowOtpForm(false);
    } catch (err) {
      console.error("OTP verification error:", err);
      setMessage(err.response?.data?.error || "OTP verification failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">Patient Registration</h2>

        {!showOtpForm ? (
          <form onSubmit={handleRegister} className="space-y-4">
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
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
            >
              Register
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              type="text"
              name="otp"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full p-2 border rounded-md"
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700"
            >
              Verify OTP
            </button>
          </form>
        )}

        {message && (
          <p className="mt-4 text-center text-gray-700 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}
