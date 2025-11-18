import express from "express";
import { pool } from "../db.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// ------------------------ GET ALL APPOINTMENTS ------------------------
router.get("/", authenticate, async (req, res) => {
  try {
    let result;
    if (req.user.role === "doctor") {
      result = await pool.query(
        `SELECT * FROM appointments
         WHERE doctor_id = $1 AND deleted_at IS NULL
         ORDER BY appointment_date ASC, appointment_time ASC`,
        [req.user.id]
      );
    } else if (req.user.role === "patient") {
      result = await pool.query(
        `SELECT * FROM appointments
         WHERE patient_id = $1 AND deleted_at IS NULL
         ORDER BY appointment_date ASC, appointment_time ASC`,
        [req.user.id]
      );
    } else {
      result = await pool.query(
        `SELECT * FROM appointments
         WHERE deleted_at IS NULL
         ORDER BY appointment_date ASC, appointment_time ASC`
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET APPOINTMENTS ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ GET PATIENT'S APPOINTMENTS ------------------------
router.get("/my", authenticate, async (req, res) => {
  if (req.user.role !== "patient") return res.status(403).json({ error: "Access denied" });
  try {
    const result = await pool.query(
      `SELECT * FROM appointments
       WHERE patient_id = $1 AND deleted_at IS NULL
       ORDER BY appointment_date ASC, appointment_time ASC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET MY APPOINTMENTS ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ GET APPOINTMENT BY ID ------------------------
router.get("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM appointments WHERE appointment_id = $1 AND deleted_at IS NULL`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Appointment not found" });

    const appointment = result.rows[0];

    if (
      (req.user.role === "doctor" && appointment.doctor_id !== req.user.id) ||
      (req.user.role === "patient" && appointment.patient_id !== req.user.id)
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(appointment);
  } catch (err) {
    console.error("❌ GET APPOINTMENT ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ CREATE APPOINTMENT ------------------------
router.post("/", authenticate, async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time, status } = req.body;
    
    console.log("📥 Received appointment data:", req.body);
    
    // ✅ FIXED: Handle patient ID based on user role
    let finalPatientId;
    if (req.user.role === "patient") {
      finalPatientId = req.user.id;
    } else if (req.user.role === "admin" && patient_id) {
      finalPatientId = patient_id;
    } else {
      return res.status(400).json({ error: "Patient ID is required" });
    }

    // ✅ FIXED: Validation for required fields
    if (!doctor_id) return res.status(400).json({ error: "Doctor ID is required" });
    if (!appointment_date) return res.status(400).json({ error: "Appointment date is required" });
    if (!appointment_time) return res.status(400).json({ error: "Appointment time is required" });

    // ✅ FIXED: Check doctor conflict (using separate date and time fields)
    const doctorConflict = await pool.query(
      `SELECT * FROM appointments
       WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND deleted_at IS NULL`,
      [doctor_id, appointment_date, appointment_time]
    );
    if (doctorConflict.rows.length > 0) {
      return res.status(400).json({ error: "Doctor already has an appointment at this time" });
    }

    // ✅ FIXED: Check patient conflict (using separate date and time fields)
    const patientConflict = await pool.query(
      `SELECT * FROM appointments
       WHERE patient_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND deleted_at IS NULL`,
      [finalPatientId, appointment_date, appointment_time]
    );
    if (patientConflict.rows.length > 0) {
      return res.status(400).json({ error: "You already have an appointment at this time" });
    }

    // ✅ FIXED: Use the correct database structure with separate date/time
    const result = await pool.query(
      `INSERT INTO appointments 
       (patient_id, doctor_id, appointment_date, appointment_time, status) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        finalPatientId,
        doctor_id,
        appointment_date,  // ✅ Now matches database column
        appointment_time,  // ✅ Now matches database column
        status || 'scheduled'
      ]
    );
    
    console.log("✅ Appointment created successfully:", result.rows[0]);
    res.status(201).json({ 
      message: "Appointment created successfully", 
      appointment: result.rows[0] 
    });
    
  } catch (error) {
    console.error("❌ CREATE APPOINTMENT ERROR:", error.message);
    
    // ✅ ADDED: More specific error handling
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({ error: "Invalid doctor or patient ID" });
    }
    if (error.code === '22007') { // Invalid datetime format
      return res.status(400).json({ error: "Invalid date/time format. Use YYYY-MM-DD for date and HH:MM:SS for time" });
    }
    if (error.code === '23502') { // Not null violation
      return res.status(400).json({ error: "Required field is missing" });
    }
    
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ UPDATE APPOINTMENT ------------------------
router.put("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { patient_id, doctor_id, appointment_date, appointment_time, status } = req.body;

  // ✅ FIXED: Validation for required fields
  if (!patient_id || !doctor_id || !appointment_date || !appointment_time || !status) {
    return res.status(400).json({ 
      error: "All fields (patient_id, doctor_id, appointment_date, appointment_time, status) are required" 
    });
  }

  try {
    const existing = await pool.query(
      `SELECT * FROM appointments WHERE appointment_id = $1 AND deleted_at IS NULL`,
      [id]
    );
    if (existing.rows.length === 0) return res.status(404).json({ error: "Appointment not found" });

    const appointment = existing.rows[0];

    if (req.user.role === "patient")
      return res.status(403).json({ error: "Patients cannot update appointments" });

    // ✅ FIXED: Check conflicts using separate date and time fields
    if (appointment.appointment_date !== appointment_date || appointment.appointment_time !== appointment_time) {
      const doctorConflict = await pool.query(
        `SELECT * FROM appointments
         WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3 
         AND appointment_id != $4 AND deleted_at IS NULL`,
        [doctor_id, appointment_date, appointment_time, id]
      );
      if (doctorConflict.rows.length > 0)
        return res.status(400).json({ error: "Doctor already has an appointment at this time" });

      const patientConflict = await pool.query(
        `SELECT * FROM appointments
         WHERE patient_id = $1 AND appointment_date = $2 AND appointment_time = $3 
         AND appointment_id != $4 AND deleted_at IS NULL`,
        [patient_id, appointment_date, appointment_time, id]
      );
      if (patientConflict.rows.length > 0)
        return res.status(400).json({ error: "Patient already has an appointment at this time" });
    }

    // ✅ FIXED: Update using separate date and time fields
    const result = await pool.query(
      `UPDATE appointments
       SET patient_id = $1, doctor_id = $2, appointment_date = $3, 
           appointment_time = $4, status = $5, updated_at = NOW()
       WHERE appointment_id = $6
       RETURNING *`,
      [patient_id, doctor_id, appointment_date, appointment_time, status, id]
    );

    res.json({ 
      message: "Appointment updated successfully", 
      appointment: result.rows[0] 
    });
  } catch (err) {
    console.error("❌ UPDATE APPOINTMENT ERROR:", err.message);
    
    // ✅ ADDED: More specific error handling
    if (err.code === '23503') { // Foreign key violation
      return res.status(400).json({ error: "Invalid doctor or patient ID" });
    }
    if (err.code === '22007') { // Invalid datetime format
      return res.status(400).json({ error: "Invalid date/time format" });
    }
    
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ SOFT DELETE ------------------------
router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    // Check if user has permission to delete this appointment
    const existing = await pool.query(
      `SELECT * FROM appointments WHERE appointment_id = $1 AND deleted_at IS NULL`,
      [id]
    );
    
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Appointment not found or already deleted" });
    }

    const appointment = existing.rows[0];
    
    // Only allow patients to delete their own appointments, doctors their own, admins any
    if (req.user.role === "patient" && appointment.patient_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }
    if (req.user.role === "doctor" && appointment.doctor_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const result = await pool.query(
      `UPDATE appointments
       SET deleted_at = NOW()
       WHERE appointment_id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Appointment not found or already deleted" });

    res.json({ message: "Appointment soft-deleted successfully" });
  } catch (err) {
    console.error("❌ DELETE APPOINTMENT ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ RESTORE ------------------------
router.put("/restore/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    // Authorization check for restore operation
    const existing = await pool.query(
      `SELECT * FROM appointments WHERE appointment_id = $1 AND deleted_at IS NOT NULL`,
      [id]
    );
    
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Appointment not found or not deleted" });
    }

    const appointment = existing.rows[0];
    
    // Only allow admins or the involved doctor/patient to restore
    if (req.user.role === "patient" && appointment.patient_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }
    if (req.user.role === "doctor" && appointment.doctor_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const result = await pool.query(
      `UPDATE appointments
       SET deleted_at = NULL, updated_at = NOW()
       WHERE appointment_id = $1 AND deleted_at IS NOT NULL
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Appointment not found or not deleted" });

    res.json({ 
      message: "Appointment restored successfully", 
      appointment: result.rows[0] 
    });
  } catch (err) {
    console.error("❌ RESTORE APPOINTMENT ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ GET APPOINTMENTS BY STATUS ------------------------
router.get("/status/:status", authenticate, async (req, res) => {
  const { status } = req.params;
  
  try {
    let result;
    if (req.user.role === "doctor") {
      result = await pool.query(
        `SELECT * FROM appointments
         WHERE doctor_id = $1 AND status = $2 AND deleted_at IS NULL
         ORDER BY appointment_date ASC, appointment_time ASC`,
        [req.user.id, status]
      );
    } else if (req.user.role === "patient") {
      result = await pool.query(
        `SELECT * FROM appointments
         WHERE patient_id = $1 AND status = $2 AND deleted_at IS NULL
         ORDER BY appointment_date ASC, appointment_time ASC`,
        [req.user.id, status]
      );
    } else {
      result = await pool.query(
        `SELECT * FROM appointments
         WHERE status = $1 AND deleted_at IS NULL
         ORDER BY appointment_date ASC, appointment_time ASC`,
        [status]
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET APPOINTMENTS BY STATUS ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ GET UPCOMING APPOINTMENTS COUNT ------------------------
router.get("/stats/upcoming", authenticate, async (req, res) => {
  try {
    let result;
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD
    
    if (req.user.role === "doctor") {
      result = await pool.query(
        `SELECT COUNT(*) as upcoming_count
         FROM appointments 
         WHERE doctor_id = $1 
         AND appointment_date >= $2 
         AND deleted_at IS NULL
         AND status != 'cancelled'`,
        [req.user.id, today]
      );
    } else if (req.user.role === "patient") {
      result = await pool.query(
        `SELECT COUNT(*) as upcoming_count
         FROM appointments 
         WHERE patient_id = $1 
         AND appointment_date >= $2 
         AND deleted_at IS NULL
         AND status != 'cancelled'`,
        [req.user.id, today]
      );
    } else {
      result = await pool.query(
        `SELECT COUNT(*) as upcoming_count
         FROM appointments 
         WHERE appointment_date >= $1 
         AND deleted_at IS NULL
         AND status != 'cancelled'`,
        [today]
      );
    }
    
    res.json({ upcomingAppointments: parseInt(result.rows[0].upcoming_count) });
  } catch (err) {
    console.error("❌ GET UPCOMING APPOINTMENTS COUNT ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

