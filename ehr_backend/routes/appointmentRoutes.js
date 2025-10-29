import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// ✅ Get all active appointments
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT appointment_id, patient_id, doctor_id, appointment_datetime, status, created_at, updated_at
       FROM appointments
       WHERE deleted_at IS NULL
       ORDER BY appointment_id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching appointments:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get appointment by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT appointment_id, patient_id, doctor_id, appointment_datetime, status, created_at, updated_at
       FROM appointments
       WHERE appointment_id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Appointment not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching appointment:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Add new appointment (with validation)
router.post("/", async (req, res) => {
  const { patient_id, doctor_id, appointment_datetime, status } = req.body;

  // Validate required fields
  if (!patient_id || !doctor_id || !appointment_datetime || !status) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_datetime, status)
       VALUES ($1, $2, $3, $4)
       RETURNING appointment_id, patient_id, doctor_id, appointment_datetime, status, created_at`,
      [patient_id, doctor_id, appointment_datetime, status]
    );

    res.status(201).json({
      message: "Appointment created successfully",
      appointment: result.rows[0],
    });
  } catch (err) {
    console.error("Error adding appointment:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Update appointment (with soft delete check)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { patient_id, doctor_id, appointment_datetime, status } = req.body;

  try {
    // Check if appointment exists
    const existing = await pool.query(
      "SELECT * FROM appointments WHERE appointment_id = $1 AND deleted_at IS NULL",
      [id]
    );
    if (existing.rows.length === 0)
      return res.status(404).json({ message: "Appointment not found" });

    const result = await pool.query(
      `UPDATE appointments
       SET patient_id = $1,
           doctor_id = $2,
           appointment_datetime = $3,
           status = $4,
           updated_at = NOW()
       WHERE appointment_id = $5
       RETURNING appointment_id, patient_id, doctor_id, appointment_datetime, status, updated_at`,
      [patient_id, doctor_id, appointment_datetime, status, id]
    );

    res.json({
      message: "Appointment updated successfully",
      appointment: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating appointment:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Soft delete appointment
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE appointments
       SET deleted_at = NOW()
       WHERE appointment_id = $1 AND deleted_at IS NULL
       RETURNING appointment_id`,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Appointment not found or already deleted" });

    res.json({ message: "Appointment soft-deleted successfully" });
  } catch (err) {
    console.error("Error deleting appointment:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
