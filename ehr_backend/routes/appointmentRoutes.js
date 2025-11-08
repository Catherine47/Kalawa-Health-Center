import express from "express";
import { pool } from "../db.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// ------------------------ GET ALL ACTIVE APPOINTMENTS ------------------------
router.get("/", authenticate, async (req, res) => {
  try {
    let result;
    if (req.user.role === "doctor") {
      // Doctor sees only their appointments
      result = await pool.query(
        `SELECT * FROM appointments
         WHERE doctor_id = $1 AND deleted_at IS NULL
         ORDER BY appointment_datetime ASC`,
        [req.user.id]
      );
    } else if (req.user.role === "patient") {
      // Patient sees only their appointments
      result = await pool.query(
        `SELECT * FROM appointments
         WHERE patient_id = $1 AND deleted_at IS NULL
         ORDER BY appointment_datetime ASC`,
        [req.user.id]
      );
    } else {
      // Admin sees all appointments
      result = await pool.query(
        `SELECT * FROM appointments
         WHERE deleted_at IS NULL
         ORDER BY appointment_datetime ASC`
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET APPOINTMENTS ERROR:", err.message);
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
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Appointment not found" });

    const appointment = result.rows[0];

    // Access control
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
  const { patient_id, doctor_id, appointment_datetime, status } = req.body;

  if (!patient_id || !doctor_id || !appointment_datetime || !status)
    return res.status(400).json({ error: "All fields are required" });

  // Patients can only book for themselves
  if (req.user.role === "patient" && patient_id !== req.user.id)
    return res.status(403).json({ error: "Patients can only book for themselves" });

  try {
    // Check doctor conflict
    const doctorConflict = await pool.query(
      `SELECT * FROM appointments
       WHERE doctor_id = $1 AND appointment_datetime = $2 AND deleted_at IS NULL`,
      [doctor_id, appointment_datetime]
    );
    if (doctorConflict.rows.length > 0)
      return res.status(400).json({ error: "Doctor already has an appointment at this time" });

    // Check patient conflict
    const patientConflict = await pool.query(
      `SELECT * FROM appointments
       WHERE patient_id = $1 AND appointment_datetime = $2 AND deleted_at IS NULL`,
      [patient_id, appointment_datetime]
    );
    if (patientConflict.rows.length > 0)
      return res.status(400).json({ error: "You already have an appointment at this time" });

    const result = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_datetime, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [patient_id, doctor_id, appointment_datetime, status]
    );

    res.status(201).json({ message: "Appointment created successfully", appointment: result.rows[0] });
  } catch (err) {
    console.error("❌ CREATE APPOINTMENT ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ UPDATE APPOINTMENT ------------------------
router.put("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { patient_id, doctor_id, appointment_datetime, status } = req.body;

  try {
    const existing = await pool.query(
      `SELECT * FROM appointments WHERE appointment_id = $1 AND deleted_at IS NULL`,
      [id]
    );
    if (existing.rows.length === 0)
      return res.status(404).json({ error: "Appointment not found" });

    const appointment = existing.rows[0];

    // Patients cannot update
    if (req.user.role === "patient")
      return res.status(403).json({ error: "Patients cannot update appointments" });

    // Check doctor conflict if datetime changed
    if (appointment.appointment_datetime !== appointment_datetime) {
      const doctorConflict = await pool.query(
        `SELECT * FROM appointments
         WHERE doctor_id = $1 AND appointment_datetime = $2 AND appointment_id != $3 AND deleted_at IS NULL`,
        [doctor_id, appointment_datetime, id]
      );
      if (doctorConflict.rows.length > 0)
        return res.status(400).json({ error: "Doctor already has an appointment at this time" });

      const patientConflict = await pool.query(
        `SELECT * FROM appointments
         WHERE patient_id = $1 AND appointment_datetime = $2 AND appointment_id != $3 AND deleted_at IS NULL`,
        [patient_id, appointment_datetime, id]
      );
      if (patientConflict.rows.length > 0)
        return res.status(400).json({ error: "Patient already has an appointment at this time" });
    }

    const result = await pool.query(
      `UPDATE appointments
       SET patient_id = $1, doctor_id = $2, appointment_datetime = $3, status = $4, updated_at = NOW()
       WHERE appointment_id = $5
       RETURNING *`,
      [patient_id, doctor_id, appointment_datetime, status, id]
    );

    res.json({ message: "Appointment updated successfully", appointment: result.rows[0] });
  } catch (err) {
    console.error("❌ UPDATE APPOINTMENT ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ SOFT DELETE APPOINTMENT ------------------------
router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
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

// ------------------------ RESTORE SOFT-DELETED APPOINTMENT ------------------------
router.put("/restore/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE appointments
       SET deleted_at = NULL, updated_at = NOW()
       WHERE appointment_id = $1 AND deleted_at IS NOT NULL
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Appointment not found or not deleted" });

    res.json({ message: "Appointment restored successfully", appointment: result.rows[0] });
  } catch (err) {
    console.error("❌ RESTORE APPOINTMENT ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
