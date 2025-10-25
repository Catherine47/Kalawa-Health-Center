import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// ✅ Get all prescriptions
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM prescriptions ORDER BY prescription_id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get prescription by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM prescriptions WHERE prescription_id=$1", [id]);
    if (!result.rows.length)
      return res.status(404).json({ message: "Prescription not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add new prescription
router.post("/", async (req, res) => {
  const { patient_id, doctor_id, diagnosis, date_issued } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO prescriptions (patient_id, doctor_id, diagnosis, date_issued)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [patient_id, doctor_id, diagnosis, date_issued]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update prescription
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { patient_id, doctor_id, diagnosis, date_issued } = req.body;

  try {
    const result = await pool.query(
      `UPDATE prescriptions
       SET patient_id = $1,
           doctor_id = $2,
           diagnosis = $3,
           date_issued = $4
       WHERE prescription_id = $5
       RETURNING *`,
      [patient_id, doctor_id, diagnosis, date_issued, id]
    );

    if (!result.rows.length)
      return res.status(404).json({ message: "Prescription not found" });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete prescription
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM prescriptions WHERE prescription_id=$1 RETURNING *",
      [id]
    );
    if (!result.rows.length)
      return res.status(404).json({ message: "Prescription not found" });

    res.json({ message: "Prescription deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

