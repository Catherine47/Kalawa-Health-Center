import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// ✅ Test route
router.get("/test", (req, res) => {
  res.send("✅ doctorRoutes is working!");
});

// ✅ Get all active doctors (exclude soft-deleted)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT doctor_id, first_name, last_name, specialization, email_address, phone_number, created_at, updated_at
       FROM doctors
       WHERE deleted_at IS NULL
       ORDER BY doctor_id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching doctors:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get a single doctor by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT doctor_id, first_name, last_name, specialization, email_address, phone_number, created_at, updated_at
       FROM doctors
       WHERE doctor_id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Doctor not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching doctor:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Add a new doctor
router.post("/", async (req, res) => {
  const { first_name, last_name, specialization, email_address, phone_number } = req.body;

  // Validation
  if (!first_name || !last_name || !specialization || !email_address || !phone_number) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO doctors (first_name, last_name, specialization, email_address, phone_number)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING doctor_id, first_name, last_name, specialization, email_address, phone_number, created_at`,
      [first_name, last_name, specialization, email_address, phone_number]
    );

    res.status(201).json({
      message: "Doctor added successfully",
      doctor: result.rows[0],
    });
  } catch (err) {
    if (err.code === "23505") {
      res.status(400).json({ error: "Email or phone number already exists" });
    } else {
      console.error("Error adding doctor:", err.message);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// ✅ Update doctor details
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, specialization, email_address, phone_number } = req.body;

  try {
    // Check if doctor exists and not deleted
    const existing = await pool.query(
      "SELECT * FROM doctors WHERE doctor_id = $1 AND deleted_at IS NULL",
      [id]
    );
    if (existing.rows.length === 0)
      return res.status(404).json({ message: "Doctor not found" });

    const result = await pool.query(
      `UPDATE doctors
       SET first_name = $1,
           last_name = $2,
           specialization = $3,
           email_address = $4,
           phone_number = $5,
           updated_at = NOW()
       WHERE doctor_id = $6
       RETURNING doctor_id, first_name, last_name, specialization, email_address, phone_number, updated_at`,
      [first_name, last_name, specialization, email_address, phone_number, id]
    );

    res.json({
      message: "Doctor updated successfully",
      doctor: result.rows[0],
    });
  } catch (err) {
    if (err.code === "23505") {
      res.status(400).json({ error: "Email or phone number already exists" });
    } else {
      console.error("Error updating doctor:", err.message);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// ✅ Soft delete doctor (not permanently)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE doctors
       SET deleted_at = NOW()
       WHERE doctor_id = $1 AND deleted_at IS NULL
       RETURNING doctor_id`,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Doctor not found or already deleted" });

    res.json({ message: "Doctor soft-deleted successfully" });
  } catch (err) {
    console.error("Error deleting doctor:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
