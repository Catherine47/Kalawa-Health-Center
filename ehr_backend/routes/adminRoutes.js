import express from "express";
import { pool } from "../db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendOTPEmail } from "../utils/sendEmail.js";
import { authenticate } from "../middleware/authenticate.js";

dotenv.config();
const router = express.Router();

// ------------------------ HELPER FUNCTION ------------------------
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// ------------------------ TEST ROUTE ------------------------
router.get("/test", (req, res) => {
  res.send("✅ Admin routes with OTP, email verification, CRUD, user management, and reports are working correctly!");
});

// ------------------------ GET ALL ADMINS ------------------------
router.get("/", authenticate, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

  try {
    const result = await pool.query(
      `SELECT admin_id, first_name, last_name, username, email_address, is_verified, created_at
       FROM admins
       WHERE deleted_at IS NULL
       ORDER BY admin_id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching admins:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ REGISTER ADMIN ------------------------
router.post("/register", async (req, res) => {
  const { first_name, last_name, username, password, email_address } = req.body;

  if (!first_name || !last_name || !username || !password || !email_address) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp_code = generateOTP();

    const result = await pool.query(
      `INSERT INTO admins 
        (first_name, last_name, username, password, email_address, otp_code, is_verified, deleted_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, FALSE, NULL, NOW(), NOW())
       RETURNING admin_id, first_name, last_name, email_address, is_verified`,
      [first_name, last_name, username, hashedPassword, email_address, otp_code]
    );

    await sendOTPEmail(email_address, otp_code, "Admin");

    res.status(201).json({
      message: "✅ Admin registered successfully. OTP sent to email.",
      admin: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error registering admin:", err.message);
    if (err.code === "23505") {
      res.status(400).json({ error: "Email or username already exists" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// ------------------------ RESEND OTP ------------------------
router.post("/resend-otp", async (req, res) => {
  const { email_address } = req.body;
  if (!email_address) return res.status(400).json({ error: "Email is required" });

  try {
    const result = await pool.query(
      "SELECT admin_id FROM admins WHERE email_address = $1 AND deleted_at IS NULL",
      [email_address]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Admin not found" });

    const otp_code = generateOTP();
    await pool.query(
      "UPDATE admins SET otp_code = $1, updated_at = NOW() WHERE email_address = $2",
      [otp_code, email_address]
    );

    await sendOTPEmail(email_address, otp_code, "Admin");

    res.json({ message: "✅ OTP resent successfully" });
  } catch (err) {
    console.error("❌ Error resending OTP:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ VERIFY OTP ------------------------
router.post("/verify-otp", async (req, res) => {
  const { email_address, otp_code } = req.body;
  if (!email_address || !otp_code)
    return res.status(400).json({ error: "Email and OTP are required" });

  try {
    const result = await pool.query(
      "SELECT * FROM admins WHERE email_address = $1 AND deleted_at IS NULL",
      [email_address]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Admin not found" });

    const admin = result.rows[0];
    if (admin.is_verified)
      return res.json({ message: "Admin already verified." });

    if (admin.otp_code !== otp_code)
      return res.status(400).json({ error: "Invalid OTP" });

    await pool.query(
      "UPDATE admins SET is_verified = TRUE, otp_code = NULL, updated_at = NOW() WHERE admin_id = $1",
      [admin.admin_id]
    );

    res.json({ message: "✅ Admin verified successfully!" });
  } catch (err) {
    console.error("❌ Error verifying OTP:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ LOGIN ------------------------
router.post("/login", async (req, res) => {
  const { email_address, password } = req.body;
  if (!email_address || !password)
    return res.status(400).json({ error: "Email and password are required" });

  try {
    const result = await pool.query(
      "SELECT * FROM admins WHERE email_address = $1 AND deleted_at IS NULL",
      [email_address]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Admin not found" });

    const admin = result.rows[0];
    if (!admin.is_verified)
      return res.status(403).json({ error: "Please verify your email first" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      { id: admin.admin_id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "✅ Login successful",
      token,
      admin: {
        id: admin.admin_id,
        first_name: admin.first_name,
        last_name: admin.last_name,
        email_address: admin.email_address,
      },
    });
  } catch (err) {
    console.error("❌ Error logging in:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ UPDATE ADMIN ------------------------
router.put("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, username, password, email_address } = req.body;

  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Access denied" });

  try {
    const existing = await pool.query(
      "SELECT * FROM admins WHERE admin_id = $1 AND deleted_at IS NULL",
      [id]
    );
    if (existing.rows.length === 0)
      return res.status(404).json({ error: "Admin not found" });

    let hashedPassword = existing.rows[0].password;
    if (password && password.trim() !== "")
      hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `UPDATE admins
       SET first_name = $1, last_name = $2, username = $3, password = $4, email_address = $5, updated_at = NOW()
       WHERE admin_id = $6
       RETURNING admin_id, first_name, last_name, username, email_address, updated_at`,
      [first_name, last_name, username, hashedPassword, email_address, id]
    );

    res.json({ message: "✅ Admin updated successfully", admin: result.rows[0] });
  } catch (err) {
    console.error("❌ Error updating admin:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ SOFT DELETE ADMIN ------------------------
router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Access denied" });

  try {
    const result = await pool.query(
      "UPDATE admins SET deleted_at = NOW() WHERE admin_id = $1 AND deleted_at IS NULL RETURNING admin_id",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Admin not found or already deleted" });

    res.json({ message: "✅ Admin soft-deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting admin:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ RESTORE ADMIN ------------------------
router.put("/restore/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Access denied" });

  try {
    const result = await pool.query(
      "UPDATE admins SET deleted_at = NULL, updated_at = NOW() WHERE admin_id = $1 AND deleted_at IS NOT NULL RETURNING admin_id",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Admin not found or not deleted" });

    res.json({ message: "✅ Admin restored successfully" });
  } catch (err) {
    console.error("❌ Error restoring admin:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ MANAGE PATIENT ACCOUNTS ------------------------
router.get("/patients", authenticate, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

  try {
    const result = await pool.query(
      "SELECT patient_id, first_name, last_name, email_address, phone_number, is_verified, created_at FROM patients WHERE is_deleted = false"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET PATIENTS ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ MANAGE DOCTOR ACCOUNTS ------------------------
router.get("/doctors", authenticate, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

  try {
    const result = await pool.query(
      "SELECT doctor_id, first_name, last_name, email_address, phone_number, specialization, is_verified, created_at FROM doctors WHERE is_deleted = false"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET DOCTORS ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ SYSTEM REPORTS ------------------------
router.get("/reports/summary", authenticate, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

  try {
    const [patientCount, doctorCount, appointmentCount] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM patients WHERE is_deleted = false"),
      pool.query("SELECT COUNT(*) FROM doctors WHERE is_deleted = false"),
      pool.query("SELECT COUNT(*) FROM appointments") // assumes appointments table
    ]);

    res.json({
      total_patients: parseInt(patientCount.rows[0].count),
      total_doctors: parseInt(doctorCount.rows[0].count),
      total_appointments: parseInt(appointmentCount.rows[0].count),
    });
  } catch (err) {
    console.error("❌ GET REPORTS ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
