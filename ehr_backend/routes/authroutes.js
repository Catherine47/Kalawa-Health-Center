// routes/authRoutes.js
import express from "express";

const router = express.Router();

/**
 * ✅ Temporary endpoint to simulate sending an OTP
 */
router.post("/send-otp", async (req, res) => {
  const { email, purpose, role } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    console.log(`📧 Sending OTP to ${email} for ${role || "user"} (${purpose || "general"})`);

    // Temporary fixed OTP for testing
    const otp = "123456";

    // Normally you'd store OTP in DB or cache and send via email
    res.json({
      message: "OTP sent successfully",
      email,
      otp, // only for testing; remove in production!
    });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

/**
 * ✅ Temporary endpoint to verify OTP
 */
router.post("/verify-otp", async (req, res) => {
  const { email, otp, purpose, role } = req.body;

  try {
    if (otp !== "123456") {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    res.json({
      message: "OTP verified successfully",
      email,
      role,
    });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
