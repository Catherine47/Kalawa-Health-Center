"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { OTPService } from "@/lib/otpService";

export default function RegisterPage() {
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Basic frontend validation
  const validateForm = () => {
    const { first_name, last_name, dob, gender, email_address, phone_number, password } = formData;

    if (!first_name || !last_name || !dob || !gender || !email_address || !phone_number || !password) {
      setError("Please fill in all fields.");
      return false;
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email_address)) {
      setError("Please enter a valid email address.");
      return false;
    }

    // Password length check
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }

    // Phone number digits check
    if (!/^\d{10,15}$/.test(phone_number)) {
      setError("Phone number must contain 10-15 digits.");
      return false;
    }

    setError("");
    return true;
  };

  // ✅ Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // 1️⃣ Register patient
      const registerRes = await axios.post("http://localhost:5000/patients/register", formData);

      if (registerRes.status === 201) {
        console.log("✅ Registration successful:", registerRes.data);

        // 2️⃣ Send OTP via backend
        await OTPService.sendOTP(formData.email_address, "registration", "patient");

        // 3️⃣ Redirect to OTP verification page
        router.push(
          `/verify-otp?email=${encodeURIComponent(formData.email_address)}&purpose=registration&role=patient`
        );
      }
    } catch (err: any) {
      console.error("❌ Registration failed:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md mx-auto p-4">
      {error && <p className="text-red-600 font-medium">{error}</p>}

      <input
        name="first_name"
        value={formData.first_name}
        onChange={handleChange}
        placeholder="First Name"
        required
        className="border p-2 rounded"
      />
      <input
        name="last_name"
        value={formData.last_name}
        onChange={handleChange}
        placeholder="Last Name"
        required
        className="border p-2 rounded"
      />
      <input
        type="date"
        name="dob"
        value={formData.dob}
        onChange={handleChange}
        required
        className="border p-2 rounded"
      />
      <select
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        required
        className="border p-2 rounded"
      >
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <input
        type="email"
        name="email_address"
        value={formData.email_address}
        onChange={handleChange}
        placeholder="Email"
        required
        className="border p-2 rounded"
      />
      <input
        type="tel"
        name="phone_number"
        value={formData.phone_number}
        onChange={handleChange}
        placeholder="Phone Number"
        required
        className="border p-2 rounded"
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        required
        className="border p-2 rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
