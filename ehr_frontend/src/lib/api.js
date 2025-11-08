// lib/api.js or similar file
export async function verifyOtp(email, otp, role, purpose) {
  const res = await fetch(`http://localhost:5000/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, role, purpose }),
  });
  if (!res.ok) throw new Error("Failed to verify OTP");
  return res.json();
}
