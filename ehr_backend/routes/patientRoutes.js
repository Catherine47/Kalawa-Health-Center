import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// ✅ Get all patients
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM patients ORDER BY patient_id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get patient by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM patients WHERE patient_id = $1", [id]);
    if (!result.rows.length) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add new patient
router.post("/", async (req, res) => {
  const { first_name, last_name, dob, gender, email_address, phone_number } = req.body;

  if (!first_name || !last_name || !dob || !gender || !email_address || !phone_number) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO patients (first_name, last_name, dob, gender, email_address, phone_number)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [first_name, last_name, dob, gender, email_address, phone_number]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    // Handle unique constraint violations clearly
    if (err.code === "23505") {
      res.status(400).json({ error: "Email or phone number already exists" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// ✅ Update patient details
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, dob, gender, email_address, phone_number } = req.body;

  try {
    const result = await pool.query(
      `UPDATE patients
       SET first_name = $1,
           last_name = $2,
           dob = $3,
           gender = $4,
           email_address = $5,
           phone_number = $6
       WHERE patient_id = $7
       RETURNING *`,
      [first_name, last_name, dob, gender, email_address, phone_number, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      res.status(400).json({ error: "Email or phone number already exists" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// ✅ Delete patient
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM patients WHERE patient_id = $1 RETURNING *", [id]);
    if (!result.rows.length) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json({ message: "Patient deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
