import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// ✅ Test route
router.get("/test", (req, res) => {
  res.send("✅ prescriptionDrugsRoutes is working!");
});

// ✅ Get all prescription drugs
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM prescription_drugs ORDER BY drug_id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching prescription_drugs:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get prescription drug by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM prescription_drugs WHERE drug_id = $1", [id]);
    if (!result.rows.length) return res.status(404).json({ message: "Prescription drug not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error fetching prescription_drug:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add a new prescription drug
router.post("/", async (req, res) => {
  const { prescription_id, drug_name, dosage, duration } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO prescription_drugs (prescription_id, drug_name, dosage, duration)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [prescription_id, drug_name, dosage, duration]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error inserting prescription_drug:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update prescription drug
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { prescription_id, drug_name, dosage, duration } = req.body;

  try {
    const result = await pool.query(
      `UPDATE prescription_drugs 
       SET prescription_id = $1, drug_name = $2, dosage = $3, duration = $4
       WHERE drug_id = $5
       RETURNING *`,
      [prescription_id, drug_name, dosage, duration, id]
    );

    if (!result.rows.length) return res.status(404).json({ message: "Prescription drug not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error updating prescription_drug:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete prescription drug
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM prescription_drugs WHERE drug_id = $1 RETURNING *", [id]);
    if (!result.rows.length) return res.status(404).json({ message: "Prescription drug not found" });
    res.json({ message: "Prescription drug deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting prescription_drug:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
