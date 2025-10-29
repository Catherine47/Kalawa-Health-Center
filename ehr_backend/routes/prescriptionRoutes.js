import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// ✅ Get all active prescriptions (not deleted)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM prescriptions
      WHERE deleted_at IS NULL
      ORDER BY prescription_id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching prescriptions:", err.message);
    res.status(500).json({ error: "Failed to fetch prescriptions." });
  }
});

// ✅ Get a single prescription by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT * FROM prescriptions
      WHERE prescription_id = $1 AND deleted_at IS NULL
    `, [id]);

    if (!result.rows.length)
      return res.status(404).json({ message: "Prescription not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error fetching prescription:", err.message);
    res.status(500).json({ error: "Failed to fetch prescription." });
  }
});

// ✅ Add a new prescription (secure insert)
router.post("/", async (req, res) => {
  const { patient_id, doctor_id, diagnosis, date_issued } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO prescriptions (patient_id, doctor_id, diagnosis, date_issued)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [patient_id, doctor_id, diagnosis, date_issued]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error adding prescription:", err.message);
    res.status(500).json({ error: "Failed to add prescription." });
  }
});

// ✅ Update an existing prescription
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { patient_id, doctor_id, diagnosis, date_issued } = req.body;

  try {
    const result = await pool.query(
      `UPDATE prescriptions
       SET patient_id = $1,
           doctor_id = $2,
           diagnosis = $3,
           date_issued = $4,
           updated_at = NOW()
       WHERE prescription_id = $5 AND deleted_at IS NULL
       RETURNING *`,
      [patient_id, doctor_id, diagnosis, date_issued, id]
    );

    if (!result.rows.length)
      return res.status(404).json({ message: "Prescription not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error updating prescription:", err.message);
    res.status(500).json({ error: "Failed to update prescription." });
  }
});

// ✅ Soft delete prescription (mark as deleted, don't remove)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE prescriptions
       SET deleted_at = NOW()
       WHERE prescription_id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id]
    );

    if (!result.rows.length)
      return res.status(404).json({ message: "Prescription not found" });

    res.json({ message: "Prescription deleted successfully (soft delete)" });
  } catch (err) {
    console.error("❌ Error deleting prescription:", err.message);
    res.status(500).json({ error: "Failed to delete prescription." });
  }
});

export default router;
