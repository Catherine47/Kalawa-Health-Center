// routes/authRoutes.js
import express from "express";
const router = express.Router();

router.post("/verify-otp", async (req, res) => {
  const { email, otp, purpose, role } = req.body;

  try {
    // Temporary OTP logic — replace later with real verification
    const isValid = otp === "123456"; // e.g., from DB or cache

    if (!isValid) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    return res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
