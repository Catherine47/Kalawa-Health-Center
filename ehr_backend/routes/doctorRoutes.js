import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// ✅ Test route
router.get("/test", (req, res) => {
  res.send("✅ doctorRoutes is working!");
});


// ✅ Get all doctors
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM doctors ORDER BY doctor_id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ Get doctor by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM doctors WHERE doctor_id = $1", [id]);
    if (!result.rows.length) return res.status(404).json({ message: "Doctor not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Add a new doctor
router.post("/", async (req, res) => {
  const { first_name, last_name, specialization, email_address, phone_number } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO doctors (first_name, last_name, specialization, email_address, phone_number)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [first_name, last_name, specialization, email_address, phone_number]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Update a doctor
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, specialization, email_address, phone_number } = req.body;

  try {
    const result = await pool.query(
      `UPDATE doctors 
       SET first_name = $1, last_name = $2, specialization = $3, 
           email_address = $4, phone_number = $5
       WHERE doctor_id = $6
       RETURNING *`,
      [first_name, last_name, specialization, email_address, phone_number, id]
    );

    if (!result.rows.length) return res.status(404).json({ message: "Doctor not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Delete a doctor
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM doctors WHERE doctor_id = $1 RETURNING *", [id]);
    if (!result.rows.length) return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: "Doctor deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
