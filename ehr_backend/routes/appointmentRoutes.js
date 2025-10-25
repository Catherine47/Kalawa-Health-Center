import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// ✅ Get all appointments
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM appointments ORDER BY appointment_id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get appointment by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM appointments WHERE appointment_id=$1", [id]);
    if (!result.rows.length) return res.status(404).json({ message: "Appointment not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add new appointment
router.post("/", async (req, res) => {
  const { patient_id, doctor_id, appointment_datetime, status } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_datetime, status)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [patient_id, doctor_id, appointment_datetime, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update appointment
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { patient_id, doctor_id, appointment_datetime, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE appointments
       SET patient_id=$1, doctor_id=$2, appointment_datetime=$3, status=$4
       WHERE appointment_id=$5 RETURNING *`,
      [patient_id, doctor_id, appointment_datetime, status, id]
    );

    if (!result.rows.length) return res.status(404).json({ message: "Appointment not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete appointment
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM appointments WHERE appointment_id=$1 RETURNING *", [id]);
    if (!result.rows.length) return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
