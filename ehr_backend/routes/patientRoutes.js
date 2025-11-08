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

// ✅ Generate random 6-digit OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// ------------------------ GET ALL PATIENTS (ADMIN ONLY) ------------------------
router.get("/", authenticate, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Access denied" });

  try {
    const result = await pool.query(
      `SELECT patient_id, first_name, last_name, email_address, phone_number 
       FROM patients WHERE is_deleted = false`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET PATIENTS ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ GET PATIENT BY ID ------------------------
router.get("/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  // Patients can only view their own profile
  if (req.user.role === "patient" && req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const result = await pool.query(
      `SELECT patient_id, first_name, last_name, email_address, phone_number 
       FROM patients WHERE patient_id = $1 AND is_deleted = false`,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Patient not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ GET PATIENT ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ REGISTER PATIENT ------------------------
router.post("/register", async (req, res) => {
  const {
    first_name,
    last_name,
    dob,
    gender,
    email_address,
    phone_number,
    password,
  } = req.body;

  if (
    !first_name ||
    !last_name ||
    !dob ||
    !gender ||
    !email_address ||
    !phone_number ||
    !password
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const existing = await pool.query(
      "SELECT email_address FROM patients WHERE email_address = $1 AND is_deleted = false",
      [email_address]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp_code = generateOTP();
    const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    const result = await pool.query(
      `INSERT INTO patients 
      (first_name, last_name, dob, gender, email_address, phone_number, password_hash, otp_code, otp_expires_at, is_verified, is_deleted, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,false,false,NOW(),NOW())
      RETURNING patient_id, first_name, last_name, email_address`,
      [
        first_name,
        last_name,
        dob,
        gender,
        email_address,
        phone_number,
        hashedPassword,
        otp_code,
        otp_expires_at,
      ]
    );

    try {
      await sendOTPEmail(email_address, otp_code, "Patient");
      console.log(`📧 OTP sent successfully to ${email_address}`);
    } catch (emailError) {
      console.error("⚠️ OTP email failed:", emailError.message);
      return res.status(201).json({
        message:
          "Registration successful, but OTP email failed to send. Use 'Resend OTP' to try again.",
        patient: {
          id: result.rows[0].patient_id,
          name: `${result.rows[0].first_name} ${result.rows[0].last_name}`,
          email: result.rows[0].email_address,
        },
      });
    }

    res.status(201).json({
      message: "Registration successful. OTP sent to email.",
      patient: {
        id: result.rows[0].patient_id,
        name: `${result.rows[0].first_name} ${result.rows[0].last_name}`,
        email: result.rows[0].email_address,
      },
    });
  } catch (err) {
    console.error("❌ REGISTER PATIENT ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ RESEND OTP ------------------------
router.post("/resend-otp", async (req, res) => {
  const { email_address } = req.body;
  if (!email_address)
    return res.status(400).json({ error: "Email address is required" });

  try {
    const otp_code = generateOTP();
    const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);

    const result = await pool.query(
      `UPDATE patients 
       SET otp_code = $1, otp_expires_at = $2 
       WHERE email_address = $3 AND is_deleted = false
       RETURNING email_address`,
      [otp_code, otp_expires_at, email_address]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Patient not found" });

    try {
      await sendOTPEmail(email_address, otp_code, "Patient");
      res.status(200).json({ message: "OTP resent successfully" });
    } catch (emailError) {
      console.error("⚠️ RESEND OTP email failed:", emailError.message);
      res.status(200).json({
        message:
          "OTP regenerated but email failed to send. Please try again later.",
      });
    }
  } catch (err) {
    console.error("❌ RESEND OTP ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ VERIFY OTP ------------------------
router.post("/verify", async (req, res) => {
  const { email_address, otp } = req.body;
  if (!email_address || !otp)
    return res.status(400).json({ error: "Email and OTP are required" });

  try {
    const result = await pool.query(
      "SELECT * FROM patients WHERE email_address = $1 AND is_deleted = false",
      [email_address]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Patient not found" });

    const patient = result.rows[0];
    if (new Date() > new Date(patient.otp_expires_at))
      return res.status(400).json({ error: "OTP expired" });
    if (patient.otp_code !== otp)
      return res.status(400).json({ error: "Invalid OTP" });

    await pool.query(
      "UPDATE patients SET is_verified = true, otp_code = NULL, otp_expires_at = NULL WHERE email_address = $1",
      [email_address]
    );

    res.status(200).json({ message: "Account verified successfully" });
  } catch (err) {
    console.error("❌ VERIFY OTP ERROR:", err.message);
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
      "SELECT * FROM patients WHERE email_address = $1 AND is_deleted = false",
      [email_address]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Patient not found" });

    const patient = result.rows[0];
    if (!patient.is_verified)
      return res.status(403).json({ error: "Please verify your email first" });

    const isMatch = await bcrypt.compare(password, patient.password_hash);
    if (!isMatch) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      {
        id: patient.patient_id,
        email: patient.email_address,
        role: "patient",
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      patient: {
        id: patient.patient_id,
        name: `${patient.first_name} ${patient.last_name}`,
        email: patient.email_address,
      },
    });
  } catch (err) {
    console.error("❌ LOGIN ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ PATIENT APPOINTMENTS ------------------------
router.get("/:id/appointments", authenticate, async (req, res) => {
  const { id } = req.params;

  if (req.user.role === "patient" && req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const result = await pool.query(
      `SELECT a.appointment_id, a.doctor_id, d.first_name AS doctor_first_name, d.last_name AS doctor_last_name, a.date, a.time, a.status
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.doctor_id
       WHERE a.patient_id = $1 AND a.is_deleted = false
       ORDER BY a.date, a.time`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET PATIENT APPOINTMENTS ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ PATIENT PRESCRIPTIONS ------------------------
router.get("/:id/prescriptions", authenticate, async (req, res) => {
  const { id } = req.params;

  if (req.user.role === "patient" && req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const result = await pool.query(
      `SELECT pr.prescription_id, pr.doctor_id, d.first_name AS doctor_first_name, d.last_name AS doctor_last_name, pr.created_at
       FROM prescriptions pr
       JOIN doctors d ON pr.doctor_id = d.doctor_id
       WHERE pr.patient_id = $1
       ORDER BY pr.created_at DESC`,
      [id]
    );

    // Get drugs for each prescription
    const prescriptions = await Promise.all(
      result.rows.map(async (pr) => {
        const drugsRes = await pool.query(
          `SELECT drug_name, dosage, duration 
           FROM prescription_drugs 
           WHERE prescription_id = $1`,
          [pr.prescription_id]
        );
        return { ...pr, drugs: drugsRes.rows };
      })
    );

    res.json(prescriptions);
  } catch (err) {
    console.error("❌ GET PATIENT PRESCRIPTIONS ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ UPDATE PATIENT (ADMIN ONLY) ------------------------
router.put("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, phone_number } = req.body;

  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Access denied: Admins only" });

  try {
    const result = await pool.query(
      `UPDATE patients SET first_name = $1, last_name = $2, phone_number = $3, updated_at = NOW()
       WHERE patient_id = $4 AND is_deleted = false 
       RETURNING patient_id, first_name, last_name, phone_number`,
      [first_name, last_name, phone_number, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Patient not found" });

    res.json({
      message: "Patient updated successfully",
      patient: result.rows[0],
    });
  } catch (err) {
    console.error("❌ UPDATE PATIENT ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ SOFT DELETE PATIENT (ADMIN ONLY) ------------------------
router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Access denied: Admins only" });

  try {
    const result = await pool.query(
      "UPDATE patients SET is_deleted = true, updated_at = NOW() WHERE patient_id = $1 RETURNING patient_id",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Patient not found" });

    res.json({ message: "Patient soft-deleted successfully" });
  } catch (err) {
    console.error("❌ DELETE PATIENT ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ RESTORE PATIENT (ADMIN ONLY) ------------------------
router.put("/restore/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Access denied: Admins only" });

  try {
    const result = await pool.query(
      "UPDATE patients SET is_deleted = false, updated_at = NOW() WHERE patient_id = $1 RETURNING patient_id",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Patient not found" });

    res.json({ message: "Patient restored successfully" });
  } catch (err) {
    console.error("❌ RESTORE PATIENT ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
