import express from "express";
import { pool } from "../db.js";

const router = express.Router();

/* ✅ SECURITY IMPROVEMENTS
   1. Parameterized queries → prevent SQL injection
   2. Soft delete → preserve data integrity
   3. Validations for required fields
   4. Returns structured JSON responses
   5. Includes restore endpoint for recovery
*/

// ✅ Get all active (non-deleted) patients
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM patients WHERE is_deleted = false ORDER BY patient_id ASC"
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get patient by ID (only if not deleted)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM patients WHERE patient_id = $1 AND is_deleted = false",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching patient:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Add new patient (secure insertion)
router.post("/", async (req, res) => {
  const { first_name, last_name, dob, gender, email_address, phone_number } = req.body;

  if (!first_name || !last_name || !dob || !gender || !email_address || !phone_number) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO patients (first_name, last_name, dob, gender, email_address, phone_number, is_deleted)
       VALUES ($1, $2, $3, $4, $5, $6, false)
       RETURNING *`,
      [first_name, last_name, dob, gender, email_address, phone_number]
    );
    res.status(201).json({ message: "Patient added successfully", patient: result.rows[0] });
  } catch (err) {
    console.error("Error adding patient:", err);
    if (err.code === "23505") {
      res.status(400).json({ error: "Email or phone number already exists" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// ✅ Update patient (only if active)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, dob, gender, email_address, phone_number } = req.body;

  if (!first_name || !last_name || !dob || !gender || !email_address || !phone_number) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const result = await pool.query(
      `UPDATE patients
       SET first_name = $1,
           last_name = $2,
           dob = $3,
           gender = $4,
           email_address = $5,
           phone_number = $6
       WHERE patient_id = $7 AND is_deleted = false
       RETURNING *`,
      [first_name, last_name, dob, gender, email_address, phone_number, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Patient not found or deleted" });
    }

    res.status(200).json({ message: "Patient updated successfully", patient: result.rows[0] });
  } catch (err) {
    console.error("Error updating patient:", err);
    if (err.code === "23505") {
      res.status(400).json({ error: "Email or phone number already exists" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// ✅ Soft delete patient (mark as deleted instead of removing)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE patients SET is_deleted = true WHERE patient_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({ message: "Patient soft-deleted successfully" });
  } catch (err) {
    console.error("Error deleting patient:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Restore soft-deleted patient
router.put("/restore/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE patients SET is_deleted = false WHERE patient_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({ message: "Patient restored successfully" });
  } catch (err) {
    console.error("Error restoring patient:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
