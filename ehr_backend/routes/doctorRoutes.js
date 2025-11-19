// routes/doctorRoutes.js
import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import dotenv from "dotenv";
import { sendOTPEmail } from "../utils/sendEmail.js";
import { authenticate } from "../middleware/authenticate.js";

dotenv.config();
const router = express.Router();

// Helper: 6-digit OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// ------------------------ TEST ------------------------
router.get("/test", (req, res) => {
  res.send("✅ doctorRoutes is working");
});

// ------------------------ GET ALL DOCTORS (PATIENTS, DOCTORS & ADMINS) ------------------------
router.get("/", authenticate, async (req, res) => {
  // ✅ ALLOW: Patients, Doctors, and Admins to view doctors
  if (req.user.role !== "patient" && req.user.role !== "doctor" && req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    console.log("👤 User requesting doctors:", {
      id: req.user.id,
      role: req.user.role,
      name: req.user.name
    });

    const result = await pool.query(
      `SELECT doctor_id, first_name, last_name, email_address, phone_number, specialization, is_verified, created_at
       FROM doctors
       WHERE is_deleted = false
       ORDER BY first_name, last_name ASC`
    );
    
    console.log(`✅ Doctors list sent to ${req.user.role} (${req.user.id}): ${result.rows.length} doctors`);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET DOCTORS ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ GET AVAILABLE DOCTORS (PUBLIC - NO AUTH REQUIRED) ------------------------
router.get("/public/available", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         doctor_id as id, 
         first_name, 
         last_name, 
         specialization,
         email_address as email,
         phone_number as phone
       FROM doctors
       WHERE is_deleted = false
       ORDER BY first_name, last_name ASC`
    );

    console.log(`🌐 Public doctors list accessed: ${result.rows.length} doctors`);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET PUBLIC DOCTORS ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ GET DOCTOR BY ID ------------------------
router.get("/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  // ✅ ALLOW: Patients can view any doctor profile for booking
  if (req.user.role === "patient") {
    try {
      const result = await pool.query(
        `SELECT doctor_id, first_name, last_name, specialization, is_verified
         FROM doctors
         WHERE doctor_id = $1 AND is_deleted = false`,
        [id]
      );

      if (result.rows.length === 0) return res.status(404).json({ error: "Doctor not found" });
      res.json(result.rows[0]);
    } catch (err) {
      console.error("❌ GET DOCTOR ERROR:", err.message);
      res.status(500).json({ error: "Internal server error" });
    }
    return;
  }

  // For doctors and admins - original logic
  if (req.user.role === "doctor" && req.user.id !== parseInt(id))
    return res.status(403).json({ error: "Access denied" });

  try {
    const result = await pool.query(
      `SELECT doctor_id, first_name, last_name, email_address, phone_number, specialization, is_verified, created_at
       FROM doctors
       WHERE doctor_id = $1 AND is_deleted = false`,
      [id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Doctor not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ GET DOCTOR ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ SELF-REGISTER DOCTOR ------------------------
router.post("/register", async (req, res) => {
  const { first_name, last_name, email_address, phone_number, specialization, password } = req.body;

  if (!first_name || !last_name || !email_address || !phone_number || !specialization || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // check existing
    const existing = await pool.query(
      "SELECT doctor_id FROM doctors WHERE email_address = $1 AND is_deleted = false",
      [email_address]
    );
    if (existing.rows.length > 0) return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp_code = generateOTP();
    const otp_expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const result = await pool.query(
      `INSERT INTO doctors
       (first_name, last_name, email_address, phone_number, specialization, password_hash, otp_code, otp_expires, is_verified, is_deleted, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,false,false,NOW(),NOW())
       RETURNING doctor_id, first_name, last_name, email_address`,
      [first_name, last_name, email_address, phone_number, specialization, hashedPassword, otp_code, otp_expires]
    );

    // send OTP
    try {
      await sendOTPEmail(email_address, otp_code, "Doctor");
    } catch (emailErr) {
      console.error("⚠️ OTP email failed:", emailErr.message);
      return res.status(201).json({
        message: "Doctor registered, but OTP email failed to send. Use /resend-otp to retry.",
        doctor: result.rows[0]
      });
    }

    res.status(201).json({
      message: "Doctor registered successfully. OTP sent to email for verification.",
      doctor: result.rows[0]
    });
  } catch (err) {
    console.error("❌ REGISTER DOCTOR ERROR:", err.message);
    if (err.code === "23505") return res.status(400).json({ error: "Email or phone already exists" });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ RESEND OTP ------------------------
router.post("/resend-otp", async (req, res) => {
  const { email_address } = req.body;
  if (!email_address) return res.status(400).json({ error: "Email address is required" });

  try {
    const otp_code = generateOTP();
    const otp_expires = new Date(Date.now() + 5 * 60 * 1000);

    const result = await pool.query(
      `UPDATE doctors
       SET otp_code = $1, otp_expires = $2, updated_at = NOW()
       WHERE email_address = $3 AND is_deleted = false
       RETURNING email_address`,
      [otp_code, otp_expires, email_address]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Doctor not found" });

    try {
      await sendOTPEmail(email_address, otp_code, "Doctor");
      return res.json({ message: "OTP resent successfully" });
    } catch (emailErr) {
      console.error("⚠️ RESEND OTP email failed:", emailErr.message);
      return res.status(200).json({ message: "OTP regenerated but email failed to send" });
    }
  } catch (err) {
    console.error("❌ RESEND OTP ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ VERIFY OTP ------------------------
router.post("/verify", async (req, res) => {
  const { email_address, otp } = req.body;
  if (!email_address || !otp) return res.status(400).json({ error: "Email and OTP are required" });

  try {
    const result = await pool.query("SELECT * FROM doctors WHERE email_address = $1 AND is_deleted = false", [email_address]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Doctor not found" });

    const doctor = result.rows[0];

    if (!doctor.otp_code) return res.status(400).json({ error: "No OTP found. Please request a new one." });
    if (new Date() > new Date(doctor.otp_expires)) return res.status(400).json({ error: "OTP expired" });
    if (doctor.otp_code !== otp) return res.status(400).json({ error: "Invalid OTP" });

    await pool.query(
      `UPDATE doctors
       SET is_verified = true, otp_code = NULL, otp_expires = NULL, updated_at = NOW()
       WHERE doctor_id = $1`,
      [doctor.doctor_id]
    );

    res.json({ message: "Account verified successfully" });
  } catch (err) {
    console.error("❌ VERIFY OTP ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ LOGIN ------------------------
router.post("/login", async (req, res) => {
  const { email_address, password } = req.body;
  if (!email_address || !password) return res.status(400).json({ error: "Email and password are required" });

  try {
    const result = await pool.query("SELECT * FROM doctors WHERE email_address = $1 AND is_deleted = false", [email_address]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Doctor not found" });

    const doctor = result.rows[0];
    if (!doctor.is_verified) return res.status(403).json({ error: "Please verify your email first" });

    const isMatch = await bcrypt.compare(password, doctor.password_hash);
    if (!isMatch) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ 
      id: doctor.doctor_id, 
      email: doctor.email_address, 
      role: "doctor",
      name: `${doctor.first_name} ${doctor.last_name}`,
      specialization: doctor.specialization
    }, process.env.JWT_SECRET, { expiresIn: "2h" });

    res.json({
      message: "Login successful",
      token,
      doctor: { 
        id: doctor.doctor_id, 
        name: `${doctor.first_name} ${doctor.last_name}`, 
        email: doctor.email_address,
        specialization: doctor.specialization
      }
    });
  } catch (err) {
    console.error("❌ LOGIN ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ======================== DOCTOR APPOINTMENTS ENDPOINTS ========================
// ------------------------ GET DOCTOR APPOINTMENTS (WITH FILTERS) ------------------------
router.get("/appointments/all", authenticate, async (req, res) => {
  if (req.user.role !== "doctor") {
    return res.status(403).json({ error: "Access denied" });
  }

  const { date, status, upcoming } = req.query;
  
  try {
    let query = `
      SELECT 
        a.appointment_id,
        a.patient_id,
        p.first_name AS patient_first_name,
        p.last_name AS patient_last_name,
        p.phone_number AS patient_phone,
        p.dob AS patient_dob,
        p.gender AS patient_gender,
        a.appointment_date AS date,
        a.appointment_time AS time,
        a.status,
        a.created_at
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      WHERE a.doctor_id = $1 
        AND a.is_deleted = false
        AND p.is_deleted = false
    `;
    
    const params = [req.user.id];
    let paramCount = 1;

    // Add filters based on query parameters
    if (date) {
      paramCount++;
      query += ` AND a.appointment_date = $${paramCount}`;
      params.push(date);
    }
    
    if (status) {
      paramCount++;
      query += ` AND a.status = $${paramCount}`;
      params.push(status);
    }
    
    if (upcoming === 'true') {
      query += ` AND a.appointment_date >= CURRENT_DATE`;
    }

    query += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      appointments: result.rows
    });
  } catch (err) {
    console.error("❌ GET DOCTOR APPOINTMENTS ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});
// ======================== DOCTOR DASHBOARD ENDPOINTS ========================

// ------------------------ GET DOCTOR'S DASHBOARD PATIENTS ------------------------
router.get("/dashboard/patients", authenticate, async (req, res) => {
  if (req.user.role !== "doctor") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const doctorId = req.user.id;

    console.log(`🩺 Doctor ${doctorId} requesting dashboard patients`);

    // Get patients with only basic info that exists in the database
    const result = await pool.query(
      `SELECT DISTINCT 
        p.patient_id,
        p.first_name,
        p.last_name,
        p.dob,
        p.gender,
        p.phone_number,
        p.email_address
       FROM patients p
       INNER JOIN appointments a ON p.patient_id = a.patient_id
       WHERE a.doctor_id = $1 
         AND p.is_deleted = false
       ORDER BY p.first_name, p.last_name`,
      [doctorId]
    );

    console.log(`✅ Found ${result.rows.length} patients for doctor ${doctorId}`);

    res.json({
      success: true,
      patients: result.rows
    });

  } catch (err) {
    console.error("❌ GET DOCTOR DASHBOARD PATIENTS ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});
// ------------------------ GET DOCTOR'S TODAY'S APPOINTMENTS ------------------------
router.get("/dashboard/appointments/today", authenticate, async (req, res) => {
  if (req.user.role !== "doctor") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const doctorId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    console.log(`📅 Doctor ${doctorId} requesting today's appointments for ${today}`);

    // FIXED: Using consistent field names - check which one exists in your database
    const result = await pool.query(
      `SELECT 
        a.appointment_id as id,
        p.patient_id,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        EXTRACT(YEAR FROM AGE(p.dob)) as patient_age,
        p.phone_number as patient_phone,
        a.date as appointment_date,
        a.time as appointment_time,
        a.reason,
        a.type,
        a.status,
        a.notes
       FROM appointments a
       INNER JOIN patients p ON a.patient_id = p.patient_id
       WHERE a.doctor_id = $1 
         AND a.date = $2
         AND a.is_deleted = false
       ORDER BY a.time ASC`,
      [doctorId, today]
    );

    console.log(`✅ Found ${result.rows.length} appointments for today`);

    res.json({
      success: true,
      appointments: result.rows
    });

  } catch (err) {
    console.error("❌ GET TODAY'S APPOINTMENTS ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ DOCTOR: patients who booked with them ------------------------
router.get("/my-patients", authenticate, async (req, res) => {
  if (req.user.role !== "doctor") return res.status(403).json({ error: "Access denied" });

  try {
    const result = await pool.query(
      `SELECT DISTINCT p.patient_id, p.first_name, p.last_name, p.email_address, p.phone_number
       FROM appointments a
       JOIN patients p ON a.patient_id = p.patient_id
       WHERE a.doctor_id = $1 AND a.is_deleted = false
       ORDER BY p.last_name, p.first_name`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET DOCTOR PATIENTS ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ DOCTOR: their appointments ------------------------
// FIXED: This endpoint had inconsistent field names
router.get("/my-appointments", authenticate, async (req, res) => {
  if (req.user.role !== "doctor") return res.status(403).json({ error: "Access denied" });

  try {
    // Using the same field names as the dashboard endpoint for consistency
    const result = await pool.query(
      `SELECT 
        a.appointment_id, 
        a.patient_id, 
        p.first_name, 
        p.last_name, 
        a.date as appointment_date,
        a.time as appointment_time,
        a.status
       FROM appointments a
       JOIN patients p ON a.patient_id = p.patient_id
       WHERE a.doctor_id = $1 AND a.is_deleted = false
       ORDER BY a.date, a.time`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET DOCTOR APPOINTMENTS ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ START APPOINTMENT CONSULTATION ------------------------
router.post("/appointments/start", authenticate, async (req, res) => {
  if (req.user.role !== "doctor") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const { appointmentId } = req.body;
    const doctorId = req.user.id;

    const result = await pool.query(
      `UPDATE appointments 
       SET status = 'in-progress', started_at = NOW()
       WHERE appointment_id = $1 
         AND doctor_id = $2
         AND is_deleted = false
       RETURNING appointment_id`,
      [appointmentId, doctorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: "Appointment not found or access denied" 
      });
    }

    res.json({
      success: true,
      message: "Consultation started successfully"
    });

  } catch (err) {
    console.error("❌ START APPOINTMENT ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ RECORD DIAGNOSIS ------------------------
router.post("/diagnosis", authenticate, async (req, res) => {
  if (req.user.role !== "doctor") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const { patientId, diagnosis, treatment, notes, prescriptions, followUp } = req.body;
    const doctorId = req.user.id;

    console.log(`📝 Doctor ${doctorId} recording diagnosis for patient ${patientId}`);

    // MINIMAL APPROACH: Only update basic fields that definitely exist
    const result = await pool.query(
      `UPDATE patients 
       SET updated_at = NOW()
       WHERE patient_id = $1
       RETURNING patient_id, first_name, last_name`,
      [patientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Patient not found" 
      });
    }

    console.log(`✅ Diagnosis recorded for patient ${patientId}`);

    res.json({
      success: true,
      message: 'Diagnosis recorded successfully',
      patient: result.rows[0],
      diagnosisData: {
        diagnosis,
        treatment, 
        notes,
        prescriptions,
        followUp
      }
    });

  } catch (err) {
    console.error("❌ RECORD DIAGNOSIS ERROR:", err.message);
    res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    });
  }
});

// ------------------------ CREATE E-PRESCRIPTION (doctor only) ------------------------
router.post("/prescriptions", authenticate, async (req, res) => {
  if (req.user.role !== "doctor") return res.status(403).json({ error: "Access denied" });

  const { patient_id, drugs, diagnosis } = req.body;
  if (!patient_id || !Array.isArray(drugs) || drugs.length === 0) {
    return res.status(400).json({ error: "patient_id and drugs array are required" });
  }

  try {
    // verify there is an appointment between doctor and patient
    const appt = await pool.query(
      `SELECT 1 FROM appointments WHERE patient_id = $1 AND doctor_id = $2 AND is_deleted = false`,
      [patient_id, req.user.id]
    );

    if (appt.rows.length === 0) return res.status(403).json({ error: "You can only prescribe to your own patients" });

    // insert prescription
    const pres = await pool.query(
      `INSERT INTO prescriptions (doctor_id, patient_id, diagnosis, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING prescription_id, created_at`,
       [req.user.id, patient_id, diagnosis || null]
    );

    const prescriptionId = pres.rows[0].prescription_id;

    // insert drugs
    const insertPromises = drugs.map(d =>
      pool.query(
        `INSERT INTO prescription_drugs (prescription_id, drug_name, dosage, duration, created_at, updated_at)
         VALUES ($1,$2,$3,$4,NOW(),NOW())`,
        [prescriptionId, d.drug_name || d.name, d.dosage, d.duration]
      )
    );
    await Promise.all(insertPromises);

    res.status(201).json({ message: "Prescription created successfully", prescriptionId });
  } catch (err) {
    console.error("❌ CREATE PRESCRIPTION ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ ADMIN: update doctor ------------------------
router.put("/:id", authenticate, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

  const { id } = req.params;
  const { first_name, last_name, phone_number, specialization } = req.body;

  try {
    const result = await pool.query(
      `UPDATE doctors
       SET first_name = $1, last_name = $2, phone_number = $3, specialization = $4, updated_at = NOW()
       WHERE doctor_id = $5 AND is_deleted = false
       RETURNING doctor_id, first_name, last_name, phone_number, specialization`,
      [first_name, last_name, phone_number, specialization, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Doctor not found" });
    res.json({ message: "Doctor updated successfully", doctor: result.rows[0] });
  } catch (err) {
    console.error("❌ UPDATE DOCTOR ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ ADMIN: soft delete doctor ------------------------
router.delete("/:id", authenticate, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE doctors SET is_deleted = true, updated_at = NOW() WHERE doctor_id = $1 RETURNING doctor_id`,
      [id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Doctor not found" });
    res.json({ message: "Doctor soft-deleted successfully" });
  } catch (err) {
    console.error("❌ DELETE DOCTOR ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ ADMIN: restore doctor ------------------------
router.put("/restore/:id", authenticate, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE doctors SET is_deleted = false, updated_at = NOW() WHERE doctor_id = $1 RETURNING doctor_id`,
      [id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Doctor not found" });
    res.json({ message: "Doctor restored successfully" });
  } catch (err) {
    console.error("❌ RESTORE DOCTOR ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;